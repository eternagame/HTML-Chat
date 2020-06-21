<template>
  <SettingsSection title="Toolbar Features">
    <p>These enable you to send emoticons and formatted text.</p>
    <table>
      <tr>
        <td class="feature-button-container left-side">
          <button
            @click="toggleMarkdown"
            :style="{ fontSize: `${11 / 14}rem` }"
            class="btn settings-button feature-button"
          >{{ markdownChatFeatures ? "Disable" : "Enable" }} markdown</button>
        </td>
        <td class="feature-button-container">
          <button
            @click="toggleEmoticons"
            :style="{ fontSize: `${11 / 14}rem` }"
            class="btn settings-button feature-button"
          >{{ emoticonChatFeatures ? "Disable" : "Enable" }} emoticons</button>
        </td>
      </tr>
      <tr>
        <td class="feature-button-container left-side">
          <button
            @click="disableAllChatFeatures"
            :disabled="!allChatFeatures"
            :style="{ fontSize: `${11 / 14}rem` }"
            class="btn settings-button feature-button"
          >Disable all</button>
        </td>
        <td class="feature-button-container">
          <button
            @click="enableAllChatFeatures"
            :disabled="allChatFeatures"
            :style="{ fontSize: `${11 / 14}rem` }"
            style="margin-top:1px;"
            class="btn settings-button feature-button"
          >Enable all</button>
        </td>
      </tr>
    </table>

    <h6>Custom emoticons</h6>
    <table>
      <tbody>
        <tr v-for="(emote, index) in customEmoticons" :key="emote">
          <td>{{ emote }}</td>
          <td>
            Change to
            <input :id="index" @input="update" style="width:1rem" />
          </td>
        </tr>
      </tbody>
      <tfoot>
        <tr>
          <td colspan="2" class="warning">{{ emoticonErrorMessage }}</td>
        </tr>
      </tfoot>
    </table>
  </SettingsSection>
</template>
<script lang="ts">
  import {
    Component, Watch, Prop, Vue,
  } from 'vue-property-decorator';
  import SettingsSection from '../SettingsSection.vue';

@Component({
  components: {
    SettingsSection,
  },
})
  export default class ToolbarSection extends Vue {
  allChatFeatures = true;

  emoticonChatFeatures = true;

  markdownChatFeatures = true;

  toggleEmoticons() {
    this.emoticonChatFeatures = !this.emoticonChatFeatures;
    if (this.emoticonChatFeatures && this.markdownChatFeatures) {
      this.allChatFeatures = this.emoticonChatFeatures;
      this.$vxm.settings.allChatFeatures = this.allChatFeatures;
      localStorage.allChatFeatures = JSON.stringify(this.allChatFeatures);
    }
    if (!this.emoticonChatFeatures && !this.markdownChatFeatures) {
      this.allChatFeatures = this.emoticonChatFeatures;
      this.$vxm.settings.allChatFeatures = this.allChatFeatures;
      localStorage.allChatFeatures = JSON.stringify(this.allChatFeatures);
    }
    this.$vxm.settings.emoticonChatFeatures = this.emoticonChatFeatures;
    localStorage.emoticonChatFeatures = JSON.stringify(
      this.emoticonChatFeatures,
    );
  }

  toggleMarkdown() {
    this.markdownChatFeatures = !this.markdownChatFeatures;
    if (this.emoticonChatFeatures && this.markdownChatFeatures) {
      this.allChatFeatures = this.markdownChatFeatures;
      this.$vxm.settings.allChatFeatures = this.allChatFeatures;
      localStorage.allChatFeatures = JSON.stringify(this.allChatFeatures);
    }
    if (!this.emoticonChatFeatures && !this.markdownChatFeatures) {
      this.allChatFeatures = this.markdownChatFeatures;
      this.$vxm.settings.allChatFeatures = this.allChatFeatures;
      localStorage.allChatFeatures = JSON.stringify(this.allChatFeatures);
    }
    this.$vxm.settings.markdownChatFeatures = this.markdownChatFeatures;
    localStorage.markdownChatFeatures = JSON.stringify(
      this.markdownChatFeatures,
    );
  }

  toggleAllChatFeatures() {
    this.allChatFeatures = !this.allChatFeatures;
    this.emoticonChatFeatures = this.allChatFeatures;
    this.markdownChatFeatures = this.allChatFeatures;
    this.$vxm.settings.allChatFeatures = this.allChatFeatures;
    localStorage.allChatFeatures = JSON.stringify(this.allChatFeatures);
    this.$vxm.settings.emoticonChatFeatures = this.allChatFeatures;
    localStorage.emoticonChatFeatures = JSON.stringify(this.allChatFeatures);
    this.$vxm.settings.markdownChatFeatures = this.allChatFeatures;
    localStorage.markdownChatFeatures = JSON.stringify(this.allChatFeatures);
  }

  enableAllChatFeatures() {
    if (!this.allChatFeatures) {
      this.toggleAllChatFeatures();
    }
  }

  disableAllChatFeatures() {
    if (this.allChatFeatures) {
      this.toggleAllChatFeatures();
    }
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
    if (localStorage.allChatFeatures) {
      this.allChatFeatures = JSON.parse(localStorage.allChatFeatures);
    } else {
      this.allChatFeatures = this.$vxm.settings.allChatFeatures;
    }
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
  padding-left: 0;
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
</style>
