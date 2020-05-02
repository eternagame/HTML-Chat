<template>
<button class='plus-emoticon-button' v-on:click="toggle()" :style="{ right: rightAmount + 'px'}">
  {{emote}}
</button>
</template>

<script lang="ts">
  import { Component, Prop, Vue } from 'vue-property-decorator';


  @Component({
  })
  export default class EmoticonButton extends Vue {
    emoticon = '➕';

    @Prop({ required: true })
    position!: Number;

    get emote() {
      return this.emoticon;
    }

    get rightAmount() {
      return ((Number(this.position) - 1) * 20).toString();
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
  right:0px;
  padding:3px;
  margin:5px;
  border: solid 1px white;
  border-radius:10%;
  background-color:white;
}
</style>
