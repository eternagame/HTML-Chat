import { MINIMIZED_WINDOW_WIDTH } from '#constants';
import type { WindowRect, WindowState } from '#models';
import { useLocalStorage, useWindowSize } from '@vueuse/core';
import { defineStore } from 'pinia';
import { computed, customRef, reactive, readonly, ref, useId, watch, type ToRefs } from 'vue';
import { useConfigurationStore } from './configuration.store';
import {
  clampHeight,
  clampWidth,
  viewportOffsetToX,
  viewportOffsetToY,
  xToViewportOffset,
  yToViewportOffset,
} from '#utils/layout.util.ts';

export const useLayoutStore = defineStore('layout', () => {
  const configuration = useConfigurationStore();

  const windowSize = useWindowSize();

  const sidebarId = useId();
  const isSidebarOpen = ref(false);
  const windowState = useLocalStorage<WindowState>(
    `chat_${configuration.appContext}_windowState`,
    'normal',
    { listenToStorageChanges: false },
  );

  const storedWindowRect = useLocalStorage(
    `chat_${configuration.appContext}_windowRect`,
    {
      hViewportOffset: xToViewportOffset(
        configuration.defaultX,
        configuration.defaultWidth,
        windowSize,
      ),
      vViewportOffset: yToViewportOffset(
        configuration.defaultY,
        configuration.defaultHeight,
        windowSize,
      ),
      width: configuration.defaultWidth,
      height: configuration.defaultHeight,
    },
    { mergeDefaults: true, listenToStorageChanges: false },
  );

  const viewportSize = useWindowSize();

  const currWidth = computed(() =>
    windowState.value === 'minimized' ? MINIMIZED_WINDOW_WIDTH : windowRect.width,
  );
  const currHeight = computed(() => (windowState.value === 'minimized' ? 45 : windowRect.height));

  const windowRect = reactive<ToRefs<WindowRect>>({
    x: customRef((track, trigger) => {
      const proxy = {
        get(): number {
          track();
          return viewportOffsetToX(
            storedWindowRect.value.hViewportOffset,
            currWidth.value,
            windowSize,
          );
        },
        set(value: number) {
          storedWindowRect.value.hViewportOffset = xToViewportOffset(
            value,
            currWidth.value,
            windowSize,
          );
          trigger();
        },
      };

      // Ensure we still fulfill all window placement constraints if for example we're right positioned
      // but the window moves left so that the top of the window moves beyond the screen
      watch(viewportSize.width, () => {
        proxy.set(proxy.get());
      });
      // Ensure we still fulfill all window placement constraints if for example we've resized the
      // viewport and moved while minimized, which might otherwise let us get into a state where when we
      // maximize, the x position was valid (within screen boundaries) when minimized but not when maximized
      watch(windowState, () => {
        proxy.set(proxy.get());
      });

      return proxy;
    }),
    y: customRef((track, trigger) => {
      const proxy = {
        get(): number {
          track();
          return viewportOffsetToY(
            storedWindowRect.value.vViewportOffset,
            currHeight.value,
            windowSize,
          );
        },
        set(value: number) {
          storedWindowRect.value.vViewportOffset = yToViewportOffset(
            value,
            currHeight.value,
            windowSize,
          );
          trigger();
        },
      };

      // Ensure we still fulfill all window placement constraints if for example we're bottom positioned
      // but the window moves up so that the top of the window moves beyond the screen
      watch(viewportSize.height, () => {
        proxy.set(proxy.get());
      });
      // Ensure we still fulfill all window placement constraints if for example we've resized the
      // viewport and moved while minimized, which might otherwise let us get into a state where when we
      // maximize, the y position was valid (within screen boundaries) when minimized but not when maximized
      watch(windowState, () => {
        proxy.set(proxy.get());
      });

      return proxy;
    }),
    width: customRef((track, trigger) => {
      watch(viewportSize.width, () => trigger());

      return {
        get(): number {
          track();
          return clampWidth(storedWindowRect.value.width, windowSize);
        },
        set(value) {
          const oldX = windowRect.x;
          storedWindowRect.value.width = clampWidth(value, windowSize);
          // Changing the width only implies expanding from the right. This could change our x
          // offset if we're positioned relative to the right, so we ensure our x position remains
          // unchanged
          windowRect.x = oldX;
          trigger();
        },
      };
    }),
    height: customRef((track, trigger) => {
      watch(viewportSize.height, () => trigger());

      return {
        get(): number {
          track();
          return clampHeight(storedWindowRect.value.height, windowSize);
        },
        set(value) {
          const oldY = windowRect.y;
          storedWindowRect.value.height = clampHeight(value, windowSize);
          // Changing the height only implies expanding from the bottom. This could change our y
          // offset if we're positioned relative to the bottom, so we ensure our y position remains
          // unchanged
          windowRect.y = oldY;
          trigger();
        },
      };
    }),
  });

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
