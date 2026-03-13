<template>
  <BApp>
    <h1>Connection status: {{ irc.connectionStatus }}</h1>

    <ChatApp v-if="irc.isInitialized" />
    <LoginForm v-else @login="irc.signIn" />
  </BApp>
</template>

<script setup lang="ts">
  import ChatApp from '#components/ChatApp.vue';
  import LoginForm from '#components/LoginForm.vue';
  import { useIrcStore } from '#stores';
  import { BApp } from 'bootstrap-vue-next';

  const irc = useIrcStore();
</script>
