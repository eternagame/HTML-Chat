<template>
  <SettingsSection title="Ignored" >
      <table style="width:175px" >
        <tr v-for="user in ignoredUsers" :key="user.Username">
          <button
            :style="{ fontSize:`${11 / 14}rem` }"
            style="right:0; width:150px;"
            class='unignore-user btn settings-button'
            v-on:click="unignore(user)" >
            Unignore {{user}}
          </button>
        </tr>
        <tr v-show="!anyIgnoredUsers">No users ignored</tr>
        <tr><button
          :style="{ fontSize:`${11 / 14}rem` }"
          style="margin-top:5px; width:150px"
          class='unignore-user btn settings-button'
          v-on:click="unignore('*')"
          v-show="anyIgnoredUsers"
        >
          Unignore All
        </button></tr>
      </table>
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

    // If any users are ignored. Uses ignoredUsers.length
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
}
</style>
