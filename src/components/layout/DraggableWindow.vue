<template>
  <div
    ref="containerRef"
    class="draggable-window"
    :class="{
      'draggable-window--active': isActive,
      'draggable-window--dragging': isDragging,
      'draggable-window--resizing': isResizing,
      'draggable-window--fullscreen': layout.windowState === 'fullscreen',
      'draggable-window--minimized': layout.windowState === 'minimized',
    }"
    :style="containerStyle"
    @pointerdown="isActive = true"
  >
    <div ref="headerRef" class="header" @dblclick="onHeaderDoubleClick">
      <slot name="header"></slot>
    </div>

    <div v-show="layout.windowState !== 'minimized'" class="body">
      <slot />
    </div>
    <div v-if="$slots.footer" v-show="layout.windowState !== 'minimized'" class="footer">
      <slot name="footer"></slot>
    </div>

    <div
      v-for="handle in WINDOW_HANDLES"
      :key="handle"
      :class="['handle', `handle-${handle}`]"
      @pointerdown.stop.prevent="onStartResize($event, handle)"
    ></div>
  </div>
</template>

<script setup lang="ts">
  import { WINDOW_HANDLES, WINDOW_MIN_HEIGHT, WINDOW_MIN_WIDTH } from '#constants';
  import type { WindowHandle, WindowRect } from '#models';
  import { useLayoutStore } from '#stores';
  import { onClickOutside, useDraggable, useEventListener } from '@vueuse/core';
  import { computed, type CSSProperties, ref } from 'vue';

  const layout = useLayoutStore();

  const containerRef = ref<HTMLDivElement>();
  const headerRef = ref<HTMLDivElement>();
  const isActive = ref(false);
  const isResizing = ref(false);

  const { x, y, isDragging } = useDraggable(containerRef, {
    // Get initial position from store
    initialValue: () => layout.windowRect,
    handle: headerRef,
    restrictInView: true,
    disabled: () => layout.windowState === 'fullscreen',
    onEnd(endPosition) {
      layout.windowRect.x = endPosition.x;
      layout.windowRect.y = endPosition.y;
    },
  });

  const containerStyle = computed<CSSProperties>(() => {
    switch (layout.windowState) {
      case 'fullscreen':
        return {
          left: 0,
          top: 0,
          width: '100dvw',
          height: '100dvh',
        };

      case 'minimized':
        return { left: `${x.value}px`, top: `${y.value}px`, width: `200px` };

      default:
        return {
          left: `${x.value}px`,
          top: `${y.value}px`,
          width: `${layout.windowRect.width}px`,
          height: `${layout.windowRect.height}px`,
        };
    }
  });

  function onHeaderDoubleClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (target.closest('button')) {
      return;
    }
    layout.windowState = layout.windowState === 'fullscreen' ? 'normal' : 'fullscreen';
  }

  let currentHandle: WindowHandle | null = null;
  let startState: (WindowRect & Record<'pointerX' | 'pointerY', number>) | null = null;
  let cleanupOnResize: ReturnType<typeof useEventListener> | null = null;
  let cleanupOnEndResize: ReturnType<typeof useEventListener> | null = null;

  onClickOutside(containerRef, () => {
    isActive.value = false;
  });
  function onStartResize(event: PointerEvent, handle: WindowHandle) {
    if (layout.windowState !== 'normal') {
      // Prevent resizing if minimized or fullscreen
      return;
    }

    isResizing.value = true;
    currentHandle = handle;
    startState = {
      width: layout.windowRect.width,
      height: layout.windowRect.height,
      x: x.value,
      y: y.value,
      pointerX: event.clientX,
      pointerY: event.clientY,
    };

    cleanupOnResize = useEventListener('pointermove', onResize);
    cleanupOnEndResize = useEventListener('pointerup', endResize);
  }
  function onResize(event: PointerEvent) {
    if (!isResizing.value || !startState || !currentHandle) {
      return;
    }

    const deltaX = event.clientX - startState.pointerX;
    const deltaY = event.clientY - startState.pointerY;

    // Handle horizontal resizes
    if (currentHandle.includes('e')) {
      layout.windowRect.width = Math.max(WINDOW_MIN_WIDTH, startState.width + deltaX);
    } else if (currentHandle.includes('w')) {
      // Changing width AND x position
      const newWidth = startState.width - deltaX;
      if (newWidth >= WINDOW_MIN_WIDTH) {
        layout.windowRect.width = newWidth;
        x.value = startState.x + deltaX;
      } else {
        layout.windowRect.width = WINDOW_MIN_WIDTH;
        x.value = startState.x + (startState.width - WINDOW_MIN_WIDTH);
      }
    }

    // Handle vertical resizes
    if (currentHandle.includes('s')) {
      layout.windowRect.height = Math.max(WINDOW_MIN_HEIGHT, startState.height + deltaY);
    } else if (currentHandle.includes('n')) {
      // Changing height AND y position
      const newHeight = startState.height - deltaY;
      if (newHeight >= WINDOW_MIN_HEIGHT) {
        layout.windowRect.height = newHeight;
        y.value = startState.y + deltaY;
      } else {
        layout.windowRect.height = WINDOW_MIN_HEIGHT;
        y.value = startState.y + (startState.height - WINDOW_MIN_HEIGHT);
      }
    }
  }
  function endResize() {
    isResizing.value = false;
    currentHandle = null;
    startState = null;
    cleanupOnResize?.();
    cleanupOnEndResize?.();
  }
