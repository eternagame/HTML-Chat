<template>
  <button
    class="pin-button border-0"
    style="float: right;"
    @click="$emit('input', !value);"
    :class="{ active: value}"
    aria-label="`Click to pin viewed messages"
   >
  </button>
</template>

<script lang="ts">
  import { Component, Prop, Vue } from 'vue-property-decorator';


  @Component
  export default class PinButton extends Vue {
    @Prop({ required: true })
    value !: boolean;
  }
</script>


<style lang="scss" scoped>
  .pin-button {
    background-image: url("../../assets/pin-outline.png");
    background-repeat: no-repeat;
    background-size: 60% 60%;
    background-position: center;
    height: 35px;
    width: 35px;
    background-color: transparent;
    transition: all 0.4s;
  }
  .pin-button:hover {
    cursor: pointer;
  }
  .pin-button.active {
    background-image: url("../../assets/pin.png");
  }
</style>
