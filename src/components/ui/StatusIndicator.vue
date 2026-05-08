<template>
  <span
    v-if="status !== 'online'"
    class="indicator"
    :class="{
      'indicator--away': status === 'away',
      'indicator--offline': status === 'offline',
    }"
    ><span aria-hidden="true">●</span><span class="visually-hidden">{{ status }}</span></span
  >
</template>
<script setup lang="ts">
  import type { UserStatus } from '#models';
  defineProps<{ status: UserStatus }>();
</script>
<style scoped>
  .indicator--away {
    color: yellow;
  }
  .indicator--offline {
    color: gray;
  }
</style>
