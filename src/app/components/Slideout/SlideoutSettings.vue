<template>
  <div id="settings-wrapper">
    <h3>Text Size</h3>
    <input v-model="size" type=number min=10 max=22>
    <p id='font-size-p' class='bottom-section'>Default is 14</p>
    <h3>Ignored List</h3>
    <ul class='bottom-section'>
      <li v-for="user in ignoredUsers" :key="user.Username">
        {{ user }}
        <button class='unignore-user' v-on:click="unignore(user)">Unignore</button>
      </li>
      <li v-show="!anyIgnoredUsers">No users ignored</li>
      <button class='unignore-user' v-on:click="unignore('*')" v-show="anyIgnoredUsers" >
        Unignore All</button>
    </ul>
    <h3>Notifications</h3>
    <table>
      <tr v-for="channel in channels" :key="channel.name">
        <td>{{channel.name}}</td>
        <td>
          <button style="width:calc(100% - 6px)" @click="toggleNotificationsEnabled(channel.name)">
            {{channel['notificationsEnabled'] === true ? 'Disable' : 'Enable'}}
          </button>
        </td>
      </tr>
      <tr>
        <td class='footer'>
          <button style="width:width:calc(100% - 6px)"
            :disabled="anyNotificationsDisabled"
            @click="toggleAll"
          >
            Enable all
          </button>
        </td>
        <td class='footer'>
          <button
            style="width:width:calc(100% - 6px)"
              :disabled="anyNotificationsEnabled"
              @click="toggleAll"
          >
            Disable all
          </button>
        </td>
    </tr>
    </table>
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
    @Prop({ required: true })
    size!:string; // font size

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
      this.size = this.$vxm.chat.fontSize.toString();
    }

    // Updates global font size when input changes
    @Watch('size')
    updateFontSize() {
      this.$vxm.chat.fontSize = parseInt(this.size, 10);
    }

    // Unignore user on list
    unignore(user:string) {
      this.$vxm.chat.unignoreUser(user);
    }

    get channels() {
      return this.$vxm.chat.channels;
    }

    toggleNotificationsEnabled(channel:string) {
      const trueChannel = this.$vxm.chat.channels[channel];
      if (trueChannel) {
        trueChannel.notificationsEnabled = !trueChannel.notificationsEnabled;
        if (!trueChannel.notificationsEnabled) {
          trueChannel.notifications = false;
        }
      }
    }

    get anyNotificationsEnabled() {
      return Object.values(this.channels).some(item => {
        const { notificationsEnabled } = item as Channel;
        return notificationsEnabled;
      });
    }

    get anyNotificationsDisabled() {
      return Object.values(this.channels).some(item => {
        const { notificationsEnabled } = item as Channel;
        return !notificationsEnabled;
      });
    }

    toggleAll() {
      Object.values(this.channels).forEach(item => {
       this.toggleNotificationsEnabled((item as Channel).name);
      });
    }
  }
</script>
<style scoped>
#font-size-p { /* 'Default is 14' text */
  vertical-align: mid;
  margin-left:2px;
}
.bottom-section {
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
td {
  border:solid white 1px;
  padding:4px;
  width:max-content;
}
.footer {
  border:none;
}
</style>
