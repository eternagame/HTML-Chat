<template>
  <div style="position:relative; background-color:darkblue;">
    <input type="checkbox" class="checkbox" v-model="checked">
    <span>
      <SlideoutButton
        :selected="chatSelected"
        :name="`Chat`"
        @input="activeTab = 0"
        :class="{ 'big' : checked && activeTab === 0}"
        v-show="!checked || activeTab === 0"
      />
      <SlideoutButton
        :selected="userSelected"
        :name="`Users`"
        @input="activeTab = 1"
        :class="{ 'big' : checked && activeTab === 1 }"
        v-show="!checked || activeTab === 1"
      />
      <SlideoutButton
        :selected="settingsSelected"
        :name="`Settings`"
        @input="activeTab = 2"
        :class="{ 'big' : checked && activeTab === 2 }"
        v-show="!checked || activeTab === 2"
      />
    </span>
    <SlideoutChats
      v-if="chatSelected"
      v-show="!checked"
    />
  </div>
</template>

<script lang="ts">
  import {
    Vue, Component, Prop, Watch,
  } from 'vue-property-decorator';
  import SlideoutChats from '@/components/Slideout/SlideoutChats.vue';
  import SlideoutButton from '@/components/Slideout/SlideoutButton.vue';

  @Component({
    components: {
      SlideoutChats,
      SlideoutButton,
    },
  })
  export default class Slideout extends Vue {
    activeTab = 0;

    checked = true;

    get chatSelected() {
        return this.activeTab === 0;
    }

    get userSelected() {
      return this.activeTab === 1;
    }

    get settingsSelected() {
      return this.activeTab === 2;
    }

    get centeredValue() {
      if (!this.checked && this.activeTab === 2) {
        return ('calc(100% - 23px;');
      }
      return '24.59px';
    }

    @Watch('activeTab')
    tabChanged() {
      if (this.activeTab !== 0) {
        this.checked = true;
      }
      this.$vxm.chat.changeTab1(this.activeTab);
    }
  }
</script>

<style scoped>
.checkbox {
  width:fit-content;
  margin:5px;
  vertical-align:middle;
}
.big {
  width: Calc(100% - 23px);
  float:right;
}
</style>
