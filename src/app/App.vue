<template>
  <DraggableDiv
    id="eterna-chat"
    style="overflow-y: hidden; resize:both"
    :style="{ 'min-height': minimized ? '40px' : '400px',
    /* Makes sure minimum height is changed to allow for chat to be minimized*/
    top: `${initialPosition[1]}px`,
    left:`${initialPosition[0]}px`,
    width: `${initialSize[0] || 300}px`,
    height: `${initialSize[1] || 500}px`}"
    :class="{ eternaChatFull: fullSized, eternaChatNormal: !fullSized, minimizedChat: minimized }"
    :enabled="!fullSize /* Disables dragging when chat is fullsize*/"
    v-resize:debounce="resized"
  >
    <template slot="main">
      <slideout
        style="z-index: 1;"
        minimizedValue="!minimized"
        ref="slideout"
        @auth="showAuth = true" />
      <transition name="fade">
        <div class="chat-content" v-if="!minimized">
          <MessagePane
            v-for="(channel, index) in messageTabs"
            :key="channel.name"
            :data="channel"
            v-show="index === activeTab"
            :visibility="index === activeTab"
            @postMessage="postMessage($event, channel.name)"
            ref="messagepanes"
          />
          <ConnectingPopup />
          <ReportDialog ref="reportDialog" />
          <PrivateMessageModal ref="privmsgmodal" v-show="showPrivMsgModal"/>
        </div>
      </transition>
      <OperLogin @login="operAuthenticate" v-if="showAuth" @cancel="showAuth=false" ref="login" />
    </template>
    <template slot="header">
      <div id="current-tab">{{ currentTab }}</div>
      <MinimizationTriangle v-model="minimization" class="minimizationTriangle" />
      <OpenWindowButton v-model="fullSize" />
    </template>
    <template slot="footer">
      <div id="resize-handle" v-show="!minimized"/>
    </template>
  </DraggableDiv>
</template>
<!-- TODO
- Reconnect button
  - Style to align with theme
  - Hide input when visible
- Cleanup
  - Comment code
  - Remove unused imports
  - Group functions and properties
- Away status
  - Allow it to be manually set
  - Automatically set it after a certain amount of time with no interaction
-->
<script lang="ts">
  import {
    Vue, Component, Prop, Watch,
  } from 'vue-property-decorator';
  import BootstrapVue from 'bootstrap-vue';
  import {
    openDB, deleteDB, wrap, unwrap,
  } from 'idb';
  import resize from 'vue-resize-directive';
  import Slideout from './components/Slideout/Slideout.vue';
  import ConnectingPopup from '@/components/Connection/ConnectingPopup.vue';
  import ReportDialog from '@/components/ReportDialog.vue';
  import MessagePane from '@/components/Panes/MessagePane.vue';
  import MinimizationTriangle from '@/components/MinimizationTriangle.vue';
  import OpenWindowButton from '@/components/OpenWindowButton.vue';
  import DraggableDiv from '@/components/DraggableDiv.vue';
  import Message from '@/types/message';
  import OperLogin from '@/components/OperLogin.vue';
  import Ban from '@/types/Ban';
  import PrivateMessageModal from '@/components/Messages/PrivateMessageModal.vue';

  Vue.use(BootstrapVue);

  Vue.component('v-style', {
    render: function c(createElement) {
      return createElement('style', this.$slots.default);
    },
  });

