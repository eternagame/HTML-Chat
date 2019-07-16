<template>
  <Message
    v-if="!$store.state.connectionData.connected && !$store.state.connectionData.firstConnection"
    id="chat-loading"
  >
    <img
      src="https://s3.amazonaws.com/eterna/icon_img/loading.gif"
      class="loading-icon"
    >
    <span
      v-show="$store.state.connectionData.tryingToConnect"
      id="connecting"
    >Connecting...</span>
    <span
      v-show="!$store.state.connectionData.tryingToConnect"
      id="failed"
    >
      Connection failed. retrying in
      <span id="timer">{{ $store.state.connectionData.currentTimer }}</span> seconds.
    </span>
  </Message>
</template>

<script lang="ts">
  import { Component } from 'vue-property-decorator';
  import Vue from '@/types/vue';
  import MessageComp from '@/components/ChatContent/Messages/Message.vue';

  @Component({ components: { Message: MessageComp } })
  export default class ConnectingMessage extends Vue {}
</script>

<style lang="scss">
.loading-icon {
  margin-bottom: 5px;
  background-repeat: no-repeat;
  width: 20px;
  height: 20px;
  margin-left: auto;
  margin-right: auto;
  vertical-align: middle;
}
</style>
