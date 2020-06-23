<template>
  <SettingsSection title="Toolbar Features">
    <p>These enable you to send emoticons and formatted text.</p>
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
        <td class="left-side">All</td>
        <td><SettingsEnableDisable :value="allChatFeatures" @input="allChatFeaturesChanged" /></td>
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
      if (this.emoticonChatFeatures && this.markdownChatFeatures) return true;
      if (!this.emoticonChatFeatures && !this.markdownChatFeatures) return false;
      return null;
    }

    allChatFeaturesChanged(to:boolean) {
      this.emoticonChatFeatures = to;
      this.markdownChatFeatures = to;
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
  vertical-align: baseline;
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
