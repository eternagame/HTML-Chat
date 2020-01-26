import { ProxyWatchers } from 'vuex-class-component/dist/interfaces';
import ChatStore from '../store/chat.vuex';

declare module 'vue/types/vue' {
  interface Vue {
    $vxm: {
      chat: ProxyWatchers & ChatStore,
    }
  }

  interface VueConstructor {
    $vxm: {
      chat: ProxyWatchers & ChatStore,
    }
  }
}
