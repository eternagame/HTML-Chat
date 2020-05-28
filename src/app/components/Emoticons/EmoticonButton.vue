<template>
  <div id='emoticon-button-container' class='emoticon-button' @click="clicked">
    <p id='emoticon-text-container'>{{emoticon}}</p>
  </div>
</template>
<script lang='ts'>
  import { Component, Prop, Vue } from 'vue-property-decorator';
  @Component
  export default class EmoticonButton extends Vue {
    @Prop()
    emoticon !: string;

    clicked() {
      this.$emit('emote', this.emoticon);
    }
  }
</script>
<style scoped>
  .emoticon-button {
    background-color:#043468;
    color:white;
    border:none;
    float:left;
    position: relative;
    width:30px;
    height:25px;
    padding-top:1px;
    text-align:center;
  }
  #emoticon-button-container :hover {
    background-color: #21508c;
  }
  #emoticon-text-container {
    vertical-align: middle;
    height:100%;
    font-size:14px;
    -webkit-user-select: none;
    -moz-user-select: none;
  }
</style>
