<template>
  <button
    class="open-window border-0"
    style="float: right;"
    @click="$emit('input', !value)"
    :aria-label="`Make chat ${value ? 'fullscreen' : 'normal size'}`"
   >
  </button>
</template>

<script lang="ts">
  import { Component, Prop, Vue } from 'vue-property-decorator';


  @Component
  export default class OpenWindowButton extends Vue {
    @Prop({ required: true })
    value !: boolean;
  }
</script>


<style lang="scss" scoped>
  .open-window {
    background-image: url("~@/assets/open-window.png");
    background-repeat: no-repeat;
    background-size: 60% 60%;
    background-position: center;
    height: 34px;
    width: 35px;
    background-color: transparent;
  }
  .open-window:hover {
    cursor: pointer;
  }
</style>
