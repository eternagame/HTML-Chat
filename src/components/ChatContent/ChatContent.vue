<template>
  <transition name="fade">
    <div
      id="chat-content"
      style="border: rgba(255, 255, 255, 0.2) solid 2px; height: Calc(100% - 29px); position: relative;"
      class="chat-content"
      v-show="!$store.state.minimized"
    >
      <chat-tabs></chat-tabs>
      <ConnectingPopup>
      </ConnectingPopup>
      <connect-button
        v-show="!$store.state.connectionData.connected &&
              !$store.state.connectionData.firstConnection"
      ></connect-button>
      <report-dialog></report-dialog>
    </div>
  </transition>
</template>

<script lang="ts">
import Vue from "@/types/vue";
import Component from "vue-class-component";
import ChatTabs from "./ChatTabs.vue";
import ChatInput from "./ChatInput.vue";
import ConnectButton from "./Connection/ConnectButton.vue";
import ReportDialog from "@/components/ChatContent/Messages/BlockMenu/ReportDialog.vue";
import ConnectingPopup from "@/components/ChatContent/Connection/ConnectingPopup.vue";

@Component({
  components: {
    ReportDialog,
    ChatTabs,
    ChatInput,
    ConnectButton,
    ConnectingPopup
  }
})
export default class ChatContent extends Vue {}
</script>


<style lang="scss" scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 200ms;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}

</style>
