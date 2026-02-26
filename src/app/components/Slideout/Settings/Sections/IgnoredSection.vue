<template>
  <SettingsSection title="Ignored">
    <ul style="margin-bottom: 0" class="list-group">
      <li v-for="user in ignoredUsers" :key="user">
        <span style="vertical-align: sub">{{user}}</span>
        <button
          type="button"
          class='float-right btn btn-primary btn-sm'
          @click="unignore(user)">
          Unignore
        </button>
      </li>
      <li v-show="!anyIgnoredUsers">No users ignored</li>
      <li v-show="anyIgnoredUsers" class="height-normal">
        <button
          type="button"
          class='btn btn-primary w-100 btn-sm'
          @click="unignore('*')"
        >
          Unignore All
        </button>
      </li>
    </ul>
  </SettingsSection>
</template>
<script lang="ts" setup>
import { vxm } from '#store/vxm';
import { computed } from 'vue';
import SettingsSection from '../SettingsSection.vue';

const ignoredUsers = computed(() => vxm.chat.ignoredUsers);
const anyIgnoredUsers = computed(() => ignoredUsers.value.length > 0);

/**
 * Unignore user on list
 */
function unignore(user: string) {
  vxm.chat.unignoreUser(user);
}
</script>
<style lang="scss" scoped>
li {
  width:calc(100% - 40px);
  height:36px;
}
.height-normal {
  height:auto;
}
</style>
