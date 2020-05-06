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
  export default class SlideoutButtonUsers extends SlideoutButton {
    @Prop()
    name:string = 'Users';

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
    background-color: black;
    height:40px;
    background-image: url("../assets/user-icon-white.png");
    background-repeat: no-repeat;
    background-size: 60% 40%;
    background-position: center;
    width: 40px;
  }

  /* Change background color of buttons on hover */
  button:hover:not(.active) {
    background-color: rgba(255, 255, 255, 0.13);
  }

  button.active {
    background-image: url("../assets/user-icon-green.png");
  }
</style>
