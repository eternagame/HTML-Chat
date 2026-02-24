<!-- Code taken from https://dev.to/mandrewcito/vue-js-draggable-div-3mee and modified so draggability can be turned on or off -->
<template>
  <!-- TODO: Figure out keyboard accessibility... -->
  <!-- eslint-disable-next-line vuejs-accessibility/click-events-have-key-events -->
  <div ref="draggableContainer" id="draggable-container" @click="internalClick">
    <div class="handle handle-l" @mousedown="resizeMouseDown($event, 'l')" />
    <div class="handle handle-tl" @mousedown="resizeMouseDown($event, 'tl')" />
    <div class="handle handle-t" @mousedown="resizeMouseDown($event, 't')" />
    <div class="handle handle-tr" @mousedown="resizeMouseDown($event, 'tr')" />
    <div class="handle handle-r" @mousedown="resizeMouseDown($event, 'r')" />
    <div class="handle handle-br" @mousedown="resizeMouseDown($event, 'br')" />
    <div class="handle handle-b" @mousedown="resizeMouseDown($event, 'b')" />
    <div class="handle handle-bl" @mousedown="resizeMouseDown($event, 'bl')" />
    <div id="draggable-header" @mousedown="dragMouseDown">
      <slot name="header" />
    </div>
    <slot name="main" />
    <slot name="footer" />
  </div>
</template>

<script lang="ts" setup>
import gsap from 'gsap';
import throttle from 'lodash/throttle';
import {
  computed, onMounted, ref, watch,
} from 'vue';

const props = defineProps({
  enabled: {
    type: Boolean,
    default: true,
  },
  positionBasis: {
    type: String,
    default: 'initial',
  },
});
const emit = defineEmits<{
  (event: 'scrollDown'): void,
  (event: 'dragMouseDown'): void
  (event: 'closeDragElement'): void
}>();

const positions = {
  clientX: 0,
  clientY: 0,
  movementX: 0,
  movementY: 0,
};
const resizePositions = {
  clientX: 0,
  clientY: 0,
  movementX: 0,
  movementY: 0,
  dir: '',
};

const draggableContainer = ref<HTMLDivElement>();
/**
 * Alias for `draggableContainer`
 * TODO: Remove
 */
const container = computed(() => draggableContainer.value!);

watch(() => props.enabled, (enabled) => {
  if (enabled) {
    container.value.style.top = `${positions.clientY}px`;
    container.value.style.left = `${positions.clientX}px`;
  }
});

function elementDrag(event: MouseEvent) {
  if (!props.enabled) {
    return;
  }

  event.preventDefault();
  positions.movementX = positions.clientX - event.clientX;
  positions.movementY = positions.clientY - event.clientY;
  positions.clientX = event.clientX;
  positions.clientY = event.clientY;
  // set the element's new position:
  if (!container.value) return;

  let leftValue = container.value.offsetLeft - positions.movementX;
  let topValue = container.value.offsetTop - positions.movementY;

  const {
    width, height, minHeight,
  } = container.value.style;

  const chatWidth = parseInt(width.replace('px', ''), 10);
  let chatHeight = parseInt(height.replace('px', ''), 10);

  let minimized = false;
  if (minHeight === '40px') minimized = true;
  if (minimized) chatHeight = 40;

  const breakpoint = 10;
  const minLeft = 0;
  let minTop = 0;
  let maxTop = window.innerHeight - chatHeight;
  const maxLeft = window.innerWidth - chatWidth;

  if (minimized) {
    // When the chat is rotated, width and height are a little strange
    // To properly respect the window boundaries, there needs to be an offset
    const offsetX = 0 - chatWidth / 2 + chatHeight / 2;

    if (leftValue < minLeft + breakpoint) {
      minTop -= offsetX;
      maxTop += offsetX;
      gsap.to(draggableContainer.value!, { duration: 0.5, rotation: 90 });
      gsap.to(draggableContainer.value!, { duration: 1, x: offsetX });
    } else if (leftValue > maxLeft - breakpoint) {
      minTop -= offsetX;
      maxTop += offsetX;
      gsap.to(draggableContainer.value!, { duration: 0.5, rotation: -90 });
      gsap.to(draggableContainer.value!, { duration: 1, x: 0 - offsetX });
    } else {
      gsap.to(draggableContainer.value!, { duration: 0.5, rotation: 0 });
      gsap.to(draggableContainer.value!, { duration: 1, x: 0 });
    }
  }

  leftValue = Math.max(minLeft, leftValue);
  topValue = Math.max(minTop, topValue);
  leftValue = Math.min(maxLeft, leftValue);
  topValue = Math.min(maxTop, topValue);

  container.value.style.left = `${leftValue}px`;
  container.value.style.top = `${topValue}px`;
}
function closeDragElement() {
  document.onmouseup = null;
  document.onmousemove = null;
  if (!localStorage || !container.value) {
    return;
  }

  const windowSize = {
    x: window.innerWidth,
    y: window.innerHeight,
  };
  const {
    left, top, width, height,
  } = container.value.style;
  const chatPosition = {
    x: Number(left.replace('px', '')),
    y: Number(top.replace('px', '')),
  };
  const chatSize = {
    x: Number(width.replace('px', '')),
    y: Number(height.replace('px', '')),
  };
  // Determines whether chat is placed WRT l/r, t/b by center
  const center = {
    x: chatPosition.x + chatSize.x / 2,
    y: chatPosition.y + chatSize.y / 2,
  };
  const side = center.x < windowSize.x / 2 ? 'left' : 'right';
  const side2 = center.y < windowSize.y / 2 ? 'top' : 'bottom';
  // Gets offsets from sides
  let offset = chatPosition.x;
  if (side === 'right') {
    // Gets offset from right
    offset = windowSize.x - chatPosition.x - chatSize.x;
  }
  let offset2 = chatPosition.y;
  if (side2 === 'bottom') {
    // Gets offset from bottom
    offset2 = windowSize.y - chatPosition.y - chatSize.y;
  }
  localStorage[`chat_${props.positionBasis}Position`] = JSON.stringify([side, offset, side2, offset2]);
  emit('closeDragElement');
}
function dragMouseDown(event: MouseEvent) {
  if (!props.enabled) {
    return;
  }
  emit('dragMouseDown');
  event.preventDefault();
  // get the mouse cursor position at startup:
  positions.clientX = event.clientX;
  positions.clientY = event.clientY;
  document.onmousemove = elementDrag;
  document.onmouseup = closeDragElement;
}

