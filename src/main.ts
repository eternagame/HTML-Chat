import Vue from 'vue';
import chatPlugin from './app/plugin/plugin';
import App from './standalone/App.vue';
import store from './standalone/store';

Vue.config.productionTip = false;
Vue.use(chatPlugin, { store });

new Vue({
  render: h => h(App),
  store,
}).$mount('#app');
