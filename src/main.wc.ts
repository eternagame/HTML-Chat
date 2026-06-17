import log from 'loglevel';
import { createPinia, setActivePinia } from 'pinia';
import { defineCustomElement } from 'vue';
import EternaChatApp from './AppWC.vue';
import styles from './style.scss?inline';
import { useChatStore } from '#stores';

log.setLevel(import.meta.env.PROD ? 'info' : 'trace');

const pinia = createPinia();
setActivePinia(pinia);

// Re-scoping Bootstrap to web component root
const scopedStyles = styles.replace(/:root/g, ':host');
const EternaChat = defineCustomElement(EternaChatApp, { styles: [scopedStyles] });
function register() {
  customElements.define('eterna-chat', EternaChat);
}

const chat = useChatStore();
const sendMessage = (message: string) => chat.handleUserInput(message, true);

export { EternaChat, register, sendMessage };
