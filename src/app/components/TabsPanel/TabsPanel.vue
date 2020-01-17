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

</style>
