<template>
  <SettingsSection title="Status" >
    <li>
      <span style="vertical-align: middle">You are {{userStatus ? 'away' : 'online'}}</span>
      <span style="margin-top: 5px;">
        <SettingsEnableDisable
          :value="!userStatus"
          @input="changeStatus"
          onText="ONLINE"
          offText="AWAY"
          :width="150"/>
      </span>
    </li>
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
li {
  list-style-type: none;
  width: calc(100% - 40px);
}
</style>
