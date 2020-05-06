<template>
  <div id="splitter"></div>
</template>

<script lang="ts">
  import { Component, Prop, Vue } from 'vue-property-decorator';


  @Component
  export default class Splitter extends Vue {
  }
</script>

<style lang="scss" scoped>
  #splitter {
    height:1px;
    width:90%;
    padding:0px;
    padding-right:5px;
    padding-left:5px;
    background-color:gray;
    position:relative;
    margin:0px;
    margin-bottom:0px;
    top:15px;
  }
</style>
