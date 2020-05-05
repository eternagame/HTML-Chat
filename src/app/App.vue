<template>
  <div
    id="eterna-chat"
    style="height:100%; overflow-y:hidden;"
  >
    <slideout style="z-index:1;"></slideout>
    <transition name="fade">
      <div class="chat-content" v-if="!minimized">
        <MessagePane
          v-for="(channel, index) in messageTabs"
          :key="channel.name"
          :data="channel"
          v-show="index === activeTab2 && chatPaneSelected"
          :visibility="index === activeTab2 && chatPaneSelected"
          @postMessage="postMessage($event, channel.name)"
        />
        <UserPane :visibility="userPaneSelected" v-show="userPaneSelected" />
        <ConnectingPopup/>
        <ReportDialog ref="reportDialog"/>
      </div>
    </transition>
    <MinimizationTriangle v-model="minimization" class="minimizationTriangle" />
    <a class="open-window" href="full_window_link_here">↗️</a>
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
  import UserPane from '@/components/Panes/UserPane.vue';
  import MinimizationTriangle from '@/components/MinimizationTriangle.vue';

  @Component({
    components: {
      Slideout,
      ReportDialog,
      ConnectingPopup,
      MessagePane,
      UserPane,
      MinimizationTriangle,
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

    get activeTab() {
      return this.$vxm.chat.tab1;
    }

    get activeTab2() {
      return this.$vxm.chat.tab2;
    }

    $refs!: {
      reportDialog: ReportDialog;
    };

    get messageTabs() {
      return Object.values(this.$vxm.chat.channels).map(channel => channel!);
    }

    get userPaneSelected() {
      return this.activeTab === 1;
    }

    get chatPaneSelected() {
      return this.activeTab === 0;
    }

    get minimized() {
      return this.minimization;
    }

    postMessage(rawMessage: string, channel: string) {
      this.$vxm.chat.sendMessage({ rawMessage, channel });
    }

    mounted() {
      this.$vxm.chat.init({ username: this.username, workbranch: this.workbranch, uid: this.uid });
    }

    created() {
      this.$vxm.chat.$subscribe('openReportModal', payload => {
        this.$refs.reportDialog.open(payload);
      });
    }
  }
</script>

<style lang="scss">
  @import '~vue-context/src/sass/vue-context';
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
    min-width: 0;
    font-family: "Open Sans", "Open Sans", Arial, Gulim;
    font-size: 14px;
    font-weight: 300;
  }

  .minimization-triangle {
    position: absolute;
    top: 0px;
    right: 0px;
  }

  .tabs {
    position: relative;
    height: 25px;
    margin: 0;
    padding: 0;
  }

  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 200ms;
  }

  .fade-enter, .fade-leave-to
  {
    opacity: 0;
  }

  .chat-content {
    border: rgba(255, 255, 255, 0.2) solid 2px;
    height: calc(100% - 34px); //Account for top bar and border
    position: absolute;
    top:30px;
    left:0px;
    width:calc(100% - 4px); //Account for border
    color: #c0dce7;
  }
  .minimizationTriangle {
    position:absolute;
    top:0px;
    margin-top:2.5px;
    right:0px;
  }
  .open-window {
    position:absolute;
    top:0px;
    margin-top:5.5px;
    right:35px;
    text-decoration: none;
    vertical-align: middle;
  }
</style>
