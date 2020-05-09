<template>
  <div
    style="position:relative; width:75%"
    class="slideout-container"
    :class="{ slideoutContainerHidden: !checked, tall:checked}"
  >
    <HamburgerMenuButton v-model="checked" :notification="notifications"/>
    <span v-if="checked">
      <SlideoutButtonChat
        :selected="chatSelected"
        @input="activeTab = 0"
      />
      <SlideoutButtonUsers
        :selected="userSelected"
        @input="activeTab = 1"
      />
      <SlideoutButtonSettings
        :selected="settingsSelected"
        @input="activeTab = 2"
      />
      <SlideoutChats
        v-if="chatSelected"
        ref="chat"
      />
      <SlideoutUser v-if="userSelected"/>
      <SlideoutSettings v-if="settingsSelected" size=14 />
    </span>
  </div>
</template>

<script lang="ts">
  import {
    Vue, Component, Prop, Watch,
  } from 'vue-property-decorator';
  import SlideoutChats from './SlideoutChats.vue';
  import SlideoutUser from './SlideoutUser.vue';
  import SlideoutSettings from './SlideoutSettings.vue';
  import SlideoutButton from './SlideoutButton.vue';
  import SlideoutButtonUsers from '../SlideoutButtonUsers.vue';
  import SlideoutButtonChat from '../SlideoutButtonChat.vue';
  import SlideoutButtonSettings from '../SlideoutButtonSettings.vue';
  import MinimizationTriangle from '@/components/MinimizationTriangle.vue';
  import HamburgerMenuButton from '@/components/HamburgerMenuButton.vue';

  @Component({
    components: {
      SlideoutChats,
      SlideoutUser,
      SlideoutSettings,
      SlideoutButton,
      SlideoutButtonSettings,
      SlideoutButtonChat,
      SlideoutButtonUsers,
      MinimizationTriangle,
      HamburgerMenuButton,
    },
  })
  export default class Slideout extends Vue {
    activeTab = 0;

    // For hamburger
    checked = false;

    @Prop()
    minimizedValue !: boolean;

    $refs!: {
      chat:SlideoutChats,
    };

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

    get notifications() {
      const { notificationChannels } = this.$vxm.chat; // Gets object that stores notification info
      // Values for each channel
      const anyNotifications = Object.values(notificationChannels).some(item => item);
      if (!anyNotifications) { return false; } // If no notifications, don't display any
       // If notification in current channel, only display if slideout is visible
      if (notificationChannels[this.currentTab]) {
        return this.checked;
      }
       // If neither of the above were true (there are notifications not in this tab) return true
      return true;
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
      this.$emit('input', this.checked);
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
