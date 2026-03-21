<template>
  <ul>
    <li v-for="user in connectedUsers" :key="user.username">
      <UsernameDisplay :username="user.username" />
    </li>
  </ul>
</template>
<script setup lang="ts">
  import { useUserListStore } from '#stores';
  import { computed } from 'vue';
  import UsernameDisplay from './UsernameDisplay.vue';

  const userList = useUserListStore();
  const connectedUsers = computed(() =>
    userList.users
      .filter((user) => user.status !== 'offline')
      .sort((a, b) => a.username.localeCompare(b.username)),
  );
</script>
