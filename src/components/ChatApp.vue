<template>
  <div class="chat-app" :style="{ fontSize: `${settings.fontSize}px` }">
    <DraggableWindow>
      <template v-slot:header>
        <span>{{ channel.currentChannelName }}</span>
      </template>
      <template v-slot:main>
        <div class="channel d-flex flex-column">
          <ChannelMessages class="flex-grow-1 flex-shrink-1" />
          <ChatInput class="flex-grow-1 flex-shrink-0" />
        </div>
      </template>
    </DraggableWindow>
  </div>
</template>

<script setup lang="ts">
  import { useChannelStore, useSettingsStore } from '#stores';
  import ChannelMessages from './channel/ChannelMessages.vue';
  import DraggableWindow from './layout/DraggableWindow.vue';
  import ChatInput from './chat/ChatInput.vue';
  // TODO: Re-implement resizing tracking

  const channel = useChannelStore();
  const settings = useSettingsStore();
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
