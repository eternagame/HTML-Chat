<template>
  <button class="section-button border-0" type="button" :aria-current="active">
    <img v-show="active" class="icon" :src="iconActive" :alt="label" />
    <img v-show="!active" class="icon" :src="icon" :alt="label" />
  </button>
</template>
<script setup lang="ts">
  withDefaults(
    defineProps<{ icon: string; iconActive: string; active?: boolean; label: string }>(),
    { active: false },
  );
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
