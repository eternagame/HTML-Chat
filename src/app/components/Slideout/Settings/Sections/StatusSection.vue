<template>
  <SettingsSection title="Status" >
    <p>You are currently marked as {{userStatus ? 'away' : 'online'}}</p>
    <SettingsEnableDisable
      :value="!userStatus"
      @input="changeStatus"
      onText="ONLINE"
      offText="AWAY"
      :width="125"/>
  </SettingsSection>
</template>
<script lang="ts">
  import {
    Component, Watch, Prop, Vue,
  } from 'vue-property-decorator';
  import SettingsSection from '../SettingsSection.vue';
  import SettingsEnableDisable from '../SettingsEnableDisable.vue';

  @Component({
    components: {
      SettingsSection,
      SettingsEnableDisable,
    },
  })
  export default class StatusSection extends Vue {
    changeStatus(to:boolean) {
      this.$vxm.chat.autoUpdateStatus = to;
      if (to) {
        this.$vxm.chat.setUnaway();
      } else {
        this.$vxm.chat.setAway();
      }
    }

    get userStatus() {
      return this.$vxm.chat.userStatus;
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
