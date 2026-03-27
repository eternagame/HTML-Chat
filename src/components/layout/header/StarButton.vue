<template>
  <button
    type="button"
    class="star-button border-0"
    :style="buttonStyle"
    :aria-pressed="active"
    :aria-label="label"
    @click="emit('toggle', !active)"
  />
</template>

<script setup lang="ts">
  import starImage from '#assets/star-outline.png';
  import starActiveImage from '#assets/star.png';
  import { computed, type CSSProperties } from 'vue';

  const props = defineProps<{ active: boolean }>();
  const emit = defineEmits<{
    (event: 'toggle', value: boolean): void;
  }>();

  const label = computed(() => `${props.active ? 'Hide' : 'Show'} starred messages.`);
  const buttonStyle = computed<CSSProperties>(() => ({
    backgroundImage: `url('${props.active ? starActiveImage : starImage}')`,
  }));
</script>

<style scoped>
  .star-button {
    background-color: transparent;
    background-repeat: no-repeat;
    background-size: 60% 60%;
    background-position: center;
    height: 2em;
    width: 2em;
  }
</style>
