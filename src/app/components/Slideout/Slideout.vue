<template>
  <div
  style="position:relative; width:75%"
  :class="{ slideoutContainerHidden: !checked, tall:checked}"
  >
      <div class="slideout-container" :class="{ slideoutContainerHidden: !checked }">
        <HamburgerMenuButton v-model="checked" class="checkbox"/>
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
          <SlideoutSettings v-if="settingsSelected" message=14 />
        </span>
      </div>
  </div>
</template>

<script lang="ts">
  import {
    Vue, Component, Prop, Watch,
  } from 'vue-property-decorator';
  import SlideoutChats from '@/components/Slideout/SlideoutChats.vue';
  import SlideoutUser from '@/components/Slideout/SlideoutUser.vue';
  import SlideoutSettings from '@/components/Slideout/SlideoutSettings.vue';
  import SlideoutButton from '@/components/Slideout/SlideoutButton.vue';
  import SlideoutButtonUsers from '@/components/SlideoutButtonUsers.vue';
  import SlideoutButtonChat from '@/components/SlideoutButtonChat.vue';
  import SlideoutButtonSettings from '@/components/SlideoutButtonSettings.vue';
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

    minimizedValue = false;

    get chatSelected() {
        return this.activeTab === 0;
    }

    get userSelected() {
      return this.activeTab === 1;
    }

    get settingsSelected() {
      return this.activeTab === 2;
    }

    get messageTabs() {
        return Object.values(this.$vxm.chat.channels).map(channel => channel!);
    }

    get userCount() {
      return Object.keys(this.$vxm.chat.connectedUsers).length;
    }
  }
</script>

<style scoped>
.checkbox {
  position: relative;
  vertical-align: top;
}
.slideout-container {
  width:fit-content;
  background-color:black;
  color:white;
  height:100%;
  position:absolute;
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
