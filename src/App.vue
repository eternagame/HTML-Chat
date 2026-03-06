<template>
  <BApp>
    <h1>You are {{ irc.isConnected ? 'connected' : 'not connected' }}</h1>

    <LoginForm @login="irc.signIn" />
  </BApp>
</template>

<script setup lang="ts">
  import LoginForm from '#components/LoginForm.vue';
  import { useIrcStore } from '#stores';
  import { BApp } from 'bootstrap-vue-next';

  const irc = useIrcStore();
</script>
