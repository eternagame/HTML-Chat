<template>
  <div
    id="app1"
    style="height:100%; overflow-y:hidden;"
  >
    <div
      class="chat"
      style="height: 100%;"
    >
      <tabs-panel />
      <chat-content />
    </div>
  </div>
</template>

<script lang="ts">
  import { Component, Prop } from 'vue-property-decorator';
  import Vue from '@/types/vue';
  import TabsPanel from './components/TabsPanel/TabsPanel.vue';
  import ChatContent from './components/ChatContent/ChatContent.vue';

  @Component({
    components: {
      TabsPanel,
      ChatContent,
    },
  })
  export default class App extends Vue {
    @Prop()
    username!: string;

    @Prop()
    workbranch!: string;

    @Prop()
    uid!: string;

    mounted() {
      this.$store.dispatch('$_chat/init', { username: this.username, workbranch: this.workbranch, uid: this.uid });
    }
  }
</script>

<style lang="scss">
textarea {
  border-radius: 2px;
  font-family: "Open Sans", "Helvetica Neue", Arial, Gulim;
  font-size: 0.85rem;
  border: 1px solid rgb(169, 169, 169);
  width: calc(100% - 10px);
  font-size: 14px !important;
}

.chat {
  font-family: "Helvetica Neue", "Open Sans", Arial, Gulim;
  font-size: 14px;
  font-weight: 300;
}
</style>
