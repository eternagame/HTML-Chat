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

<script>
  export default {
    name: 'DraggableDiv',
    data() {
      return {
        positions: {
          clientX: undefined,
          clientY: undefined,
          movementX: 0,
          movementY: 0,
        },
      };
    },
    props: {
      enabled: Boolean,
      inGame: Boolean,
      inForum: Boolean,
    },
    computed: {
      disabled: function disabled() {
        return !this.enabled;
      },
    },
    watch: {
      enabled: {
        handler: function changed() {
          if (!this.enabled) {
            this.$refs.draggableContainer.style.top = `${this.clientY}px`;
            this.$refs.draggableContainer.style.left = `${this.clientX}px`;
          }
        },
      },
    },
    methods: {
      dragMouseDown(event) {
        if (!this.disabled) {
          event.preventDefault();
          // get the mouse cursor position at startup:
          this.positions.clientX = event.clientX;
          this.positions.clientY = event.clientY;
          document.onmousemove = this.elementDrag;
          document.onmouseup = this.closeDragElement;
        }
      },
      elementDrag(event) {
        if (!this.disabled) { // If dragging isn't disabled
          event.preventDefault();
          this.positions.movementX = this.positions.clientX - event.clientX;
          this.positions.movementY = this.positions.clientY - event.clientY;
          this.positions.clientX = event.clientX;
          this.positions.clientY = event.clientY;
          // set the element's new position:
          this.$refs.draggableContainer.style.top = `${this.$refs.draggableContainer.offsetTop - this.positions.movementY}px`;
          this.$refs.draggableContainer.style.left = `${this.$refs.draggableContainer.offsetLeft - this.positions.movementX}px`;
        }
      },
      closeDragElement() {
        /* Chat position is stored relative to the center of the page - this is because
        of how the site is laid out. It means that the chat won't move if the browser resizes. */
        /* If the chat is in-game, position is stored relative to edges of page */
        if (localStorage) {
          const windowSize = [window.innerWidth, window.innerHeight];
          const {
            left, top, width, height,
          } = this.$refs.draggableContainer.style;
          const chatPosition = [Number(left.replace('px', '')), Number(top.replace('px', ''))];
          const chatSize = [Number(width.replace('px', '')), Number(height.replace('px', ''))];
          // Determines whether chat is placed WRT l/r, t/b by center
          const center = [chatPosition[0] + chatSize[0] / 2, chatPosition[1] + chatSize[1] / 2];
          const side = center[0] < windowSize[0] / 2 ? 'l' : 'r';
          const side2 = center[1] < windowSize[1] / 2 ? 't' : 'b';
          // Gets offsets from sides
          let offset = chatPosition[0];
          if (side === 'r') {
            // Gets offset from right
            offset = windowSize[0] - chatPosition[0] - chatSize[0];
          }
          let offset2 = chatPosition[1];
          if (side2 === 'b') {
            // Gets offset from bottom
            offset2 = windowSize[1] - chatPosition[1] - chatSize[1];
          }
          let basis;
          if (this.inGame) basis = 'gameP';
          else if (this.inForum) basis = 'forumP';
          else basis = 'p';
          localStorage[`chat_${basis}osition`] = JSON.stringify([side, offset, side2, offset2]);
        }
        document.onmouseup = null;
        document.onmousemove = null;
      },
    },
  };
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
