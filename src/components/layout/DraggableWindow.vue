<template>
  <div
    ref="containerRef"
    class="draggable-window"
    :class="{ 'is-active': isActive }"
    :style="containerStyle"
    @mousedown="isActive = true"
  >
    <div ref="headerRef" class="header">
      <slot name="header"></slot>
    </div>
    <div class="body">
      <slot name="main"></slot>
    </div>
    <div class="footer" v-if="$slots.footer">
      <slot name="footer"></slot>
    </div>

    <div
      v-for="handle in handles"
      :key="handle"
      :class="['handle', `handle-${handle}`]"
      @pointerdown.stop.prevent="startResize($event, handle)"
    ></div>
  </div>
</template>

<script setup lang="ts">
  import {
    onClickOutside,
    type Position,
    useDraggable,
    useEventListener,
    useLocalStorage,
  } from '@vueuse/core';
  import { computed, type CSSProperties, ref } from 'vue';

  const handles = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'] as const;
  type Handle = (typeof handles)[number];
  const MIN_WIDTH = 200;
  const MIN_HEIGHT = 150;

  const containerRef = ref<HTMLDivElement>();
  const headerRef = ref<HTMLDivElement>();
  const isActive = ref(false);
  const isResizing = ref(false);
  const width = useLocalStorage('chat_windowWidth', 400);
  const height = useLocalStorage('chat_windowHeight', 300);
  const initialPosition = useLocalStorage<Position>(
    'chat_windowPosition',
    { x: 0, y: 0 },
    { mergeDefaults: true },
  );

  onClickOutside(containerRef, () => {
    isActive.value = false;
  });

  const { x, y } = useDraggable(containerRef, {
    initialValue: initialPosition,
    handle: headerRef,
    onEnd(endPosition) {
      // Save position to localStorage
      Object.assign(initialPosition.value, endPosition);
    },
  });

  let currentHandle: Handle | null = null;
  let positionStart: Record<
    'x' | 'y' | 'width' | 'height' | 'pointerX' | 'pointerY',
    number
  > | null = null;

  let cleanupMove: ReturnType<typeof useEventListener> | null = null;
  let cleanupEnd: ReturnType<typeof useEventListener> | null = null;

  function startResize(event: PointerEvent, handle: Handle) {
    isResizing.value = true;
    currentHandle = handle;
    positionStart = {
      x: x.value,
      y: y.value,
      width: width.value,
      height: height.value,
      pointerX: event.clientX,
      pointerY: event.clientY,
    };

    cleanupMove = useEventListener('pointermove', onResize);
    cleanupEnd = useEventListener('pointerup', endResize);
  }

  function onResize(event: PointerEvent) {
    if (!isResizing.value || !positionStart || !currentHandle) {
      return;
    }

    const deltaX = event.clientX - positionStart.pointerX;
    const deltaY = event.clientY - positionStart.pointerY;

    // Handle horizontal resizes
    if (currentHandle.includes('e')) {
      width.value = Math.max(MIN_WIDTH, positionStart.width + deltaX);
    } else if (currentHandle.includes('w')) {
      const newWidth = positionStart.width - deltaX;
      if (newWidth >= MIN_WIDTH) {
        width.value = newWidth;
        x.value = positionStart.x + deltaX;
      } else {
        width.value = MIN_WIDTH;
        x.value = positionStart.x + (positionStart.width - MIN_WIDTH);
      }
    }

    // Handle vertical resizes
    if (currentHandle.includes('s')) {
      height.value = Math.max(MIN_HEIGHT, positionStart.height + deltaY);
    } else if (currentHandle.includes('n')) {
      const newHeight = positionStart.height - deltaY;
      if (newHeight >= MIN_HEIGHT) {
        height.value = newHeight;
        y.value = positionStart.y + deltaY;
      } else {
        height.value = MIN_HEIGHT;
        y.value = positionStart.y + (positionStart.height - MIN_HEIGHT);
      }
    }
  }

  function endResize() {
    isResizing.value = false;
    currentHandle = null;
    positionStart = null;
    // Save position to localStorage
    initialPosition.value.x = x.value;
    initialPosition.value.y = y.value;
    cleanupMove?.();
    cleanupEnd?.();
  }

  const containerStyle = computed<CSSProperties>(() => ({
    left: `${x.value}px`,
    top: `${y.value}px`,
    width: `${width.value}px`,
    height: `${height.value}px`,
  }));
</script>

<style scoped>
  .draggable-window {
    position: absolute;
    display: flex;
    flex-direction: column;
    z-index: 9;
    isolation: isolate;
  }

  .header {
    flex-shrink: 0;
    cursor: grab;
    background-color: #043468;
    color: #ffffff;
    user-select: none;
    &:active {
      cursor: grabbing;
    }
  }

  .body {
    flex: 1;
    overflow-y: auto;
    min-height: 0;
    padding: 1em;
  }

  .footer {
    flex-shrink: 0;
    padding: 0.75em 1em;
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
