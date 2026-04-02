<template>
  <button
    class="minimization-triangle border-0"
    :class="{
      'minimization-triangle--open': open,
      'minimization-triangle--closed': !open,
    }"
    type="button"
    :style="{ backgroundImage: `url(${arrowImage})` }"
    :aria-label="label"
    :aria-expanded="open"
    :aria-controls="controls"
    @click="emit('toggle', !open)"
  />
</template>

<script setup lang="ts">
  import arrowImage from '#assets/minimization-triangle.png';
  import { computed } from 'vue';

  const props = defineProps<{ open: boolean; controls: string }>();
  const emit = defineEmits<{
    (event: 'toggle', value: boolean): void;
  }>();
  const label = computed(() => (props.open ? 'Close' : 'Open'));
</script>

<style scoped>
  .minimization-triangle {
    /* Normal/open state: 🔽 */
    background-color: transparent;
    background-repeat: no-repeat;
    background-size: 60% 40%;
    background-position: center;
    height: 2em;
    width: 2em;
    transform: rotate(0deg);
    @media (prefers-reduced-motion: no-preference) {
      transition: transform 200ms ease-in-out;
    }
  }

  /* Closed state: ◀ */
  .minimization-triangle--closed {
    transform: rotate(90deg);
  }
</style>
