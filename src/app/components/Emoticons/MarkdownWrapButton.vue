<template>
  <div id='md-wrap-button-container' class='md-button' @click="clicked">
    <strong class="text" v-if="b">B</strong>
    <em class="text" v-if="i">I</em>
    <div class="text" id="s" v-if="s">S</div>
    <code class="text" v-if="c">C</code>
    <u class="text" v-if="l">L</u>
  </div>
</template>
<script lang='ts'>
  import { Component, Prop, Vue } from 'vue-property-decorator';
  @Component
  export default class MarkdownWrapButton extends Vue {
    @Prop()
    name !: string;

    @Prop()
    italics !: boolean;

    @Prop()
    bold !: boolean;

    @Prop()
    strikethrough !: boolean;

    @Prop()
    code !: boolean;

    @Prop()
    link !: boolean;

    get c() {
      return this.code;
    }

    get i() {
      return this.italics;
    }

    get b() {
      return this.bold;
    }

    get s() {
      return this.strikethrough;
    }

    get l() {
      return this.link;
    }

    clicked() {
      this.$emit('md', this.name);
    }
  }
</script>
<style scoped>
  .md-button {
    color:black;
    border:none;
    float:right;
    position: relative;
    width:20px;
    height:25px;
    padding-right:2.5px;
    padding-top:1px;
    text-align:center;
  }
  .text {
    vertical-align: middle;
    height:100%;
    font-size:16px;
    -webkit-user-select: none;
    -moz-user-select: none;
  }
  #s {
    text-decoration: line-through;
    font-size:12px;
    padding-top:2px;
  }

  #s:before,
  #s:after {
    content: "\00a0\00a0";
  }
</style>
