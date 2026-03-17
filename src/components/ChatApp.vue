<template>
  <DraggableWindow>
    <template v-slot:main>
      <OnlineUsers />
      <Transition name="fade"> </Transition>
    </template>
  </DraggableWindow>
</template>

<script setup lang="ts">
  import DraggableWindow from './DraggableWindow.vue';
  import OnlineUsers from './user/OnlineUsers.vue';
  import { useChannelStore, useIrcStore } from '#stores';
  import { AUTO_JOIN_CHANNELS } from '#constants';
  import { ref, watch } from 'vue';
  // TODO: Re-implement resizing tracking

  const irc = useIrcStore();
  const channels = useChannelStore();
  const joined = ref(false);

  watch([joined, () => irc.connectionStatus], ([hasJoined, connectionStatus]) => {
    if (hasJoined || connectionStatus !== 'connected') {
      return;
    }

    for (const channel of AUTO_JOIN_CHANNELS) {
      channels.joinChannel(channel);
    }
    channels.changeActiveChannel(AUTO_JOIN_CHANNELS[0]);
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
