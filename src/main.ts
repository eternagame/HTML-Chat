import Vue from 'vue';
import VueResource from 'vue-resource';
import App from './App.vue';
import store from './store/store';

Vue.use(VueResource);
Vue.config.productionTip = false;

new Vue({
  store,
  render: h => h(App),
}).$mount('#app');