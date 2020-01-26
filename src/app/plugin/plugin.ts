import { Store } from 'vuex';
import { extractVuexModule, createProxy } from 'vuex-class-component';
import V from 'vue';
import Chat from '@/main';
import ChatStore from '../store/chat.vuex';

export default {
  install(Vue: any, options: {store: Store<any> }) {
    if (!options.store) {
      throw new Error('Please provide vuex store.');
    }
    options.store.registerModule('$_chat', extractVuexModule(ChatStore).chatModule);
    Vue.component('eterna-chat', Chat);
    V.prototype.$vxm = {
      ...V.prototype.$vxm,
      chat: createProxy(options.store, ChatStore),
    };
  },
};
