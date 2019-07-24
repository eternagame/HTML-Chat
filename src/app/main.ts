import Vue from 'vue';
import VueResource from 'vue-resource';
import BootstrapVue from 'bootstrap-vue';
import VModal from 'vue-js-modal';
import Vuex from 'vuex';
import App from './App.vue';
import store from './store/store';

Vue.use(VModal);
Vue.use(BootstrapVue);
Vue.use(VueResource);
Vue.config.productionTip = false;

export default new Vue({
  render: h => h(App),
});
