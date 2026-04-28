import { FONT_SIZE_MAX, FONT_SIZE_MIN } from '#constants';
import { clamp } from '#utils';
import { useLocalStorage } from '@vueuse/core';
import { defineStore } from 'pinia';
import { computed } from 'vue';

export const useSettingsStore = defineStore('settings', () => {
  const fontSize = useLocalStorage('chat_fontSize', 14);
  function setFontSize(size: number) {
    fontSize.value = clamp(size, FONT_SIZE_MIN, FONT_SIZE_MAX);
  }

  return {
    fontSize: computed(() => fontSize.value),
    setFontSize,
  };
});
