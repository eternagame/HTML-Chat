import { clamp } from '#utils';
import { useLocalStorage } from '@vueuse/core';
import { defineStore } from 'pinia';
import { computed } from 'vue';

const FONT_SIZE_MIN = 10;
const FONT_SIZE_MAX = 18;

export const useSettingsStore = defineStore('settings', () => {
  const fontSize = useLocalStorage('chat_fontSize', 14);
  function setFontSize(size: number) {
    fontSize.value = clamp(size, FONT_SIZE_MIN, FONT_SIZE_MAX);
  }

  const emoticonFeatureEnabled = useLocalStorage('chat_emoticonFeatureEnabled', true);
  const markdownFeatureEnabled = useLocalStorage('chat_markdownFeatureEnabled', true);
  const previewFeatureEnabled = useLocalStorage('chat_previewFeatureEnabled', true);

  const customEmojis = useLocalStorage('chat_customEmojis', ['😜', '🤔', '😮']);
  function setCustomEmoji(emoticon: string, index: number) {
    if (index < 0 || index >= customEmojis.value.length) {
      return;
    }
    customEmojis.value[index] = emoticon;
  }

  return {
    fontSize: computed(() => fontSize.value),
    setFontSize,
    emoticonFeatureEnabled,
    markdownFeatureEnabled,
    previewFeatureEnabled,
    customEmojis: computed(() => customEmojis.value),
    setCustomEmoji,
  };
});
