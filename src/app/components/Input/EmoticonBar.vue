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
          :aria-label="`Add a ${emoticon} emoticon to the input text`"
          @emote='add' />
      </div>
      <div id='markdown-submenu' v-show="markdownSelected && markdownChatFeatures" >
        <MarkdownWrapButton
          v-for="(item, index) in markdownCodes"
          :key="item"
          :type="item"
          class="border-right"
          @md="format"
          style="flex: 0 0 auto"
          draggable
          @dragstart.native="drag($event, index, item)"
          @drop.native.prevent
          @dragover.native.prevent
          @dragenter.native.prevent="dragOver($event, index, item)"
          :aria-label="`Format the input text (${item})`"
        />
      </div>
      <div id='preview-submenu' v-show="previewSelected && previewChatFeatures">
        <span v-html="inputHTML" id="preview-content"/>
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
        aria-label="Open emoticon toolbar"
        id="emoticonSelect"
        v-if="emoticonChatFeatures"
        name="👍"
        styles=""
        @button="select('emoticon');"
        @close="close"
      />
      <MenuButton
        aria-label="Open markdown toolbar"
        id="markdownSelect"
        v-if="markdownChatFeatures"
        name="A"
        styles="bold italics underline"
        @button="select('markdown');"
        @close="close"
      />
      <MenuButton
        aria-label="Open preview toolbar"
        id="previewSelect"
        v-if="previewChatFeatures"
        name="P"
        styles=""
        @button="select('preview');"
        @close="close"
      />
      <MenuButton
        name="?"
        class="other-menu-button"
        styles=""
        @button="menuButtonClicked"
        aria-label="Help"
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

    markdownCodes = ['bold', 'italics', 'italicsbold', 'strikethrough', 'code', 'link', 'action', 'quote', 'serif', 'cursive', 'highlight'];

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
        this.close();
        break;
      case '?':
        this.$emit('md', 'question');
        break;
      default: break;
      }
      this.$emit('update');
    }

    close() {
      this.markdownSelected = false;
      this.emoticonsSelected = false;
      this.previewSelected = false;
    }

    // Changing input

    add(emote:string) { // Emits event to MessagePane
      this.$emit('emote', emote);
    }

    format(options:string) { // Emits event to MessagePane
      this.$emit('md', options);
    }

    @Prop({ required: true })
    inputValue = '';

    @Prop()
    selection !: number[];

    get inputHTML() {
      let value = this.inputValue;
      if (this.selection !== [0, 0] && this.selection[1] - this.selection[0] > 0) {
        value = value.slice(this.selection[0], this.selection[1]);
      }
      const markdown = md.renderInline(value);
      if (markdown === '') return 'Type some text to see a preview';
      return markdown;
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

    @Watch('anyChatFeatures')
    updateToolbarHeight() {
      this.$emit('update');
    }

    drag(ev: DragEvent, item: number, name: string) {
      this.dragged = item;
      this.draggedName = name;
    }

    dragged = -1;

    draggedName = '';

    dragOver(ev: DragEvent, item: number, name: string) {
      if (this.dragged === -1 || name === this.draggedName) return;
      const draggedItem = this.markdownCodes[this.dragged];
      const dropItem = this.markdownCodes[item];
      Vue.set(this.markdownCodes, this.dragged, dropItem);
      Vue.set(this.markdownCodes, item, draggedItem);
      this.dragged = item;
      localStorage.chat_markdownButtons = JSON.stringify(this.markdownCodes);
    }

    created() {
      if (localStorage.chat_markdownButtons) {
        this.markdownCodes = JSON.parse(localStorage.chat_markdownButtons);
      }
      if (localStorage.chat_emoticonChatFeatures) {
        this.$vxm.settings.emoticonChatFeatures = JSON.parse(localStorage
          .chat_emoticonChatFeatures);
      }
      if (localStorage.chat_markdownChatFeatures) {
        this.$vxm.settings.markdownChatFeatures = JSON.parse(localStorage
          .chat_markdownChatFeatures);
      }
      if (localStorage.chat_previewChatFeatures) {
        this.$vxm.settings.previewChatFeatures = JSON.parse(localStorage
          .chat_previewChatFeatures);
      }
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
  position: relative;
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
  position: relative;
}
.other-menu-button {
  right: 0; /* Menu buttons floated to the right */
  position: absolute;
  top:0;
}
.menu-container {
  background-color:#043468;
  color:white;
}
#preview-submenu {
  display:inline-block;
  width:calc(100% - 30px) !important;
}
#markdown-submenu {
  overflow-x: auto;
  flex-wrap: nowrap;
  display: flex;
  width: calc(100% - 25px);
  height:25px;
}
::-webkit-scrollbar-track,
::-webkit-scrollbar,
::-moz-scrollbar,
::-moz-scrollbar-track,
::-webkit-scrollbar-thumb,
::-moz-scrollbar-thumb {
  height: 0;
  width: 0;
  display:none;
}
</style>
