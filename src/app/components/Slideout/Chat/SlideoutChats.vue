<template>
  <div style="position:relative; overflow-y:auto; height:calc(100% - 40px)">
    <ChatSelectButton
      v-for="({name}, index) in messageTabs"
      :key="name"
      :isActive="activeTab === index"
      :name="name"
      :description="channelDescription(name)"
      @input="setTab(index)"
      v-on:click="update"
      :class="{ notified:isNotified(name), mentioned:isMentioned(name) }"
    >
    </ChatSelectButton>
    <AddChatButton />
  </div>
</template>
<script lang="ts">
  import {
    Vue, Component, Prop, Watch,
  } from 'vue-property-decorator';
  import ChatSelectButton from './ChatSelectButton.vue';
  import Slideout from '../Slideout.vue';
  import AddChatButton from './AddChatButton.vue';

  @Component({
    components: {
      ChatSelectButton,
      AddChatButton,
    },
  })
  export default class SlideoutChats extends Vue {
    activeTab = 100; // If any real channel index (or unset), causes weird bug. This fixes it

    channelDescriptions: {[channel:string]:string} = {
    '#general': 'General chat',
    '#off-topic': 'Off-topic chat',
    '#help': 'Help requests',
    '#labs': 'Discussion related to labs',
    };

    get messageTabs() {
      return Object.values(this.$vxm.chat.channels).map(channel => channel!);
    }

    @Watch('activeTab') // When tab changed
    tabChanged() {
      (this.$parent as Slideout).checked = false; // Close slideout
      const channelName = this.messageTabs[this.activeTab].name;
      this.$vxm.chat.chatChannel = channelName; // Change channel name displayed at top
      this.$vxm.chat.tab = this.activeTab;
    }

    update() {
      (this.$parent as Slideout).checked = false; // Hide slideout
       // Set current tab name in top bar as this tab's name
      this.$vxm.chat.chatChannel = this.messageTabs[this.activeTab].name;
      this.$vxm.chat.tab = this.activeTab; // Set self as active tab
    }

    isSelected(of:Number) { // If given tab selected
      return of === this.activeTab;
    }

    // Gives channel description given name
    channelDescription(name:string) {
      // Gets description for channel, if there is one, from object defined above
      const description = this.channelDescriptions[name];
      if (description) { // If description exists, return it
        return description;
      }
      if (!name.startsWith('#')) { // If it's a private message, use a custom description
        return `Direct chat with ${name}`;
      }
      // Remove hashtag
      const trimmedName = name.replace('#', '');
      // Return channel name with first letter capitalized + ' channel'
      return `${trimmedName.charAt(0).toUpperCase()}${trimmedName.substr(1)} channel`;
    }

    isNotified(name:string) { // If given tab is notified
      // Make sure name returns a real channel
      const trueChannel = this.$vxm.chat.channels[name];
      if (trueChannel) {
        // If it exists, return whether or not it has notifications
        return trueChannel.notifications;
      }
      // If it doesn't exist, return false (default)
      return false;
    }

    isMentioned(name:string) { // If given tab is notified
      // Make sure name returns a real channel
      const trueChannel = this.$vxm.chat.channels[name];
      if (trueChannel) {
        // If it exists, return whether or not it has notifications
        return trueChannel.mentioned;
      }
      // If it doesn't exist, return false (default)
      return false;
    }

    setTab(index: number) {
      if (this.activeTab !== index) {
        this.activeTab = index;
      } else {
        (this.$parent as Slideout).checked = false;
      }
    }
  }
</script>
<style scoped>
::-webkit-scrollbar {
    width: 10px;
    height:10px;
}

::-webkit-scrollbar-thumb {
  background-color:#343a40; /* Make scrollbar visible */
  border-radius:5px;
}
</style>
