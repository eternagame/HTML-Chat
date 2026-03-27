<template>
  <button
    class="open-window border-0"
    type="button"
    :style="{ backgroundImage: `url(${openWindowImage})` }"
    :aria-label="label"
    :aria-pressed="active"
    @click="emit('toggle', !active)"
  />
</template>

<script lang="ts" setup>
  import openWindowImage from '#assets/open-window.png';
  import { computed } from 'vue';

  const props = defineProps<{ active: boolean }>();
  const emit = defineEmits<{
    (event: 'toggle', value: boolean): void;
  }>();
  const label = computed(
    () => `Change chat window size to ${props.active ? 'normal' : 'fullscreen'}.`,
  );
</script>

<style scoped>
  .open-window {
    background-color: transparent;
    background-repeat: no-repeat;
    background-size: 60% 60%;
    background-position: center;
    height: 2em;
    width: 2em;
  }
</style>
