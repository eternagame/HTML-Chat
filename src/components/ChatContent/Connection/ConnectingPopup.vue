<template>
  <div
    v-show="!$store.state.connectionData.connected &&
      $store.state.connectionData.firstConnection"
    class="connecting-popup"
  >
    <img
      src="https://s3.amazonaws.com/eterna/icon_img/loading.gif"
      class="loading-icon"
      style="display: block"
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
  </div>
</template>

<script lang="ts">
  import { Component, Prop } from 'vue-property-decorator';
  import Vue from '@/types/vue';

  @Component({ components: {} })
  export default class ConnectingPopup extends Vue {}
</script>

<style lang="scss" scoped>
.connecting-popup {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #fff;
  text-align: center;
}
</style>
