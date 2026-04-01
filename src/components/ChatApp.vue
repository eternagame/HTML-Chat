<template>
  <div class="chat-app" :style="{ fontSize: `${settings.fontSize}px` }">
    <DraggableWindow>
      <template v-slot:header>
        <div class="header d-flex flex-row flex-nowrap align-items-center">
          <SidebarMenuButton class="flex-shrink-0" />
          <span class="channel-name flex-grow-1">{{
            channel.currentChannel?.displayName ?? channel.currentChannelName
          }}</span>
          <OpenWindowButton
            class="flex-shrink-0"
            :active="layout.windowState === 'fullscreen'"
            @toggle="layout.setWindowState($event ? 'fullscreen' : 'normal')"
          />
          <MinimizationTriangle
            class="flex-shrink-0"
            :open="layout.windowState !== 'minimized'"
            :controls="`${mainId} ${footerId}`"
            @toggle="layout.setWindowState($event ? 'normal' : 'minimized')"
          />
        </div>
      </template>

      <div :id="mainId" class="channel d-flex flex-column">
        <SidebarMenu />
        <ReportModal />
        <ChannelMessages class="flex-grow-1" />
      </div>

      <template v-slot:footer>
        <div :id="footerId" class="footer">
          <ConnectingMessage />
          <ChatInput />
        </div>
      </template>
    </DraggableWindow>
  </div>
</template>

<script setup lang="ts">
  import { useChannelStore, useLayoutStore, useSettingsStore } from '#stores';
  import { useId } from 'vue';
  import ChannelMessages from './channel/ChannelMessages.vue';
  import ChatInput from './chat/ChatInput.vue';
  import ConnectingMessage from './connection/ConnectingMessage.vue';
  import DraggableWindow from './layout/DraggableWindow.vue';
  import OpenWindowButton from './layout/header/OpenWindowButton.vue';
  import ReportModal from './modals/ReportModal.vue';
  import SidebarMenu from './sidebar/SidebarMenu.vue';
  import SidebarMenuButton from './sidebar/SidebarMenuButton.vue';
  import MinimizationTriangle from './ui/MinimizationTriangle.vue';

  const channel = useChannelStore();
  const layout = useLayoutStore();
  const settings = useSettingsStore();
  const mainId = useId();
  const footerId = useId();
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
  }
</style>
