<template>
  <div
    id="eterna-chat"
    style="height:100%; overflow-y:hidden;"
  >
    <transition name="fade">
      <div style="height: 100%;" v-show="!minimized">
        <div style="position:relative;">
          <TabButton
            v-for="({name}, index) in messageTabs"
            :key="name"
            :selected="activeTab === index"
            :name="name.substr(1)"
            @input="activeTab = index"
          />
          <TabButton
            :selected="userPaneSelected"
            :name="`Online(${userCount})`"
            @input="activeTab = messageTabs.length"
          />
        </div>
        <div class="chat-content">
          <MessagePane
            v-for="(channel, index) in messageTabs"
            :key="channel.name"
            :data="channel"
            v-show="index === activeTab"
            :visibility="index === activeTab"
            @postMessage="postMessage($event, channel.name)"
          />
          <UserPane :visibility="userPaneSelected" v-show="userPaneSelected"/>
        </div>
        <ConnectingPopup/>
        <ReportDialog ref="reportDialog"/>
      </div>
    </transition>
    <MinimizationTriangle class="minimization-triangle" v-model="minimized"/>
  </div>
</template>

<script lang="ts">
  import {
    Vue, Component, Prop, Watch,
  } from 'vue-property-decorator';
  import MinimizationTriangle from './components/MinimizationTriangle.vue';
  import TabButton from './components/TabButton.vue';
  import ConnectingPopup from '@/components/Connection/ConnectingPopup.vue';
  import ReportDialog from '@/components/ReportDialog.vue';
  import MessagePane from '@/components/Panes/MessagePane.vue';
  import UserPane from '@/components/Panes/UserPane.vue';

  @Component({
    components: {
      MinimizationTriangle,
      TabButton,
      ReportDialog,
      ConnectingPopup,
      MessagePane,
      UserPane,
    },
  })
  export default class App extends Vue {
    @Prop()
    username!: string;

    @Prop()
    workbranch!: string;

    @Prop()
    uid!: string;

    minimized = false;

    activeTab = 0;

    $refs!: {
      reportDialog: ReportDialog;
    };

    get messageTabs() {
      return Object.values(this.$vxm.chat.channels).map(channel => channel!);
    }

    get userPaneSelected() {
      return this.activeTab === this.messageTabs.length;
    }

    get userCount() {
      return Object.keys(this.$vxm.chat.connectedUsers).length;
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
    font-family: "Helvetica Neue", "Open Sans", Arial, Gulim;
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
    height: calc(100% - 29px);
    position: relative;
    color: #c0dce7;
  }
</style>