</script>

<style scoped>
  .draggable-window {
    position: absolute;
    display: flex;
    flex-direction: column;
    z-index: 9;
    isolation: isolate;
    background-color: #043468;
    color: #fff;
    padding: 0.5em;
    border-radius: 8px;

    &:not(.draggable-window--resizing):not(.draggable-window--dragging) {
      @media (prefers-reduced-motion: no-preference) {
        transition-property: top, left, width, height;
        transition-duration: 200ms;
        transition-timing-function: cubic-bezier(0.18, 0.89, 0.32, 1.1);
      }
    }
  }

  .draggable-window--fullscreen,
  .draggable-window--minimized {
    .handle {
      display: none;
    }
  }

  .header {
    flex-shrink: 0;
    color: #ffffff;
    user-select: none;
    padding-inline: 0.5em;
    padding-top: 0.25em;
  }

  .draggable-window:not(.draggable-window--fullscreen) .header {
    cursor: grab;
    &:active {
      cursor: grabbing;
    }
  }

  .body {
    flex: 1;
    position: relative;
    min-height: 0;
    overflow: hidden;
    background-color: #05224b;
    border-radius: 8px;
    margin-block: 0.75em;
  }

  .footer {
    flex-shrink: 0;
    padding: 0 0.25em 0.25em;
  }

  .handle {
    position: absolute;
  }
  /* Edges */
  .handle-n {
    top: -4px;
    left: 8px;
    right: 8px;
    height: 8px;
    cursor: ns-resize;
  }
  .handle-s {
    bottom: -4px;
    left: 8px;
    right: 8px;
    height: 8px;
    cursor: ns-resize;
  }
  .handle-e {
    right: -4px;
    top: 8px;
    bottom: 8px;
    width: 8px;
    cursor: ew-resize;
  }
  .handle-w {
    left: -4px;
    top: 8px;
    bottom: 8px;
    width: 8px;
    cursor: ew-resize;
  }

  /* Corners */
  .handle-nw {
    top: -4px;
    left: -4px;
    width: 12px;
    height: 12px;
    cursor: nwse-resize;
  }
  .handle-ne {
    top: -4px;
    right: -4px;
    width: 12px;
    height: 12px;
    cursor: nesw-resize;
  }
  .handle-sw {
    bottom: -4px;
    left: -4px;
    width: 12px;
    height: 12px;
    cursor: nesw-resize;
  }
  .handle-se {
    bottom: -4px;
    right: -4px;
    width: 12px;
    height: 12px;
    cursor: nwse-resize;
  }
</style>
