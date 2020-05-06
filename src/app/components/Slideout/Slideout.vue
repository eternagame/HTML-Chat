<template>
  <div
    style="position:relative; width:75%"
    class="slideout-container"
    :class="{ slideoutContainerHidden: !checked, tall:checked}"
  >
    <HamburgerMenuButton v-model="checked"/>
    <span :class="{slideoutContent: !checked }" v-if="checked">
      <SlideoutButtonChat
        :selected="chatSelected"
        @input="activeTab = 0"
      />
      <SlideoutButtonUsers
        :selected="userSelected"
        @input="activeTab = 1"
      />
      <SlideoutButtonSettings
        :selected="settingsSelected"
        @input="activeTab = 2"
      />
      <SlideoutChats
        v-if="chatSelected"
      />
      <SlideoutUser v-if="userSelected"/>
      <SlideoutSettings v-if="settingsSelected" size=14 />
    </span>
  </div>
</template>

<script lang="ts">
  import {
    Vue, Component, Prop, Watch,
  } from 'vue-property-decorator';
  import SlideoutChats from './SlideoutChats.vue';
  import SlideoutUser from './SlideoutUser.vue';
  import SlideoutSettings from './SlideoutSettings.vue';
  import SlideoutButton from './SlideoutButton.vue';
  import SlideoutButtonUsers from '../SlideoutButtonUsers.vue';
  import SlideoutButtonChat from '../SlideoutButtonChat.vue';
  import SlideoutButtonSettings from '../SlideoutButtonSettings.vue';
  import MinimizationTriangle from '@/components/MinimizationTriangle.vue';
  import HamburgerMenuButton from '@/components/HamburgerMenuButton.vue';

  @Component({
    components: {
      SlideoutChats,
      SlideoutUser,
      SlideoutSettings,
      SlideoutButton,
      SlideoutButtonSettings,
      SlideoutButtonChat,
      SlideoutButtonUsers,
      MinimizationTriangle,
      HamburgerMenuButton,
    },
  })
  export default class Slideout extends Vue {
    activeTab = 0;

    checked = false;

    @Prop()
    minimizedValue !: boolean;

    get chatSelected() {
        return this.activeTab === 0;
    }

    get userSelected() {
      return this.activeTab === 1;
    }

    get settingsSelected() {
      return this.activeTab === 2;
    }

    // Slideout slides back when minimized
    @Watch('minimizedValue')
    minimzationChanged() {
      if (!this.minimizedValue) {
        this.checked = false;
      }
    }
  }
</script>

<style scoped>
.hamburger {
  position: relative;
  vertical-align: top;
}
.slideout-container {
  width:fit-content;
  background-color:black;
  color:white;
  height:100%;
  top:0px;
  left:0px;
  z-index: 2;
}
.slideoutContainerHidden {
  height:0px;
  animation: slideBack 0.25s;
}
.slideoutContent {
  visibility: hidden;
}
@keyframes slide {
  from {left: -151px;}
  to {left:0px;}
}
@keyframes slideBack {
  to {height:100%; width:0px}
  from {height:100%; width:160px}
}
.tall {
  height:100%;
  animation: slide 0.25s;
}
</style>
