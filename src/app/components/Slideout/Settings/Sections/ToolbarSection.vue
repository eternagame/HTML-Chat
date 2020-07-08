<template>
  <SettingsSection title="Toolbar Features">
    <ul aria-label="Which features are enabled in the toolbar">
      <li aria-label="Whether emoticons are enabled in the toolbar">
        <span class="left-side">
          Emoticons
          <SettingsTooltip text="Whether the emoticons menu in the toolbar is visible" />
        </span>
        <span style="float: right"><SettingsSwitch v-model="emoticonChatFeatures" /></span>
      </li>
      <li aria-label="Whether markdown is enabled in the toolbar">
        <span class="left-side">
          Markdown
          <SettingsTooltip text="Whether the markdown menu in the toolbar is visible" />
        </span>
        <span style="float: right"><SettingsSwitch v-model="markdownChatFeatures" /></span>
      </li>
      <li aria-label="Whether the preview is enabled in the toolbar">
        <span class="left-side">
          Preview
          <SettingsTooltip text="Whether the markdown preview menu in the toolbar is visible" />
        </span>
        <span style="float: right"><SettingsSwitch v-model="previewChatFeatures" /></span>
      </li>
      <li>
        <span class="left-side">All</span>
        <span style="float: right">
          <SettingsEnableDisable :value="allChatFeatures" @input="allChatFeaturesChanged" />
        </span>
      </li>
    </ul>
    <ul style="margin-top:10px" v-if="$vxm.settings.emoticonChatFeatures"
      aria-label="Change custom emoticons that appear in the toolbar">
      <li>
        Custom emoticons
        <SettingsTooltip text="Which emoticons appear in your three custom slots
        in the emoticon menu in the toolbar" />
      </li>
      <li
        v-for="(emote, index) in customEmoticons"
        :key="emote"
        :aria-label="`Change emote in slot ${index}`">
          {{ emote}}
          <span style="float: right">
          <label :for="index">Replace with</label>
          <input
            :name="index"
            :id="index"
            @input="update"
            style="width:1rem; position: relative; bottom: 2px; height:1rem; margin-left: 5px" />
          </span>
      </li>
      <li v-show="emoticonErrorMessage && emoticonErrorMessage !== ''">
        <span class="warning">{{ emoticonErrorMessage }}</span>
      </li>
    </ul>
    <li style="list-style-type: none">
      Typing messages
      <SettingsTooltip text="Whether you see messages above the toolbar when people are typing" />
      <span style="float: right">
        <SettingsSwitch v-model="$vxm.settings.typingMessages" />
      </span>
    </li>
  </SettingsSection>
</template>
<script lang="ts">
  import {
    Component, Watch, Prop, Vue,
  } from 'vue-property-decorator';
  import SettingsSection from '../SettingsSection.vue';
  import SettingsSwitch from '../SettingsSwitch.vue';
  import SettingsEnableDisable from '../SettingsEnableDisable.vue';
  import SettingsTooltip from '../SettingsTooltip.vue';

@Component({
  components: {
    SettingsSection,
    SettingsSwitch,
    SettingsEnableDisable,
    SettingsTooltip,
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
      localStorage.chat_emoticonChatFeatures = JSON.stringify(this.emoticonChatFeatures);
      this.$vxm.settings.emoticonChatFeatures = this.emoticonChatFeatures;
    }

    markdownChatFeatures = true;

    @Watch('markdownChatFeatures')
    markdownChatFeaturesChanged() {
      localStorage.chat_markdownChatFeatures = JSON.stringify(this.markdownChatFeatures);
      this.$vxm.settings.markdownChatFeatures = this.markdownChatFeatures;
    }

    previewChatFeatures = true;

    @Watch('previewChatFeatures')
    previewChatFeaturesChanged() {
      localStorage.chat_previewChatFeatures = JSON.stringify(this.previewChatFeatures);
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
          localStorage.chat_customEmoticons = JSON.stringify(
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
      if (localStorage.chat_emoticonChatFeatures) {
        this.emoticonChatFeatures = JSON.parse(localStorage.chat_emoticonChatFeatures);
      } else {
        this.emoticonChatFeatures = this.$vxm.settings.emoticonChatFeatures;
      }
      if (localStorage.chat_markdownChatFeatures) {
        this.markdownChatFeatures = JSON.parse(localStorage.chat_markdownChatFeatures);
      } else {
        this.markdownChatFeatures = this.$vxm.settings.markdownChatFeatures;
      }
    }

    @Watch('$vxm.settings.typingMessages')
    typingMessageSettingsUpdated() {
      if (localStorage) {
        localStorage.chat_typingMessages = JSON.stringify(this.$vxm.settings.typingMessages);
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
  width: calc(100% - 40px);
  margin-bottom: 10px;
}
</style>
