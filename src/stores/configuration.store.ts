import { WINDOW_MIN_HEIGHT, WINDOW_MIN_WIDTH } from '#constants';
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useConfigurationStore = defineStore('configuration', () => {
  const appContext = ref('default');
  const defaultX = ref(0);
  const defaultY = ref(0);
  const defaultWidth = ref(WINDOW_MIN_WIDTH * 2);
  const defaultHeight = ref(WINDOW_MIN_HEIGHT * 2);

  return { appContext, defaultX, defaultY, defaultWidth, defaultHeight };
});
