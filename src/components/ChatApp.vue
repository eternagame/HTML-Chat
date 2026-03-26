<template>
  <div class="chat-app" :style="{ fontSize: `${settings.fontSize}px` }">
    <DraggableWindow>
      <template v-slot:header>
        <div class="header d-flex flex-row flex-nowrap align-items-center">
          <SidebarMenuButton class="flex-shrink-0" />
          <span class="channel-name flex-grow-1">{{ channel.currentChannelName }}</span>
          <OpenWindowButton
            class="flex-shrink-0"
            :active="layout.windowState === 'fullscreen'"
            @toggle="layout.setWindowState($event ? 'fullscreen' : 'normal')"
          />
          <MinimizationTriangle
            class="flex-shrink-0"
            :open="layout.windowState !== 'minimized'"
            @toggle="layout.setWindowState($event ? 'normal' : 'minimized')"
          />
        </div>
      </template>
      <template v-slot:main>
        <div class="channel d-flex flex-column">
          <SidebarMenu />
          <ChannelMessages class="flex-grow-1" />
        </div>
      </template>
      <template v-slot:footer>
        <ChatInput />
      </template>
    </DraggableWindow>
  </div>
</template>

<script setup lang="ts">
  import { useChannelStore, useLayoutStore, useSettingsStore } from '#stores';
  import ChannelMessages from './channel/ChannelMessages.vue';
  import DraggableWindow from './layout/DraggableWindow.vue';
  import ChatInput from './chat/ChatInput.vue';
  import MinimizationTriangle from './ui/MinimizationTriangle.vue';
  import OpenWindowButton from './layout/header/OpenWindowButton.vue';
  import SidebarMenuButton from './sidebar/SidebarMenuButton.vue';
  import SidebarMenu from './sidebar/SidebarMenu.vue';

  const channel = useChannelStore();
  const layout = useLayoutStore();
  const settings = useSettingsStore();
</script>

<style scoped>
  .header {
    gap: 1em;

    .channel-name {
      font-size: 1.25em;
      line-height: 1.5;
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
    }
  }

  .channel {
    position: relative;
    height: 100%;
    padding: 0.5em;
  }
</style>
