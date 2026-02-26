import Vue from 'vue';
import BootstrapVue from 'bootstrap-vue';
import VModal from 'vue-js-modal';
import App from './App.vue';

Vue.use(VModal);
Vue.use(BootstrapVue);
Vue.config.productionTip = false;

// Vue.config.performance = true;

export default new Vue({
  render: h => h(App),
});
