<template>
  <div
    id="eterna-chat"
    style="height:100%; overflow-y:hidden;"
  >
    <div style="height: 100%;" v-show="!minimized">
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
  </div>
</template>
<script lang="ts">
  import {
    Vue, Component, Prop, Watch,
  } from 'vue-property-decorator';
  import MinimizationTriangle from '@/components/MinimizationTriangle.vue';
  import TabButton from '@/components/TabButton.vue';

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
        this.$vxm.chat.changeTab2(this.activeTab);
    }
  }
</script>

<style lang="scss">
  @import '~vue-context/src/sass/vue-context';
  textarea {
    border-radius: 2px;
    font-family: "Open Sans", "Helvetica Neue", Arial, Gulim;
    font-size: 0.85rem;
    border: 1px solid rgb(169, 169, 169);
    width: calc(100% - 10px);
    font-size: 14px !important;
  }
</style>

<style lang="scss" scoped>
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

  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 200ms;
  }

  .fade-enter, .fade-leave-to
  {
    opacity: 0;
  }

  .chat-content {
    border: rgba(255, 255, 255, 0.2) solid 2px;
    height: calc(100% - 29px);
    position: relative;
    color: #c0dce7;
  }
</style>
