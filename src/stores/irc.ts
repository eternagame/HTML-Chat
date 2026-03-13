import type { ConnectionStatus, ReconnectionStatus, User } from '#models';
import { createNick } from '#utils';
import { useCountdown, useLocalStorage } from '@vueuse/core';
import { Client } from 'irc-framework';
import Connection from 'irc-framework/src/transports/websocket';
import log from 'loglevel';
import { defineStore } from 'pinia';
import { computed, markRaw, reactive, readonly, ref, shallowRef } from 'vue';

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
  /**
   * Tracking if the client has started the connection.
   * Keeps the chat view visible until client manually signs out.
   */
  const isInitialized = ref(false);
  const client = shallowRef<Client | null>(null);
  const savedUser = useLocalStorage<Record<'username' | 'uid', string> | null>('chat_user', null);

  const currentUser = reactive<User>({
    username: '',
    uid: '',
    away: false,
    awayReason: '',
    nicks: new Set<string>(),
  });
  const currentNick = ref('');
  const isRegistered = ref(false);
  const connectionStatus = ref<ConnectionStatus>('disconnected');
  const reconnectCountdown = useCountdown(0);
  const reconnectStatus = reactive<ReconnectionStatus>({
    isReconnecting: false,
    retryCount: 0,
    maxRetryCount: 0,
  });

  function initClient(username: string, uid: string) {
    if (client.value) {
      return;
    }

    const nick = createNick(username);
    currentNick.value = nick;
    currentUser.nicks.add(nick);
    currentUser.username = username;
    currentUser.uid = uid;

    const ircClient = new Client({
      host: import.meta.env.VITE_APP_SERVER_URL!,
      ssl: import.meta.env.VITE_APP_SSL === 'true',
      nick,
      username: uid,
      gecos: username,
      transport: CustomConnection,
    })
      .on('nick in use', (event) => {
        // Remove used nick
        currentUser.nicks.delete(event.nick);
        currentNick.value = '';

        // Retry connection with new nickname
        quit();
        initClient(username, uid);
      })
      .on('connecting', () => {
        connectionStatus.value = 'connecting';
      })
      .on('registered', () => {
        isRegistered.value = true;
      })
      .on('connected', () => {
        connectionStatus.value = 'connected';
        reconnectStatus.isReconnecting = false;
        reconnectCountdown.stop();
      })
      .on('reconnecting', (event) => {
        reconnectStatus.isReconnecting = true;
        reconnectStatus.retryCount = event.attempt;
        reconnectStatus.maxRetryCount = event.max_retries;
        reconnectCountdown.start(event.wait / 1_000);
      })
      .on('close', () => {
        connectionStatus.value = 'reconnect failed';
        reconnectStatus.isReconnecting = false;
      })
      .on('debug', (message) => {
        log.debug(message);
      })
      .on('raw', (event) => {
        log.debug(event);
      });

    ircClient.connect();
    client.value = markRaw(ircClient);
    isInitialized.value = true;
    console.log('IRC Client:', ircClient);
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

  function quit() {
    isRegistered.value = false;
    connectionStatus.value = 'disconnected';
    client.value?.quit();
    client.value = null;
  }

  function signOut() {
    savedUser.value = null;
    isInitialized.value = false;
    quit();
  }

  return {
    isInitialized: readonly(isInitialized),
    client: computed(() => (isRegistered.value ? client.value : null)),
    isConnected: computed(
      () => isRegistered.value && client.value !== null && connectionStatus.value === 'connected',
    ),
    connectionStatus: readonly(connectionStatus),
    reconnectStatus: readonly(reconnectStatus),
    reconnectCountdown: readonly(reconnectCountdown.remaining),
    currentUser: readonly(currentUser),
    quit,
    autoSignIn,
    signIn,
    signOut,
  };
});

export default useIrcStore;
