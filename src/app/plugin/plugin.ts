import Chat from '@/main';
import chatModule from '../store/store';
import { Store } from 'vuex';

export default {
  install(Vue: any, options: {store: Store<any> }) {
    if (!options.store) {
      throw new Error('Please provide vuex store.');
    }
    options.store.registerModule('$_chat', chatModule);
    Vue.component('eterna-chat', Chat);
  },
};
