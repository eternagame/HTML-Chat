import { defineStore } from 'pinia';
import { computed } from 'vue';
import { useLocalStorage } from '@vueuse/core';

const useSettingsStore = defineStore('settings', () => {
  const font = useLocalStorage('chat_fontSize', 14);
  const indicator = useLocalStorage('chat_indicator', ' (!)');
  const emoticonChatFeatures = useLocalStorage('chat_emoticonChatFeatures', true);
  const markdownChatFeatures = useLocalStorage('chat_markdownChatFeatures', true);
  const previewChatFeatures = useLocalStorage('chat_previewChatFeatures', true);
  const awayReason = useLocalStorage('chat_awayReason', '');
  const typingMessages = useLocalStorage('chat_typingMessages', true);

  const fontSize = computed(() => Math.min(Math.max(font.value, 0), 18));

  return {
    font,
    indicator,
    emoticonChatFeatures,
    markdownChatFeatures,
    previewChatFeatures,
    awayReason,
    typingMessages,
    fontSize,
  };
});

export default useSettingsStore;
