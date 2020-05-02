<template>
<button class='emoticon-button' v-on:click="add()" :style="{ right: rightAmount + 'px'}">
  {{emote}}
</button>
</template>

<script lang="ts">
  import { Component, Prop, Vue } from 'vue-property-decorator';


  @Component({
  })
  export default class EmoticonButton extends Vue {
    @Prop({ required: true })
    emoticon!: string;

    @Prop({ required: true })
    position!: Number;

    get emote() {
      return this.emoticon;
    }

    get rightAmount() {
      return ((Number(this.position) - 1) * 20).toString();
    }

    add() {
      this.$vxm.chat.addString(this.emote);
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
