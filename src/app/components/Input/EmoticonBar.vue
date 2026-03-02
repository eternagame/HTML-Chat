<template>
  <div class="menu-container text-white">
    <div
      class="submenu text-white overflow-hidden mb-1"
      v-show="(emoticonsSelected || markdownSelected || previewSelected) && anyChatFeatures"
    >
      <div class="emoticon-submenu" v-show="emoticonsSelected && settings.emoticonChatFeatures">
        <EmoticonButton
          v-for="emoticon in emotesList"
          :key="emoticon"
          :emoticon="emoticon"
          class="border-right"
          @emote="add"
        />
      </div>
      <div class="markdown-submenu" v-show="markdownSelected && settings.markdownChatFeatures">
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
          :aria-label="`Format input (${item})`"
        />
      </div>
      <div class="preview-submenu" v-show="previewSelected && settings.previewChatFeatures">
        <span v-html="inputHTML" id="preview-content" class="pl-1" />
      </div>
      <MenuButton
        id="close"
        class="other-menu-button"
        name="X"
        styles="bold"
        @button="menuButtonClicked"
      />
    </div>
    <div id="input">
      <slot name="input" />
    </div>
    <div class="emoticon-bar-container text-white border-0 overflow-hidden" v-if="anyChatFeatures">
      <MenuButton
        aria-label="emoticon"
        id="emoticonSelect"
        v-if="settings.emoticonChatFeatures"
        name="👍"
        styles=""
        @button="select('emoticon')"
      />
      <MenuButton
        aria-label="markdown"
        id="markdownSelect"
        v-if="settings.markdownChatFeatures"
        name="A"
        styles="bold italics underline"
        @button="select('markdown')"
      />
      <MenuButton
        aria-label="preview"
        id="previewSelect"
        v-if="settings.previewChatFeatures"
        name="P"
        styles=""
        @button="select('preview')"
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
<script lang="ts" setup>
import { vxm } from '#store/vxm';
import useSettingsStore from '#stores/settings';
import md from '@/tools/Markdown';
import { useLocalStorage } from '@vueuse/core';
import {
  computed, ref, set, watch,
} from 'vue';
import EmoticonButton from './EmoticonButton.vue';
import MarkdownWrapButton from './MarkdownWrapButton.vue';
import MenuButton from './MenuButton.vue';

const props = defineProps({
  inputValue: {
    type: String,
    required: true,
  },
  selection: {
    type: Array,
    default: () => [0, 0],
  },
});
const emit = defineEmits<{
  (event: 'update'): void;
  (event: 'md', markdownOption: string): void;
  (event: 'emote', emote: string): void;
}>();

/** Emotes */
const emotesList = computed(() => ['👍', '👎', '🙂', '🙁'].concat(vxm.chat.customEmoticons));
/** Markdown buttons */
const markdownCodes = useLocalStorage('chat_markdownButtons', [
  'bold',
  'italics',
  'italicsbold',
  'strikethrough',
  'code',
  'link',
  'action',
  'quote',
  'serif',
  'cursive',
  'highlight',
]);

const settings = useSettingsStore();

// Submenu selection
const emoticonsSelected = ref<boolean>(false);
const markdownSelected = ref<boolean>(false);
const previewSelected = ref<boolean>(false);
/** Opens emoticon or markdown submenu depending on which button was pressed */
function select(menu: string) {
  if (menu === 'markdown') {
    markdownSelected.value = !markdownSelected.value;
    emoticonsSelected.value = false;
    previewSelected.value = false;
  } else if (menu === 'emoticon') {
    markdownSelected.value = false;
    emoticonsSelected.value = !emoticonsSelected.value;
    previewSelected.value = false;
  } else if (menu === 'preview') {
    markdownSelected.value = false;
    emoticonsSelected.value = false;
    previewSelected.value = !previewSelected.value;
  }
  emit('update');
}

function close() {
  markdownSelected.value = false;
  emoticonsSelected.value = false;
  previewSelected.value = false;
  emit('update');
}

// Click handling
function menuButtonClicked(button: string) {
  // Handles button clicks
  switch (button) {
    case 'X':
      close();
      break;
    case '?':
      emit('md', 'question');
      break;
    default:
      break;
  }
  emit('update');
}

// Changing input
function add(emote: string) {
  emit('emote', emote);
}
function format(options: string) {
  emit('md', options);
}

const inputHTML = computed(() => {
  let value = props.inputValue;

  if (
    props.selection.every((s): s is number => typeof s === 'number')
      && props.selection[1] - props.selection[0] > 0
  ) {
    value = value.slice(props.selection[0], props.selection[1]);
  }
  const markdown = md.renderInline(value);
  if (markdown === '') return 'Type some text to see a preview';
  return markdown;
});

// Chat features
const anyChatFeatures = computed(
  () => settings.emoticonChatFeatures
      || settings.markdownChatFeatures
      || settings.previewChatFeatures,
);

watch(anyChatFeatures, () => {
  // Update toolbar height
  emit('update');
});

const dragged = ref<number>(-1);
const draggedName = ref<string>('');

function drag(ev: DragEvent, item: number, name: string) {
  dragged.value = item;
  draggedName.value = name;
}

function dragOver(ev: DragEvent, item: number, name: string) {
  if (dragged.value === -1 || name === draggedName.value) return;

  const draggedItem = markdownCodes.value[dragged.value];
  const dropItem = markdownCodes.value[item];

  set(markdownCodes.value, dragged.value, dropItem);
  set(markdownCodes.value, item, draggedItem);
  dragged.value = item;
}
</script>
<style scoped>
  .emoticon-bar-container {
    background-color: #043468;
    width: calc(100% - 2px); /* Same width as textarea */
    height: 25px;
    border-bottom-left-radius: 8px;
    border-bottom-right-radius: 8px;
    position: relative;
  }
  .submenu {
    background-color: #043468;
    width: calc(100% - 2px); /* Same width as textarea */
    border-radius: 8px;
    height: 25px;
    position: relative;
  }
  .other-menu-button {
    right: 0; /* Menu buttons floated to the right */
    position: absolute;
    top: 0;
  }
  .menu-container {
    background-color: #043468;
  }
  .preview-submenu {
    display: inline-block;
    width: calc(100% - 30px) !important;
  }
  .markdown-submenu {
    flex-wrap: nowrap;
    width: calc(100% - 25px);
    height: 25px;
    overflow: auto;
    display: flex;
    scrollbar-width: none;
  }
  ::-webkit-scrollbar-track,
  ::-webkit-scrollbar,
  ::-moz-scrollbar,
  ::-moz-scrollbar-track,
  ::-webkit-scrollbar-thumb,
  ::-moz-scrollbar-thumb {
    height: 0;
    width: 0;
    display: none;
  }
</style>
