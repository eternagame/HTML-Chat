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
      name="B"
      bold=true
      class="border-left"
      @md="format"
      v-if="markdownChatFeatures" />
      <MarkdownWrapButton
      name="T"
      italics=true
      class="border-left"
      @md="format"
      v-if="markdownChatFeatures" />
      <MarkdownWrapButton
      name="S"
      strikethrough=true
      id="strike"
      class="border-left"
      @md="format"
      v-if="markdownChatFeatures" />
      <MarkdownWrapButton
      name="C"
      code=true
      class="border-left"
      @md="format"
      v-if="markdownChatFeatures" />
      <MarkdownWrapButton
      name="L"
      link=true
      class="border-left"
      @md="format"
      v-if="markdownChatFeatures" />
      <MarkdownWrapButton
      name="A"
      action=true
      class="border-left"
      @md="format"
      v-if="markdownChatFeatures" />
      <MarkdownWrapButton
      name="?"
      question=true
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

    emotesList = ['🙁', '😡'];

    expand(val:boolean) {
      this.$emit('expanded', val);
      this.value = val;
    }

    add(emote:string) {
      this.$emit('emote', emote);
    }

    format(options:string) {
      this.$emit('md', options);
    }

    get emoticonChatFeatures() {
      return this.$vxm.settings.emoticonChatFeatures;
    }

    get markdownChatFeatures() {
      return this.$vxm.settings.markdownChatFeatures;
    }

    get allChatFeatures() {
      if (this.$vxm.settings.allChatFeatures) {
        return true;
      }
      return (this.markdownChatFeatures || this.emoticonChatFeatures);
    }
  }
</script>
<style scoped>
#emoticon-bar-container {
  position: relative;
  top:0;
  background-color:white;
  width:calc(100% - 2px);
  border-radius:8px;
  height:25px;
  margin-bottom:5px;
  overflow:hidden;
}
.border-left {
  border-left: 1px solid black;
}
.border-right {
  border-right: 1px solid black;
}
#strike {
  padding:2px;
  padding-right:2px;
  overflow-x:hidden;
  text-align:center;
}
</style>
