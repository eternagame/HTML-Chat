<template>
  <MessageGroup v-for="group in messageGroups" :key="group.id" :message-group="group" />
</template>

<script setup lang="ts">
  import { useMessageGroups } from '#composables/useMessageGroups.ts';
  import { useChannelStore } from '#stores';
  import { computed } from 'vue';
  import MessageGroup from './MessageGroup.vue';

  const { activeChannel } = useChannelStore();
  const messages = computed(() => activeChannel.messages);
  const { messageGroups } = useMessageGroups(messages);
</script>

<style scoped></style>
