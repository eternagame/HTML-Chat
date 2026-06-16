<template>
  <BApp>
    <ChatApp />
  </BApp>
</template>
<script setup lang="ts">
  import ChatApp from '#components/ChatApp.vue';
  import { useConfigurationStore, useIrcStore } from '#stores';
  import { BApp } from 'bootstrap-vue-next';
  import { onMounted } from 'vue';

  const props = defineProps<{
    username: string;
    uid: string;
    appContext?: string;
    defaultX?: number;
    defaultY?: number;
    defaultWidth?: number;
    defaultHeight?: number;
  }>();

  const configuration = useConfigurationStore();
  if (props.appContext) configuration.appContext = props.appContext;
  if (props.defaultX) configuration.defaultX = props.defaultX;
  if (props.defaultY) configuration.defaultY = props.defaultY;
  if (props.defaultWidth) configuration.defaultWidth = props.defaultWidth;
  if (props.defaultHeight) configuration.defaultHeight = props.defaultHeight;

  const irc = useIrcStore();
  onMounted(() => {
    irc.signIn({ username: props.username, uid: props.uid, remember: false });
  });
</script>
<style>
  :host {
    font: inherit;
    display: block;
    color: inherit;
    line-height: inherit;
    text-align: inherit;
  }
</style>
