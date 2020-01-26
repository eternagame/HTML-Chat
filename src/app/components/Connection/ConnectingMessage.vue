<template>
  <li
    v-if="!connectionData.connected && !connectionData.firstConnection"
    id="chat-loading"
  >
    <img
      src="https://s3.amazonaws.com/eterna/icon_img/loading.gif"
      class="loading-icon"
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
  }
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
