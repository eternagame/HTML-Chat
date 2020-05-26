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
    border:none;
    float:right;
    position: relative;
    width:20px;
    height:25px;
    padding-right:2.5px;
    padding-top:1px;
    text-align:center;
  }
  #emoticon-text-container {
    vertical-align: middle;
    height:100%;
    font-size:14px;
    -webkit-user-select: none;
    -moz-user-select: none;
  }
</style>
