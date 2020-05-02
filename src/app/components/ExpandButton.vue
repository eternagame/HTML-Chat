<template>
<button class='plus-emoticon-button' v-on:click="toggle()">
  {{emote}}
</button>
</template>

<script lang="ts">
  import { Component, Prop, Vue } from 'vue-property-decorator';


  @Component({
  })
  export default class ExpandButton extends Vue {
    emoticon = '➕';

    get emote() {
      return this.emoticon;
    }

    toggle() {
      this.$vxm.chat.toggleExpansion();
    }
  }
</script>

<style scoped lang="scss">
button {
  position: absolute;
  bottom: 0px;
  padding-right:3px;
  padding-left:3px;
  padding-bottom:1px;
  padding-top:1px;
  right:0px;
  margin:5px;
  border: solid 1px white;
  border-radius:8%;
  background-color:white;
}
</style>
