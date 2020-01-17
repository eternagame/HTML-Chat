<template>
  <div
    id="eterna-chat"
    style="height:100%; overflow-y:hidden;"
  >
    <transition-group name="fade">
      <tabsPanel v-show="!minimized" key="TabsPanel"/>
      <ChatContent v-show="!minimized" key="ChatContent"/>
    </transition-group>
    <MinimizationTriangle class="minimization-triangle" v-model="minimized"/>
  </div>
</template>

<script lang="ts">
  import { Component, Prop, Watch } from 'vue-property-decorator';
  import Vue from '@/types/vue';
  import TabsPanel from './components/TabsPanel/TabsPanel.vue';
  import ChatContent from './components/ChatContent/ChatContent.vue';
  import MinimizationTriangle from './components/TabsPanel/MinimizationTriangle.vue';

  @Component({
    components: {
      TabsPanel,
      ChatContent,
      MinimizationTriangle,
    },
  })
  export default class App extends Vue {
    @Prop()
    username!: string;

    @Prop()
    workbranch!: string;

    @Prop()
    uid!: string;

    minimized = false;

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

  #eterna-chat {
    min-width: 0;
    font-family: "Helvetica Neue", "Open Sans", Arial, Gulim;
    font-size: 14px;
    font-weight: 300;
  }

  .minimization-triangle {
    position: absolute;
    top: 0px;
    right: 0px;
  }

  .tabs {
    position: relative;
    height: 25px;
    margin: 0;
    padding: 0;
  }

  .tabs-content {
    display: inline;
  }

  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 200ms;
  }

  .fade-enter, .fade-leave-to
  {
    opacity: 0;
  }
</style>
