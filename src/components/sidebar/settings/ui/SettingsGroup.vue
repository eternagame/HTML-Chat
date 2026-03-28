<template>
  <section class="settings-group">
    <h5>{{ title }}</h5>

    <div class="settings-group-content">
      <slot />
    </div>
  </section>
</template>
<script setup lang="ts">
  defineProps<{ title: string }>();
</script>
