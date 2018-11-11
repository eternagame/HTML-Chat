<template>
  <div class="tabs">
    <transition name="fade">
      <div v-show="!$store.state.minimized">
        <tab-button v-for="(tab, index) in $store.state.tabs" :key="index" :index="index"></tab-button>
      </div>
    </transition>
    <minimization-triangle></minimization-triangle>
  </div>
</template>

<script lang="ts">
import Vue from "@/types/vue";
import Component from "vue-class-component";
import TabButton from "./TabButton.vue";
import MinimizationTriangle from "./MinimizationTriangle.vue";
@Component({
  components: {
    TabButton,
    MinimizationTriangle
  }
})
export default class TabsPanel extends Vue {

}
</script>


<style lang="scss" scoped>
.tabs {
  position: relative;
  height: 25px;
  margin: 0px 0px 0px 0px;
  padding: 0px;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 200ms;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
</style>
