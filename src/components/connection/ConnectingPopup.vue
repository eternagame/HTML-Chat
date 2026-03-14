<template>
  <div
    v-show="!connectionData.connected
      && connectionData.firstConnection"
    class="connecting-popup text-center text-white"
  >
    <img
      src="https://s3.amazonaws.com/eterna/icon_img/loading.gif"
      class="loading-icon"
      style="display: block"
      alt=""
    >
    <span
      v-show="connectionData.tryingToConnect"
      id="connecting"
    >Connecting...</span>
    <span
      v-show="!connectionData.tryingToConnect"
      id="failed"
    >
      Connection failed. retrying in
      <span id="timer">{{ connectionData.currentTimer }}</span> seconds.
    </span>
  </div>
</template>

<script lang="ts" setup>
import { vxm } from '#store/vxm';
import { computed } from 'vue';

const connectionData = computed(() => vxm.chat.connectionData);
</script>

<style lang="scss" scoped>
.connecting-popup {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>
