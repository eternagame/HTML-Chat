<template>
  <SettingsSection title="Toolbar Features">
    <ul class="list-group">
      <li>
        <span class="align-sub">
          Emoticons
          <SettingsTooltip text="Whether the emoticons menu in the toolbar is visible" />
        </span>
        <span class="float-right"><SettingsSwitch v-model="settings.emoticonChatFeatures" /></span>
      </li>
      <li>
        <span class="align-sub">
          Markdown
          <SettingsTooltip text="Whether the markdown menu in the toolbar is visible" />
        </span>
        <span class="float-right"><SettingsSwitch v-model="settings.markdownChatFeatures" /></span>
      </li>
      <li>
        <span class="align-sub">
          Preview
          <SettingsTooltip text="Whether the markdown preview menu in the toolbar is visible" />
        </span>
        <span class="float-right"><SettingsSwitch v-model="settings.previewChatFeatures" /></span>
      </li>
      <li>
        <span class="align-sub">All</span>
        <span class="float-right">
          <SettingsEnableDisable :value="allChatFeatures" @input="allChatFeaturesChanged" />
        </span>
      </li>
    </ul>
    <ul class="mt-2 list-group" v-if="$vxm.settings.emoticonChatFeatures">
      <li>
        Custom emoticons
        <SettingsTooltip
          text="Which emoticons appear in your three custom slots
        in the emoticon menu in the toolbar" />
      </li>
      <li
        v-for="(emote, index) in customEmoticons"
        :key="emote"
        :aria-label="`Change emote in slot ${index}`">
        {{ emote}}
        <span class="float-right">
          <label :for="index">Replace with</label>
          <input
            :name="index"
            :id="index"
            @input="update"
            class='ml-1'
            style="width:1rem; position: relative; bottom: 2px; height:1rem" />
        </span>
      </li>
      <li v-show="emoticonErrorMessage && emoticonErrorMessage !== ''">
        <span class="warning">{{ emoticonErrorMessage }}</span>
      </li>
    </ul>
    <li style="list-style-type: none">
      Typing messages
      <SettingsTooltip text="Whether you see messages above the toolbar when people are typing" />
      <span class="float-right">
        <SettingsSwitch v-model="settings.typingMessages" />
      </span>
    </li>
  </SettingsSection>
</template>
<script lang="ts" setup>
import { Vue } from 'vue-property-decorator';
import { computed, ref } from 'vue';
import { vxm } from '#store/vxm';
import useSettingsStore from '#stores/settings';
import SettingsSection from '../SettingsSection.vue';
import SettingsSwitch from '../SettingsSwitch.vue';
import SettingsEnableDisable from '../SettingsEnableDisable.vue';
import SettingsTooltip from '../SettingsTooltip.vue';

const settings = useSettingsStore();
const allChatFeatures = computed(() => {
  const features = [
    settings.emoticonChatFeatures,
    settings.markdownChatFeatures,
    settings.previewChatFeatures,
  ];

  if (features.every(f => f === true)) {
    return 'ALL_ON';
  }
  if (features.every(f => f === false)) {
    return 'ALL_OFF';
  }
  return 'MIXED';
});

function allChatFeaturesChanged(to: boolean) {
  settings.emoticonChatFeatures = to;
  settings.markdownChatFeatures = to;
  settings.previewChatFeatures = to;
}

// Custom emoticons
const emoticonErrorMessage = ref<string>('');
const customEmoticons = computed(() => vxm.chat.customEmoticons);
// TODO: Refactor to not use HTML id attribute to track index of list
function update(e: InputEvent) {
  const target = e.target as HTMLInputElement;
  const id = Number(target.id);
  let { value } = target;
  value = value.trim();
  while ([...value].length > 1) {
    value = value.substring(0, value.length - 1);
  }
  const emoticonRegex = /[^\w\d\p{P}\p{S}]/;
  if (value.match(emoticonRegex)) {
    if (customEmoticons.value.some(j => j === value)) {
      emoticonErrorMessage.value = 'You are using that emoticon in another slot';
      return;
    }
    Vue.set(vxm.chat.customEmoticons, id, value);
    localStorage.chat_customEmoticons = JSON.stringify(vxm.chat.customEmoticons);
    emoticonErrorMessage.value = '';
  } else {
    emoticonErrorMessage.value = `${value} is not a valid emoticon`;
  }
  if (value.trim() === '') {
    emoticonErrorMessage.value = '';
  }
  target.value = '';
}
</script>
<style lang="scss" scoped>
@import "@/assets/_custom.scss";
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
