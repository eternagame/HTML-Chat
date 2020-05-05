<template>
  <a
    class="open-window"
    style="float: right;"
    href="link-to-full-window"
  >
  </a>
</template>

<script lang="ts">
  import { Component, Prop, Vue } from 'vue-property-decorator';


  @Component
  export default class OpenWindowButton extends Vue {
  }
</script>


<style lang="scss" scoped>
  .open-window {
    background-image: url("../assets/open-window.png");
    background-repeat: no-repeat;
    background-size: 60% 60%;
    background-position: center;
    height: 24px;
    width: 25px;
  }
</style>
