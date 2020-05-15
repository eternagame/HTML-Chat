<template>
  <div
    id="eterna-chat"
    style="overflow-y: hidden;"
    :class="{ eternaChatFull: fullSized, eternaChatNormal: !fullSized, minimizedChat: minimized }"
  >
    <slideout style="z-index: 1;" :minimizedValue="!minimized"></slideout>
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
      </div>
    </transition>
    <div id="current-tab">{{ currentTab }}</div>
    <MinimizationTriangle v-model="minimization" class="minimizationTriangle" />
    <OpenWindowButton v-model="fullSize" />
  </div>
</template>

<script lang="ts">
  import {
    Vue, Component, Prop, Watch,
  } from 'vue-property-decorator';
  import Slideout from './components/Slideout/Slideout.vue';
  import ConnectingPopup from '@/components/Connection/ConnectingPopup.vue';
  import ReportDialog from '@/components/ReportDialog.vue';
  import MessagePane from '@/components/Panes/MessagePane.vue';
  import MinimizationTriangle from '@/components/MinimizationTriangle.vue';
  import OpenWindowButton from '@/components/OpenWindowButton.vue';

@Component({
  components: {
    Slideout,
    ReportDialog,
    ConnectingPopup,
    MessagePane,
    MinimizationTriangle,
    OpenWindowButton,
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
  };

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
    this.$vxm.chat.sendMessage({ rawMessage, channel });
    // When user sends a message, make sure it doesn't notify itself
    this.$vxm.chat.readChannel(channel);
  }

  mounted() {
    this.$vxm.chat.init({
      username: this.username,
      workbranch: this.workbranch,
      uid: this.uid,
    });
  }

  created() {
    this.$vxm.chat.$subscribe('openReportModal', (payload) => {
      this.$refs.reportDialog.open(payload);
    });
  }

  @Watch('minimized')
  minimizedChanged() {
    this.fullSize = false;
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

<style lang="scss" scoped>
#eterna-chat {
  font-family: "Open Sans", "Open Sans", Arial, Gulim;
  font-size: 14px;
  font-weight: 300;
  background-color: #043468;
  position: relative; /* Makes sure everything is placed with respect to it, not to its parent */
  top: 0px;
  left: 0px;
  transition: height 200ms;
}

.eternaChatNormal {
  width: 100%;
  height: 100%;
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
  background-color: #05224b;
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
    width: 100%;
    height: 100%;
    margin: 0;
  }
  to {
    width: 90vw;
    height: 90vh;
    margin-right: 5vw;
    margin-left: 5vw;
    margin-top: 5vh;
    margin-bottom: 5vh;
  }
}
@keyframes growNormal {
  to {
    width: 100%;
    height: 100%;
    margin: 0;
  }
  from {
    width: 90vw;
    height: 90vh;
    margin-right: 5vw;
    margin-left: 5vw;
    margin-top: 5vh;
    margin-bottom: 5vh;
  }
}
.eternaChatFull {
  width: 90vw;
  height: 90vh;
  margin-right: 5vw;
  margin-left: 5vw;
  margin-top: 5vh;
  margin-bottom: 5vh;
  box-shadow: 0 0 2vw 20vw rgba(4, 52, 104, 0.5);
  animation: growFull 1s;
}
</style>
