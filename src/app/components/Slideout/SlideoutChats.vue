<template>
  <div>
    <div style="position:relative;">
      <TabButton
        v-for="({name}, index) in messageTabs"
        :key="name"
        :selected="activeTab === index"
        :name="name.substr(1)"
        :description="channelDescriptions[name]"
        @input="activeTab = index"
        v-on:click="update"
      />
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

  @Component({
    components: {
      MinimizationTriangle,
      TabButton,
    },
  })
  export default class SlideoutChats extends Vue {
    activeTab = 4;

    channelDescriptions = {
    '#general': 'General chat',
    '#off-topic': 'For off-topic conversations',
    '#help': 'Help requests',
    };

    get messageTabs() {
      return Object.values(this.$vxm.chat.channels).map(channel => channel!);
    }

    @Watch('activeTab')
    tabChanged() {
      (this.$parent as Slideout).checked = false;
      this.$vxm.chat.changeChannel(this.messageTabs[this.activeTab].name);
      this.$vxm.chat.changeTab2(this.activeTab);
    }

    update() {
      (this.$parent as Slideout).checked = false;
      this.$vxm.chat.changeChannel(this.messageTabs[this.activeTab].name);
      this.$vxm.chat.changeTab2(this.activeTab);
    }
  }
</script>
