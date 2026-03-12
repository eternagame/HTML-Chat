<template>
  <DraggableWindow>
    <template v-slot:main>
      <Transition name="fade"> </Transition>
    </template>
  </DraggableWindow>
</template>

<script setup lang="ts">
  import DraggableWindow from './DraggableWindow.vue';
  // TODO: Re-implement resizing tracking
</script>

<style scoped>
  .fade-enter-active,
  .fade-leave-active {
    transform-origin: top center;
    @media (prefers-reduced-motion: no-preference) {
      transition: transform 200ms;
    }
  }

  .fade-enter,
  .fade-leave-to {
    transform-origin: top center;
    /* Moves everything up without interfering with top bar. */
    transform: scaleY(0);
  }
</style>
