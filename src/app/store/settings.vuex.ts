import { ActionTree, MutationTree, CommitOptions } from 'vuex';
import * as Irc from 'irc-framework';
import {
  createModule, mutation, action, extractVuexModule,
} from 'vuex-class-component';
import Vue from 'vue';
import { Watch } from 'vue-property-decorator';

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
