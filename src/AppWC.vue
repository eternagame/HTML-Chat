<template>
  <BApp>
    <ChatApp />
  </BApp>
</template>
<script setup lang="ts">
  import ChatApp from '#components/ChatApp.vue';
  import { useIrcStore } from '#stores';
  import { BApp } from 'bootstrap-vue-next';
  import { onMounted } from 'vue';

  const irc = useIrcStore();
  const props = defineProps<{ username: string; uid: string }>();
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
