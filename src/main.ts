import Vue from 'vue';
import VueResource from 'vue-resource';
import BootstrapVue from 'bootstrap-vue';
import VModal from 'vue-js-modal';
import App from './App.vue';
import store from './store/store';

Vue.use(VModal);
Vue.use(BootstrapVue);
Vue.use(VueResource);
Vue.config.productionTip = false;

new Vue({
  store,
  render: h => h(App),
}).$mount('#app');
