import { ActionTree, MutationTree, CommitOptions } from 'vuex';
import * as Irc from 'irc-framework';
import {
  createModule, mutation, action, extractVuexModule,
} from 'vuex-class-component';
import toBool from 'to-bool';
import Vue from 'vue';

const VuexModule = createModule({
  strict: false,
});
export default class SettingsModule extends VuexModule {
  fontSize: Number = 14;

  indicator: string = ' (!)';
}
