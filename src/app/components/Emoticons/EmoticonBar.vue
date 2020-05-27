<template>
  <div id='emoticon-bar-container'>
    <ExpandButton @expand="expand" class="border-left" v-if="emoticonChatFeatures"/>
    <EmoticonButton emoticon="👍" class="border-left" @emote='add' v-if="emoticonChatFeatures"/>
    <EmoticonButton emoticon="👎" class="border-left" @emote='add' v-if="emoticonChatFeatures"/>
    <EmoticonButton emoticon="🙂" class="border-left" @emote='add' v-if="emoticonChatFeatures"/>
    <EmoticonButton
      v-for="emoticon in emotesList"
      :key="emoticon"
      :emoticon='emoticon'
      class="border-left"
      v-show="value && emoticonChatFeatures"
      @emote='add' />
    <MarkdownWrapButton
      type="bold"
      class="border-left"
      @md="format"
      v-if="markdownChatFeatures" />
      <MarkdownWrapButton
      type="italics"
      class="border-left"
      @md="format"
      v-if="markdownChatFeatures" />
      <MarkdownWrapButton
      type="strikethrough"
      id="strike"
      class="border-left"
      @md="format"
      v-if="markdownChatFeatures" />
      <MarkdownWrapButton
      type="code"
      class="border-left"
      @md="format"
      v-if="markdownChatFeatures" />
      <MarkdownWrapButton
      type="link"
      class="border-left"
      @md="format"
      v-if="markdownChatFeatures" />
      <MarkdownWrapButton
      type="action"
      class="border-left"
      @md="format"
      v-if="markdownChatFeatures" />
      <MarkdownWrapButton
      type="question"
      class="border-left"
      @md="format"
      v-if="markdownChatFeatures" />
  </div>
</template>
<script lang='ts'>
  import {
    Component, Prop, Vue, Watch,
  } from 'vue-property-decorator';
  import EmoticonButton from './EmoticonButton.vue';
  import ExpandButton from './ExpandButton.vue';
  import SendButton from '../SendButton.vue';
  import MarkdownWrapButton from './MarkdownWrapButton.vue';
  @Component({
    components: {
      SendButton,
      EmoticonButton,
      ExpandButton,
      MarkdownWrapButton,
    },
  })
  export default class EmoticonBar extends Vue {
    value = false;

    emotesList = ['🙁', '😡']; // Emotes that appear when expanded

    expand(val:boolean) {
      this.value = val;
    }

    add(emote:string) { // Emits event to MessagePane
      this.$emit('emote', emote);
    }

    format(options:string) { // Emits event to MessagePane
      this.$emit('md', options);
    }

    get emoticonChatFeatures() { // Gets values from settings vuex
      return this.$vxm.settings.emoticonChatFeatures;
    }

    get markdownChatFeatures() {
      return this.$vxm.settings.markdownChatFeatures;
    }
  }
</script>
<style scoped>
#emoticon-bar-container {
  background-color:white;
  width:calc(100% - 2px); /* Same width as textarea */
  border-radius:8px;
  height:25px;
  margin-bottom:5px;
  overflow:hidden; /* Prevents awkward scrolling and overflow */
}
.border-left {
  border-left: 1px solid black;
}
#strike { /* Strikethrough isn't cut off */
  padding:2px;
  padding-right:2px;
  overflow-x:hidden;
  text-align:center;
}
</style>
