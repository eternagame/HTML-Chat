import Chat from '@/main'; // Toasts component
import chatModule from '../store/store'; // Vuex toasts module
import Vuex, { Store } from 'vuex';

export default {
  install(Vue: any, options: {store: Store<any> }) {
    if (!options.store) {
      throw new Error('Please provide vuex store.');
    }

    // Register toasts vuex module
    options.store.registerModule('$_chat', chatModule);

    // Register toasts component
    Vue.component('eterna-chat', Chat);

    // Vue.prototype.$eternaChat = {

    //   show: (args: {type: string, duration: number, text: string}) => {
    //     options.store.dispatch('addToast', args);
    //   },
    // };
  },
};
