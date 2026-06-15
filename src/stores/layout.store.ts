import { MINIMIZED_WINDOW_WIDTH, WINDOW_MIN_HEIGHT, WINDOW_MIN_WIDTH } from '#constants';
import type { WindowRect, WindowState } from '#models';
import { useLocalStorage, useWindowSize } from '@vueuse/core';
import { defineStore } from 'pinia';
import { computed, customRef, reactive, readonly, ref, useId, watch, type ToRefs } from 'vue';
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

  const storedWindowRect = useLocalStorage(
    `chat_${configuration.appContext}_windowRect`,
    {
      xOffsetRatio: 0,
      xFrom: 'left' as 'left' | 'right',
      yOffsetRatio: 0,
      yFrom: 'top' as 'top' | 'bottom',
      width: WINDOW_MIN_WIDTH * 2,
      height: WINDOW_MIN_HEIGHT * 2,
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
      watch(viewportSize.width, () => trigger());

      return {
        get(): number {
          track();

          const offsetPx = storedWindowRect.value.xOffsetRatio * viewportSize.width.value;

          switch (storedWindowRect.value.xFrom) {
            case 'left':
              return offsetPx;
            case 'right':
              return viewportSize.width.value - currWidth.value - offsetPx;
          }
        },
        set(value) {
          const leftOfWindow = value;
          const centerOfWindow = value + currWidth.value / 2;
          const rightOfWindow = value + currWidth.value;
          if (centerOfWindow < 0.5 * viewportSize.width.value) {
            storedWindowRect.value.xFrom = 'left';
            storedWindowRect.value.xOffsetRatio = Math.max(
              leftOfWindow / viewportSize.width.value,
              0,
            );
          } else {
            storedWindowRect.value.xFrom = 'right';
            storedWindowRect.value.xOffsetRatio = Math.max(
              (viewportSize.width.value - rightOfWindow) / viewportSize.width.value,
              0,
            );
          }

          trigger();
        },
      };
    }),
    y: customRef((track, trigger) => {
      watch(viewportSize.height, () => trigger());

      return {
        get(): number {
          track();

          const offsetPx = storedWindowRect.value.yOffsetRatio * viewportSize.height.value;

          switch (storedWindowRect.value.yFrom) {
            case 'top':
              return offsetPx;
            case 'bottom':
              return viewportSize.height.value - currHeight.value - offsetPx;
          }
        },
        set(value) {
          const topOfWindow = value;
          const centerOfWindow = value + currHeight.value / 2;
          const bottomOfWindow = value + currHeight.value;
          if (centerOfWindow < 0.5 * viewportSize.height.value) {
            storedWindowRect.value.yFrom = 'top';
            storedWindowRect.value.yOffsetRatio = Math.max(
              topOfWindow / viewportSize.height.value,
              0,
            );
          } else {
            storedWindowRect.value.yFrom = 'bottom';
            storedWindowRect.value.yOffsetRatio = Math.max(
              (viewportSize.height.value - bottomOfWindow) / viewportSize.height.value,
              0,
            );
          }

          trigger();
        },
      };
    }),
    width: customRef((track, trigger) => {
      watch(viewportSize.width, () => trigger());

      return {
        get(): number {
          track();
          if (storedWindowRect.value.width > viewportSize.width.value)
            return viewportSize.width.value;
          return storedWindowRect.value.width;
        },
        set(value) {
          const oldX = windowRect.x;
          storedWindowRect.value.width = value < WINDOW_MIN_WIDTH ? WINDOW_MIN_WIDTH : value;
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
          if (storedWindowRect.value.height > viewportSize.height.value)
            return viewportSize.height.value;
          return storedWindowRect.value.height;
        },
        set(value) {
          const oldY = windowRect.y;
          storedWindowRect.value.height = value < WINDOW_MIN_HEIGHT ? WINDOW_MIN_HEIGHT : value;
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

    // Hacky way to make sure we still fulfill all window placement constraints if
    // for example we've resized the viewport and moved while minimized, which might
    // otherwise let us get into a state where when we maximize, the x/y position was
    // valid (within screen boundaries) when minimized but not when maximized
    // There's probably a smarter way to do this
    /* oxlint-disable eslint(no-self-assign) */
    windowRect.height = windowRect.height;
    windowRect.width = windowRect.width;
    windowRect.x = windowRect.x;
    windowRect.y = windowRect.y;
    /* oxlint-enable */
  });

  return {
    sidebarId,
    isSidebarOpen: readonly(isSidebarOpen),
    toggleSidebar,
    windowState,
    windowRect,
  };
});
