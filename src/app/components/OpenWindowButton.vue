<template>
  <div
    class="open-window"
    style="float: right;"
    @click="$emit('input', !value)"
  >
  </div>
</template>

<script lang="ts">
  import { Component, Prop, Vue } from 'vue-property-decorator';


  @Component
  export default class OpenWindowButton extends Vue {
    @Prop()
    value!: boolean;
  }
</script>


<style lang="scss" scoped>
  .open-window {
    background-image: url("../assets/open-window.png");
    background-repeat: no-repeat;
    background-size: 60% 60%;
    background-position: center;
    height: 34px;
    width: 35px;
  }
  .open-window:hover {
    cursor: pointer;
  }
</style>
