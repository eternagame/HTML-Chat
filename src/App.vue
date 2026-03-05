<template>
  <BApp>
    <LoginForm @login="console.log" />
  </BApp>
</template>

<script setup lang="ts">
  import LoginForm from '#components/LoginForm.vue';
  import { BApp } from 'bootstrap-vue-next';
</script>
