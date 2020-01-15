<template>
  <Button
    :class="{active: selected}"
    @click="changeTab"
  >
    {{ name }}
    <slot />
  </Button>
</template>

<script lang="ts">
  import { Component, Prop } from 'vue-property-decorator';
  import Vue from '@/types/vue';

  @Component
  export default class TabButton extends Vue {
    get name() {
      return this.$store.state.$_chat.tabs[this.index].name;
    }

    @Prop()
    index!: number;

    get selected() {
      return this.$store.state.$_chat.activeTab === this.index;
    }

    changeTab(e: Event) {
      if (!this.selected) {
        this.$store.commit('$_chat/changeTab', { tabIndex: this.index });
      }
    }
  }
</script>


<style lang="scss" scoped>
  /* Style the buttons that are used to open the tab content */
  button {
    float: left;
    border: none;
    outline: none;
    cursor: pointer;
    transition: 0.3s;
    top: 1px;
    padding: 0.4em 1.25em;
    height: 100%;
    font-family: "Century Gothic", "Didact Gothic", Arial, sans-serif;
    font-size: 12px;
    font-weight: bold;
    color: #fff;
    border: none;
    background-color: rgba(255, 255, 255, 0.07);
    border-radius: 0;
    margin: 0;
  }

  /* Change background color of buttons on hover */
  button:hover:not(.active) {
    background-color: rgba(255, 255, 255, 0.13);
  }

  /* Create an active/current tablink class */
  button.active {
    background-color: rgba(255, 255, 255, 0.2);
  }
</style>
