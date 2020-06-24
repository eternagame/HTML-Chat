<template>
  <DraggableDiv
    id="eterna-chat"
    style="overflow-y: hidden"
    :style="chatStyle"
    :class="{ eternaChatFull: fullSized, eternaChatNormal: !fullSized, minimizedChat: minimized }"
    :enabled="!fullSize /* Disables dragging when chat is fullsize*/"
    v-resize:debounce="resized"
    :inGame="inGame"
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
<script lang="ts">
  import {
    Vue, Component, Prop, Watch,
  } from 'vue-property-decorator';
  import resize from 'vue-resize-directive';
  import BootstrapVue from 'bootstrap-vue';
  import sjcl from 'sjcl';
  import Slideout from './components/Slideout/Slideout.vue';
  import ConnectingPopup from '@/components/Connection/ConnectingPopup.vue';
  import ReportDialog from '@/components/ReportDialog.vue';
  import MessagePane from '@/components/Panes/MessagePane.vue';
  import MinimizationTriangle from '@/components/Header/MinimizationTriangle.vue';
  import OpenWindowButton from '@/components/Header/OpenWindowButton.vue';
  import DraggableDiv from '@/components/DraggableDiv.vue';
  import OperLogin from '@/components/OperLogin.vue';
  import PrivateMessageModal from '@/components/Messages/PrivateMessageModal.vue';

  Vue.use(BootstrapVue);

  Vue.component('v-style', { // Used to reactively style pseudo-elements
    render: function c(createElement) { // Basically creates a reactive <style> element
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
  // Minimization

  minimization = false;

  @Watch('minimized')
  minimizedChanged() {
    this.fullSize = false;
  }

  get minimized() {
    return this.minimization;
  }

  get minimizedStyle() {
    return {
      'min-height': this.minimized ? '40px' : '400px',
      resize: this.minimized ? '' : 'both',
    };
  }

  // Private messages

  get showPrivMsgModal() {
    return this.$vxm.chat.privMsgModal;
  }


  @Watch('showPrivMsgModal') // Shows modal
  triggerStart() {
    if (this.showPrivMsgModal) {
      this.$refs.privmsgmodal.onStart();
    }
  }

  // Full size

  fullSize = false;

  get fullSized() {
    return this.fullSize;
  }


  @Watch('fullSize')
  sizeChanged() {
    if (this.fullSize && this.minimized) {
      this.fullSize = false;
    }
    if (this.fullSize === false) {
      // Scrolls down when the chat is brought back to normal size
      this.$refs.messagepanes[this.activeTab].onContentChanged();
    }
  }

  // Tabs

  get messageTabs() {
    return Object.values(this.$vxm.chat.channels).map((channel) => channel!);
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

  // Oper

  get isOper() {
    return this.$vxm.chat.oper;
  }

  showAuth = false;

  async operAuthenticate(
    { username, password, remember }: {username: string, password: string, remember: boolean},
  ) {
    this.$vxm.chat.operLoginUser = username; // Sets creds used for authentification by chat.vuex
    this.$vxm.chat.operLoginPassword = password;
    if (remember) { // Store values
      // Encrypt password
      localStorage.operPass = JSON.stringify(sjcl.encrypt('password', password));
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

  @Watch('show') // Show authentification modal
  showAuthentification() {
    if (this.show) {
      this.showAuth = true;
      this.$vxm.chat.auth = false;
    }
  }

  /**
   * Logs the user in as an operator
   */
  async logInOper() {
    if (localStorage && localStorage.operUser && localStorage.operPass) {
      let pass = JSON.parse(localStorage.operPass);
      const user = localStorage.operUser;
      pass = sjcl.decrypt('password', pass); // Decrypt password
      if (user && pass) {
        this.$vxm.chat.operLoginPassword = pass; // Log in
        this.$vxm.chat.operLoginUser = user;
        this.$vxm.chat.operCommand();
        setTimeout(this.operLoginStatus, 150);
      }
    }
  }

  // Drag and resize

  get gamePosition() {
    return this.$vxm.chat.inGamePosition;
  }

  get positionStyle() {
    const style: { [key:string]: string} = {};
    if (this.inGame) {
      console.log(this.gamePosition);
      if (this.gamePosition[0] === 'l') {
        style.left = `${this.gamePosition[1]}px`;
      } else {
        style.right = `${this.gamePosition[1]}px`;
      }
      if (this.gamePosition[2] === 't') {
        style.top = `${this.gamePosition[3]}px`;
      } else {
        style.bottom = `${this.gamePosition[3]}px`;
      }
    } else {
      style.left = `${this.initialPosition[0]}px`;
      style.top = `${this.initialPosition[1]}px`;
    }
    return style;
  }

  get sizeStyle() {
    return {
      width: `${this.initialSize[0] || 300}px`,
      height: `${this.initialSize[1] || 500}px`,
    };
  }

  get initialPosition() {
    return this.$vxm.chat.initialPosition;
  }

  get initialSize() {
    return this.$vxm.chat.initialSize;
  }

  resized() { // When the chat is resized, store the new size
    const w = this.$el.scrollWidth;
    const h = this.$el.scrollHeight;
    if (localStorage && (w !== 300 || h !== 500)) {
      localStorage.size = JSON.stringify(`${w} ${h}`);
    }
  }

  // Slideout

  get slideoutOpen() {
    return this.$vxm.chat.slideoutOpen;
  }

  @Watch('slideoutOpen')
  slideoutChanged() { // Make sure the chat isn't minimized when the slideout opens
    if (this.slideoutOpen) {
      this.minimization = false;
    }
  }

  close(ev: MouseEvent) {
    if (!this.$refs.slideout || !this.$refs.slideout.$el) return;
    if (!this.$refs.slideout.$el.contains(ev.target as Node) // If the click is not in the slideout
    && this.$el.contains(ev.target as Node)) { // And it is in the chat
      this.$vxm.chat.slideoutOpen = false; // Close the slideout
    }
  }

  // Status

  windowFocused = true;


  @Watch('windowFocused')
  focusChanged() { // Updates status when focus is changed
    if (this.windowFocused) {
      this.$vxm.chat.setUnaway();
    } else {
      this.$vxm.chat.setAway();
    }
  }

  // Other

  @Prop()
  username!: string;

  @Prop()
  workbranch!: string;

  @Prop()
  uid!: string;

  @Prop()
  inGame !: boolean;

  $refs!: {
    reportDialog: ReportDialog;
    login: OperLogin,
    privmsgmodal: PrivateMessageModal,
    messagepanes: MessagePane,
    slideout: Slideout,
  };

  postMessage(rawMessage: string, channel: string) {
    if (!channel.startsWith('#')) { // If it's a PRIVMSG
      this.$vxm.chat.postToQuery({ message: rawMessage, channel });
    } else { // Otherwise
      this.$vxm.chat.sendMessage({ rawMessage, channel });
    }
    // When user sends a message, make sure it doesn't notify itself
    this.$vxm.chat.readChannel(channel);
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
    this.startTimers();
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
    window.addEventListener('focus', () => { // Updates away/online status when tab is clicked on/off
      if (this.$vxm.chat.autoUpdateStatus) { // Don't update if user has set themselves as away
        this.windowFocused = true;
      }
      this.$vxm.chat.focused = true;
      this.$vxm.chat.readChannel(this.currentTab);
    });
    window.addEventListener('blur', () => {
      this.windowFocused = false;
      this.$vxm.chat.focused = false;
    });
  }

  get chatStyle() {
    return Object.assign(Object.assign(this.positionStyle, this.sizeStyle), this.minimizedStyle);
  }

  // Inactivity timer

  timeout = 60000; // How long a user is inactive before they are marked as away

  timeoutId !: number;

  onInactive() {
    this.$vxm.chat.setAway();
  }

  resetInactiveTimer() { // When the user interacts with the chat, reset the timer
    window.clearTimeout(this.timeoutId);
    this.beginInactiveTimer();
  }

  beginInactiveTimer() {
    this.timeoutId = setTimeout(this.onInactive, this.timeout);
  }

  startTimers() { // Begins timers and sets event listeners
    const chat = document.getElementById('eterna-chat'); // $refs was acting up
    chat?.addEventListener('mousemove', this.resetInactiveTimer, false);
    chat?.addEventListener('mousedown', this.resetInactiveTimer, false);
    chat?.addEventListener('keypress', this.resetInactiveTimer, false);
    chat?.addEventListener('touchmove', this.resetInactiveTimer, false);
    this.beginInactiveTimer();
  }

  // Hooks

  postScreenshot(url:string) {
    this.postMessage(url, '#help');
  }
  }
</script>
<style lang="scss" scoped>
@import "./assets/_custom.scss";
@import "~bootstrap/scss/bootstrap.scss";
@import '~bootstrap-vue/dist/bootstrap-vue.css';
/*** Chat container ***/
#eterna-chat {
  font-family: "Open Sans", "Open Sans", Arial, Gulim;
  font-size: 14px;
  font-weight: 300;
  background-color: $med-dark-blue;
  position: absolute; /* Makes sure everything is placed with respect to it, not to its parent */
  transition: width 200ms, height 200ms, margin 1s, position 1s;
  min-width: 350px; /* Bounds on chat resizing */
  max-width: 450px;
  max-height: 600px;
}
.eternaChatNormal {
  width: $container-width; // Fill in with normal size
  height: $container-height;
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

/*** Header ***/
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

/*** Footer ***/
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
.resize-handle:hover {
  cursor:se-resize;
}
</style>
