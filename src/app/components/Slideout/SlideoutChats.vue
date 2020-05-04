<template>
  <div>
    <div style="position:relative;">
      <TabButton
        v-for="({name}, index) in messageTabs"
        :key="name"
        :selected="activeTab === index"
        :name="name.substr(1)"
        @input="activeTab = index"
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
    activeTab = 0;

    get messageTabs() {
      return Object.values(this.$vxm.chat.channels).map(channel => channel!);
    }

    @Watch('activeTab')
    tabChanged() {
      (this.$parent as Slideout).checked = true;
      this.$vxm.chat.changeTab2(this.activeTab);
    }
  }
</script>
