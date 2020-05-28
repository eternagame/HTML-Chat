<template>
  <button id='md-wrap-button-container' class='md-button' @click="clicked">
    <strong class="text" v-if="typeIs('bold')">B</strong>
    <em class="text" v-if="typeIs('italics')">T</em>
    <span class="text" id="s" v-if="typeIs('strikethrough')">S</span>
    <code class="text" v-if="typeIs('code')">C</code>
    <u class="text" v-if="typeIs('link')">L</u>
    <strong class="text" id="action" v-if="typeIs('action')"><em>me</em></strong>
    <span class="text" v-if="typeIs('question')">?</span>
    <em class="text" v-if="typeIs('italicsbold')"><strong>E</strong></em>
  </button>
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
    background-color:#043468;
    border:none;
    float:left;
    position: relative;
    width:30px;
    height:25px;
    padding-top:1px;
    text-align:center;
  }
  .md-button:hover {
    background-color:#21508c;
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
    padding-top:5px;
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
