<template>
  <DraggableDiv
    id="eterna-chat"
    style="overflow-y: hidden;"
    :class="{ eternaChatFull: fullSized, eternaChatNormal: !fullSized, minimizedChat: minimized }"
    :enabled="!fullSize"
  >
    <template slot="main">
      <slideout style="z-index: 1;" :minimizedValue="!minimized" @auth="showAuth = true"></slideout>
      <transition name="fade">
        <div class="chat-content" v-if="!minimized">
          <MessagePane
            v-for="(channel, index) in messageTabs"
            :key="channel.name"
            :data="channel"
            v-show="index === activeTab"
            :visibility="index === activeTab"
            @postMessage="postMessage($event, channel.name)"
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
  </DraggableDiv>
</template>

<script lang="ts">
  import {
    Vue, Component, Prop, Watch,
  } from 'vue-property-decorator';
  import BootstrapVue from 'bootstrap-vue';
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
})
  export default class App extends Vue {
  @Prop()
  username!: string;

  @Prop()
  workbranch!: string;

  @Prop()
  uid!: string;

  minimization = false;

  fullSize = false;

  showAuth = false;

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

  // Gets current chat tab
  get activeTab() {
    return this.$vxm.chat.tab;
  }

  $refs!: {
    reportDialog: ReportDialog;
    login: OperLogin,
    privmsgmodal: PrivateMessageModal,
  };

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

  operAuthenticate({ username, password }: {username: string, password: string}) {
    this.$vxm.chat.operLoginUser = username; // Sets creds used for authentification by chat.vuex
    this.$vxm.chat.operLoginPassword = password;
    this.$vxm.chat.operCommand(); // Set all nicks as opers
    setTimeout(this.operLoginStatus, 200); // A precaution so messages are received properly
  }

  operLoginStatus() {
    if (this.isOper) {
      this.$refs.login.message = 'Login succeeded'; // Success message
      this.$refs.login.showsMessage = true; // Modal shows success message
      this.$vxm.chat.oper = true; // Makes sure it knows user is oper
    } else {
      this.$refs.login.authFailed = true; // Sets 'incorrect user/pass' message
      this.$refs.login.password = ''; // Resets password field
    }
  }

  get show() {
    return this.$vxm.chat.auth;
  }

  @Watch('show')
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
  }

  key(e:KeyboardEvent) {
    if (e.code === 'Tab') { /* Watches for tabs. If a tab is detected, outline on input will remain on focus */
      this.$vxm.chat.tabbing = true;
      window.removeEventListener('keydown', this.key);
    }
  }

  created() {
    this.$vxm.chat.$subscribe('openReportModal', (payload) => {
      this.$refs.reportDialog.open(payload);
    });
    window.addEventListener('keydown', this.key);
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
  }
</script>

<style lang="scss">
@import "~vue-context/src/sass/vue-context";
textarea {
  border-radius: 2px;
  font-family: "Open Sans", "Helvetica Neue", Arial, Gulim;
  font-size: 0.85rem;
  border: 1px solid rgb(169, 169, 169);
  width: calc(100% - 10px);
  font-size: 14px !important;
}
</style>
<style lang="scss">
.green-button {
  margin-bottom: 5px !important;
  padding: 4px 7px !important;
}

.green-button,
.green-button-interactive,
.green-button-interactive2D {
    background-color: #4FB748;
    font-weight: normal;
    position: relative;
    text-align: center;
    font-size: 12px;
    padding: 0px;
    text-transform: capitalized;
    font-family: 'Open Sans', 'Century Gothic', 'Didact Gothic', Arial, sans-serif;
}

.green-button-bg {
    position: absolute;
}

.green-button-interactive {
    -webkit-border-radius: 5px;
    -moz-border-radius: 5px;
    border-radius: 5px;
    text-decoration: none;
    box-shadow: 5px 5px #2C6628;
}

.green-button-interactive:hover,
.green-button-interactive.hover {
    background-color: #48A641;
    box-shadow: 4px 4px #2C6628;
    -webkit-transform: translate(1px, 1px);
    -moz-transform: translate(1px, 1px);
    transform: translate(1px, 1px);
}

.green-button-interactive:active,
.green-button-interactive.active {
    background-color: #48A641;
    box-shadow: 2px 2px #2C6628;
    -webkit-transform: translate(3px, 3px);
    -moz-transform: translate(3px, 3px);
    transform: translate(3px, 3px);
}

.green-button,
.green-button-interactive2D {
    -webkit-border-radius: 5px;
    -moz-border-radius: 5px;
    border-radius: 5px;
    text-decoration: none;
    box-shadow: 0px 5px #2C6628;
    margin: 0px 2.5px;
}

.green-button:hover,
.green-button.hover,
.green-button-interactive2D:hover,
.green-button-interactive2D.hover {
    background-color: #48A641;
    box-shadow: 0px 4px #2C6628;
    -webkit-transform: translate(0px, 1px);
    -moz-transform: translate(0px, 1px);
    transform: translate(0px, 1px);
}

.green-button:active,
.green-button.active,
.green-button-interactive2D:active,
.green-button-interactive2D.active {
    background-color: #48A641;
    box-shadow: 0px 2px #2C6628;
    -webkit-transform: translate(0px, 3px);
    -moz-transform: translate(0px, 3px);
    transform: translate(0px, 3px);
}
.green-button:disabled {
  background-color:darken($color: (#48A641), $amount: 10%);
  color:darken($color: (#fff), $amount: 20%);
}
</style>
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
  top: 0px;
  left: 0px;
  transition: height 200ms;
}

.eternaChatNormal {
  width: $container-width; // Fill in with normal size
  height: $container-height;
  animation: growNormal 1s;
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
@keyframes growFull {
  from {
    width: 300px; // Fill in with default size
    height: 500px;
    margin: 0;
  }
  to {
    width: 90vw;
    height: 90vh;
    margin-right: 5vw;
    margin-left: 5vw;
    margin-top: 5vh;
    margin-bottom: 5vh;
    left: 0px !important;
    top: 0px !important;
  }
}
@keyframes growNormal {
  to {
    width: 300px; //Fill in with default size
    height: 500px;
    margin: 0;
  }
  from {
    width: 90vw;
    height: 90vh;
    margin-right: 5vw;
    margin-left: 5vw;
    margin-top: 5vh;
    margin-bottom: 5vh;
    left:0px !important;
    top:0px !important;
  }
}
.eternaChatFull { /* Full size chat */
  width: 90vw; /* Takes up 90% of the viewport*/
  height: 90vh;
  margin-right: 5vw; /* Margins take up the rest*/
  margin-left: 5vw;
  margin-top: 5vh;
  margin-bottom: 5vh;
  box-shadow: 0 0 2vw 20vw $dark-blue-transparent; /* Creates blur effect */
  animation: growFull 1s;
  left:0px !important; /* Overrides dragging styles so full size chat isn't cut off */
  top:0px !important;
}
.minimizedChat { /* Removes light blue background when chat is minimzed and only shows top bar */
  height:40px;
}
</style>
