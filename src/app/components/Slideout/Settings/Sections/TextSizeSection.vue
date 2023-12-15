<template>
  <SettingsSection title="Text Size" >
      <input v-model="size" type=number min=10 max=18 aria-label="Change text size">
      <p
        id='font-warning'
        v-show="size < 10 || size > 18" >
        Font size must be a number between 10 and 18
      </p>
      <SettingsTooltip
        text="Must be a number between 10 and 18. Default is 14"
        class="align-middle"
      />
    </SettingsSection>
</template>
<script lang="ts">
  import {
    Component, Watch, Prop, Vue,
  } from 'vue-property-decorator';
  import SettingsSection from '../SettingsSection.vue';
  import SettingsTooltip from '../SettingsTooltip.vue';

  @Component({
    components: {
      SettingsSection,
      SettingsTooltip,
    },
  })
  export default class TextSizeSection extends Vue {
    size:string = '14'; // font size

    // Updates global font size when input changes
    @Watch('size')
    updateFontSize() {
       // Only update if valid font size
      if (parseInt(this.size, 10) >= 10 && parseInt(this.size, 10) <= 18) {
        this.$vxm.settings.font = parseInt(this.size, 10);
        localStorage.chat_fontSize = JSON.stringify(this.size);
      }
    }

    get fontSize() {
      return this.$vxm.settings.fontSize;
    }

    created() {
      if (localStorage.chat_fontSize) {
        this.size = String(Number(JSON.parse(localStorage.chat_fontSize)));
      } else {
        this.size = this.$vxm.settings.fontSize.toString();
      }
    }
  }
</script>
<style scoped>
#font-size-p { /* 'Default is 14' text */
  margin-left:2px;
}
#font-warning {
  color:#f39c12;
}
input {
  margin:2px;
  width:calc(100% - 23px); /* Accounts for padding on both sides */
  max-width:150px; /* Big screens don't have arbitrarily large input */
}
</style>
