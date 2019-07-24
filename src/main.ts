import Vue from 'vue';
import chatPlugin from './app/plugin/plugin';
import App from './standalnoe/App.vue';
import store from './standalnoe/store';

Vue.config.productionTip = false;
Vue.use(chatPlugin, { store });

new Vue({
  render: h => h(App),
  store,
}).$mount('#app');
