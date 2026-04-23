<template>
  <BPopover click :target="target" @show="onShow">
    <p v-if="user.isFetchingProfile || !user.profile">Fetching player profile...</p>
    <article v-else class="profile d-flex flex-column">
      <img
        class="profile-avatar align-self-center"
        :src="user.profile.avatar ?? defaultAvatar"
        alt=""
      />

      <div class="align-self-center">
        <StatusIndicator v-if="user.status !== 'online'" :status="user.status" />

        <a v-if="user.profile.link" :href="user.profile.link" target="_blank">{{
          user.displayName
        }}</a>
        <span v-else>{{ user.displayName }}</span>
      </div>

      <div class="profile-actions">
        <BButtonGroup size="sm"
          ><BButton type="button" variant="outline-secondary" @click="toggleIgnore">
            {{ isIgnored ? 'Unignore' : 'Ignore' }} {{ user.displayName }}</BButton
          ></BButtonGroup
        >
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
  </BPopover>
</template>
<script setup lang="ts">
  import defaultAvatar from '#assets/default-avatar.svg';
  import StatusIndicator from '#components/ui/StatusIndicator.vue';
  import { ANONYMOUS_USER } from '#constants';
  import { useUserListStore } from '#stores';
  import { BButton, BButtonGroup, BPopover } from 'bootstrap-vue-next';
  import { computed } from 'vue';

  const props = defineProps<{ username: string; target?: HTMLElement | null }>();

  const userList = useUserListStore();
  const user = computed(() => userList.getUserByUsername(props.username) ?? ANONYMOUS_USER);
  const isIgnored = computed(() => userList.ignoredUsernames.has(props.username));

  function onShow() {
    userList.loadProfile(props.username);
  }

  function toggleIgnore() {
    if (isIgnored.value) {
      userList.unignoreUser(props.username);
    } else {
      userList.ignoreUser(props.username);
    }
  }
</script>
<style scoped>
  .profile {
    width: 250px;
  }
  .profile-avatar {
    height: 75px;
    object-fit: contain;
    border-radius: 50%;
  }
  .profile-actions {
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
  }
</style>
