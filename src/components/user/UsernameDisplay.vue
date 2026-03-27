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
        {{ user.displayName }}
      </div>
    </template>

    <template v-if="user.isFetchingProfile || !user.profile">Fetching player profile...</template>
    <template v-else>
      <article class="profile d-flex flex-column">
        <img
          class="profile-avatar align-self-center"
          :src="user.profile.avatar ?? defaultAvatar"
          alt=""
        />

        <div class="align-self-center">
          <span
            v-if="user.status !== 'online'"
            class="indicator"
            :class="{
              'indicator--away': user.status === 'away',
              'indicator--offline': user.status === 'offline',
            }"
            >●
          </span>
          <a v-if="user.profile.link" :href="user.profile.link" target="_blank">{{
            user.displayName
          }}</a>
          <span v-else>{{ user.displayName }}</span>
        </div>

        <dl>
          <dt>Rank</dt>
          <dd v-if="user.profile.rank">#{{ user.profile.rank }}</dd>
          <dd v-else>Unranked</dd>

          <dt>Roles</dt>
          <dd>{{ user.profile.roles.join(', ') }}</dd>
        </dl>

        <section v-if="user.profile.description" v-html="user.profile.description" />
        <p v-else>User has not added a description to their profile.</p>
      </article>
    </template>
  </BPopover>
</template>

<script setup lang="ts">
  import defaultAvatar from '#assets/default-avatar.svg';
  import { ANONYMOUS_USER } from '#constants';
  import { useUserListStore } from '#stores';
  import { BPopover } from 'bootstrap-vue-next';
  import { computed } from 'vue';

  const props = defineProps<{ username: string }>();
  const userList = useUserListStore();
  const user = computed(() => userList.getUserByUsername(props.username) ?? ANONYMOUS_USER);
  const usernameColor = computed(() => user.value.color);
  function onShow() {
    userList.loadProfile(props.username);
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

  .profile {
    width: 250px;
  }

  .profile-avatar {
    height: 75px;
    object-fit: contain;
    border-radius: 50%;
  }
</style>
