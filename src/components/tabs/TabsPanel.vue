<template>
    <ul>
        <tab-button name="General"></tab-button>
        <tab-button name="Online">(0)</tab-button>
        <li style="float: right;"><div id="minimization-triangle"></div></li>

    </ul>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import TabButton from './TabButton.vue';

@Component({
  components: {
  TabButton
  }
  })
export default class Message extends Vue {}
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
