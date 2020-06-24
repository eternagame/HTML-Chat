<template>
  <SettingsSection title="Toolbar Features">
    <table>
      <tr>
        <td class="left-side">Emoticons</td>
        <td><SettingsSwitch v-model="emoticonChatFeatures" /></td>
      </tr>
      <tr>
        <td class="left-side">Markdown</td>
        <td><SettingsSwitch v-model="markdownChatFeatures" /></td>
      </tr>
      <tr>
        <td class="left-side">Preview</td>
        <td><SettingsSwitch v-model="previewChatFeatures" /></td>
      </tr>
      <tr>
        <td class="left-side">All</td>
        <td><SettingsEnableDisable :value="allChatFeatures" @input="allChatFeaturesChanged" /></td>
      </tr>
    </table>
    <ul style="margin-top:5px" v-if="$vxm.settings.emoticonChatFeatures">
      <li>Custom emoticons</li>
      <li v-for="(emote, index) in customEmoticons" :key="emote">
        <span>{{ emote }}</span>
        <span style="float:right">
          Change to
          <input :id="index" @input="update" style="width:1rem; vertical-align:mid; height:1rem;" />
        </span>
      </li>
      <li v-show="emoticonErrorMessage && emoticonErrorMessage !== ''">
        <span class="warning">{{ emoticonErrorMessage }}</span>
      </li>
    </ul>
  </SettingsSection>
</template>
<script lang="ts">
  import {
    Component, Watch, Prop, Vue,
  } from 'vue-property-decorator';
  import SettingsSection from '../SettingsSection.vue';
  import SettingsSwitch from '../SettingsSwitch.vue';
  import SettingsEnableDisable from '../SettingsEnableDisable.vue';

@Component({
  components: {
    SettingsSection,
    SettingsSwitch,
    SettingsEnableDisable,
  },
})
  export default class ToolbarSection extends Vue {
    get allChatFeatures() {
      if (this.emoticonChatFeatures
        && this.markdownChatFeatures
        && this.previewChatFeatures) return true;
      if (!this.emoticonChatFeatures
        && !this.markdownChatFeatures
        && !this.previewChatFeatures) return false;
      return null;
    }

    allChatFeaturesChanged(to:boolean) {
      this.emoticonChatFeatures = to;
      this.markdownChatFeatures = to;
      this.previewChatFeatures = to;
    }

    emoticonChatFeatures = true;

    @Watch('emoticonChatFeatures')
    emoticonChatFeaturesChanged() {
      localStorage.emoticonChatFeatures = JSON.stringify(this.emoticonChatFeatures);
      this.$vxm.settings.emoticonChatFeatures = this.emoticonChatFeatures;
    }

    markdownChatFeatures = true;

    @Watch('markdownChatFeatures')
    markdownChatFeaturesChanged() {
      localStorage.markdownChatFeatures = JSON.stringify(this.markdownChatFeatures);
      this.$vxm.settings.markdownChatFeatures = this.markdownChatFeatures;
    }

    previewChatFeatures = true;

    @Watch('previewChatFeatures')
    previewChatFeaturesChanged() {
      localStorage.previewChatFeatures = JSON.stringify(this.previewChatFeatures);
      this.$vxm.settings.previewChatFeatures = this.previewChatFeatures;
    }


    // Custom emoticons

    update(e: Event) {
      const targ = e.target as HTMLInputElement;
      const id = Number(targ.id);
      let { value } = targ;
      value = value.trim();
      while ([...value].length > 1) {
        value = value.substring(0, value.length - 1);
      }
      const emoticonRegex = /[^\w\d\p{P}\p{S}]/;
      if (value.match(emoticonRegex)) {
        if (this.customEmoticons.some(j => j === value)) {
          this.emoticonErrorMessage = 'You are using that emoticon in another slot';
          return;
        }
        Vue.set(this.$vxm.chat.customEmoticons, id, value);
        if (localStorage) {
          localStorage.customEmoticons = JSON.stringify(
            this.$vxm.chat.customEmoticons,
          );
        }
        this.emoticonErrorMessage = '';
      } else {
        this.emoticonErrorMessage = `${value} is not a valid emoticon`;
      }
      if (value.trim() === '') {
        this.emoticonErrorMessage = '';
      }
      targ.value = '';
    }

  emoticonErrorMessage = '';

    get customEmoticons() {
      return this.$vxm.chat.customEmoticons;
    }

    created() {
      if (localStorage.emoticonChatFeatures) {
        this.emoticonChatFeatures = JSON.parse(localStorage.emoticonChatFeatures);
      } else {
        this.emoticonChatFeatures = this.$vxm.settings.emoticonChatFeatures;
      }
      if (localStorage.markdownChatFeatures) {
        this.markdownChatFeatures = JSON.parse(localStorage.markdownChatFeatures);
      } else {
        this.markdownChatFeatures = this.$vxm.settings.markdownChatFeatures;
      }
    }
  }
</script>
<style lang="scss" scoped>
@import "@/assets/_custom.scss";
@import "~bootstrap/scss/bootstrap.scss";
@import "~bootstrap-vue/dist/bootstrap-vue.css";
.settings-button {
  background-color: $green;
}
.left-side {
  vertical-align: sub;
}
.feature-button-container {
  padding: 2px;
}
.feature-button {
  float: left;
  width: 95%;
}
.warning {
  color: $warning;
}
li {
  width: calc(100% - 40px)
}
</style>
