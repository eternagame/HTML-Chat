<template>
  <SettingsSection title="Notifications" >
    <h6>Ignored</h6>
        <table>
          <tr v-for="channel in channels" :key="channel.name">
            <td>{{channel.name}}</td>
            <td>
              <button
                style="width:100%"
                @click="toggleNotificationsEnabled(channel.name)"
                :style="{ fontSize:`${11 / 14}rem` }"
                class="btn settings-button"
              >
                {{channel['notificationsEnabled'] === true ? 'Disable' : 'Enable'}}
              </button>
            </td>
          </tr>
          <tr>
            <td class='footer'>
              <button
                style="width:100%"
                :disabled="anyNotificationsDisabled"
                @click="enableAll"
                :style="{ fontSize:`${11 / 14}rem` }"
                class="btn settings-button"
              >
                Enable all
              </button>
            </td>
            <td class='footer'>
              <button
                style="width:100%"
                :disabled="anyNotificationsEnabled"
                @click="disableAll"
                :style="{ fontSize:`${11 / 14}rem` }"
                class="btn settings-button"
              >
                Disable all
              </button>
            </td>
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
        <button class="btn settings-button" @click="handleDesktopNotificationClick">
          {{this.desktopNotifications ? 'Disable' : 'Enable'}}
        </button>
  </SettingsSection>
</template>
<script lang="ts">
  import {
    Component, Watch, Prop, Vue,
  } from 'vue-property-decorator';
  import SettingsSection from '../SettingsSection.vue';
  import { Channel } from '@/store/chat.vuex';

  @Component({
    components: {
      SettingsSection,
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
    toggleNotificationsEnabled(channel:string) {
      const trueChannel = this.$vxm.chat.channels[channel];
      if (trueChannel) {
        trueChannel.notificationsEnabled = !trueChannel.notificationsEnabled;
        if (!trueChannel.notificationsEnabled) {
          trueChannel.notifications = false;
        }
      }
      this.$vxm.chat.ignoredChannels[channel] = (trueChannel as Channel).notificationsEnabled;
      if (localStorage && this.$vxm.chat.ignoredChannels) {
        localStorage.ignoredChannels = JSON.stringify(this.$vxm.chat.ignoredChannels);
      }
    }

    // If any notifications are enabled
    get anyNotificationsEnabled() {
      // Iterates through each channel and checks if notifications are enabled
      return !Object.values(this.channels).some(item => {
        // Making sure nothing is undefined and gets value from channel
        const { notificationsEnabled } = item as Channel;
        return notificationsEnabled;
      });
    }

    // If any notifications are disabled
    get anyNotificationsDisabled() {
      // Again, iterating through each channel
      return !Object.values(this.channels).some(item => {
        // Making sure nothing is undefined and gets value from channel
        const { notificationsEnabled } = item as Channel;
        return !notificationsEnabled;
      });
    }

    // Enables notifications for all channels
    enableAll() {
      // For each channel
      Object.values(this.channels).forEach(item => {
        // If notifications aren't enabled, toggle their value. If they are, leave them alone
        if (!(item as Channel).notificationsEnabled) {
          this.toggleNotificationsEnabled((item as Channel).name);
        }
      });
    }

    // Disables notifications for all channels
    disableAll() {
      // For each channel
      Object.values(this.channels).forEach(item => {
        // If notifications are enabled, toggle their value. If they aren't, leave them alone
        if ((item as Channel).notificationsEnabled) {
          this.toggleNotificationsEnabled((item as Channel).name);
        }
      });
    }

    // Return list of channels
    get channels() {
      return this.$vxm.chat.channels;
    }

    indicator:string = '(!)';

    desktopNotifications = false;

    handleDesktopNotificationClick() {
      if (this.desktopNotifications) {
        this.desktopNotifications = false;
        this.$vxm.chat.desktopNotifications = false;
        localStorage.desktopNotifications = JSON.stringify(false);
      } else {
        this.requestDesktopNotifications();
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
</style>
