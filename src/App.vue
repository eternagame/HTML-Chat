<template>
  <BApp>
    <ChatApp v-if="irc.isInitialized" />
    <LoginForm v-else @login="irc.signIn" />
  </BApp>
</template>

<script setup lang="ts">
  import ChatApp from '#components/ChatApp.vue';
  import LoginForm from '#components/LoginForm.vue';
  import { useIrcStore } from '#stores';
  import { BApp } from 'bootstrap-vue-next';
  import { onMounted } from 'vue';

  const irc = useIrcStore();

  onMounted(() => {
    irc.autoSignIn();
  });
</script>
