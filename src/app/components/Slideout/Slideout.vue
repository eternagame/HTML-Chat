<template>
  <div
  style="position:relative; width:151px"
  :class="{ slideoutContainerHidden: !checked, tall:checked}"
  >
    <div class="slideout-container" :class="{ slideoutContainerHidden: !checked }">
      <input type="checkbox" class="checkbox" v-model="checked" v-show="true">
      <span v-if="checked" id="slideout-content">
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
    <div id="current-tab">{{currentTab}}</div>
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

    get currentTab() {
        return this.$vxm.chat.chatChannel;
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
}
.tall {
  height:100%
}
#current-tab {
  position:absolute;
  right:25px;
  padding-top:0px;
  font-size:20px;
  top:0px;
  width:calc(100% - 48px);
  float:right;
  text-align: left;
  z-index: 0;
  height: 30px;
}
</style>
