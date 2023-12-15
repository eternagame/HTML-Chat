<template>
  <div
    id='emoticon-button-container'
    class='emoticon-button text-white border-left-0 border-top-0  pt-1 text-center float-left'
    @click="clicked"
  >
    <p id='emoticon-text-container' class='align-middle h-100'>{{emoticon}}</p>
  </div>
</template>
<script lang='ts'>
  import { Component, Prop, Vue } from 'vue-property-decorator';
  @Component
  export default class EmoticonButton extends Vue {
    @Prop({ required: true })
    emoticon !: string;

    clicked() {
      this.$emit('emote', this.emoticon);
    }
  }
</script>
<style scoped>
  .emoticon-button {
    background-color:#043468;
    position: relative;
    width:30px;
    height:25px;
  }
  #emoticon-button-container:hover {
    background-color: #21508c;
  }
  #emoticon-text-container {
    font-size:14px;
    -webkit-user-select: none;
    -moz-user-select: none;
  }
</style>
