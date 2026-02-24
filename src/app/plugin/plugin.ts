import V from 'vue';
import Chat from '@/main';
import { register, vxm } from '../../store/vxm';

export default {
  install(Vue: any) {
    register();
    Vue.component('eterna-chat', Chat);
    V.prototype.$vxm = { ...V.prototype.$vxm, ...vxm };
  },
};
