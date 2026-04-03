<template>
  <header>
    <h4>Settings</h4>
  </header>

  <div class="settings">
    <SettingsNotifications />
    <SettingsOperator />
  </div>
</template>
<script setup lang="ts">
  import SettingsNotifications from './SettingsNotifications.vue';
  import SettingsOperator from './SettingsOperator.vue';
</script>
<style scoped></style>
