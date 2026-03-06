import type { User } from '#models';
import { createNick } from '#utils';
import { useLocalStorage } from '@vueuse/core';
import { Client } from 'irc-framework';
import Connection from 'irc-framework/src/transports/websocket';
import log from 'loglevel';
import { defineStore } from 'pinia';
import { computed, ref, shallowRef } from 'vue';

export interface InitClientConfig {
  username: string;
  uid: string;
}

export class CustomConnection extends Connection {
  override writeLine(line: string, cb: () => void): void {
    super.writeLine(`${line}\r\n`, cb);
  }
}

const useIrcStore = defineStore('irc', () => {
  const client = shallowRef<Client | null>(null);
  const savedUser = useLocalStorage<Record<'username' | 'uid', string> | null>('chat_user', null);

  const currentUser = ref<User>({
    username: '',
    uid: '',
    away: false,
    awayReason: '',
    nicks: [],
  });
  const currentNick = ref('');
  const isRegistered = ref(false);

  function initClient(username: string, uid: string) {
    if (client.value) {
      return;
    }

    const nick = createNick(username);
    currentNick.value = nick;
    currentUser.value.nicks.push(nick);
    currentUser.value.username = username;
    currentUser.value.uid = uid;

    client.value = new Client({
      host: import.meta.env.VITE_APP_SERVER_URL!,
      ssl: import.meta.env.VITE_APP_SSL === 'true',
      nick,
      username,
      transport: CustomConnection,
    })
      .on('nick in use', (event) => {
        // Remove used nick
        currentUser.value.nicks.splice(currentUser.value.nicks.indexOf(event.nick));
        currentNick.value = '';

        // Retry connection with new nickname
        quit();
        initClient(username, uid);
      })
      .on('registered', () => {
        isRegistered.value = true;
      })
      .on('debug', (message) => {
        log.debug(message);
      })
      .on('raw', (event) => {
        log.debug(event);
      });
    client.value.connect();
  }

  /** Sign in with saved login (if remembered) */
  function autoSignIn() {
    if (savedUser.value) {
      initClient(savedUser.value.username, savedUser.value.uid);
    }
  }

  function signIn(login: { username: string; uid: string; remember: boolean }) {
    if (login.remember) {
      savedUser.value = { username: login.username, uid: login.uid };
    }
    initClient(login.username, login.uid);
  }

  function signOut() {
    savedUser.value = null;
    quit();
  }

  function quit() {
    isRegistered.value = false;
    client.value?.quit();
    client.value = null;
  }

  return {
    client: computed(() => client.value),
    isConnected: computed(() => client.value !== null && isRegistered.value),
    initClient,
    quit,
    autoSignIn,
    signIn,
    signOut,
  };
});

export default useIrcStore;
