<template>
  <li
    v-if="!connectionData.connected && !connectionData.firstConnection && !disconnected"
    id="chat-loading"
    style="list-style-type: none"
  >
    <img
      src="https://s3.amazonaws.com/eterna/icon_img/loading.gif"
      class="loading-icon mr-auto ml-auto align-middle mb-1"
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
  </li>
</template>

<script lang="ts" setup>
import { vxm } from '#store/vxm';
import { computed } from 'vue';

const connectionData = computed(() => vxm.chat.connectionData);
const disconnected = computed(() => vxm.chat.disconnected);
</script>

<style lang="scss">
.loading-icon {
  background-repeat: no-repeat;
  width: 20px;
  height: 20px;
}
</style>
