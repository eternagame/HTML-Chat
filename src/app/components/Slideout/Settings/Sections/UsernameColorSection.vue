<template>
  <SettingsSection title="Username Color" >
    <ColorPicker />
  </SettingsSection>
</template>
<script lang="ts">
  import {
    Component, Watch, Prop, Vue,
  } from 'vue-property-decorator';
  import SettingsSection from '../SettingsSection.vue';
  import ColorPicker from '../ColorPicker/ColorPicker.vue';

  @Component({
    components: {
      SettingsSection,
      ColorPicker,
    },
  })
  export default class UsernameColorSection extends Vue {
  }
</script>
