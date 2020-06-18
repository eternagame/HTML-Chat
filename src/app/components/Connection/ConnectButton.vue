<template>
  <div
    id="reconnect"
    :class="{active: $vxm.chat.connectionData.tryingToConnect}"
    class="connect-button btn"
    style="color:white; font-weight:bolder; font-size:13px;"
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

@import "@/assets/_custom.scss";
@import "~bootstrap/scss/bootstrap.scss";
@import '~bootstrap-vue/dist/bootstrap-vue.css';
.connect-button {
  width: 100%;
  background-color:$green;
}
</style>
