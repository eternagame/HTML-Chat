<!-- Code taken from https://dev.to/mandrewcito/vue-js-draggable-div-3mee and modified so draggability can be turned on or off -->
<template>
  <div ref="draggableContainer" id="draggable-container">
    <div id="draggable-header" @mousedown="dragMouseDown">
      <slot name="header"></slot>
    </div>
    <slot name="main"></slot>
    <slot name="footer"></slot>
  </div>
</template>

<script lang="ts">
  import {
    Component, Prop, Watch, Vue,
  } from 'vue-property-decorator';
  import gsap from 'gsap';

  @Component
  export default class DraggableDiv extends Vue {
    positions = {
      clientX: 0,
      clientY: 0,
      movementX: 0,
      movementY: 0,
    };

    @Prop({ default: true })
    enabled !: boolean;

    @Prop({ default: 'initial' })
    positionBasis !: string;

    get container() {
      return this.$refs.draggableContainer as HTMLDivElement;
    }

    @Watch('enabled')
    changed() {
      if (this.enabled) {
        this.container.style.top = `${this.positions.clientY}px`;
        this.container.style.left = `${this.positions.clientX}px`;
      }
    }

    dragMouseDown(event: MouseEvent) {
      if (this.enabled) {
        this.$emit('dragMouseDown');
        event.preventDefault();
        // get the mouse cursor position at startup:
        this.positions.clientX = event.clientX;
        this.positions.clientY = event.clientY;
        document.onmousemove = this.elementDrag;
        document.onmouseup = this.closeDragElement;
      }
    }

    elementDrag(event: MouseEvent) {
      if (this.enabled) { // If dragging isn't disabled
        event.preventDefault();
        this.positions.movementX = this.positions.clientX - event.clientX;
        this.positions.movementY = this.positions.clientY - event.clientY;
        this.positions.clientX = event.clientX;
        this.positions.clientY = event.clientY;
        // set the element's new position:
        if (!this.container) return;

        let leftValue = this.container.offsetLeft - this.positions.movementX;
        let topValue = this.container.offsetTop - this.positions.movementY;

        const {
        width, height, minHeight, transform,
        } = this.container.style;

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
          const chat = this.$refs.draggableContainer;

          // When the chat is rotated, width and height are a little strange
          // To properly respect the window boundaries, there needs to be an offset
          const offsetX = 0 - chatWidth / 2 + chatHeight / 2;

          if (leftValue < minLeft + breakpoint) {
            minTop -= offsetX;
            maxTop += offsetX;
            gsap.to(chat, { duration: 0.5, rotation: 90 });
            gsap.to(chat, { duration: 1, x: offsetX });
          } else if (leftValue > maxLeft - breakpoint) {
            minTop -= offsetX;
            maxTop += offsetX;
            gsap.to(chat, { duration: 0.5, rotation: -90 });
            gsap.to(chat, { duration: 1, x: 0 - offsetX });
          } else {
            gsap.to(chat, { duration: 0.5, rotation: 0 });
            gsap.to(chat, { duration: 1, x: 0 });
          }
        }

        leftValue = Math.max(minLeft, leftValue);
        topValue = Math.max(minTop, topValue);
        leftValue = Math.min(maxLeft, leftValue);
        topValue = Math.min(maxTop, topValue);

        this.container.style.left = `${leftValue}px`;
        this.container.style.top = `${topValue}px`;
      }
    }

    minimize() {
      const {
      left, top, width, height, minHeight,
      } = this.container.style;
      const chatLeft = parseInt(left.replace('px', ''), 10);
      const chatTop = parseInt(top.replace('px', ''), 10);
      const chatWidth = parseInt(width.replace('px', ''), 10);
      const chatHeight = parseInt(height.replace('px', ''), 10);
      const minimized = minHeight !== '40px'; // Timing of function means it's called right before the update; it gives a delayed value that is the opposite of the true value

      const breakpoint = 10;

      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      const chat = this.$refs.draggableContainer;

      if (!minimized) {
        if (chatTop >= windowHeight - chatHeight) {
          gsap.to(chat, {
            duration: 0.2,
            top: windowHeight - chatHeight,
          });
        }
      } else if (chatTop + chatHeight >= windowHeight) {
          gsap.to(chat, {
            duration: 0.2,
            top: windowHeight - 40,
          });
        }

      // TODO
    }

    closeDragElement() {
      document.onmouseup = null;
      document.onmousemove = null;
      if (localStorage) {
        if (!this.container) return;
        const windowSize = {
          x: window.innerWidth,
          y: window.innerHeight,
        };
        const {
          left, top, width, height,
        } = this.container.style;
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
        localStorage[`chat_${this.positionBasis}Position`] = JSON.stringify([side, offset, side2, offset2]);
        this.$emit('closeDragElement');
      }
    }
  }
</script>

<style>
#draggable-container {
  position: absolute;
  z-index: 9;
}
#draggable-header {
  z-index: 10;
}
</style>
