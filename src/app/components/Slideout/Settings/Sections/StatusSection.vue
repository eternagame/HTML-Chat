<template>
  <SettingsSection title="Status">
    <div class="setting">
      <span
        class="align-middle">
        You are currently {{userStatus ? 'away' : 'online'}}
        <SettingsTooltip
          text="When others view your username, they will see an indicator if you are away"
        />
      </span>
    </div>
    <div class="setting">
      <span aria-label="set status">Set
        <SettingsTooltip
          text="Change your status"
        /></span>
      <span class="float-right">
        <SettingsEnableDisable
          :value="userStatus ? 'ALL_ON' : 'ALL_OFF'"
          @input="changeStatus"
          onText="ONLINE"
          offText="AWAY"
          :width="120" />
      </span>
    </div>
    <div class="setting">
      <span>Auto Update
        <SettingsTooltip
          text="Whether your status will update when you leave or come back to the tab"
        />
      </span>
      <span class="float-right">
        <SettingsSwitch
          v-model="vxm.chat.autoUpdateStatus"
        />
      </span>
    </div>
    <div class="setting">
      <label style="width: 100%">
        <span>
          Reason
          <SettingsTooltip
            text="When others see the away indicator, they will see the reason you are away"
          />
        </span>
        <span class="float-right">
          <input type=text v-model="settings.awayReason" style="width: 115px">
        </span>
      </label>
    </div>
  </SettingsSection>
</template>
<script lang="ts" setup>
import { vxm } from '#store/vxm';
import useSettingsStore from '#stores/settings';
import { computed } from 'vue';
import SettingsEnableDisable from '../SettingsEnableDisable.vue';
import SettingsSection from '../SettingsSection.vue';
import SettingsSwitch from '../SettingsSwitch.vue';
import SettingsTooltip from '../SettingsTooltip.vue';

const settings = useSettingsStore();
const userStatus = computed(() => vxm.chat.userStatus ?? false);

function changeStatus(to: boolean) {
  if (to) {
    vxm.chat.setUnaway();
  } else {
    vxm.chat.autoUpdateStatus = false;
    vxm.chat.setAway(settings.awayReason);
  }
}
</script>
<style lang="scss" scoped>
.setting {
  width: calc(100% - 40px);
  margin-bottom: 10px;
}
input {
  font-size: 0.85rem;
}
</style>
