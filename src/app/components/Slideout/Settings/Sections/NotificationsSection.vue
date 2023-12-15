<template>
  <SettingsSection title="Notifications" >
    <ul class="list-group">
      <li
        v-for="channel in channels"
        :key="channel.name"
        :aria-label="`Notifications for ${channel.name}`"
      >
        <span class="align-baseline">{{channel.name}}</span>
        <span class="switch">
          <SettingsSwitch
            v-model="$vxm.chat.channels[channel.name].notificationsEnabled"
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
    <li>
      <span
        class="align-baseline d-inline-block"
      >
        Indicator <SettingsTooltip text="Appears in the page title if you have notifications" />
      </span>
      <span style="width: 40%" class='float-right'>
        <input type=text v-model="indicator" style="padding:1px;">
      </span>
    </li>
    <li>
      <span class="align-baseline d-inline-block">Desktop Notifications</span>
      <span
        class="switch"
      >
        <SettingsSwitch v-model="desktopNotifications" />
      </span>
    </li>
    <li>
      <span
        class="align-baseline d-inline-block;"
      >
        Keywords
          <SettingsTooltip text="If you have multiple keywords, separate them with commas.
          Your username is automatically a keyword." />
      </span>
      <span class='float-right' style="width: 40%">
        <input type=text v-model="keywords" style="padding:1px;">
      </span>
    </li>
  </SettingsSection>
</template>
<script lang="ts">
  import {
    Component, Watch, Prop, Vue,
  } from 'vue-property-decorator';
  import SettingsSection from '../SettingsSection.vue';
  import SettingsSwitch from '../SettingsSwitch.vue';
  import SettingsEnableDisable from '../SettingsEnableDisable.vue';
  import SettingsTooltip from '../SettingsTooltip.vue';
  import { Channel } from '@/store/chat.vuex';

  enum states {
    all_enabled,
    some_enabled,
    all_disabled
  }

  @Component({
    components: {
      SettingsSection,
      SettingsSwitch,
      SettingsEnableDisable,
      SettingsTooltip,
    },
  })
  export default class NotificationsSection extends Vue {
    keywords = '';

    @Watch('keywords')
    keywordsChanged() {
      const keywordsArray = this.keywords.split(/, ?/);
      if (keywordsArray[0] === '') {
        return;
      }
      if (localStorage) {
        localStorage.chat_notificationsKeywords = JSON.stringify(keywordsArray);
      }
    }

    // Toggle whether notifications are enabled for a specific channel
    updateNotifications(channel:string) {
      const trueChannel = this.$vxm.chat.channels[channel];
      if (trueChannel) {
        if (!trueChannel.notificationsEnabled) {
          trueChannel.notifications = false;
        }
      }
      this.$vxm.chat.ignoredChannels[channel] = (trueChannel as Channel).notificationsEnabled;
      if (localStorage && this.$vxm.chat.ignoredChannels) {
        localStorage.chat_ignoredChannels = JSON.stringify(this.$vxm.chat.ignoredChannels);
      }
    }

    get allEnabled() {
      const channels = Object.values(this.$vxm.chat.channels);
      if (channels.every(e => e!.notificationsEnabled)) return states.all_enabled;
      if (channels.every(e => !e!.notificationsEnabled)) return states.all_disabled;
      return states.some_enabled;
    }

    updateAll(to: boolean) {
      Object.values(this.$vxm.chat.channels).forEach(e => {
        e!.notificationsEnabled = to;
      });
    }

    // Return list of channels
    get channels() {
      return this.$vxm.chat.channels;
    }

    indicator:string = '(!)';

    desktopNotifications = false;

    @Watch('desktopNotifications')
    desktopNotificationsChanged() {
      if (this.desktopNotifications) {
        this.requestDesktopNotifications();
      } else {
        this.$vxm.chat.desktopNotifications = false;
        localStorage.chat_desktopNotifications = JSON.stringify(false);
      }
    }

    requestDesktopNotifications() {
      Notification.requestPermission(((result) => {
        if (result === 'granted') {
          this.desktopNotifications = true;
          this.$vxm.chat.desktopNotifications = true;
          localStorage.chat_desktopNotifications = JSON.stringify(true);
        } else {
          this.desktopNotifications = false;
          this.$vxm.chat.desktopNotifications = false;
          localStorage.chat_desktopNotifications = JSON.stringify(false);
        }
      }));
    }

    @Watch('indicator')
    indicatorChanged() {
      if (localStorage) {
        localStorage.chat_indicator = JSON.stringify(this.indicator);
      }
      this.$vxm.settings.indicator = this.indicator;
    }

    created() {
      if (localStorage.chat_notificationsKeywords) {
        this.keywords = JSON.parse(localStorage.chat_notificationsKeywords).join(', ');
      } else if (this.$vxm.chat.notificationsKeywords) {
        this.keywords = this.$vxm.chat.notificationsKeywords.join(', ');
      } else {
        this.keywords = '';
      }
      if (localStorage.chat_indicator) {
        this.indicator = JSON.parse(localStorage.chat_indicator);
      } else {
        this.indicator = this.$vxm.settings.indicator;
      }
      if (localStorage.chat_desktopNotifications) {
        this.desktopNotifications = JSON.parse(localStorage.chat_desktopNotifications);
        this.$vxm.chat.desktopNotifications = this.desktopNotifications;
      }
    }
  }
</script>
<style lang="scss" scoped>
@import "@/assets/_custom.scss";
.settings-button {
  background-color:$green;
}
li {
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
