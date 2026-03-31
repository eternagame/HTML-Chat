import { WINDOW_MIN_HEIGHT, WINDOW_MIN_WIDTH } from '#constants';
import type { WindowRect, WindowState } from '#models';
import { useLocalStorage } from '@vueuse/core';
import { defineStore } from 'pinia';
import { readonly, ref, useId, watch } from 'vue';

export const useLayoutStore = defineStore('layout', () => {
  const sidebarId = useId();
  const isSidebarOpen = ref(false);
  const windowState = useLocalStorage<WindowState>('chat_windowState', 'normal');
  const windowRect = useLocalStorage<WindowRect>(
    'chat_windowRect',
    { x: 0, y: 0, width: WINDOW_MIN_WIDTH * 2, height: WINDOW_MIN_HEIGHT * 2 },
    { mergeDefaults: true },
  );

  function toggleSidebar(force?: boolean) {
    if (typeof force === 'boolean') {
      isSidebarOpen.value = force;
    } else {
      isSidebarOpen.value = !isSidebarOpen.value;
    }
  }

  function setWindowState(state: WindowState) {
    windowState.value = state;
  }

  function saveWindowRect(rect: Partial<WindowRect>) {
    Object.assign(windowRect.value, rect);

    if (windowRect.value.width < WINDOW_MIN_WIDTH) {
      windowRect.value.width = WINDOW_MIN_WIDTH;
    }
    if (windowRect.value.height < WINDOW_MIN_HEIGHT) {
      windowRect.value.height = WINDOW_MIN_HEIGHT;
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
    windowState: readonly(windowState),
    windowRect: readonly(windowRect),
    toggleSidebar,
    setWindowState,
    saveWindowRect,
  };
});
