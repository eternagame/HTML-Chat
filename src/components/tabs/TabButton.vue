<template>
    <li class="tab">
        <a :href="'#' + destination">
            {{name}}
            <slot></slot>
        </a>
    </li>
</template>

<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
@Component
export default class TabButton extends Vue {
  @Prop()
  name!: string;

  @Prop()
  destination!: string;
}
</script>


<style lang="scss" scoped>
.tab {
  border: none;
  background-color: rgba(255, 255, 255, 0.07);
  border-radius: 0;
  margin: 0;
}
.tab > a:focus {
  outline: none;
}
.tab:hover:not(.ui-state-active) {
  background-color: rgba(255, 255, 255, 0.13);
}
.tab > a {
  position: relative;
  top: 1px;
  padding: 0.4em 1.25em;
  font-family: "Century Gothic", "Didact Gothic", Arial, sans-serif;
  font-size: 12px;
  font-weight: bold;
  text-transform: uppercase;
  color: #fff;
}
.tab.ui-state-active {
  //?
  background-color: rgba(255, 255, 255, 0.2);
  padding: 0;
}
</style>
