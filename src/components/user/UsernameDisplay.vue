<template>
  <BPopover click @show="onShow">
    <template #target>
      <div class="username" :style="{ color: usernameColor }">
        <span
          v-if="user.status !== 'online'"
          class="indicator"
          :class="{
            'indicator--away': user.status === 'away',
            'indicator--offline': user.status === 'offline',
          }"
          >●</span
        >
        {{ user.username }}
      </div>
    </template>

    <template v-if="user.isFetchingProfile || !user.profile">Fetching player profile...</template>
    <template v-else>
      <img :src="user.profile.avatar ?? defaultAvatar" alt="" />

      <a v-if="user.profile.link" :href="user.profile.link" target="_blank">{{ user.username }}</a>
      <span v-else>{{ user.username }}</span>

      <dl>
        <dt>Rank</dt>
        <dd v-if="user.profile.rank">#{{ user.profile.rank }}</dd>
        <dd v-else>Unranked</dd>

        <dt>Roles</dt>
        <dd>{{ user.profile.roles.join(', ') }}</dd>
      </dl>

      <section v-if="user.profile.description" v-html="user.profile.description" />
      <p v-else>User has not added a description to their profile.</p>
    </template>
  </BPopover>
</template>

<script setup lang="ts">
  import defaultAvatar from '#assets/default-avatar.svg';
  import { useUserListStore } from '#stores';
  import { BPopover } from 'bootstrap-vue-next';
  import { computed } from 'vue';

  const props = defineProps<{ nick: string }>();
  const userList = useUserListStore();
  const user = computed(() => userList.getUser(props.nick));
  const usernameColor = computed(() => user.value.color);

  function onShow() {
    userList.loadProfile(props.nick);
  }
</script>

<style scoped>
  .username {
    display: inline-block;
  }
  .indicator--away {
    color: yellow;
  }
  .indicator--offline {
    color: gray;
  }
</style>
