<template>
  <Button
    :class="{active: isActive}"
    @click="$emit('input');"
  >
    <p class='channel-name'>{{ name }}</p><br>
    <p class='channel-description'>{{ description }}</p>
    <slot />
  </Button>
</template>

<script lang="ts">
  import {
    Component, Prop, Vue, Watch,
  } from 'vue-property-decorator';
  import chat from '@/store/chat.vuex';
  import SlideoutChats from './Slideout/SlideoutChats.vue';


  @Component
  export default class TabButton extends Vue {
    @Prop()
    name!: string;

    @Prop()
    description!: string;

    @Prop()
    selected!: string;

    get isActive() {
      return this.$vxm.chat.chatChannel.includes(this.name);
    }
  }
</script>


<style lang="scss" scoped>
  /* Style the buttons that are used to open the tab content */
  button {
    border: none;
    outline: none;
    cursor: pointer;
    transition: 0.3s;
    padding: 0.4em 1.25em;
    font-family: "Century Gothic", "Didact Gothic", Arial, sans-serif;
    font-size: 12px;
    font-weight: bold;
    color: #fff;
    background-color: rgba(255, 255, 255, 0.07);
    text-transform: capitalize;
    display:block;
    width: 100%;
  }

  /* Change background color of buttons on hover */
  button:hover:not(.active) {
    background-color: rgba(255, 255, 255, 0.13);
  }

  button.active {
    background-color: rgba(255, 255, 255, 0.2);
    border-left: solid blue 10px;
  }

  .channel-name {
    font-size: 20px;
  }

  .channel-description {
    font-size: 12px;
  }
</style>
