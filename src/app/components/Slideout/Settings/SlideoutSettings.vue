<template>
  <div id="settings-wrapper" :style="{ fontSize:`${fontSize}px` }">
    <section>
      <h5 class="heading" >Text Size</h5>
      <MinimizationTriangle
        style="display:inline-block"
        settings="true"
        @input="menusChanged"
        v-model="openMenus.textSize" />
      <transition name="settings-slide">
      <div v-show="!openMenus.textSize" class="settings-content-container">
        <input v-model="size" type=number min=10 max=18>
        <p id='font-size-p'>Default is 14</p>
        <p
          id='font-warning'
          v-show="size < 10 || size > 18" >
          Font size must be a number, greater than 10, and less than 18
        </p>
      </div>
      </transition>
    </section>
    <section>
      <h5 class="heading" >Ignored</h5>
      <MinimizationTriangle
        style="display:inline-block"
        settings="true"
        @input="menusChanged"
        v-model="openMenus.ignored" />
      <transition name="settings-slide">
      <div v-show="!openMenus.ignored" class="settings-content-container">
      <table style="width:175px" >
        <tr v-for="user in ignoredUsers" :key="user.Username">
          <button
            :style="{ fontSize:`${fontSize * 11 / 14}px` }"
            style="right:0; width:150px;"
            class='unignore-user btn settings-button'
            v-on:click="unignore(user)" >
            Unignore {{user}}
          </button>
        </tr>
        <tr v-show="!anyIgnoredUsers">No users ignored</tr>
        <tr><button
          :style="{ fontSize:`${fontSize * 11 / 14}px` }"
          style="margin-top:5px; width:150px"
          class='unignore-user btn settings-button'
          v-on:click="unignore('*')"
          v-show="anyIgnoredUsers"
        >
          Unignore All
        </button></tr>
      </table>
      </div>
      </transition>
    </section>
    <section>
      <h5 class="heading" >Notifications</h5>
      <MinimizationTriangle
        style="display:inline-block"
        settings="true"
        @input="menusChanged"
        v-model="openMenus.notifications" />
      <transition name="settings-slide">
      <div v-show="!openMenus.notifications" class="settings-content-container">
        <h6>Ignored</h6>
        <table>
          <tr v-for="channel in channels" :key="channel.name">
            <td>{{channel.name}}</td>
            <td>
              <button
                style="width:100%"
                @click="toggleNotificationsEnabled(channel.name)"
                :style="{ fontSize:`${fontSize * 11 / 14}px` }"
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
                :style="{ fontSize:`${fontSize * 11 / 14}px` }"
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
                :style="{ fontSize:`${fontSize * 11 / 14}px` }"
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
      </div>
      </transition>
    </section>
    <section>
      <h5 class="heading" >Username Color</h5>
      <MinimizationTriangle
        style="display:inline-block"
        settings="true"
        @input="menusChanged"
        v-model="openMenus.color" />
      <transition name="settings-slide">
      <ColorPicker v-show="!openMenus.color" class="settings-content-container" />
      </transition>
    </section>
    <section>
      <h5 class="heading" >Toolbar Features</h5>
      <MinimizationTriangle
        style="display:inline-block"
        settings="true"
        @input="menusChanged"
        v-model="openMenus.toolbar" />
      <transition name="settings-slide">
      <div v-show="!openMenus.toolbar" class="settings-content-container">
        <p>
          These enable you to send emoticons and formatted text.
        </p>
        <table>
          <tr>
            <td class="feature-button-container left-side">
              <button
                @click="toggleMarkdown"
                :style="{ fontSize:`${fontSize * 11 / 14}px` }"
                class="btn settings-button feature-button" >
                {{markdownChatFeatures ? 'Disable' : 'Enable'}} markdown
              </button>
            </td>
            <td class="feature-button-container">
              <button
                @click="toggleEmoticons"
                :style="{ fontSize:`${fontSize * 11 / 14}px` }"
                class="btn settings-button feature-button" >
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
                class="btn settings-button feature-button" >
                Disable all
              </button>
            </td>
            <td class="feature-button-container">
              <button
                @click="enableAllChatFeatures"
                :disabled="allChatFeatures"
                :style="{ fontSize:`${fontSize * 11 / 14}px` }"
                style="margin-top:1px;"
                class="btn settings-button feature-button" >
                Enable all
            </button>
            </td>
          </tr>
        </table>
        <h6>Custom emoticons</h6>
        <table>
          <tbody>
          <tr v-for="(emote, index) in customEmoticons" :key="emote">
            <td>{{emote}}</td>
            <td>Change to <input :id="index" @input="update" style="width:1rem"></td>
          </tr>
          </tbody>
          <tfoot><tr><td colspan=2 class="warning">{{emoticonErrorMessage}}</td></tr></tfoot>
        </table>
      </div>
      </transition>
    </section>
    <section>
      <li class="settings-section-header">
      <h5 class="heading">Status</h5>
      <MinimizationTriangle
        style="display:inline-block"
        settings="true"
        @input="menusChanged"
        v-model="openMenus.status" />
      </li>
      <transition name="settings-slide">
      <div v-show="!openMenus.status" class="settings-content-container">
        <p>You are currently marked as {{userStatus ? 'away' : 'online'}}</p>
        <button class="btn settings-button" @click="changeStatus(!userStatus)">
          Toggle
        </button>
      </div>
      </transition>
    </section>
    <section>
      <li class="settings-section-header">
      <h5 class="heading" >Operator</h5>
      <MinimizationTriangle
        style="display:inline-block"
        settings="true"
        @input="menusChanged"
        v-model="openMenus.oper" />
      </li>
      <transition name="settings-slide">
      <div v-show="!openMenus.oper" class="settings-content-container">
        <p>You are {{isOper ? '' : 'not'}} logged in as an operator</p>
        <button
          @click="$emit('auth')"
          :style="{ fontSize:`${fontSize * 11 / 14}px` }"
          class="btn settings-button"
          v-show="!isOper" >
            Log in as operator
        </button>
        <h6>Change nick</h6>
        <input @input="setNick" :value="opernick">
      </div>
      </transition>
    </section>
  </div>
