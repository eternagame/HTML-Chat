<template>
  <div
    class="connecting-popup"
    v-show="!$store.state.connectionData.connected &&
              $store.state.connectionData.firstConnection"
  >
    <img src="https://s3.amazonaws.com/eterna/icon_img/loading.gif" class="loading-icon" style="display: block">
    <span id="connecting" v-show="$store.state.connectionData.tryingToConnect">Connecting...</span>
    <span id="failed" v-show="!$store.state.connectionData.tryingToConnect">
      Connection failed. retrying in
      <span id="timer">{{$store.state.connectionData.currentTimer}}</span> seconds.
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
