<template>
  <SettingsSection title="Notifications" >
    <h6>Ignored</h6>
        <table>
          <tr v-for="channel in channels" :key="channel.name">
            <td>{{channel.name}}</td>
            <td>
              <SettingsSwitch v-model="channel.notificationsEnabled"
              @input="updateNotifications(channel.name)" />
            </td>
          </tr>
          <tr>
            <td colspan=2><SettingsEnableDisable :value="allEnabled" @input="updateAll" /></td>
          </tr>
        </table>
        <h6>Indicator</h6>
        <p>
          This will appear in the page title if you have notifications
        </p>
        <input type=text v-model="indicator" style="font-size:1rem; padding:1px;">
        <h6>Keywords</h6>
        <p>
          If these keywords are used in the chat, they will trigger notifications
        </p>
        <textarea type=text v-model="keywords" style="font-size:1rem; padding:1px;" />
        <p>
          If you have multiple keywords, separate them with commas.
          Your username is automatically a keyword.
        </p>
        <h6>Desktop Notifications</h6>
        <SettingsSwitch v-model="desktopNotifications" />
  </SettingsSection>
</template>
<script lang="ts">
  import {
    Component, Watch, Prop, Vue,
  } from 'vue-property-decorator';
  import SettingsSection from '../SettingsSection.vue';
  import SettingsSwitch from '../SettingsSwitch.vue';
  import SettingsEnableDisable from '../SettingsEnableDisable.vue';
  import { Channel } from '@/store/chat.vuex';

  @Component({
    components: {
      SettingsSection,
      SettingsSwitch,
      SettingsEnableDisable,
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
        localStorage.notificationsKeywords = JSON.stringify(keywordsArray);
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
        localStorage.ignoredChannels = JSON.stringify(this.$vxm.chat.ignoredChannels);
      }
    }

    get allEnabled() {
      const channels = Object.values(this.$vxm.chat.channels);
      if (channels.every(e => e!.notificationsEnabled)) return true;
      if (channels.every(e => !e!.notificationsEnabled)) return false;
      return null;
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
        localStorage.desktopNotifications = JSON.stringify(false);
      }
    }

    requestDesktopNotifications() {
      Notification.requestPermission(((result) => {
        if (result === 'granted') {
          this.desktopNotifications = true;
          this.$vxm.chat.desktopNotifications = true;
          localStorage.desktopNotifications = JSON.stringify(true);
        } else {
          this.desktopNotifications = false;
          this.$vxm.chat.desktopNotifications = false;
          localStorage.desktopNotifications = JSON.stringify(false);
        }
      }));
    }

    @Watch('indicator')
    indicatorChanged() {
      if (localStorage) {
        localStorage.indicator = JSON.stringify(this.indicator);
      }
      this.$vxm.settings.indicator = this.indicator;
    }

    created() {
      if (localStorage.notificationsKeywords) {
        this.keywords = JSON.parse(localStorage.notificationsKeywords).join(', ');
      } else if (this.$vxm.chat.notificationsKeywords) {
        this.keywords = this.$vxm.chat.notificationsKeywords.join(', ');
      } else {
        this.keywords = '';
      }
      if (localStorage.indicator) {
        this.indicator = JSON.parse(localStorage.indicator);
      } else {
        this.indicator = this.$vxm.settings.indicator;
      }
      if (localStorage.desktopNotifications) {
        this.desktopNotifications = JSON.parse(localStorage.desktopNotifications);
        this.$vxm.chat.desktopNotifications = this.desktopNotifications;
      }
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
td { /* Table cell in notifications settings section */
  padding:4px;
  width:max-content;
}
.footer { /* Enable and disable notifications buttons */
  border:none;
}
table {
  margin-top:2px;
  margin-bottom:2px;
}
.feature-button-container {
  padding:2px;
}
input {
  margin-bottom:10px;
}
</style>
