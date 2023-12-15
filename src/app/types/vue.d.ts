import { ProxyWatchers } from 'vuex-class-component/dist/interfaces';
import ChatStore from '../store/chat.vuex';
import SettingsStore from '../store/settings.vuex';

declare module 'vue/types/vue' {
  interface Vue {
    $vxm: {
      chat: ProxyWatchers & ChatStore,
      settings: ProxyWatchers & SettingsStore,
    }
  }

  interface VueConstructor {
    $vxm: {
      chat: ProxyWatchers & ChatStore,
      settings: ProxyWatchers & SettingsStore,
    }
  }
}
