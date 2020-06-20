<template>
  <button id='md-wrap-button-container' class='md-button' @click="clicked">
    <span class="text" :style="style">{{buttonLetter}}</span>
  </button>
</template>
<script lang='ts'>
  import { Component, Prop, Vue } from 'vue-property-decorator';
  @Component
  export default class MarkdownWrapButton extends Vue {
    @Prop()
    type !: string;

    typeIs(type:string) {
      return this.type.includes(type);
    }

    get buttonLetter() {
      switch (this.type) {
        case 'italics': return 'T';
        case 'action': return 'me';
        case 'question': return '?';
        case 'italicsbold': return 'E';
        case 'quote': return '""';
        default: return this.type.substring(0, 1).toUpperCase();
      }
    }

    get style() {
      const bold = this.typeIs('bold') || this.typeIs('action');
      const italics = this.typeIs('italics') || this.typeIs('action');
      const strikethrough = this.typeIs('strikethrough');
      const code = this.typeIs('code');
      const link = this.typeIs('link');
      return {
        'font-weight': bold ? 'bold' : '',
        'font-style': italics ? 'italic' : '',
        'text-decoration': `${strikethrough ? 'line-through' : ''} ${link ? 'underline' : ''}`,
        'font-family': code ? 'monospace' : '',
      };
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
    vertical-align:text-bottom;
  }
</style>
