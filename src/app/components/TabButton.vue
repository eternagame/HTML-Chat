<template>
  <Button
    :class="{active: isActive}"
    @click="$emit('input');"
  >
    <p class='channel-name'>#{{ name }}</p>
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
    font-family: "Open Sans","Century Gothic", "Didact Gothic", Arial, sans-serif;
    font-size: 12px;
    font-weight: bold;
    color: #fff;
    background-color: black;
    text-transform: none;
    display:block;
    width: 100%;
    height:min-content;
    margin:0px;
  }

  /* Change background color of buttons on hover */
  button:hover:not(.active) {
    background-color: rgba(255, 255, 255, 0.13);
  }

  button.active {
    border-left: solid #4A90E2 10px;
    border-top-left-radius: 5%;
    border-bottom-left-radius: 5%;
    padding-left:5px;
  }

  .channel-name {
    margin-top:2px;
    font-size: 20px;
    text-align: justify;
    text-justify:auto;
    margin-left:5px;
    margin-bottom:10px;
  }

  .channel-description {
    font-size: 12px;
    text-align:justify;
    margin-left:5px;
  }
</style>
