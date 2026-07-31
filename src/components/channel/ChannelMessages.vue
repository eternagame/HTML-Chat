<template>
  <div ref="channel-messages" class="channel-messages">
    <template v-for="(message, index) in channel.currentMessages" :key="message.id">
      <ChannelMessageItem
        :message="message"
        :userList="userList"
        :groupStartPositions="groupStartPositions"
        :index="index"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
  import { useMessageGroups } from '#composables/useMessageGroups.ts';
  import { useChannelStore, useIrcStore, useUserListStore } from '#stores';
  import { useElementSize, useScroll } from '@vueuse/core';
  import { nextTick, useTemplateRef, watch } from 'vue';
  import ChannelMessageItem from './ChannelMessageItem.vue';

  const irc = useIrcStore();
  const channel = useChannelStore();
  const userList = useUserListStore();
  const groupStartPositions = useMessageGroups(() => channel.currentMessages);

  // Auto-scrolling on messages
  const scrollRef = useTemplateRef('channel-messages');
  const { y, arrivedState } = useScroll(scrollRef, { behavior: 'instant', offset: { bottom: 20 } });
  const elemSize = useElementSize(scrollRef);
  watch([elemSize.height, elemSize.width], () => {
    if (!scrollRef.value) {
      return;
    }

    if (arrivedState.bottom) {
      y.value = scrollRef.value.scrollHeight;
    }
  });

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

  watch(channel.currentMessages, () => {
    if (!scrollRef.value) {
      return;
    }

    if (channel.currentMessages.at(-1)?.username === irc.currentUser.username) {
      // Always autoscroll when our user just posted a new message
      y.value = scrollRef.value.scrollHeight;
    }
  });
</script>

<style scoped>
  .channel-messages {
    display: flex;
    flex-direction: column;
    padding-block: 0.5em;
    height: 100%;
    overflow-x: hidden;
    overflow-y: auto;
    isolation: isolate;
  }
</style>
