<template>
  <Button
    :class="{active: selected}"
    @click="$emit('input')"
  >
    <slot />
  </Button>
</template>

<script lang="ts">
  import { Component, Prop, Vue } from 'vue-property-decorator';
  import SlideoutButton from './Slideout/SlideoutButton.vue';


  @Component
  export default class SlideoutButtonSettings extends SlideoutButton {
    @Prop()
    name:string = 'Settings';

    @Prop({ required: true })
    selected!: string;
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
    height:30px;
    background-image: url("../assets/settings-icon-white.png");
    background-repeat: no-repeat;
    background-size: 60% 60%;
    background-position: center;
    width: 30px;
  }

  /* Change background color of buttons on hover */
  button:hover:not(.active) {
    background-color: rgba(255, 255, 255, 0.13);
  }

  button.active {
    background-color: rgba(255, 255, 255, 0.2);
    background-image: url("../assets/settings-icon-green.png");
  }
</style>
