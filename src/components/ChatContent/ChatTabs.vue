<template>
  <div id="chat-tabs" :style="{
            'height': `100%`
     }">
    <component
      v-for="(tab, i) in $store.state.tabs"
      :is="tab.type"
      v-show="$store.state.activeTab === i"
      :key="tab.id"
      :data="tab"
    ></component>
  </div>
</template>

<script lang="ts">
import Vue from "@/types/vue";
import Component from "vue-class-component";
import MessagesTab from "./Tabs/MessagesTab.vue";
import OnlineTab from "./Tabs/OnlineTab.vue";

@Component({
  components: {
    MessagesTab,
    OnlineTab
  }
})
export default class ChatTabs extends Vue {}
</script>

<style lang="scss" scoped>
</style>
