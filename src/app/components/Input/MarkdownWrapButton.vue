<template>
  <button
    id='md-wrap-button-container'
    class='
    md-button
    text-white
    border-left-0
    border-top-0
    border-bottom-0
    float-left
    pt-0
    text-center'
    @click="clicked">
    <span
      class="text"
      :class="classes"
      :id="typeIs('strikethrough') ? 's' : ''"
      :style="style">{{buttonLetter}}
    </span>
  </button>
</template>
<script lang='ts'>
  import { Component, Prop, Vue } from 'vue-property-decorator';
  import getStyles from './Styles';
  @Component
  export default class MarkdownWrapButton extends Vue {
    @Prop({ required: true })
    type !: string;

    typeIs(type:string):boolean {
      return this.type.includes(type);
    }

    get buttonLetter() {
      switch (this.type) {
        case 'italics': return 'T';
        case 'action': return 'me';
        case 'question': return '?';
        case 'italicsbold': return 'E';
        case 'quote': return '""';
        case 'serif': return 'F';
        case 'cursive': return 'F';
        default: return this.type.substring(0, 1).toUpperCase();
      }
    }

    get style() {
      return getStyles(this.type);
    }

    get classes() {
        return {
          highlight: this.typeIs('highlight'),
        };
      }

    clicked() {
      this.$emit('md', this.type);
    }
  }
</script>
<style scoped>
  .md-button {
    background-color:#043468;
    position: relative;
    width:30px;
    height:25px;
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
    content: "-";
  }
  .highlight {
    display: inline-flex;
    align-items: center;
    background-color:yellow;
    color: black;
    vertical-align: baseline;
    height: 18px;
  }
</style>
