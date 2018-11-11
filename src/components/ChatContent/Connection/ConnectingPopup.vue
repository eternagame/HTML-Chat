<template>
  <div
    id="chat-loading"
    style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: #FFF; text-align: center;"
    v-show="!$store.state.connectionData.connected &&
              $store.state.connectionData.firstConnection"
  >
    <img
      src="https://s3.amazonaws.com/eterna/icon_img/loading.gif"
      style="margin-bottom: 5px; background-repeat: no-repeat; width: 20px; height: 20px; margin-left: auto; margin-right: auto; display: block;"
    >
    <span id="connecting" v-show="$store.state.connectionData.tryingToConnect">Connecting...</span>
    <span id="failed" v-show="!$store.state.connectionData.tryingToConnect">
      Connection failed. retrying in
      <span id="timer">{{$store.state.connectionData.currentTimer}}</span> seconds.
    </span>
  </div>
</template>

<script lang="ts">
import { Component, Prop } from "vue-property-decorator";
import Vue from "@/types/vue";
import ConnectingMessageContent from "./ConnectingMessageContent.vue";

@Component({ components: { ConnectingMessageContent } })
export default class ConnectingPopup extends Vue {}
</script>

<style lang="scss">
</style>
