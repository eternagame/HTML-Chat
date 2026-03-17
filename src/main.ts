import { createPinia } from 'pinia';
import { createApp } from 'vue';
import App from './App.vue';
import './style.scss';
import log from 'loglevel';

log.setLevel(import.meta.env.PROD ? 'info' : 'trace');

const pinia = createPinia();
const app = createApp(App);
app.use(pinia);
app.mount('#app');