@Component({
  components: {
    DraggableDiv,
    Slideout,
    ReportDialog,
    ConnectingPopup,
    MessagePane,
    MinimizationTriangle,
    OpenWindowButton,
    OperLogin,
    PrivateMessageModal,
  },
  directives: {
    resize,
  },
})
  export default class App extends Vue {
  @Prop()
  username!: string;

  @Prop()
  workbranch!: string;

  get animation() {
    if (this.loaded) {
      return 'none';
    }
    return 'growFull 1s';
  }

  @Prop()
  uid!: string;

  minimization = false;

  fullSize = false;

  showAuth = false;

  windowFocused = true;

  get showPrivMsgModal() {
    return this.$vxm.chat.privMsgModal;
  }

  @Watch('showPrivMsgModal')
  triggerStart() {
    if (this.showPrivMsgModal) {
      this.$refs.privmsgmodal.onStart();
    }
  }

  get isOper() {
    return this.$vxm.chat.oper;
  }

  // For text in top bar
  get currentTab() {
    return this.$vxm.chat.chatChannel;
  }

  @Watch('currentTab')
  loadHistory() { // Load history when tab changed
    // Don't put duplicates of existing history messages
    if (this.$vxm.chat.channels[this.currentTab]!.postedMessages.length <= 50) {
      this.$vxm.chat.loadMessagesForChannel(this.currentTab); // Load messages
    }
  }

  // Gets current chat tab
  get activeTab() {
    return this.$vxm.chat.tab;
  }

  $refs!: {
    reportDialog: ReportDialog;
    login: OperLogin,
    privmsgmodal: PrivateMessageModal,
    messagepanes: MessagePane,
    slideout: Slideout,
  };

  get initialPosition() {
    return this.$vxm.chat.initialPosition;
  }

  get initialSize() {
    return this.$vxm.chat.initialSize;
  }

  get slideoutOpen() {
    return this.$vxm.chat.slideoutOpen;
  }

  get messageTabs() {
    return Object.values(this.$vxm.chat.channels).map((channel) => channel!);
  }

  get minimized() {
    return this.minimization;
  }

  get fullSized() {
    return this.fullSize;
  }

  postMessage(rawMessage: string, channel: string) {
    if (!channel.startsWith('#')) { // If it's a PRIVMSG
      this.$vxm.chat.postToQuery(`${channel}|${rawMessage}`);
    } else { // Otherwise
      this.$vxm.chat.sendMessage({ rawMessage, channel });
    }
    // When user sends a message, make sure it doesn't notify itself
    this.$vxm.chat.readChannel(channel);
  }

  async operAuthenticate(
    { username, password, remember }: {username: string, password: string, remember: boolean},
  ) {
    this.$vxm.chat.operLoginUser = username; // Sets creds used for authentification by chat.vuex
    this.$vxm.chat.operLoginPassword = password;
    if (remember) { // Store values
      localStorage.operPass = password;
      localStorage.operUser = username;
    }
    this.$vxm.chat.operCommand(); // Set all nicks as opers
    setTimeout(this.operLoginStatus, 200); // A precaution so messages are received properly
  }

  operLoginStatus() {
    if (this.$refs.login) {
      if (this.isOper) {
        this.$refs.login.message = 'Login succeeded'; // Success message
        this.$refs.login.showsMessage = true; // Modal shows success message
      } else {
        this.$refs.login.authFailed = true; // Sets 'incorrect user/pass' message
        this.$refs.login.password = ''; // Resets password field
      }
    } else {
      this.$vxm.chat.oper = this.isOper;
    }
  }

  get show() {
    return this.$vxm.chat.auth;
  }

  @Watch('show') // Show modal
  showAuthentification() {
    if (this.show) {
      this.showAuth = true;
      this.$vxm.chat.auth = false;
    }
  }

  mounted() {
    this.$vxm.chat.init({
      username: this.username,
      workbranch: this.workbranch,
      uid: this.uid,
    });
    const timer = setInterval(() => { // Creates a timer to check for history and connection
      this.logInOper();
      if (this.$vxm.chat.rawHistoryMessages.length > 0) {
        clearInterval(timer); // Once history messages start coming in, stop the timer
        setTimeout(() => { // Make sure all of them come in, then process them
          this.$vxm.chat.loadMessagesForChannel('#general');
          setTimeout(() => {
            /* This gives an error because it doesn't recognize
            using ref on a v-for gives an Array of VueComponents.
            It think's its just a normal MessagePane
            */
            const pane = this.$refs.messagepanes[0];
            pane.scrollDown(); // Scroll down
          }, 100);
        }, 500);
      }
    }, 100);
    this.loaded = false;
  }

  loaded = true;

  /**
   * Logs the user in as an operator
   */
  async logInOper() {
    const pass = localStorage.operPass;
    const user = localStorage.operUser;
    if (user && pass) {
      this.$vxm.chat.operLoginPassword = pass; // Log in
      this.$vxm.chat.operLoginUser = user;
      this.$vxm.chat.operCommand();
      setTimeout(this.operLoginStatus, 150);
    }
  }

  key(e:KeyboardEvent) {
    if (e.code === 'Tab') { /* Watches for tabs. If a tab is detected, outline on input will remain on focus */
      this.$vxm.chat.tabbing = true;
    }
    if (e.code === 'ArrowUp') { // Checks if up arrow has been pressed
      // Finds the most recent message the user has sent
      const channelMsgs = this.$vxm.chat.channels[this.currentTab]?.postedMessages;
      let recent = channelMsgs?.filter(m => m.user.username === this.username).reverse()[0].message;
      if (recent?.match(/\[#[a-f0-9]{6}\]$/)) { // Remove the color
        recent = recent.substring(0, recent.length - 10);
      }
      // Notify the input
      this.$vxm.chat.updateMessage = recent || '';
      this.$vxm.chat.inputUpdate = true;
    }
  }

  created() {
    this.$vxm.chat.$subscribe('openReportModal', (payload) => {
      this.$refs.reportDialog.open(payload);
    });
    window.addEventListener('keydown', this.key);
    window.addEventListener('click', this.close); // Closes slideout when clicked outside
    window.addEventListener('focus', () => {
      this.windowFocused = true;
    });
    window.addEventListener('blur', () => {
      this.windowFocused = false;
    });
  }

  @Watch('windowFocused')
  focusChanged() {
    if (this.windowFocused) {
      this.$vxm.chat.setUnaway();
    } else {
      this.$vxm.chat.setAway();
    }
  }

  postScreenshot(url:string, puzzleName:string) {
    this.postMessage(`${puzzleName} ${url}`, '#help');
  }

  @Watch('minimized')
  minimizedChanged() {
    this.fullSize = false;
  }

  @Watch('fullSize')
  sizeChanged() {
    if (this.fullSize && this.minimized) {
      this.fullSize = false;
    }
  }

  @Watch('slideoutOpen')
  slideoutChanged() {
    if (this.slideoutOpen) {
      this.minimization = false;
    }
  }

  beforeDestroy() {
    window.removeEventListener('click', this.close);
  }

  close(ev: MouseEvent) {
    if (!this.$refs.slideout.$el.contains(ev.target as Node) // If the click is not in the slideout
    && this.$el.contains(ev.target as Node)) { // And it is in the chat
      this.$vxm.chat.slideoutOpen = false; // Close the slideout
    }
  }

  resized() {
    const w = this.$el.scrollWidth;
    const h = this.$el.scrollHeight;
    if (localStorage && (w !== 300 || h !== 500)) {
      localStorage.size = JSON.stringify(`${w} ${h}`);
    }
  }
  }
</script>


<style lang="scss" scoped>
@import "./assets/_custom.scss";
@import "~bootstrap/scss/bootstrap.scss";
@import '~bootstrap-vue/dist/bootstrap-vue.css';
#eterna-chat {
  font-family: "Open Sans", "Open Sans", Arial, Gulim;
  font-size: 14px;
  font-weight: 300;
  background-color: $med-dark-blue;
  position: relative; /* Makes sure everything is placed with respect to it, not to its parent */
  transition: width 200ms, height 200ms, margin 1s, position 1s;
  min-width: 250px; /* Bounds on chat resizing */
  max-width: 400px;
  max-height: 600px;
}

.eternaChatNormal {
  width: $container-width; // Fill in with normal size
  height: $container-height;
}

.fade-enter-active,
.fade-leave-active {
  transform-origin: top center;
  transition: 200ms;
}

.fade-enter,
.fade-leave-to {
  transform-origin: top center;
  transform: scaleY(0);
  //Moves everything up without interfering with top bar.
}

.chat-content {
  border: solid #0405224b 2px;
  border-radius: 15px;
  height: calc(100% - 54px); //Account for top bar and border
  position: absolute;
  top: 40px;
  left: 8px;
  width: calc(100% - 20px); //Account for border
  color: #c0dce7;
  background-color: $dark-blue;
  transform-origin: top center;
}
.minimizationTriangle {
  // Minimization button
  position: absolute;
  top: 0px;
  margin-top: 2.5px;
  right: 5px;
}
.open-window {
  //Link that opens chat in new window
  position: absolute;
  top: 0px;
  margin-top: 2.5px;
  right: 39px;
}
#current-tab {
  //Text on the top bar that says which chat channel the user is in
  position: absolute;
  right: 5px;
  font-family: "Open Sans", "Century Gothic", "Didact Gothic", "Arial", sans-serif;
  padding-top: 0px;
  font-size: 24px;
  top: 1px;
  width: calc(100% - 48px);
  float: right;
  text-align: left;
  z-index: 0; // Covered by slideout
  height: 30px;
}
.eternaChatFull { /* Full size chat */
  width: 90vw !important; /* Takes up 90% of the viewport*/
  height: 90vh !important;
  max-width: 90vw !important; /* Overrides resize limits */
  max-height: 90vh !important;
  margin-right: 5vw; /* Margins take up the rest*/
  margin-left: 5vw;
  margin-top: 5vh;
  margin-bottom: 5vh;
  box-shadow: 0 0 2vw 20vw $dark-blue-transparent; /* Creates blur effect */
  transition: all 1s;
  left:0px !important; /* Overrides dragging styles so full size chat isn't cut off */
  top:0px !important;
}
.minimizedChat { /* Removes light blue background when chat is minimzed and only shows top bar */
  height:40px !important;
}
::-webkit-resizer { /* Hide the resizer if possible */
  display:none;
}
#resize-handle {
  background-color:$med-dark-blue; /* Cover up the default icon if there is one */
  border-top-left-radius: 8px; /* Don't cut into the chat */
  position:absolute; /* Position over default icon */
  bottom:5px;
  right:5px;
  width:15px;
  height:15px;
  content:"";
  background-image:url("./assets/resizer.png"); /* Show custom resizer */
  background-repeat:no-repeat;
  background-size: 100% 100%;
  pointer-events:none; /* Clicks and drags go down to the resizer */
}
</style>
