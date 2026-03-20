<template>
  <DraggableWindow>
    <template v-slot:header>
      <span>{{ channel.activeChannelName }}</span>
    </template>
    <template v-slot:main>
      <OnlineUsers />
      <ChannelMessages />
      <ChatInput />
    </template>
  </DraggableWindow>
</template>

<script setup lang="ts">
  import { AUTO_JOIN_CHANNELS } from '#constants';
  import { useChannelStore, useIrcStore } from '#stores';
  import { ref, watch } from 'vue';
  import ChannelMessages from './channel/ChannelMessages.vue';
  import DraggableWindow from './layout/DraggableWindow.vue';
  import OnlineUsers from './user/OnlineUsers.vue';
  import ChatInput from './chat/ChatInput.vue';
  // TODO: Re-implement resizing tracking

  const irc = useIrcStore();
  const channel = useChannelStore();
  const joined = ref(false);

  watch([joined, () => irc.connectionStatus], ([hasJoined, connectionStatus]) => {
    if (hasJoined || connectionStatus !== 'connected') {
      return;
    }

    for (const channelName of AUTO_JOIN_CHANNELS) {
      channel.joinChannel(channelName);
    }
    channel.changeActiveChannel(AUTO_JOIN_CHANNELS[0]);
  });
</script>

<style scoped>
  .fade-enter-active,
  .fade-leave-active {
    transform-origin: top center;
    @media (prefers-reduced-motion: no-preference) {
      transition: transform 200ms;
    }
  }

  .fade-enter,
  .fade-leave-to {
    transform-origin: top center;
    /* Moves everything up without interfering with top bar. */
    transform: scaleY(0);
  }
</style>
