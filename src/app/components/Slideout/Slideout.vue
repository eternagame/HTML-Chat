<template>
  <div
  style="position:relative; width:151px"
  :class="{ slideoutContainerHidden: !checked, tall:checked}"
  >
      <div class="slideout-container" :class="{ slideoutContainerHidden: !checked }">
      <input type="checkbox" class="checkbox" v-model="checked" v-show="true">
        <span :class="{slideoutContent: !checked }" >
          <SlideoutButton
            :selected="chatSelected"
            :name="`#`"
            @input="activeTab = 0"
          />
          <SlideoutButton
            :selected="userSelected"
            :name="`👤`"
            @input="activeTab = 1"
          />
          <SlideoutButton
            :selected="settingsSelected"
            :name="`⚙️`"
            @input="activeTab = 2"
          />
          <SlideoutChats
           v-if="chatSelected"
          />
        </span>
      </div>
  </div>
</template>

<script lang="ts">
  import {
    Vue, Component, Prop, Watch,
  } from 'vue-property-decorator';
  import SlideoutChats from '@/components/Slideout/SlideoutChats.vue';
  import SlideoutButton from '@/components/Slideout/SlideoutButton.vue';
  import MinimizationTriangle from '@/components/MinimizationTriangle.vue';

  @Component({
    components: {
      SlideoutChats,
      SlideoutButton,
      MinimizationTriangle,
    },
  })
  export default class Slideout extends Vue {
    activeTab = 0;

    checked = true;

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

    @Watch('activeTab')
    tabChanged() {
      if (this.activeTab !== 0) {
        this.checked = false;
        const userString = `Users (${this.userCount})`;
        this.$vxm.chat.changeChannel(this.activeTab === 1 ? userString : 'Settings');
      }
      this.$vxm.chat.changeTab1(this.activeTab);
    }
  }
</script>

<style scoped>
.checkbox {
  width:fit-content;
  position: relative;
  height:30px;
  vertical-align: middle;
  margin-left:5px;
  margin-right:5px;
  background: none;
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
  to {height:100%; width:0px;}
  from {height:100%;width:151px;}
}
.tall {
  height:100%;
  animation: slide 0.25s;
}
</style>