/**
 * Used externally
 */
function minimize() {
  const {
    top, height, minHeight,
  } = container.value.style;
  const chatTop = parseInt(top.replace('px', ''), 10);
  const chatHeight = parseInt(height.replace('px', ''), 10);
  const minimized = minHeight !== '40px'; // Timing of function means it's called right before the update; it gives a delayed value that is the opposite of the true value
  const breakpoint = 10;
  const windowHeight = window.innerHeight;

  if (!minimized) {
    // If the chat is docked to the bottom, the minimization needs to move the top bar down
    if (chatTop >= windowHeight - chatHeight - breakpoint) {
      gsap.to(draggableContainer.value!, {
        duration: 0.2,
        top: windowHeight - chatHeight,
      });
    }
  } else if (chatTop + chatHeight >= windowHeight - breakpoint) {
    // If the chat is minimized and docked, the top should move up
    gsap.to(draggableContainer.value!, {
      duration: 0.2,
      top: windowHeight - 40,
    });
  }

  // TODO
  // TODO: Figure out what ^ that TODO comment refers to
}

function internalClick(event: MouseEvent) {
  event.stopPropagation(); // Stops event propogation before it reaches document
  container.value.classList.add('clicked-inside');
}

function externalClick() { // Only receives clicks outside container
  container.value.classList.remove('clicked-inside');
}

onMounted(() => {
  document.onclick = externalClick;
});

/** Scrolls down chat on resize. Throttled. */
const throttleScrollDown = throttle(() => {
  emit('scrollDown');
}, 15);

function resizeDrag(event: MouseEvent) {
  resizePositions.movementX = resizePositions.clientX - event.x;
  resizePositions.movementY = resizePositions.clientY - event.y;
  resizePositions.clientX = event.x;
  resizePositions.clientY = event.y;

  let widthValue = container.value.offsetWidth - resizePositions.movementX;
  let heightValue = container.value.offsetHeight - resizePositions.movementY;

  const { dir } = resizePositions;
  // If the width/height isn't being changed, don't update it
  const heightChange = dir.includes('t') || dir.includes('b');
  const widthChange = dir.includes('r') || dir.includes('l');

  if (!heightChange) heightValue = container.value.offsetHeight;
  if (!widthChange) widthValue = container.value.offsetWidth;

  if (dir.includes('l')) {
    // Moves the chat left and keeps the right edge constant
    widthValue = container.value.offsetWidth + resizePositions.movementX;
    const { minWidth } = container.value.style;
    const minWidthNum = parseFloat(minWidth.replace('px', '')) || 350;
    // Only move the chat left if the width can be changed
    if (widthValue > minWidthNum) container.value.style.left = `${container.value.offsetLeft - resizePositions.movementX}px`;
  }
  if (dir.includes('t')) {
    heightValue = container.value.offsetHeight + resizePositions.movementY;
    const { minHeight } = container.value.style;
    const minHeightNum = parseFloat(minHeight.replace('px', '')) || 400;
    if (heightValue > minHeightNum) {
      container.value.style.top = `${container.value.offsetTop - resizePositions.movementY}px`;
    }
  }
  container.value.style.width = `${widthValue}px`;
  container.value.style.height = `${heightValue}px`;
  throttleScrollDown();
}

function closeResizeElement() {
  document.onmousemove = null;
  document.onmouseup = null;
  // Makes sure CSS recognizes the changes and then restores transitions
  container.value.style.transition = '';
}

function resizeMouseDown(event: MouseEvent, direction: string) {
  event.stopPropagation();
  document.onmousemove = resizeDrag;
  document.onmouseup = closeResizeElement;
  resizePositions.dir = direction;
  resizePositions.clientX = event.x;
  resizePositions.clientY = event.y;
  // Disables transitions during the resize
  container.value.style.transition = 'none';
}

defineExpose({ minimize });
</script>

<style>
#draggable-container {
  position: absolute;
  z-index: 9;
}
#draggable-header {
  z-index: 10;
}

.clicked-inside > .handle {
  background-color: lightgray;
  width: 10px;
  height: 10px;
  position: absolute;
  display: block;
}

.handle {
  display: none;
}
.handle-l, .handle-tl, .handle-bl {
  left: 0px;
}
.handle-r, .handle-tr, .handle-br {
  right: 0px;
}
.handle-t, .handle-tl, .handle-tr {
  top: 0px;
}
.handle-b, .handle-bl, .handle-br {
  bottom: 0px;
}
.handle-l, .handle-r {
  top: 50%;
  margin-top: -5px;
}
.handle-t, .handle-b {
  left: 50%;
  margin-left: -5px;
}
.handle-l {
  cursor: w-resize
}
.handle-tl {
  cursor: nw-resize;
}
.handle-t {
  cursor: n-resize;
}
.handle-tr {
  cursor: ne-resize;
}
.handle-r {
  cursor: e-resize;
}
.handle-br {
  cursor: se-resize;
}
.handle-b {
  cursor: s-resize;
}
.handle-bl {
  cursor: sw-resize;
}
</style>
