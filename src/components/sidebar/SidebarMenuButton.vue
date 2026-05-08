<template>
  <button
    class="hamburger border-0"
    :style="imageStyle"
    type="button"
    :aria-label="label"
    :aria-controls="layout.sidebarId"
    :aria-expanded="layout.isSidebarOpen"
    @click="layout.toggleSidebar()"
  ></button>
</template>
<script setup lang="ts">
  import hamburgerImage from '#assets/hamburger.png';
  import notificationImage from '#assets/hamburger-notification.png';
  import mentionImage from '#assets/hamburger-mention.png';
  import { computed, type CSSProperties } from 'vue';
  import { useChannelStore, useLayoutStore } from '#stores';

  const channel = useChannelStore();
  const layout = useLayoutStore();

  const label = computed(() => `${layout.isSidebarOpen ? 'Close' : 'Open'} sidebar.`);

  const imageStyle = computed<CSSProperties>(() => {
    if (!channel.hasNotification) {
      return { backgroundImage: `url(${hamburgerImage})` };
    } else if (channel.hasMention) {
      return { backgroundImage: `url(${mentionImage})` };
    } else {
      return { backgroundImage: `url(${notificationImage})`, backgroundSize: '62.5% 55%' };
    }
  });
</script>
<style scoped>
  .hamburger {
    height: 2em;
    width: 2em;
    background-color: transparent;
    background-repeat: no-repeat;
    background-size: 50% 45%;
    background-position: center;
  }
</style>
