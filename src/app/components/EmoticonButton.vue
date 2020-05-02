<template>
<button class='emoticon-button' v-on:click="add()">
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

    get emote() {
      return this.emoticon;
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
  padding:4px;
  margin:5px;
}
</style>
