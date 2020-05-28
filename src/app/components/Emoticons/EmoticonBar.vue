<template>
  <div id='menu-container'>
    <div
      id='emoticon-bar-container'
      :style="{
        'border-bottom-right-radius': radius,
        'border-bottom-left-radius': radius,
        'border-bottom-width': border,
      }" >
      <MenuButton
        id="emoticonSelect"
        name="👍"
        styles=""
        @button="select(false);"
      />
      <MenuButton
        id="markdownSelect"
        name="MD"
        styles="bold italics underline"
        @button="select(true);"
      />
      <MenuButton
        name="?"
        class="other-menu-button"
        styles=""
        @button="menuButtonClicked"
      />
    </div>
    <div id='submenu' v-show='emoticonsSelected || markdownSelected'>
      <div id='emoticon-submenu' v-show="emoticonsSelected" >
        <EmoticonButton
          v-for="emoticon in emotesList"
          :key="emoticon"
          :emoticon='emoticon'
          class="border-right"
          @emote='add' />
      </div>
      <div id='markdown-submenu' v-show="markdownSelected">
        <MarkdownWrapButton
          v-for="item in markdownCodes"
          :key="item"
          :type="item"
          class="border-right"
          @md="format"
        />
      </div>
      <MenuButton
        id="close"
        class="other-menu-button"
        name="X"
        styles="bold"
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
  import SendButton from '../SendButton.vue';
  import MarkdownWrapButton from './MarkdownWrapButton.vue';
  import MenuButton from './MenuButton.vue';
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
    value = false;

    get emotesList() {
      const defaultEmotes = ['👍', '👎', '🙂', '🙁', '😂'];
      return defaultEmotes.concat(this.customEmoticons);
    }

    get customEmoticons() {
      return this.$vxm.chat.customEmoticons;
    }

    markdownCodes = ['bold', 'italics', 'italicsbold', 'strikethrough', 'code', 'link', 'action'];

    emoticonsSelected = false;

    markdownSelected = false;

    get radius() {
      if (!this.emoticonsSelected && !this.markdownSelected) {
        return '8px';
      }
      return '0px';
    }

    get border() {
      if (!this.emoticonsSelected && !this.markdownSelected) {
        return '0px';
      }
      return '1px';
    }

    select(markdown:boolean) {
      if (markdown) {
        this.markdownSelected = true;
        this.emoticonsSelected = false;
      } else {
        this.markdownSelected = false;
        this.emoticonsSelected = true;
      }
      this.$emit('update');
    }

    menuButtonClicked(button:string) {
      switch (button) {
        case 'X':
          this.markdownSelected = false;
          this.emoticonsSelected = false;
          break;
        case '?':
          this.$emit('md', 'question');
          break;
        default: break;
      }
      this.$emit('update');
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
  background-color:#043468;
  color:white;
  width:calc(100% - 2px); /* Same width as textarea */
  height:25px;
  border:none;
  border-bottom:1px solid white;
  overflow:hidden; /* Prevents awkward scrolling and overflow */
}
.border-right {
  border-right: 1px solid white;
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
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
  height:25px;
  overflow:hidden; /* Prevents awkward scrolling and overflow */
}
.other-menu-button {
  float:right;
  border:none;
  border-left:1px solid white;
}
.menu-container {
  background-color:#043468;
  color:white;
}
</style>
