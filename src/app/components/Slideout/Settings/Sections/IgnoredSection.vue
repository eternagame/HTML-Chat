<template>
  <SettingsSection title="Ignored" >
      <ul style="margin-bottom: 0" class="list-group">
        <li v-for="user in ignoredUsers" :key="user">
          <span style="vertical-align: sub">{{user}}</span>
          <button
            class='float-right btn btn-primary btn-sm'
            @click="unignore(user)" >
            Unignore
          </button>
        </li>
        <li v-show="!anyIgnoredUsers">No users ignored</li>
        <li v-show="anyIgnoredUsers" class="height-normal">
          <button
          class='btn btn-primary w-100 btn-sm'
          @click="unignore('*')"
          >
          Unignore All
          </button>
        </li>
      </ul>
    </SettingsSection>
</template>
<script lang="ts">
  import {
    Component, Watch, Prop, Vue,
  } from 'vue-property-decorator';
  import SettingsSection from '../SettingsSection.vue';

  @Component({
    components: {
      SettingsSection,
    },
  })
  export default class IgnoredSection extends Vue {
    get ignoredUsers() {
      return this.$vxm.chat.ignoredUsers;
    }

    get anyIgnoredUsers() {
      return this.ignoredUsers.length > 0;
    }

    // Unignore user on list
    unignore(user:string) {
      this.$vxm.chat.unignoreUser(user);
    }
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
