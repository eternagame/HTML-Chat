<template>
  <div>
    <img
      src="https://s3.amazonaws.com/eterna/icon_img/loading.gif"
      style="margin-bottom: 5px; background-repeat: no-repeat; width: 20px; height: 20px; margin-left: auto; margin-right: auto; display: block;"
    >
    <span
      id="connecting"
      v-show="$store.state.connectionData.tryingToConnect"
    >Connecting...</span>
    <span id="failed" v-show="!$store.state.connectionData.tryingToConnect">
      Connection failed. retrying in
      <span id="timer">{{$store.state.connectionData.currentTimer}}</span> seconds.
    </span>
  </div>
</template>

<script lang="ts">
  import { Component, Prop } from "vue-property-decorator"
import Vue from '@/types/vue'

  @Component({})
  export default class ConnectingMessageContent extends Vue {
  }
</script>

<style scoped lang="scss">
</style>
