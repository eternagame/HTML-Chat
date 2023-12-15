<template>
  <SettingsSection title="Status" >
    <li>
      <span
        class="align-middle">
        You are currently {{userStatus ? 'away' : 'online'}}
        <SettingsTooltip
          text="When others view your username, they will see an indicator if you are away"
        />
      </span>
    </li>
    <li>
      <span aria-label="set status">Set
        <SettingsTooltip
          text="Change your status"
        /></span>
      <span class="float-right">
        <SettingsEnableDisable
          :value="!userStatus"
          @input="changeStatus"
          onText="ONLINE"
          offText="AWAY"
          :width="120"/>
      </span>
    </li>
    <li>
      <span>Auto Update
        <SettingsTooltip
          text="Whether your status will update when you leave or come back to the tab"
        />
      </span>
      <span class="float-right">
        <SettingsSwitch
          v-model="$vxm.chat.autoUpdateStatus"
        />
      </span>
    </li>
    <li>
      <span
      >
        Reason
        <SettingsTooltip
          text="When others see the away indicator, they will see the reason you are away"
        />
      </span>
      <span class="float-right">
        <input type=text v-model="reason" style="width: 115px">
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
  import SettingsSwitch from '../SettingsSwitch.vue';

  @Component({
    components: {
      SettingsSection,
      SettingsEnableDisable,
      SettingsTooltip,
      SettingsSwitch,
    },
  })
  export default class StatusSection extends Vue {
    changeStatus(to:boolean) {
      if (to) {
        this.$vxm.chat.setUnaway();
      } else {
        this.$vxm.chat.autoUpdateStatus = false;
        this.$vxm.chat.setAway(this.reason);
      }
    }

    get userStatus() {
      return this.$vxm.chat.userStatus;
    }

    reason = '';

    created() {
      if (localStorage.chat_awayReason) {
        this.reason = localStorage.chat_awayReason;
      } else {
        this.reason = this.$vxm.settings.awayReason;
      }
    }

    @Watch('reason')
    updateReason() {
      localStorage.chat_awayReason = this.reason;
      this.$vxm.settings.awayReason = this.reason;
    }
  }
</script>
<style lang="scss" scoped>
li {
  list-style-type: none;
  width: calc(100% - 40px);
  margin-bottom: 10px;
}
input {
  font-size: 0.85rem;
}
</style>
