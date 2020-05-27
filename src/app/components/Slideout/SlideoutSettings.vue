<template>
  <div id="settings-wrapper" :style="{ fontSize:`${fontSize}px` }">
    <section>
      <h3>Text Size</h3>
      <input v-model="size" type=number min=10 max=22>
      <p id='font-size-p'>Default is 14</p>
      <p
        id='font-warning'
        v-show="size < 10 || size > 22" >
        Font size must be a number, greater than 10, and less than 22
      </p>
    </section>
    <section>
      <h3>Ignored List</h3>
      <ul>
        <li v-for="user in ignoredUsers" :key="user.Username">
          {{ user }}
          <button
            :style="{ fontSize:`${fontSize * 11 / 14}px` }"
            class='unignore-user green-button'
            v-on:click="unignore(user)" >
            Unignore
          </button>
        </li>
        <li v-show="!anyIgnoredUsers">No users ignored</li>
        <button
          :style="{ fontSize:`${fontSize * 11 / 14}px` }"
          class='unignore-user green-button'
          v-on:click="unignore('*')"
          v-show="anyIgnoredUsers"
        >
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
              :style="{ fontSize:`${fontSize * 11 / 14}px` }"
              class="green-button"
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
              :style="{ fontSize:`${fontSize * 11 / 14}px` }"
              class="green-button"
            >
              Enable all
            </button>
          </td>
          <td class='footer'>
            <button
              style="width:width:calc(100% - 6px)"
              :disabled="anyNotificationsEnabled"
              @click="disableAll"
              :style="{ fontSize:`${fontSize * 11 / 14}px` }"
              class="green-button"
            >
              Disable all
            </button>
          </td>
        </tr>
      </table>
      <h4>Indicator</h4>
      <p>
        This will appear in the page title if you have notifications
      </p>
      <input type=text v-model="indicator">
    </section>
    <section>
      <h3>Username Color</h3>
      <ColorPicker />
    </section>
    <section>
      <h3>Chat Features</h3>
      <p>
        These enable you to send emoticons and formatted text.
      </p>
      <table>
        <tr>
          <td class="feature-button-container left-side">
            <button
              @click="toggleMarkdown"
              :style="{ fontSize:`${fontSize * 11 / 14}px` }"
              class="green-button" >
              {{markdownChatFeatures ? 'Disable' : 'Enable'}} markdown
            </button>
          </td>
          <td class="feature-button-container">
            <button
              @click="toggleEmoticons"
              :style="{ fontSize:`${fontSize * 11 / 14}px` }"
              class="green-button feature-button" >
              {{emoticonChatFeatures ? 'Disable' : 'Enable'}} emoticons
            </button>
          </td>
        </tr>
        <tr>
          <td class="feature-button-container left-side">
            <button
              @click="disableAllChatFeatures"
              :disabled="!allChatFeatures"
              :style="{ fontSize:`${fontSize * 11 / 14}px` }"
              class="green-button feature-button" >
              Disable all
            </button>
          </td>
          <td class="feature-button-container">
            <button
              @click="enableAllChatFeatures"
              :disabled="allChatFeatures"
              :style="{ fontSize:`${fontSize * 11 / 14}px` }"
              class="green-button feature-button" >
              Enable all
           </button>
          </td>
        </tr>
      </table>
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
  import ColorPicker from './ColorPicker/ColorPicker.vue';
  @Component({
    components: {
      Username,
      ConnectButton,
      ColorPicker,
    },
  })
  export default class SlideoutSettings extends Vue {
    size:string = '14'; // font size

    indicator:string = '(!)';

    allChatFeatures = true;

    emoticonChatFeatures = true;

    markdownChatFeatures = true;

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
        this.size = this.$vxm.settings.fontSize.toString();
      }
      if (localStorage.indicator) {
        this.indicator = JSON.parse(localStorage.indicator);
      } else {
        this.indicator = this.$vxm.settings.indicator;
      }
      if (localStorage.allChatFeatures) {
        this.allChatFeatures = JSON.parse(localStorage.allChatFeatures);
      } else {
        this.allChatFeatures = this.$vxm.settings.allChatFeatures;
      }
      if (localStorage.emoticonChatFeatures) {
        this.emoticonChatFeatures = JSON.parse(localStorage.emoticonChatFeatures);
      } else {
        this.emoticonChatFeatures = this.$vxm.settings.emoticonChatFeatures;
      }
      if (localStorage.markdownChatFeatures) {
        this.markdownChatFeatures = JSON.parse(localStorage.markdownChatFeatures);
      } else {
        this.markdownChatFeatures = this.$vxm.settings.markdownChatFeatures;
      }
    }

    toggleEmoticons() {
      this.emoticonChatFeatures = !this.emoticonChatFeatures;
      if (this.emoticonChatFeatures && this.markdownChatFeatures) {
        this.allChatFeatures = this.emoticonChatFeatures;
        this.$vxm.settings.allChatFeatures = this.allChatFeatures;
        localStorage.allChatFeatures = JSON.stringify(this.allChatFeatures);
      }
      if (!this.emoticonChatFeatures && !this.markdownChatFeatures) {
        this.allChatFeatures = this.emoticonChatFeatures;
        this.$vxm.settings.allChatFeatures = this.allChatFeatures;
        localStorage.allChatFeatures = JSON.stringify(this.allChatFeatures);
      }
      this.$vxm.settings.emoticonChatFeatures = this.emoticonChatFeatures;
      localStorage.emoticonChatFeatures = JSON.stringify(this.emoticonChatFeatures);
    }

    toggleMarkdown() {
      this.markdownChatFeatures = !this.markdownChatFeatures;
      if (this.emoticonChatFeatures && this.markdownChatFeatures) {
        this.allChatFeatures = this.markdownChatFeatures;
        this.$vxm.settings.allChatFeatures = this.allChatFeatures;
        localStorage.allChatFeatures = JSON.stringify(this.allChatFeatures);
      }
      if (!this.emoticonChatFeatures && !this.markdownChatFeatures) {
        this.allChatFeatures = this.markdownChatFeatures;
        this.$vxm.settings.allChatFeatures = this.allChatFeatures;
        localStorage.allChatFeatures = JSON.stringify(this.allChatFeatures);
      }
      this.$vxm.settings.markdownChatFeatures = this.markdownChatFeatures;
      localStorage.markdownChatFeatures = JSON.stringify(this.markdownChatFeatures);
    }

    toggleAllChatFeatures() {
      this.allChatFeatures = !this.allChatFeatures;
      this.emoticonChatFeatures = this.allChatFeatures;
      this.markdownChatFeatures = this.allChatFeatures;
      this.$vxm.settings.allChatFeatures = this.allChatFeatures;
      localStorage.allChatFeatures = JSON.stringify(this.allChatFeatures);
      this.$vxm.settings.emoticonChatFeatures = this.allChatFeatures;
      localStorage.emoticonChatFeatures = JSON.stringify(this.allChatFeatures);
      this.$vxm.settings.markdownChatFeatures = this.allChatFeatures;
      localStorage.markdownChatFeatures = JSON.stringify(this.allChatFeatures);
    }

    enableAllChatFeatures() {
      if (!this.allChatFeatures) {
        this.toggleAllChatFeatures();
      }
    }

    disableAllChatFeatures() {
      if (this.allChatFeatures) {
        this.toggleAllChatFeatures();
      }
    }

    // Updates global font size when input changes
    @Watch('size')
    updateFontSize() {
       // Only update if valid font size
      if (parseInt(this.size, 10) >= 10 && parseInt(this.size, 10) <= 22) {
        this.$vxm.settings.fontSize = parseInt(this.size, 10);
        localStorage.fontSize = JSON.stringify(this.size);
      }
    }

    get fontSize() {
      const numSize = parseInt(this.size, 10); // Font size as an int
      if (numSize >= 10 && numSize <= 22) {
        return numSize;
      }
      if (numSize >= 22) {
        return 22; // If font size greater than 22, set to maximum of 22
      }
      if (numSize <= 10) {
        return 10; // If font size less than 10, set to minimum of 10
      }
      return 14; // If nothing else works, make it the default, 14
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
      this.$vxm.settings.indicator = this.indicator;
    }
  }
</script>
<style scoped>
#font-size-p { /* 'Default is 14' text */
  vertical-align: mid;
  margin-left:2px;
}
#font-warning {
  color:#f39c12;
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
  margin-left:2px;
  color:white;
  border:none;
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

::-webkit-scrollbar-corner {
  background-color:black;
}

::-webkit-scrollbar-thumb { /* Scrollbar bar */
  background-color:#343a40;
  border-radius:5px;
}
li { /* Remove bullets */
  list-style-type: none;
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
}
.feature-button-container {
  padding:2px;
}
.feature-button {
  float:left;
  width:95%;
}
.left-side {
  padding-left:0;
}
</style>
