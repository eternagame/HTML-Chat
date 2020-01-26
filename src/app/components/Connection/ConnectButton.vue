<template>
  <div
    id="reconnect"
    :class="{active: $vxm.chat.connectionData.tryingToConnect}"
    class="connect-button"
    style="color:white; font-weight:bolder; font-size:13px;"
    @click="$vxm.chat.connect;"
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

div {
  background-color: #4fb748;
  font-weight: normal;
  position: relative;
  text-align: center;
  font-size: 12px;
  padding: 0px;
  text-transform: capitalize;
  font-family: "Century Gothic", "Didact Gothic", Arial, sans-serif;
  -webkit-border-radius: 5px;
  -moz-border-radius: 5px;
  border-radius: 5px;
  text-decoration: none;

  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;

  box-shadow: 5px 5px #2c6628;
  -webkit-transform: translate(-5px, -5px);
  -moz-transform: translate(-5px, -5px);
  transform: translate(-5px, -5px);
  height: 21px; //19px + 2px border
}
div:hover {
  background-color: #48a641;
  box-shadow: 4px 4px #2c6628;
  -webkit-transform: translate(-4px, -4px);
  -moz-transform: translate(-4px, -4px);
  transform: translate(-4px, -4px);
}

div:active,
div.active {
  background-color: #48a641;
  box-shadow: 2px 2px #2c6628;
  -webkit-transform: translate(-2px, -2px);
  -moz-transform: translate(-2px, -2px);
  transform: translate(-2px, -2px);
}
</style>
