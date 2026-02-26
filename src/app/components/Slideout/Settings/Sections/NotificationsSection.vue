<template>
  <SettingsSection title="Notifications">
    <ul class="list-group">
      <li
        v-for="channel in channels"
        :key="channel.name"
        :aria-label="`Notifications for ${channel.name}`"
      >
        <span class="align-baseline">{{channel.name}}</span>
        <span class="switch">
          <SettingsSwitch
            :value="channelIsEnabled(channel.name)"
            @input="updateNotifications(channel.name)"
          />
        </span>
      </li>
      <li>
        <span class="align-baseline">All</span>
        <span class="switch">
          <SettingsEnableDisable :value="allEnabled" @input="updateAll" />
        </span>
      </li>
    </ul>

    <div class="setting">
      <label style="width: 100%;">
        <span
          class="align-baseline d-inline-block"
        >
          Indicator <SettingsTooltip text="Appears in the page title if you have notifications" />
        </span>
        <span style="width: 40%" class='float-right'>
          <input type=text v-model="indicator" style="padding:1px;">
        </span>
      </label>
    </div>
    <div class="setting">
      <span class="align-baseline d-inline-block">Desktop Notifications</span>
      <span
        class="switch"
      >
        <SettingsSwitch v-model="desktopNotifications" />
      </span>
    </div>
    <div class="setting">
      <label style="width: 100%;">
        <span
          class="align-baseline d-inline-block;"
        >
          Keywords
          <SettingsTooltip
            text="If you have multiple keywords, separate them with commas.
            Your username is automatically a keyword." />
        </span>
        <span class='float-right' style="width: 40%">
          <input type=text v-model="keywords" style="padding:1px;">
        </span>
      </label>
    </div>
  </SettingsSection>
</template>
<script lang="ts" setup>
import {
  computed, onMounted, ref, watch,
} from 'vue';
import { vxm } from '#store/vxm';
import SettingsSection from '../SettingsSection.vue';
import SettingsSwitch from '../SettingsSwitch.vue';
import SettingsEnableDisable from '../SettingsEnableDisable.vue';
import SettingsTooltip from '../SettingsTooltip.vue';

const keywords = ref<string>('');
watch(keywords, (currentKeywords) => {
  const list = currentKeywords.split(',').map(k => k.trim()).filter(k => k.length > 0);
  if (list.length === 0) {
    return;
  }

  // TODO: Extract localStorage interaction
  if (localStorage) {
    localStorage.chat_notificationsKeywords = JSON.stringify(list);
  }
});

const indicator = ref<string>('(!)');
watch(indicator, (currentIndicator) => {
  if (localStorage) {
    localStorage.chat_indicator = JSON.stringify(currentIndicator);
  }
  vxm.settings.indicator = currentIndicator;
});

const desktopNotifications = ref<boolean>(false);
function requestDesktopNotifications() {
  Notification.requestPermission()
    .then((result) => {
      const hasPermission = result === 'granted';
      desktopNotifications.value = hasPermission;
      vxm.chat.desktopNotifications = hasPermission;
      localStorage.chat_desktopNotifications = JSON.stringify(hasPermission);
    });
}
watch(desktopNotifications, enableNotifications => {
  if (enableNotifications) {
    requestDesktopNotifications();
  } else {
    vxm.chat.desktopNotifications = false;
    localStorage.chat_desktopNotifications = JSON.stringify(false);
  }
});

/** Return list of channels */
const channels = computed(() => vxm.chat.channels);
const allEnabled = computed(() => {
  const channelList = Object.values(vxm.chat.channels);
  if (channelList.every(e => e!.notificationsEnabled)) {
    return 'ALL_ON';
  }
  if (channelList.every(e => !e!.notificationsEnabled)) {
    return 'ALL_OFF';
  }
  return 'MIXED';
});

function channelIsEnabled(channel: string): boolean {
  return vxm.chat.channels[channel]?.notificationsEnabled ?? false;
}

/**
 * Toggle whether notifications are enabled for a specific channel
 * TODO: Revisit since it was previously updated via v-model incorrectly
 */
function updateNotifications(channel: string) {
  const trueChannel = vxm.chat.channels[channel];
  if (!trueChannel) {
    return;
  }

  if (!trueChannel.notificationsEnabled) {
    trueChannel.notifications = false;
  }

  vxm.chat.ignoredChannels[channel] = trueChannel.notificationsEnabled;
  if (localStorage && vxm.chat.ignoredChannels) {
    localStorage.chat_ignoredChannels = JSON.stringify(vxm.chat.ignoredChannels);
  }
}

function updateAll(to: boolean) {
  Object.values(vxm.chat.channels).forEach(e => {
    if (e) {
      e.notificationsEnabled = to;
    }
  });
}

onMounted(() => {
  if (localStorage.chat_notificationsKeywords) {
    keywords.value = JSON.parse(localStorage.chat_notificationsKeywords).join(', ');
  } else if (vxm.chat.notificationsKeywords) {
    keywords.value = vxm.chat.notificationsKeywords.join(', ');
  } else {
    keywords.value = '';
  }

  if (localStorage.chat_indicator) {
    indicator.value = JSON.parse(localStorage.chat_indicator);
  } else {
    indicator.value = vxm.settings.indicator;
  }

  if (localStorage.chat_desktopNotifications) {
    desktopNotifications.value = JSON.parse(localStorage.chat_desktopNotifications);
    vxm.chat.desktopNotifications = desktopNotifications.value;
  }
});
</script>
<style lang="scss" scoped>
@import "@/assets/_custom.scss";
.settings-button {
  background-color:$green;
}
li, .setting {
  width: calc(100% - 40px);
  height:1.5rem;
  margin-bottom:10px;
  list-style-type: none;
}
.feature-button-container {
  padding:2px;
}
input {
  height:100%;
  width: 100%;
  font-size: 0.85rem;
}
.switch {
  float:right;
}
</style>
