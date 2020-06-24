<template>
  <SettingsSection title="Ignored" >
      <ul style="margin-bottom: 0" aria-label="List of ignored users">
        <li v-for="user in ignoredUsers" :key="user">
          <span style="vertical-align: sub">{{user}}</span>
          <button
            :style="{ fontSize:`${11 / 14}rem` }"
            class='unignore-user btn settings-button'
            :aria-label="`Ignore user ${user}`"
            v-on:click="unignore(user)" >
            Unignore
          </button>
        </li>
        <li v-show="!anyIgnoredUsers">No users ignored</li>
        <li v-show="anyIgnoredUsers" class="height-normal">
          <button
          aria-label="Unignore all users"
          :style="{ fontSize:`${11 / 14}rem` }"
          style="width:100%"
          class='btn settings-button'
          v-on:click="unignore('*')"
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
@import "@/assets/_custom.scss";
@import "~bootstrap/scss/bootstrap.scss";
@import '~bootstrap-vue/dist/bootstrap-vue.css';
.settings-button {
  background-color:$green;
  display: inline-block;
}
li {
  width:calc(100% - 40px);
  height:36px;
}
.unignore-user {
  float:right;
}
.height-normal {
  height:auto;
}
</style>
