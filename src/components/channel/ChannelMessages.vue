<template>
  <div ref="scrollRef" class="channel-messages d-flex flex-column">
    <MessageGroup v-for="group in messageGroups" :key="group.id" :message-group="group" />
  </div>
</template>

<script setup lang="ts">
  import { useMessageGroups } from '#composables/useMessageGroups.ts';
  import { useChannelStore } from '#stores';
  import { useScroll } from '@vueuse/core';
  import { nextTick, useTemplateRef, watch } from 'vue';
  import MessageGroup from './MessageGroup.vue';

  const channel = useChannelStore();
  const { messageGroups } = useMessageGroups(() => channel.currentMessages);

  // Auto-scrolling on messages
  const scrollRef = useTemplateRef('scrollRef');
  const { y, arrivedState } = useScroll(scrollRef, { behavior: 'instant' });

  watch(
    messageGroups,
    () => {
      nextTick(() => {
        if (!scrollRef.value) {
          return;
        }

        if (arrivedState.bottom) {
          // Only auto-scroll when already scrolled down
          y.value = scrollRef.value.scrollHeight;
        }
      });
    },
    { deep: true },
  );
</script>

<style scoped>
  .channel-messages {
    gap: 0.5em;
    padding: 0.5em 1em;
    height: 100%;
    overflow-x: hidden;
    overflow-y: auto;
  }
</style>
