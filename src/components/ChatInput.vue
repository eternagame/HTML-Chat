<template>
  <div>
    <textarea :style="{height}" id="chat-input" @keyup="onKeyUp" @input="onInput" v-model="message" :enabled="$store.state.connectionData.connected"></textarea>
    <div id="chat-input-hidden" ref="hiddenDiv">{{message}}</div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { CHAT_CHANNEL } from "../define-user";

@Component
export default class ChatInput extends Vue {
  message = "";
  height = "19px";
  $refs!: {
    hiddenDiv: HTMLFormElement
  }
  onInput(e: KeyboardEvent){
    this.height = this.$refs.hiddenDiv.clientHeight + 'px';
  }
  onKeyUp(e: KeyboardEvent) {
    if (e.which == 13) {
      this.$store.dispatch("sendMessage", {
        message: this.message,
        channel: CHAT_CHANNEL
      });
      this.message = "";
    }
    this.height = this.$refs.hiddenDiv.clientHeight + 'px';
  }
}
</script>

<style scoped lang="scss">
/************* Chat input *************/
#chat-input {
  position: absolute;
  bottom: 0px;
  width: calc(100% - 28px);
  height: 19px;
  resize: none;
  margin: 10px;
  overflow: hidden;
}

/* To determine input size */
#chat-input-hidden {
    visibility: hidden;
    white-space: pre-wrap;
    word-wrap: break-word;
    width: calc(100% - 28px);
    min-height: 19px;
    border: 1px;
}
</style>
