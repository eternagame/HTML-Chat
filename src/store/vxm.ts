import { createProxy, extractVuexModule } from 'vuex-class-component';
import ChatStore from '@/store/chat.vuex';
import SettingsStore from '@/store/settings.vuex';
import store from '../standalone/store';

export function register() {
  store.registerModule('$_chat', extractVuexModule(ChatStore).chatModule);
  store.registerModule('$_settings', extractVuexModule(SettingsStore).settingsModule);
}

export const vxm = {
  chat: createProxy(store, ChatStore),
  settings: createProxy(store, SettingsStore),
};
