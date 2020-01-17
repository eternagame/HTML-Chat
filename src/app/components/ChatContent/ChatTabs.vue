<template>
  <div
    id="chat-tabs"
    style="height: 100%"
  >
    <component
      v-for="(tab, index) in $store.state.$_chat.tabs"
      :key="index"
      :is="tab.type"
      :data="tab"
      v-show="index === $store.state.$_chat.activeTab"
      :visibility="index === $store.state.$_chat.activeTab"
    />
  </div>
</template>

<script lang="ts">
  import Component from 'vue-class-component';
  import Vue from '@/types/vue';
  import MessagePane from './Panes/MessagePane.vue';
  import UserPane from './Panes/UserPane.vue';

  @Component({
    components: {
      MessagePane,
      UserPane,
    },
  })
  export default class ChatTabs extends Vue {
  }
</script>
