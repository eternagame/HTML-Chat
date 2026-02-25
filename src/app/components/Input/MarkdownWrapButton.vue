<template>
  <button
    type="button"
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
      :style="style">{{buttonLetter}}</span>
  </button>
</template>
<script lang='ts' setup>
import { computed } from 'vue';
import getStyles from './Styles';

const props = defineProps({
  type: {
    type: String,
    required: true,
  },
});
const emit = defineEmits<{
  (event: 'md', type: string): void
}>();

const buttonLetter = computed(() => {
  switch (props.type) {
    case 'italics': return 'T';
    case 'action': return 'me';
    case 'question': return '?';
    case 'italicsbold': return 'E';
    case 'quote': return '""';
    case 'serif': return 'F';
    case 'cursive': return 'F';
    default: return props.type.substring(0, 1).toUpperCase();
  }
});
const style = computed(() => getStyles(props.type));

function typeIs(type: string) {
  return props.type.includes(type);
}

const classes = computed(() => ({
  highlight: typeIs('highlight'),
  strikethrough: typeIs('strikethrough'),
}));

function clicked() {
  emit('md', props.type);
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
    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
  }
  .strikethrough {
    text-decoration: line-through;
    font-size:12px;
    padding-top:5px;
  }
  .strikethrough:before,
  .strikethrough:after {
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
