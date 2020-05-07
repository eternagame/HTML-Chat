<template>
  <div>
    <div style="position:relative;">
      <TabButton
        v-for="({name}, index) in messageTabs"
        :key="name"
        :isActive="activeTab === index"
        :name="name.substr(1)"
        :description="channelDescriptions[name]"
        @input="activeTab = index"
        v-on:click="update"
      >
        <Splitter />
      </TabButton>
    </div>
  </div>
</template>
<script lang="ts">
  import {
    Vue, Component, Prop, Watch,
  } from 'vue-property-decorator';
  import MinimizationTriangle from '@/components/MinimizationTriangle.vue';
  import TabButton from '@/components/TabButton.vue';
  import Slideout from './Slideout.vue';
  import Splitter from '../Splitter.vue';

  @Component({
    components: {
      MinimizationTriangle,
      TabButton,
      Splitter,
    },
  })
  export default class SlideoutChats extends Vue {
    activeTab = 4; // If 1-3, causes weird bug. This fixes it

    channelDescriptions = {
    '#general': 'General chat',
    '#off-topic': 'Off-topic chat',
    '#help': 'Help requests',
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
      (this.$parent as Slideout).checked = false;
      this.$vxm.chat.chatChannel = this.messageTabs[this.activeTab].name;
      this.$vxm.chat.tab = this.activeTab;
    }

    isSelected(of:Number) { // If given tab selected
      return of === this.activeTab;
    }
  }
</script>
<style scoped>
</style>
