<template>
  <div ref="channel-messages" class="channel-messages">
    <div class="message-item" v-for="(message, index) in channel.currentMessages" :key="message.id">
      <UsernameDisplay
        v-if="
          groupStartPositions.has(index) && message.type !== 'system' && message.type !== 'notice'
        "
        :username="message.username"
      />

      <ChannelMessage
        :message="message"
        :is-ignored="userList.ignoredUsernames.has(message.username)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import UsernameDisplay from '#components/user/UsernameDisplay.vue';
  import { useMessageGroups } from '#composables/useMessageGroups.ts';
  import { useChannelStore, useUserListStore } from '#stores';
  import { useScroll } from '@vueuse/core';
  import { nextTick, useTemplateRef, watch } from 'vue';
  import ChannelMessage from './ChannelMessage.vue';

  const channel = useChannelStore();
  const userList = useUserListStore();
  const groupStartPositions = useMessageGroups(() => channel.currentMessages);

  // Auto-scrolling on messages
  const scrollRef = useTemplateRef('channel-messages');
  const { y, arrivedState } = useScroll(scrollRef, { behavior: 'instant', offset: { bottom: 20 } });

  watch(groupStartPositions, () => {
    nextTick(() => {
      if (!scrollRef.value) {
        return;
      }

      if (arrivedState.bottom) {
        // Only auto-scroll when already scrolled down
        y.value = scrollRef.value.scrollHeight;
      }
    });
  });
</script>

<style scoped>
  .channel-messages {
    display: flex;
    flex-direction: column;
    padding: 0.5em 1em;
    height: 100%;
    overflow-x: hidden;
    overflow-y: auto;
    isolation: isolate;
  }
</style>
