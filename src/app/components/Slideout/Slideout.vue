<template>
  <div style="position:relative; background-color:darkblue;">
    <input type="checkbox" class="checkbox" v-model="checked">
    <SlideoutButton
      :selected="chatSelected"
      :name="`Chat`"
      @input="activeTab = 0"
      v-show="!checked"
    />
    <SlideoutButton
      :selected="userSelected"
      :name="`Users`"
      @input="activeTab = 1"
      v-show="!checked"
    />
    <SlideoutButton
      :selected="settingsSelected"
      :name="`Settings`"
      @input="activeTab = 2"
      v-show="!checked"
    />
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

    checked = false;

    get chatSelected() {
        return this.activeTab === 0;
    }

    get userSelected() {
      return this.activeTab === 1;
    }

    get settingsSelected() {
      return this.activeTab === 2;
    }

    @Watch('activeTab')
    tabChanged() {
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
</style>
