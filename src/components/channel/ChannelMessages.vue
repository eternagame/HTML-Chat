<template>
  <div class="channel-messages d-flex flex-column">
    <MessageGroup v-for="group in messageGroups" :key="group.id" :message-group="group" />
  </div>
</template>

<script setup lang="ts">
  import { useMessageGroups } from '#composables/useMessageGroups.ts';
  import { useChannelStore } from '#stores';
  import MessageGroup from './MessageGroup.vue';

  const channel = useChannelStore();
  const { messageGroups } = useMessageGroups(() => channel.currentMessages);
</script>

<style scoped>
  .channel-messages {
    gap: 0.5em;
    padding: 1em 0.5em;
  }
</style>
