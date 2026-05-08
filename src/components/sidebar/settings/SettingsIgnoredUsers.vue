<template>
  <SettingsGroup title="Ignored Users">
    <BListGroup v-if="ignoredUsers.length > 0">
      <BListGroupItem v-for="username in ignoredUsers" :key="username" class="ignored-user">
        <span class="username">{{ username }}</span>
        <BButton
          type="button"
          size="sm"
          variant="outline-secondary"
          @click="userList.unignoreUser(username)"
          >Unignore</BButton
        >
      </BListGroupItem>
      <BListGroupItem v-if="ignoredUsers.length > 1">
        <BButton
          type="button"
          size="sm"
          variant="secondary"
          class="w-100"
          @click="userList.unignoreAll()"
          >Unignore All</BButton
        >
      </BListGroupItem>
    </BListGroup>
    <p v-else>No users ignored.</p>
  </SettingsGroup>
</template>
<script setup lang="ts">
  import { useUserListStore } from '#stores';
  import { computed } from 'vue';
  import SettingsGroup from './ui/SettingsGroup.vue';
  import { BButton, BListGroup, BListGroupItem } from 'bootstrap-vue-next';

  const userList = useUserListStore();
  const ignoredUsers = computed(() => Array.from(userList.ignoredUsernames).sort());
</script>
<style scoped>
  .ignored-user {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 1em;
  }
  .username {
    flex: 1 1 auto;
  }
</style>
