<template>
  <header>
    <h4>Online ({{ connectedUsers.length }})</h4>
  </header>

  <ul class="list-unstyled">
    <li v-for="user in connectedUsers" :key="user.username">
      <UsernameDisplay :username="user.username" />
    </li>
  </ul>
</template>
<script setup lang="ts">
  import UsernameDisplay from '#components/user/UsernameDisplay.vue';
  import { useUserListStore } from '#stores';
  import { computed } from 'vue';

  const userList = useUserListStore();
  const connectedUsers = computed(() =>
    userList.users
      .filter((user) => user.status !== 'offline')
      .sort((a, b) => a.username.localeCompare(b.username)),
  );
</script>
