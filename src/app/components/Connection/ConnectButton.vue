<template>
  <div
    id="reconnect"
    :class="{active: $vxm.chat.connectionData.tryingToConnect}"
    class="connect-button btn"
    style="color:white; font-weight:bolder; font-size:13px; background-color: $green"
    @click="$vxm.chat.connect"
  >
    Reconnect
  </div>
</template>

<script lang="ts">
  import { Component, Prop, Vue } from 'vue-property-decorator';

  @Component({})
  export default class ConnectButton extends Vue { }
</script>

<style scoped lang="scss">
.connect-button {
  width: 100%;
}
</style>