</template>
<script lang="ts">
  import {
    Component, Watch, Prop, Vue,
  } from 'vue-property-decorator';
  import BootstrapVue from 'bootstrap-vue';
  import Username from '@/components/Messages/Username.vue';
  import ConnectButton from '@/components/Connection/ConnectButton.vue';
  import SlideoutButton from '../SlideoutButton.vue';
  import Slideout from '../Slideout.vue';
  import { Channel } from '@/store/chat.vuex';
  import ColorPicker from '../ColorPicker/ColorPicker.vue';
  import MinimizationTriangle from '../../MinimizationTriangle.vue';

  Vue.use(BootstrapVue);

  @Component({
    components: {
      Username,
      ConnectButton,
      ColorPicker,
      MinimizationTriangle,
    },
  })
  export default class SlideoutSettings extends Vue {
    // Menus

    openMenus = {
      notifications: true,
      color: true,
      oper: true,
      toolbar: true,
      textSize: true,
      ignored: true,
      status: true,
    };

    @Watch('openMenus')
    menusChanged() {
      console.log(2);
      if (localStorage) {
        localStorage.openMenus = JSON.stringify(this.openMenus);
      }
    }

    // Font size

    size:string = '14'; // font size


    // Updates global font size when input changes
    @Watch('size')
    updateFontSize() {
       // Only update if valid font size
      if (parseInt(this.size, 10) >= 10 && parseInt(this.size, 10) <= 18) {
        this.$vxm.settings.fontSize = parseInt(this.size, 10);
        localStorage.fontSize = JSON.stringify(this.size);
      }
    }

    get fontSize() {
      const numSize = parseInt(this.size, 10); // Font size as an int
      if (numSize >= 10 && numSize <= 18) {
        return numSize;
      }
      if (numSize >= 18) {
        return 18; // If font size greater than 18, set to maximum of 18
      }
      if (numSize <= 10) {
        return 10; // If font size less than 10, set to minimum of 10
      }
      return 14; // If nothing else works, make it the default, 14
    }

    // Indicator

    indicator:string = '(!)';


    @Watch('indicator')
    indicatorChanged() {
      if (localStorage) {
        localStorage.indicator = JSON.stringify(this.indicator);
      }
      this.$vxm.settings.indicator = this.indicator;
    }

    // Toolbar

    allChatFeatures = true;

    emoticonChatFeatures = true;

    markdownChatFeatures = true;

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

    // Custom emoticons

    update(e:Event) {
      const targ = e.target as HTMLInputElement;
      const id = Number(targ.id);
      let { value } = targ;
      value = value.trim();
      while ([...value].length > 1) {
        value = value.substring(0, value.length - 1);
      }
      const emoticonRegex = /[^\w\d\p{P}\p{S}]/;
      if (value.match(emoticonRegex)) {
        if (this.customEmoticons.some(j => j === value)) {
          this.emoticonErrorMessage = 'You are using that emoticon in another slot';
          return;
        }
        Vue.set(this.$vxm.chat.customEmoticons, id, value);
        if (localStorage) {
          localStorage.customEmoticons = JSON.stringify(this.$vxm.chat.customEmoticons);
        }
        this.emoticonErrorMessage = '';
      } else {
        this.emoticonErrorMessage = `${value} is not a valid emoticon`;
      }
      if (value.trim() === '') {
        this.emoticonErrorMessage = '';
      }
      targ.value = '';
    }

    emoticonErrorMessage = '';

    get customEmoticons() {
      return this.$vxm.chat.customEmoticons;
    }

    // Notifications

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

    // Status

    changeStatus(to:boolean) {
      this.$vxm.chat.autoUpdateStatus = !to;
      if (!to) {
        this.$vxm.chat.setUnaway();
      } else {
        this.$vxm.chat.setAway();
      }
    }

    get userStatus() {
      return this.$vxm.chat.userStatus;
    }

    // Nick change

    validateNick(nick:string) {
      // eslint-disable-next-line no-useless-escape
      return nick.match(/^[a-z_\-\[\]\\^{}|`][a-z0-9_\-\[\]\\^{}|`]*$/i);
    }

    setNick(e:Event) {
      const { value } = e.target as HTMLInputElement;
      if (!this.validateNick(value)) return;
      this.$vxm.chat.changeNick(value);
    }

    opernick = '';

    // Ignored

    // Gets a list of ignored users
    get ignoredUsers() {
      return this.$vxm.chat.ignoredUsers;
    }

    // If any users are ignored. Uses ignoredUsers.length
    get anyIgnoredUsers() {
      return this.ignoredUsers.length > 0;
    }

    // Unignore user on list
    unignore(user:string) {
      this.$vxm.chat.unignoreUser(user);
    }

    get isOper() {
      return this.$vxm.chat.oper;
    }

    // Other

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
      if (localStorage.notificationsKeywords) {
        this.keywords = JSON.parse(localStorage.notificationsKeywords).join(', ');
      } else {
        this.keywords = this.$vxm.chat.notificationsKeywords.join(', ');
      }
      if (localStorage.nick) {
        this.opernick = localStorage.nick;
      } else {
        this.opernick = this.$vxm.chat.customNick;
      }
      if (localStorage.openMenus) {
        this.openMenus = JSON.parse(localStorage.openMenus);
      }
    }

    // Return list of channels
    get channels() {
      return this.$vxm.chat.channels;
    }
  }
