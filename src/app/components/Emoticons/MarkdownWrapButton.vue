<template>
  <div id='md-wrap-button-container' class='md-button' @click="clicked">
    <strong class="text" v-if="typeIs('bold')">B</strong>
    <em class="text" v-if="typeIs('italics')">T</em>
    <div class="text" id="s" v-if="typeIs('strikethrough')">S</div>
    <code class="text" v-if="typeIs('code')">C</code>
    <u class="text" v-if="typeIs('link')">L</u>
    <strong class="text" id="action" v-if="typeIs('action')"><em>me</em></strong>
    <p class="text" v-if="typeIs('question')">?</p>
    <em class="text" v-if="typeIs('italicsbold')"><strong>E</strong></em>
  </div>
</template>
<script lang='ts'>
  import { Component, Prop, Vue } from 'vue-property-decorator';
  @Component
  export default class MarkdownWrapButton extends Vue {
    @Prop()
    type !: string;

    typeIs(type:string) {
      return this.type === type;
    }

    clicked() {
      this.$emit('md', this.type);
    }
  }
</script>
<style scoped>
  .md-button {
    color:white;
    border:none;
    float:left;
    position: relative;
    width:25px;
    height:25px;
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

  #action {
    font-size:12px;
    padding-left:1px;
  }
</style>
