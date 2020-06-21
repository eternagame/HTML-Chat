<template>
  <div class='emoticon-button' @click="value=!value; $emit('expand', !value)">
    <p id='expand-text-container'>➕</p>
  </div>
</template>
<script lang='ts'>
  import { Component, Prop, Vue } from 'vue-property-decorator';
  @Component
  export default class ExpandButton extends Vue {
    value : boolean = true;
  }
</script>
<style scoped>
  .emoticon-button {
    border:none;
    float:right;
    position: relative;
    width:20px;
    height:25px;
    padding-right:2.5px;
    padding-top:1px;
    text-align:center;
  }
  #expand-text-container {
    vertical-align: middle;
    height:100%;
    font-size:14px;
    -webkit-user-select: none;
    -moz-user-select: none;
  }
</style>
