<template>
  <div
    style="position:relative; width:75%"
    class="slideout-container"
    :class="{ slideoutContainerHidden: !checked, tall:checked}"
  >
    <HamburgerMenuButton v-model="checked" :notification="notifications" :mention="mentions"/>
    <v-style>
      .slideout-button:focus {
        border: {{tabbing ? 'solid white 1px' : 'none !important'}};
        outline: {{tabbing ? 'solid white 1px' : 'none !important'}};
      }
    </v-style>
    <span v-if="checked">
      <SlideoutButtonChat
        :selected="chatSelected"
        @input="activeTab = 0"
        class='slideout-button'
      />
      <SlideoutButtonUsers
        :selected="userSelected"
        @input="activeTab = 1"
        class='slideout-button'
      />
      <SlideoutButtonSettings
        :selected="settingsSelected"
        @input="activeTab = 2"
        class='slideout-button'
      />
      <SlideoutChats
        v-if="chatSelected"
      />
      <SlideoutUser v-if="userSelected" />
      <SlideoutSettings v-if="settingsSelected" @auth="$emit('auth')"/>
    </span>
  </div>
</template>

<script lang="ts">
  import {
    Vue, Component, Prop, Watch,
  } from 'vue-property-decorator';
  import SlideoutChats from './Chat/SlideoutChats.vue';
  import SlideoutUser from './Users/SlideoutUser.vue';
  import SlideoutSettings from './Settings/SlideoutSettings.vue';
  import SlideoutButton from './SlideoutButton.vue';
  import SlideoutButtonUsers from './Users/SlideoutButtonUsers.vue';
  import SlideoutButtonChat from './Chat/SlideoutButtonChat.vue';
  import SlideoutButtonSettings from './Settings/SlideoutButtonSettings.vue';
  import HamburgerMenuButton from './HamburgerMenuButton.vue';
  import { Channel } from '../../store/chat.vuex';

  @Component({
    components: {
      SlideoutChats,
      SlideoutUser,
      SlideoutSettings,
      SlideoutButton,
      SlideoutButtonSettings,
      SlideoutButtonChat,
      SlideoutButtonUsers,
      HamburgerMenuButton,
    },
  })
  export default class Slideout extends Vue {
    activeTab = 0;

    // For hamburger
    checked = false;

    @Prop() // Whether chat is minimized
    minimizedValue !: boolean;

    get tabbing() { // If the tab key has been pressed - used to conditionally enable focus rings
      return this.$vxm.chat.tabbing;
    }

    // Each of the functions below tells whether a given tab is selected
    get chatSelected() {
        return this.activeTab === 0;
    }

    get userSelected() {
      return this.activeTab === 1;
    }

    get settingsSelected() {
      return this.activeTab === 2;
    }

    get currentTab() {
      return this.$vxm.chat.chatChannel;
    }

    get vxmOpen() { // Checks to see if the slideout should be closed (click outside)
      return this.$vxm.chat.slideoutOpen;
    }

    @Watch('vxmOpen')
    close() {
      if (!this.vxmOpen) { // If it should be closed, do so
        this.checked = false;
      }
    }

    get notifications() {
      // If any channels have notifications
      // eslint-disable-next-line max-len
      const anyNotifications = Object.values(this.$vxm.chat.channels).some(item => item?.notifications);
      return anyNotifications;
    }

    get mentions() {
      // If any channels have mentions
      // eslint-disable-next-line max-len
      const anyMentions = Object.values(this.$vxm.chat.channels).some(item => item?.mentioned);
      return anyMentions;
    }

    @Watch('notifications')
    notificationsChanged() {
      // Notifications indicator in the page title that shows if there are unread messages
      const notificationIndicator: string = ` ${this.$vxm.settings.indicator}`;
      if (this.notifications) { // If notifications were just changed to true
        document.title = `html-chat${notificationIndicator}`;
      } else { // If notifications just read
        document.title = 'html-chat';
      }
    }

    // Slideout slides back when minimized
    @Watch('minimizedValue')
    minimzationChanged() {
      if (!this.minimizedValue) {
        this.checked = false;
      }
    }

    @Watch('checked') // Slideout checked
    checkedChanged() {
      this.$vxm.chat.slideoutOpen = Boolean(this.checked);
      if (!this.checked) { // If slideout is closing
        // Set current tab (what user is looking at) to read
        this.$vxm.chat.readChannel(this.currentTab);
      }
    }

    created() {
      /* Prevents all the text from being highlighted
      if the slideout is opened and closed too quickly */
      document.addEventListener('mousedown', (e) => {
        if (e.detail > 1) {
          e.preventDefault();
        }
      }, false);
    }
  }
</script>

<style scoped>
.hamburger { /* Hamburger button */
  position: relative;
  vertical-align: top;
}
.slideout-container { /* Container for slideout */
  width:fit-content;
  background-color:black;
  color:white;
  height:100%;
  top:0px;
  left:0px;
  z-index: 2;
}
.slideoutContainerHidden { /* When slideout is closed */
  height:0px;
  animation: slideBack 0.25s;
}
@keyframes slide { /* Opens slideout */
  from { left:-75%}
  to { left:0}
}
/* Height does need to be there for the slideout to work. Otherwise it doesn't animate */
@keyframes slideBack { /* Closes slideout */
  to {height:100%; width:0}
  from {height:100%; width:75%}
}
.tall { /* When slideout is open */
  height:100%;
  animation: slide 0.25s;
}
</style>
