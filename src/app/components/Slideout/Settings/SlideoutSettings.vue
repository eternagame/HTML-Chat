<template>
  <div
    id="settings-wrapper"
    class="pt-1 pb-1 pr-1 pl-3 overflow-auto"
    :style="{ fontSize:`${fontSize}px` }" >
    <TextSizeSection />
    <IgnoredSection />
    <NotificationsSection />
    <UsernameColorSection />
    <ToolbarSection />
    <StatusSection />
    <OperSection @auth="$emit('auth')" />
  </div>
</template>
<script lang="ts">
  import {
    Component, Watch, Prop, Vue,
  } from 'vue-property-decorator';
  import TextSizeSection from './Sections/TextSizeSection.vue';
  import IgnoredSection from './Sections/IgnoredSection.vue';
  import NotificationsSection from './Sections/NotificationsSection.vue';
  import UsernameColorSection from './Sections/UsernameColorSection.vue';
  import ToolbarSection from './Sections/ToolbarSection.vue';
  import StatusSection from './Sections/StatusSection.vue';
  import OperSection from './Sections/OperSection.vue';


  @Component({
    components: {
      TextSizeSection,
      IgnoredSection,
      NotificationsSection,
      UsernameColorSection,
      ToolbarSection,
      StatusSection,
      OperSection,
    },
  })
  export default class SlideoutSettings extends Vue {
    get fontSize() {
      return this.$vxm.settings.fontSize;
    }
  }
</script>
<style>
li {
  list-style-type: none;
}
</style>
<style lang="scss" scoped>
@import "@/assets/_custom.scss";
#settings-wrapper { /* Wrapper div */
  height:calc(100% - 50px);
}
</style>
