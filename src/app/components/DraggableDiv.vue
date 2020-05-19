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
            this.$refs.draggableContainer.style.top = '0px';
            this.$refs.draggableContainer.style.left = '0px';
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
        if (!this.disabled) {
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
