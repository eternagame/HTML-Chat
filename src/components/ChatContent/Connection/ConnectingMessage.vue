<template>
  <message v-if="!$store.state.connectionData.connected && !$store.state.connectionData.firstConnection" id="chat-loading" >
    <img
      src="https://s3.amazonaws.com/eterna/icon_img/loading.gif"
      style="margin-bottom: 5px; background-repeat: no-repeat; width: 20px; height: 20px; margin-left: auto; margin-right: auto;vertical-align: middle;"
    >
    <span
      id="connecting"
      v-show="$store.state.connectionData.tryingToConnect"
    >Connecting...</span>
    <span id="failed" v-show="!$store.state.connectionData.tryingToConnect">
      Connection failed. retrying in
      <span id="timer">{{$store.state.connectionData.currentTimer}}</span> seconds.
    </span>
  </message>
</template>

<script lang="ts">
  import { Component, Prop } from "vue-property-decorator"
  import Vue from '@/types/vue'
  import ConnectingMessageContent from './ConnectingMessageContent.vue'
  import MessageComp from "@/components/ChatContent/Messages/Message.vue";

  @Component({components: {ConnectingMessageContent, Message: MessageComp}})
  export default class ConnectingMessage extends Vue {
  }
</script>

<style lang="scss">
// /************ Chat Loading ************/
// #chat-loading > img {
//     float: left;
//     display: inline-block;
// }

</style>
