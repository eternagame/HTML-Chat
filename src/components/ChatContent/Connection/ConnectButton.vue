<template>
  <div
    id="reconnect"
    :class="{active: $store.state.connectionData.tryingToConnect}"
    class="unselectable clickable green-button-interactive rounded-5 centered"
    style="color:white; font-weight:bolder; font-size:13px;"
  @click="$store.dispatch('connect');">
    <div class="green-button-bg rounded-5"></div>Reconnect
  </div>
</template>

<script lang="ts">
import { Component, Prop } from "vue-property-decorator"
import Vue from '@/types/vue'

@Component({})
export default class ConnectButton extends Vue {}
</script>

<style scoped lang="scss">
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
  box-shadow: 5px 5px #2c6628;

  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
div:hover {
  background-color: #48a641;
  box-shadow: 4px 4px #2c6628;
  -webkit-transform: translate(1px, 1px);
  -moz-transform: translate(1px, 1px);
  transform: translate(1px, 1px);
}

div:active,
div.active {
  background-color: #48a641;
  box-shadow: 2px 2px #2c6628;
  -webkit-transform: translate(3px, 3px);
  -moz-transform: translate(3px, 3px);
  transform: translate(3px, 3px);
}
</style>