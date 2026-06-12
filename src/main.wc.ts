import log from 'loglevel';
import { createPinia, setActivePinia } from 'pinia';
import { defineCustomElement } from 'vue';
import EternaChatApp from './AppWC.vue';
import styles from './style.scss?inline';

log.setLevel(import.meta.env.PROD ? 'info' : 'trace');

const pinia = createPinia();
setActivePinia(pinia);

// Re-scoping Bootstrap to web component root
const scopedStyles = styles.replace(/:root/g, ':host');
const EternaChat = defineCustomElement(EternaChatApp, { styles: [scopedStyles] });
function register() {
  customElements.define('eterna-chat', EternaChat);
}

export { EternaChat, register };
