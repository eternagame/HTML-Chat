import { WINDOW_MIN_HEIGHT, WINDOW_MIN_WIDTH } from '#constants';
import type { WindowRect, WindowState } from '#models';
import { useLocalStorage } from '@vueuse/core';
import { defineStore } from 'pinia';
import { readonly, ref, useId, watch } from 'vue';
import { useConfigurationStore } from './configuration.store';

export const useLayoutStore = defineStore('layout', () => {
  const configuration = useConfigurationStore();

  const sidebarId = useId();
  const isSidebarOpen = ref(false);
  const windowState = useLocalStorage<WindowState>(
    `chat_${configuration.appContext}_windowState`,
    'normal',
    { listenToStorageChanges: false },
  );

  // Private fields managed by setter in reactive
  let windowWidth = WINDOW_MIN_WIDTH * 2;
  let windowHeight = WINDOW_MIN_HEIGHT * 2;

  const windowRect = useLocalStorage<WindowRect>(
    `chat_${configuration.appContext}_windowRect`,
    {
      x: 0,
      y: 0,
      get width() {
        return windowWidth;
      },
      set width(val) {
        windowWidth = val < WINDOW_MIN_WIDTH ? WINDOW_MIN_WIDTH : val;
      },
      get height() {
        return windowHeight;
      },
      set height(val) {
        windowHeight = val < WINDOW_MIN_HEIGHT ? WINDOW_MIN_HEIGHT : val;
      },
    },
    { mergeDefaults: true, listenToStorageChanges: false },
  );

  function toggleSidebar(force?: boolean) {
    if (typeof force === 'boolean') {
      isSidebarOpen.value = force;
    } else {
      isSidebarOpen.value = !isSidebarOpen.value;
    }
  }

  watch(windowState, (newState) => {
    if (newState === 'minimized') {
      isSidebarOpen.value = false;
    }
  });

  return {
    sidebarId,
    isSidebarOpen: readonly(isSidebarOpen),
    toggleSidebar,
    windowState,
    windowRect,
  };
});
