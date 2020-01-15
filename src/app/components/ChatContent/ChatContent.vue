<template>
  <transition name="fade">
    <div
      v-show="!$store.state.$_chat.minimized"
      id="chat-content"
      class="chat-content"
    >
      <ChatTabs />
      <ConnectingPopup />
      <ReportDialog ref="reportDialog" />
    </div>
  </transition>
</template>

<script lang="ts">
  import Component from 'vue-class-component';
  import Vue from '@/types/vue';
  import ChatTabs from './ChatTabs.vue';
  import ConnectButton from './Connection/ConnectButton.vue';
  import ReportDialog from '@/components/ChatContent/Messages/BlockMenu/ReportDialog.vue';
  import ConnectingPopup from '@/components/ChatContent/Connection/ConnectingPopup.vue';

  @Component({
    components: {
      ReportDialog,
      ChatTabs,
      ConnectButton,
      ConnectingPopup,
    },
  })
  export default class ChatContent extends Vue {
    $refs!: {
      reportDialog: ReportDialog;
    };

    created() {
      this.$store.subscribe((mutation, state) => {
        if (mutation.type === '$_chat/openReportModal') {
          this.$refs.reportDialog.open(mutation.payload);
        }
      });
    }
  }
</script>


<style lang="scss" scoped>
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
