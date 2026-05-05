import log from 'loglevel';
import { createPinia, setActivePinia } from 'pinia';
import { defineCustomElement } from 'vue';
import EternaChat from './AppWC.vue';
import styles from './style.scss?inline';

log.setLevel(import.meta.env.PROD ? 'info' : 'trace');

const pinia = createPinia();
setActivePinia(pinia);

// Re-scoping Bootstrap to web component root
const scopedStyles = styles.replace(/:root/g, ':host');
const EternaChatElement = defineCustomElement(EternaChat, { styles: [scopedStyles] });
customElements.define('eterna-chat', EternaChatElement);
