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
  export default class SlideoutButtonChat extends SlideoutButton {
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
    background-image: url("../assets/chat-icon-white.png");
    background-repeat: no-repeat;
    background-size: 40% 60%;
    background-position: center;
    width: 40px;
  }
  button.active { /* When button is selected, use green icon */
    background-image: url("../assets/chat-icon-green.png");
  }
</style>
