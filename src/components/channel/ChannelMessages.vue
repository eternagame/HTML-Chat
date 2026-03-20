<template>
  <MessageGroup v-for="group in messageGroups" :key="group.id" :message-group="group" />
</template>

<script setup lang="ts">
  import { useMessageGroups } from '#composables/useMessageGroups.ts';
  import { useChannelStore } from '#stores';
  import MessageGroup from './MessageGroup.vue';

  const channel = useChannelStore();
  const { messageGroups } = useMessageGroups(() => channel.activeMessages);
</script>

<style scoped></style>
