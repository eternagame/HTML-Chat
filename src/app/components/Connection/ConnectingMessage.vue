<template>
  <li
    v-if="!connectionData.connected && !connectionData.firstConnection && !disconnected"
    id="chat-loading"
    style="list-style-type: none"
  >
    <img
      src="https://s3.amazonaws.com/eterna/icon_img/loading.gif"
      class="loading-icon mr-auto ml-auto align-middle mb-1"
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

<script lang="ts">
  import { Component, Vue } from 'vue-property-decorator';

  @Component({ components: { } })
  export default class ConnectingMessage extends Vue {
    get connectionData() {
      return this.$vxm.chat.connectionData;
    }

    get disconnected() {
      return this.$vxm.chat.disconnected;
    }
  }
</script>

<style lang="scss">
.loading-icon {
  background-repeat: no-repeat;
  width: 20px;
  height: 20px;
}
</style>
