<template>
  <div
    id="chat-tabs"
    style="height: 100%"
  >
    <component
      :is="activeTab.type"
      :key="activeTab.id"
      :data="activeTab"
    />
  </div>
</template>

<script lang="ts">
  import Component from 'vue-class-component';
  import Vue from '@/types/vue';
  import MessagesTab from './Tabs/MessagesTab.vue';
  import OnlineTab from './Tabs/OnlineTab.vue';

  @Component({
    components: {
      MessagesTab,
      OnlineTab,
    },
  })
  export default class ChatTabs extends Vue {
    get activeTab() {
      return this.$store.state.$_chat.tabs[this.$store.state.$_chat.activeTab];
    }
  }
</script>
