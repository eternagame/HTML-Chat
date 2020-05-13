<template>
  <div id="settings-wrapper">
    <section>
      <h3>Text Size</h3>
      <input v-model="size" type=number min=10 max=22>
      <p id='font-size-p'>Default is 14</p>
    </section>
    <section>
      <h3>Ignored List</h3>
      <ul>
        <li v-for="user in ignoredUsers" :key="user.Username">
          {{ user }}
          <button class='unignore-user' v-on:click="unignore(user)">Unignore</button>
        </li>
        <li v-show="!anyIgnoredUsers">No users ignored</li>
        <button class='unignore-user' v-on:click="unignore('*')" v-show="anyIgnoredUsers" >
          Unignore All
        </button>
      </ul>
    </section>
    <section>
      <h3>Notifications</h3>
      <h4>Ignored</h4>
      <table>
        <tr v-for="channel in channels" :key="channel.name">
          <td>{{channel.name}}</td>
          <td>
            <button
              style="width:calc(100% - 6px)"
              @click="toggleNotificationsEnabled(channel.name)"
            >
              {{channel['notificationsEnabled'] === true ? 'Disable' : 'Enable'}}
            </button>
          </td>
        </tr>
        <tr>
          <td class='footer'>
            <button style="width:width:calc(100% - 6px)"
              :disabled="anyNotificationsDisabled"
              @click="enableAll"
            >
              Enable all
            </button>
          </td>
          <td class='footer'>
            <button
              style="width:width:calc(100% - 6px)"
              :disabled="anyNotificationsEnabled"
              @click="disableAll"
            >
              Disable all
            </button>
          </td>
        </tr>
      </table>
      <h4>Indicator</h4>
      <p>This is the indicator that will appear in the page title if you have notifications</p>
      <input type=text v-model="indicator">
    </section>
  </div>
</template>
<script lang="ts">
  import {
    Component, Watch, Prop, Vue,
  } from 'vue-property-decorator';
  import Username from '@/components/Messages/Username.vue';
  import ConnectButton from '@/components/Connection/ConnectButton.vue';
  import SlideoutButton from './SlideoutButton.vue';
  import Slideout from './Slideout.vue';
  import { Channel } from '../../store/chat.vuex';
  @Component({
    components: {
      Username,
      ConnectButton,
    },
  })
  export default class SlideoutSettings extends Vue {
    @Prop()
    size!:string; // font size

    @Prop()
    indicator!:String;

    // Gets a list of ignored users
    get ignoredUsers() {
      return this.$vxm.chat.ignoredUsers;
    }

    // If any users are ignored. Uses ignoredUsers.length
    get anyIgnoredUsers() {
      return this.ignoredUsers.length > 0;
    }

    // Whether it is visible. Determined by whether slideout is opened
    get visible() {
      return (this.$parent as Slideout).checked;
    }

    // When tab opened, display stored value if there is one
    created() {
      if (localStorage.fontSize) {
        this.size = String(Number(JSON.parse(localStorage.fontSize)));
      } else {
        this.size = this.$vxm.chat.fontSize.toString();
      }
      /* if (localStorage.indicator) {
        this.indicator = JSON.parse(localStorage.indicator);
      } else {
        this.indicator = this.$vxm.chat.indicator;
      } */
    }

    // Updates global font size when input changes
    @Watch('size')
    updateFontSize() {
      this.$vxm.chat.fontSize = parseInt(this.size, 10);
      localStorage.fontSize = JSON.stringify(this.size);
    }

    // Unignore user on list
    unignore(user:string) {
      this.$vxm.chat.unignoreUser(user);
    }

    // Return list of channels
    get channels() {
      return this.$vxm.chat.channels;
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

    // Enables notificaitons for all channels
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

    @Watch('indicator')
    indicatorChanged() {
      if (localStorage) {
        localStorage.indicator = JSON.stringify(this.indicator);
      }
      this.$vxm.chat.indicator = this.indicator;
    }
  }
</script>
<style scoped>
#font-size-p { /* 'Default is 14' text */
  vertical-align: mid;
  margin-left:2px;
}
section { /* 'Block' of settings */
  margin-bottom:15px;
}
h3 {
  width:calc(100% - 23px); /* Accounts for padding on both sides */
  text-align:justify;
}
input {
  margin:2px;
  width:calc(100% - 23px); /* Accounts for padding on both sides */
  max-width:150px; /* Big screens don't have arbitrarily large input */
}
button { /* Unignore user button */
  padding:2px;
  padding-bottom:3px;
  background-color:white;
  margin-left:2px;
}
#settings-wrapper { /* Wrapper div */
  padding:5px;
  padding-left:20px;
  height:calc(100% - 50px);
  overflow-y:auto;
}

::-webkit-scrollbar { /* Scrollbar track */
    width: 10px;
}

::-webkit-scrollbar-thumb { /* Scrollbar bar */
  background-color:#343a40;
  border-radius:5px;
}
li { /* Remove bullets */
  list-style-type: none;
}
td { /* Table cell in notifications settings section */
  border:solid white 1px;
  padding:4px;
  width:max-content;
}
.footer { /* Enable and disable notifications buttons */
  border:none;
}
</style>
