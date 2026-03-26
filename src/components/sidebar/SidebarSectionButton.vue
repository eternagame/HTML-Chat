<template>
  <button class="section-button border-0" type="button" :aria-current="active">
    <img class="icon" :src="displayedImage" :alt="label" />
  </button>
</template>
<script setup lang="ts">
  import { computed } from 'vue';

  const props = withDefaults(
    defineProps<{ icon: string; iconActive: string; active?: boolean; label: string }>(),
    { active: false },
  );
  const displayedImage = computed(() => (props.active ? props.iconActive : props.icon));
</script>
<style scoped>
  .section-button {
    background-color: transparent;
    padding: 10px 20px;
  }

  .icon {
    object-fit: contain;
  }
</style>
