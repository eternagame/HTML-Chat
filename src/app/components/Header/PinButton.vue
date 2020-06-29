<template>
  <button
    class="pin-button"
    style="float: right;"
    @click="$emit('input', !value);"
    :class="{ active: value}"
    aria-label="`Click to pin viewed messages"
   >
   <v-style>
      button:focus {
        border: {{$vxm.chat.tabbing ? '' : 'none !important'}};
        outline: {{$vxm.chat.tabbing ? '' : 'none !important'}};
      }
    </v-style>
  </button>
</template>

<script lang="ts">
  import { Component, Prop, Vue } from 'vue-property-decorator';


  @Component
  export default class PinButton extends Vue {
    @Prop()
    value!: boolean;
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
    border: none;
    transition: all 0.4s;
  }
  .pin-button:hover {
    cursor: pointer;
  }
  .pin-button.active {
    background-image: url("../../assets/pin.png");
  }
</style>
