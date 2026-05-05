import log from 'loglevel';
import { createPinia } from 'pinia';
import { createApp } from 'vue';
import App from './App.vue';
import './style.scss';

log.setLevel(import.meta.env.PROD ? 'info' : 'trace');

const pinia = createPinia();
const app = createApp(App);
app.use(pinia);
app.mount('#app');
