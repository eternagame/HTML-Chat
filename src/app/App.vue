<template>
  <DraggableDiv
    id="eterna-chat"
    :style="chatStyle"
    :class="{
      eternaChatFull: fullSized,
      eternaChatNormal: !fullSized,
      minimizedChat: minimized,
      tabbing: $vxm.chat.tabbing
    }"
    :enabled="!fullSize /* Disables dragging when chat is fullsize*/"
    v-resize:debounce="resized"
    :positionBasis="positionBasis"
    ref="draggable"
    @scrollDown="scrollDown"
  >
    <template slot="main">
      <slideout
        style="z-index: 1;"
        minimizedValue="!minimized"
        ref="slideout"
        @auth="showAuth = true" />
      <transition name="fade">
        <div class="chat-content" v-show="!minimized">
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
        </div>
      </transition>
      <OperLogin @login="operAuthenticate" v-if="showAuth" @cancel="showAuth=false" ref="login" />
    </template>
    <template slot="header">
      <div id="current-tab">{{ currentTab }}</div>
      <MinimizationTriangle v-model="minimization" class="minimizationTriangle" />
      <OpenWindowButton v-model="fullSize" />
      <StarButton v-model="$vxm.chat.showStarred" />
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
  import gsap from 'gsap';
  import Slideout from './components/Slideout/Slideout.vue';
  import ConnectingPopup from '@/components/Connection/ConnectingPopup.vue';
  import ReportDialog from '@/components/ReportDialog.vue';
  import MessagePane from '@/components/Panes/MessagePane.vue';
  import MinimizationTriangle from '@/components/Header/MinimizationTriangle.vue';
  import OpenWindowButton from '@/components/Header/OpenWindowButton.vue';
  import DraggableDiv from '@/components/DraggableDiv.vue';
  import OperLogin from '@/components/OperLogin.vue';
  import StarButton from '@/components/Header/StarButton.vue';

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
    StarButton,
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
    if (this.$refs && this.$refs.draggable) this.$refs.draggable.minimize();
    return this.minimization;
  }

  // Private messages

  get privateMessageUser() {
    return this.$vxm.chat.userToPrivMsg;
  }

  @Watch('privateMessageUser')
  openChannel() {
    if (this.privateMessageUser !== '') { // If the user is '', don't trigger
      // If private message channel with user nonexistent, make one
      if (!this.messageTabs.some(e => e.name === this.privateMessageUser)) {
        this.$vxm.chat.joinChannel(this.privateMessageUser);
      }
      this.$vxm.chat.tab = this.messageTabs.findIndex(e => e.name === this.privateMessageUser);
      this.$vxm.chat.chatChannel = this.privateMessageUser;
      this.$vxm.chat.slideoutOpen = false; // Open the chat channel and close slideout
    }
    this.$vxm.chat.userToPrivMsg = ''; // Reset
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
      if (this.$refs.messagepanes && this.$refs.messagepanes[this.activeTab as number]) {
        this.$refs.messagepanes[this.activeTab as number].onContentChanged();
      }
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
      localStorage.chat_operPass = JSON.stringify(sjcl.encrypt('password', password));
      localStorage.chat_operUser = username;
    }
    await this.$vxm.chat.operCommand(); // Set all nicks as opers
    this.operLoginStatus(); // A precaution so messages are received properly
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
    if (localStorage && localStorage.chat_operUser && localStorage.chat_operPass) {
      let pass = JSON.parse(localStorage.chat_operPass);
      const user = localStorage.chat_operUser;
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

  get positionStyle() {
    const style: { [key:string]: string} = {};
    if (!localStorage) return style;
    if (!localStorage[`chat_${this.positionBasis}Position`]) return style;
    const basis = JSON.parse(localStorage[`chat_${this.positionBasis}Position`]);
    if (!basis) return style;
    if (basis[0] === 'left') {
      style.left = `${basis[1]}px`;
    } else {
      style.right = `${basis[1]}px`;
    }
    if (basis[2] === 'top') {
      style.top = `${basis[3]}px`;
    } else {
      style.bottom = `${basis[3]}px`;
    }
    return style;
  }

  get sizeStyle() {
    return {
      width: `${this.initialSize[0] || 300}px`,
      height: `${this.initialSize[1] || 500}px`,
    };
  }

  get initialSize() {
    return this.$vxm.chat.initialSize;
  }

  resized() { // When the chat is resized, store the new size
    const w = this.$el.scrollWidth;
    const h = this.$el.scrollHeight;
    if (localStorage && (w !== 300 || h !== 500)) {
      localStorage.chat_size = JSON.stringify(`${w} ${h}`);
    }
  }

  scrollDown() {
    this.$refs.messagepanes.forEach(e => e.scrollDown());
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

  @Prop({ required: true })
  username!: string;

  @Prop({ required: true })
  workbranch!: string;

  @Prop({ required: true })
  uid!: string;

  @Prop({ default: 'initial' })
  positionBasis !: string;

  $refs!: {
    reportDialog: ReportDialog;
    login: OperLogin,
    messagepanes: MessagePane[],
    slideout: Slideout,
    draggable: DraggableDiv,
  };

  postMessage(rawMessage: string, channel: string) {
    if (!channel.startsWith('#')) { // If it's a private message (channel not prefixed with #)
      this.$vxm.chat.privateMessage({ message: rawMessage, channel });
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
      if (this.$vxm.chat.rawHistoryMessages.length > 0) {
        clearInterval(timer); // Once history messages start coming in, stop the timer
        setTimeout(() => { // Make sure all of them come in, then process them
          this.$vxm.chat.loadMessagesForChannel('#general');
          this.logInOper();
          setTimeout(() => {
            const pane = this.$refs.messagepanes[0];
            if (pane) {
              pane.scrollDown();
            }
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
    return Object.assign(this.positionStyle, this.sizeStyle);
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
<style lang="scss">
@import "@/assets/global.scss";
@import '~bootstrap-vue/src/index.scss';
@import '~bootstrap/scss/bootstrap.scss';
@import "@/assets/_custom.scss";
/* Removes focus ring for non-tabbing users on all buttons */
#eterna-chat:not(.tabbing) button:focus {
  outline: none;
  border: none;
}
</style>
<style lang="scss" scoped>
@import "./assets/_custom.scss";
/*** Chat container ***/
#eterna-chat {
  font-family: "Open Sans", "Open Sans", Arial, Gulim;
  font-size: 14px;
  font-weight: 300;
  background-color: $med-dark-blue;
  position: fixed; /* Makes sure everything is placed with respect to it, not to its parent */
  transition: width 200ms, height 200ms, margin 1s, position 1s;
  min-width: 300px; /* Bounds on chat resizing */
  min-height: 400px;
  overflow: hidden;
}
#eterna-chat.clicked-inside {
  outline: gray dashed 1px;
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
#eterna-chat.minimizedChat {
  /* Removes light blue background when chat is minimzed and only shows top bar */
  height:40px !important;
  min-height: 40px;
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
  // Moves everything up without interfering with top bar.
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
  right: 40px;
}
.star-button {
  //Link that opens chat in new window
  position: absolute;
  top: 0px;
  margin-top: 2.5px;
  right: 75px;
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
