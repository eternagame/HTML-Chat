import { createModule } from 'vuex-class-component';

const VuexModule = createModule({
  strict: false,
});
export default class SettingsModule extends VuexModule {
  font: number = 14;

  indicator: string = ' (!)';

  emoticonChatFeatures = true;

  markdownChatFeatures = true;

  previewChatFeatures = true;

  awayReason = '';

  typingMessages = true;

  get fontSize() {
    return Math.min(Math.max(this.font, 0), 18);
  }
}
