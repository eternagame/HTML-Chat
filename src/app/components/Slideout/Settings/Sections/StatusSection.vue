<template>
  <SettingsSection title="Status" >
    <li>
      <span
        style="vertical-align: middle"
        aria-label="When others view your username, they will see an indicator if you are away">
        You are currently {{userStatus ? 'away' : 'online'}}
        <SettingsTooltip
          title="When others view your username, they will see an indicator if you are away"
        />
      </span>
    </li>
    <li>
      <span aria-label="Change your status">Set
        <SettingsTooltip
          title="Change your status"
        /></span>
      <span style="float:right;">
        <SettingsEnableDisable
          :value="!userStatus"
          @input="changeStatus"
          onText="ONLINE"
          offText="AWAY"
          :width="120"/>
      </span>
    </li>
    <li>
      <span
        aria-label="When others see the away indicator, they will see the reason you are away"
      >
        Reason
        <SettingsTooltip
          title="When others see the away indicator, they will see the reason you are away"
        />
      </span>
      <span style="float:right">
        <input type=text v-model="reason">
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
  import SettingsTooltip from '../SettingsTooltip.vue';

  @Component({
    components: {
      SettingsSection,
      SettingsEnableDisable,
      SettingsTooltip,
    },
  })
  export default class StatusSection extends Vue {
    changeStatus(to:boolean) {
      this.$vxm.chat.autoUpdateStatus = to;
      if (to) {
        this.$vxm.chat.setUnaway();
      } else {
        this.$vxm.chat.setAway(this.reason);
      }
    }

    get userStatus() {
      return this.$vxm.chat.userStatus;
    }

    reason = '';

    created() {
      if (localStorage.awayReason) {
        this.reason = localStorage.awayReason;
      } else {
        this.reason = this.$vxm.settings.awayReason;
      }
    }

    @Watch('reason')
    updateReason() {
      localStorage.awayReason = this.reason;
      this.$vxm.settings.awayReason = this.reason;
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
  margin-bottom: 10px;
}
</style>
