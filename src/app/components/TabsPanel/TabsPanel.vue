<template>
  <div class="tabs">
    <transition name="fade">
      <div class="tabs-content" v-show="!$store.state.$_chat.minimized">
        <TabButton
          v-for="(tab, index) in $store.state.$_chat.tabs"
          :key="index"
          :index="index"
        />
      </div>
    </transition>
    <MinimizationTriangle />
  </div>
</template>

<script lang="ts">
  import Component from 'vue-class-component';
  import Vue from '@/types/vue';
  import TabButton from './TabButton.vue';
  import MinimizationTriangle from './MinimizationTriangle.vue';

  @Component({
    components: {
      TabButton,
      MinimizationTriangle,
    },
  })
  export default class TabsPanel extends Vue {
  }
</script>


<style lang="scss" scoped>
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

  .fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */
  {
    opacity: 0;
  }
</style>
