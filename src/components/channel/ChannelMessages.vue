<template>
  <div class="channel-messages d-flex flex-column" :style="{ fontSize }">
    <MessageGroup v-for="group in messageGroups" :key="group.id" :message-group="group" />
  </div>
</template>

<script setup lang="ts">
  import { useMessageGroups } from '#composables/useMessageGroups.ts';
  import { useChannelStore, useSettingsStore } from '#stores';
  import { computed } from 'vue';
  import MessageGroup from './MessageGroup.vue';

  const channel = useChannelStore();
  const settings = useSettingsStore();

  const fontSize = computed(() => `${settings.fontSize}px`);
  const { messageGroups } = useMessageGroups(() => channel.currentMessages);
</script>

<style scoped>
  .channel-messages {
    gap: 0.5em;
  }
</style>