</script>
<style lang="scss" scoped>
@import "@/assets/_custom.scss";
@import "~bootstrap/scss/bootstrap.scss";
@import '~bootstrap-vue/dist/bootstrap-vue.css';
/*** Buttons ***/
.settings-button {
  background-color:$green;
}
button { /* Unignore user button */
  padding:2px;
  padding-bottom:3px;
  margin-left:2px;
  color:white;
  border:none;
}
.feature-button {
  float:left;
  width:95%;
}

/*** Tables ***/
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

/*** Text ***/
#font-size-p { /* 'Default is 14' text */
  vertical-align: mid;
  margin-left:2px;
}
#font-warning {
  color:#f39c12;
}
h3 {
  width:calc(100% - 23px); /* Accounts for padding on both sides */
  text-align:justify;
}
.heading {
  display:inline-block;
  margin:4px;
  margin-left:0;
}
.warning {
  color:$warning;
}

/*** Other ***/
input {
  margin:2px;
  width:calc(100% - 23px); /* Accounts for padding on both sides */
  max-width:150px; /* Big screens don't have arbitrarily large input */
}
li { /* Remove bullets */
  list-style-type: none;
}
.left-side {
  padding-left:0;
}
.minimization-triangle {
  height:30px;
  width:30px;
  position:absolute;
  right:10px;
  top:0px;
}

/*** Container ***/
section { /* 'Block' of settings */
  margin-bottom:5px;
  position: relative;
}
#settings-wrapper { /* Wrapper div */
  padding:5px;
  padding-left:20px;
  height:calc(100% - 50px);
  overflow-y:auto;
}
.settings-slide-enter-active {
  transition: max-height 0.2s cubic-bezier(1,0,1,0);
  max-height:1000px;
}
.settings-slide-leave-active {
  transition: max-height 0.2s cubic-bezier(0,1,0,1);
  max-height:1000px;
}
.settings-slide-enter, .settings-slide-leave-to {
  max-height:0;
}
.settings-content-container {
  overflow:hidden;
}
</style>
