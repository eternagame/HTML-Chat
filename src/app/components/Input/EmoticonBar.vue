<template>
  <div id='menu-container'>
    <div
      id='submenu'
      v-show='(emoticonsSelected || markdownSelected || previewSelected) && anyChatFeatures'>
      <div id='emoticon-submenu' v-show="emoticonsSelected && emoticonChatFeatures" >
        <EmoticonButton
          v-for="emoticon in emotesList"
          :key="emoticon"
          :emoticon='emoticon'
          class="border-right"
          @emote='add' />
      </div>
      <div id='markdown-submenu' v-show="markdownSelected && markdownChatFeatures">
        <MarkdownWrapButton
          v-for="item in markdownCodes"
          :key="item"
          :type="item"
          class="border-right"
          @md="format"
        />
      </div>
      <div id='preview-submenu' v-show="previewSelected && previewChatFeatures">
        <div v-html="inputHTML" id="preview-content"/>
      </div>
      <MenuButton
        id="close"
        class="other-menu-button"
        name="X"
        styles="bold"
        @button="menuButtonClicked"
      />
    </div>
    <div id='input'>
        <slot name="input"></slot>
      </div>
    <div
      id='emoticon-bar-container'
      v-if="anyChatFeatures" >
      <MenuButton
        id="emoticonSelect"
        v-if="emoticonChatFeatures"
        name="👍"
        styles=""
        @button="select('emoticon');"
      />
      <MenuButton
        id="markdownSelect"
        v-if="markdownChatFeatures"
        name="A"
        styles="bold italics underline"
        @button="select('markdown');"
      />
      <MenuButton
        id="previewSelect"
        v-if="previewChatFeatures"
        name="P"
        styles=""
        @button="select('preview');"
      />
      <MenuButton
        name="?"
        class="other-menu-button"
        styles=""
        @button="menuButtonClicked"
      />
    </div>
  </div>
</template>
<script lang='ts'>
  import {
    Component, Prop, Vue, Watch,
  } from 'vue-property-decorator';
  import EmoticonButton from './EmoticonButton.vue';
  import ExpandButton from './ExpandButton.vue';
  import SendButton from './SendButton.vue';
  import MarkdownWrapButton from './MarkdownWrapButton.vue';
  import MenuButton from './MenuButton.vue';
  import md from '@/tools/Markdown';
  import MessagePane from '../Panes/MessagePane.vue';
  @Component({
    components: {
      SendButton,
      EmoticonButton,
      ExpandButton,
      MarkdownWrapButton,
      MenuButton,
    },
  })
  export default class EmoticonBar extends Vue {
    // Emoticons

    get emotesList() { // List of all emotes from defaults and custom
      const defaultEmotes = ['👍', '👎', '🙂', '🙁'];
      return defaultEmotes.concat(this.customEmoticons);
    }

    get customEmoticons() { // Gets custom emoticons
      return this.$vxm.chat.customEmoticons;
    }

    // Markdown button

    markdownCodes = ['bold', 'italics', 'italicsbold', 'strikethrough', 'code', 'link', 'action', 'quote'];

    // Submenu selection

    emoticonsSelected = false;

    markdownSelected = false;

    previewSelected = false;

    /* Opens emoticon or markdown submenu depending on which button was pressed */
    select(menu:string) {
      if (menu === 'markdown') {
        this.markdownSelected = true;
        this.emoticonsSelected = false;
        this.previewSelected = false;
      } else if (menu === 'emoticon') {
        this.markdownSelected = false;
        this.emoticonsSelected = true;
        this.previewSelected = false;
      } else if (menu === 'preview') {
        this.markdownSelected = false;
        this.emoticonsSelected = false;
        this.previewSelected = true;
      }
      this.$emit('update');
    }

    // Click handling

    menuButtonClicked(button:string) { // Handles button clicks
      switch (button) {
      case 'X':
        this.markdownSelected = false;
        this.emoticonsSelected = false;
        this.previewSelected = false;
        break;
      case '?':
        this.$emit('md', 'question');
        break;
      default: break;
      }
      this.$emit('update');
    }

    // Changing input

    add(emote:string) { // Emits event to MessagePane
      this.$emit('emote', emote);
    }

    format(options:string) { // Emits event to MessagePane
      this.$emit('md', options);
    }

    @Prop()
    inputValue = '';

    @Prop()
    selection !: number[];

    get inputHTML() {
      let value = this.inputValue;
      if (this.selection !== [0, 0] && this.selection[1] - this.selection[0] > 0) {
        value = value.slice(this.selection[0], this.selection[1]);
      }
      return md.renderInline(value);
    }

    // Chat features

    get emoticonChatFeatures() { // Gets values from settings vuex
      return this.$vxm.settings.emoticonChatFeatures;
    }

    get markdownChatFeatures() {
      return this.$vxm.settings.markdownChatFeatures;
    }

    get previewChatFeatures() {
      return this.$vxm.settings.previewChatFeatures;
    }

    get anyChatFeatures() {
      return this.emoticonChatFeatures
        || this.markdownChatFeatures
        || this.previewChatFeatures;
    }
  }
</script>
<style scoped>
#emoticon-bar-container {
  background-color:#043468;
  color:white;
  width:calc(100% - 2px); /* Same width as textarea */
  height:25px;
  border:none;
  overflow:hidden; /* Prevents awkward scrolling and overflow */
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
}
#strike { /* Strikethrough isn't cut off */
  padding:2px;
  padding-right:2px;
  overflow-x:hidden;
  text-align:center;
}
#submenu {
  background-color:#043468;
  color:white;
  width:calc(100% - 2px); /* Same width as textarea */
  border-radius:8px;
  height:25px;
  overflow:hidden; /* Prevents awkward scrolling and overflow */
  margin-bottom:3px;
}
.other-menu-button {
  float:right; /* Menu buttons floated to the right */
}
.menu-container {
  background-color:#043468;
  color:white;
}
#preview-submenu {
  display:inline-block;
  width:calc(100% - 30px) !important;
}
</style>
