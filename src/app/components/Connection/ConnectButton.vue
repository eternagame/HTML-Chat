<template>
  <div
    id="reconnect"
    :class="{active: $vxm.chat.connectionData.tryingToConnect}"
    class="connect-button btn btn-primary w-100 font-weight-bolder"
    style="font-size:13px;"
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
