<template>
  <SettingsSection title="Toolbar Features">
    <ul class="list-group">
      <li>
        <span class="align-sub">
          Emoticons
          <SettingsTooltip text="Whether the emoticons menu in the toolbar is visible" />
        </span>
        <span class="float-right"><SettingsSwitch v-model="emoticonChatFeatures" /></span>
      </li>
      <li>
        <span class="align-sub">
          Markdown
          <SettingsTooltip text="Whether the markdown menu in the toolbar is visible" />
        </span>
        <span class="float-right"><SettingsSwitch v-model="markdownChatFeatures" /></span>
      </li>
      <li>
        <span class="align-sub">
          Preview
          <SettingsTooltip text="Whether the markdown preview menu in the toolbar is visible" />
        </span>
        <span class="float-right"><SettingsSwitch v-model="previewChatFeatures" /></span>
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
        <SettingsSwitch v-model="typingMessages" />
      </span>
    </li>
  </SettingsSection>
</template>
<script lang="ts" setup>
import { Vue } from 'vue-property-decorator';
import {
  computed, onMounted, ref, watch,
} from 'vue';
import { vxm } from '#store/vxm';
import SettingsSection from '../SettingsSection.vue';
import SettingsSwitch from '../SettingsSwitch.vue';
import SettingsEnableDisable from '../SettingsEnableDisable.vue';
import SettingsTooltip from '../SettingsTooltip.vue';

const emoticonChatFeatures = ref<boolean>(true);
watch(emoticonChatFeatures, (enabled) => {
  localStorage.chat_emoticonChatFeatures = JSON.stringify(enabled);
  vxm.settings.emoticonChatFeatures = enabled;
});

const markdownChatFeatures = ref<boolean>(true);
watch(markdownChatFeatures, (enabled) => {
  localStorage.chat_markdownChatFeatures = JSON.stringify(enabled);
  vxm.settings.markdownChatFeatures = enabled;
});

const previewChatFeatures = ref<boolean>(true);
watch(previewChatFeatures, (enabled) => {
  localStorage.chat_previewChatFeatures = JSON.stringify(enabled);
  vxm.settings.previewChatFeatures = enabled;
});

const allChatFeatures = computed(() => {
  const features = [
    emoticonChatFeatures.value,
    markdownChatFeatures.value,
    previewChatFeatures.value,
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
  emoticonChatFeatures.value = to;
  markdownChatFeatures.value = to;
  previewChatFeatures.value = to;
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

const typingMessages = ref<boolean>(true);
watch(typingMessages, (viewTyping) => {
  vxm.settings.typingMessages = viewTyping;
  localStorage.chat_typingMessages = JSON.stringify(viewTyping);
});

onMounted(() => {
  if (localStorage.chat_emoticonChatFeatures) {
    emoticonChatFeatures.value = JSON.parse(localStorage.chat_emoticonChatFeatures);
  } else {
    emoticonChatFeatures.value = vxm.settings.emoticonChatFeatures;
  }
  if (localStorage.chat_markdownChatFeatures) {
    markdownChatFeatures.value = JSON.parse(localStorage.chat_markdownChatFeatures);
  } else {
    markdownChatFeatures.value = vxm.settings.markdownChatFeatures;
  }
  if (localStorage.chat_previewChatFeatures) {
    previewChatFeatures.value = JSON.parse(localStorage.chat_previewChatFeatures);
  } else {
    previewChatFeatures.value = vxm.settings.previewChatFeatures;
  }
  if (localStorage.chat_typingMessages) {
    typingMessages.value = JSON.parse(localStorage.chat_typingMessages);
  } else {
    typingMessages.value = vxm.settings.typingMessages;
  }
});
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
