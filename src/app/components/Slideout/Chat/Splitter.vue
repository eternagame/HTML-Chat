<template>
  <div class="splitter" /> <!--- Just a filled-in div --->
</template>

<script lang="ts">
  import { Component, Prop, Vue } from 'vue-property-decorator';


  @Component
  export default class Splitter extends Vue {
  }
</script>

<style lang="scss" scoped>
  .splitter {
    height:1px;
    width:calc(100% - 10px);
    padding:0px;
    padding-right:5px;
    padding-left:5px;
    background-color:#7b8a8b;
    position:relative;
    margin:0px;
    top:5px;
  }
</style>
