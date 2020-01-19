import { ActionTree } from 'vuex';
import Irc from 'irc-framework';
import { State } from './state';
import Message from '../types/message';
import Connection from './websocket';
import BanStatus from '@/types/BanStatus';
import User from '@/types/user';

const actions: ActionTree<State, any> = {
  init({ state, dispatch }, { username, workbranch, uid }:
                  { username: string, workbranch: string, uid: string }) {
    state.currentUser = new User(username, uid);
    state.workbranch = workbranch;
    dispatch('initClient');
  },

  initClient({
    state, commit, dispatch,
  }) {
    dispatch('generateNick');
    const client = new Irc.Client({
      host: state.connectionData.serverUrl,
      nick: state.nick,
      username: state.currentUser.uid,
      gecos: state.currentUser.username,
      transport: Connection,
      ssl: state.connectionData.ssl,
    });
    client.on('registered', (e) => {
      state.channels.forEach((channelName) => {
        const channel = client.channel(channelName);
        channel.join();

        channel.updateUsers(() => {
          channel.users.forEach(user => commit('addUser', { nick: user.nick, uid: user.ident }));
        });
      });
      state.connectionData.failedAttempts = 0;
      commit('setConnected', { connected: true });
    });

    client.on('join', (e) => {
      commit('addUser', { nick: e.nick, uid: e.ident });
    });
    client.on('quit', (e) => {
      commit('removeUser', { nick: e.nick });
    }); // TODO: Change the param
    client.on('part', (e) => {
      commit('removeUser', { nick: e.nick });
    }); // TODO: Change the param
    // TODO: Make it call another function once we implement joining specific channels (!!!!!)
    client.on('kick', e => dispatch('userKicked', { data: e })); // TODO;

    client.on('message', (event) => {
      dispatch('onMessageReceived', event);
    });
    client.on('notice', (event) => {
      dispatch('onMessageReceived', event);
    });
    client.on('mode', (event) => {
      dispatch('onModeMessageRecieved', event);
    });
    client.on('socket close', () => {
      dispatch('onDisconnect');
    });
    client.on('socket connected', () => {
      clearInterval(state.connectionData.timerInterval);
      state.connectionData.currentTimer = 0;
    });
    client.on('nick in use', (event) => {
      dispatch('onNickInUse', event);
    });
    client.on('irc error', (event) => {
      dispatch('onIrcError', event);
    });
    state.client = client;
    dispatch('connect');
  },

  connect({ state, commit, dispatch }) {
    state.client!.connect();
    state.connectionData.currentTimer = 0;
    clearInterval(state.connectionData.timerInterval);
  },

  onNickInUse({ state, commit, dispatch }, { nick, reason }: Irc.NickInvalidEventArgs) {
    state.currentUser.nicks.splice(state.currentUser.nicks.indexOf(nick));
    dispatch('initClient');
  },

  generateNick({ state }) {
    const connectionId = Math.floor(Math.random() * 1000);
    const nick = `${state.currentUser.username}^${connectionId}`;
    state.currentUser.nicks.push(nick);
    state.nick = nick;
  },

  sendMessage(
    { state, commit, dispatch },
    { message: rawMessage, channel }: { message: string; channel: string },
  ) {
    function postMessage(
      message: string,
      { user = User.annonymous, isHistory = false, isAction = false } = {},
    ) {
      commit('postMessage', {
        message: new Message(message, channel, user, isAction),
      });
    }

    let message = rawMessage.trim();
    let isAction = false;
    // No posting as annon or if nothing has been actually posted
    if (state.currentUser.username && message !== '') {
      let post = true;
      // Chat commands
      if (message.startsWith('/')) {
        post = false;
        let parts = message.match(/^\/([^ ]+)/);
        const command = parts ? parts[1] : '';
        parts = message.match(/^\/\w+ (.+)/);
        const params = parts ? parts[1] : '';
        switch (command) {
          case 'help':
            switch (params) {
              case 'me':
                postMessage('/me: Posts message formatted as an action');
                postMessage('Usage: /me <message>');
                postMessage('Example: /me laughs');
                break;
              case 'ignore':
                postMessage(
                  "/ignore: Don't show messages from a particular message. Show currently ignored users with /ignore-list. Unignore message with /unignore.",
                );
                postMessage('Usage: /ignore <username>');
                postMessage('Example: /ignore player1');
                break;
              case 'ignore-list':
                postMessage(
                  '/ignore-list: Shows currently ignored users. Ignore a message with /ignore. Unignore message with /unignore.',
                );
                postMessage('Usage: /ignore-list');
                postMessage('Example: /ignore-list');
                break;
              case 'unignore':
                postMessage(
                  '/unignore: Shows messages from a message after being igored. Unignores all users when username is *. Ignore a message with /ignore. Show currently ignored users with /ignore-list.',
                );
                postMessage('Usage: /unignore <username>');
                postMessage('Example: /unignore player1');
                postMessage('Example: /unignore *');
                break;
              default:
                postMessage('Available commands: help, me, ignore, ignore-list, unignore');
                postMessage('Type /help <command> for information on individual commands');
                postMessage('Example: /help ignore');
                postMessage(
                  'Additional commands available via LinkBot (see the [wiki](http://eternawiki.org/wiki/index.php5/HELP) for more information)',
                );
                break;
            }
            break;
          case 'disconnect':
            postMessage('Disconnecting...');
            dispatch('onDisconnect');
            break;
          case 'spam':
            for (let i = 0; i < 100; i++) { postMessage(`Spam ${i}`); }
            break;
          case 'me':
            if (!params) {
              postMessage(
                'Please include command parameters. Type /help me for usage instructions',
              );
              break;
            }
            isAction = true;
            post = true;
            message = params;
            break;
          case 'ignore':
            if (!params) {
              postMessage(
                'Please include command parameters. Type /help ignore for more usage instructions',
              );
              break;
            }
            dispatch('ignoreUser', { username: params, channel });
            break;
          case 'ignore-list':
            postMessage(`Currently ignored users: ${state.ignoredUsers.join(', ') || 'none'}`);
            break;
          case 'unignore':
            if (!params) {
              postMessage(
                'Please include command parameters. Type /help unignore for more usage instructions',
              );
              break;
            }
            commit('unignoreUser', { username: params, channel });
            break;
          default:
            postMessage('Invalid command. Type /help for more available commands');
            break;
        }
      }

      if (post) {
        if (!state.banned[channel]) {
          if (isAction) {
            state.client!.action(channel, `@test:123 ${message}`);
          } else {
            state.client!.say(channel, message);
          }
          commit('postMessage', {
            message: new Message(message, channel, state.currentUser, isAction),
          });
        } else {
          commit('postedMessage', {
            message: new Message("Can't send messages because you are banned"),
          });
        } // TODO
      }
    }
  },

  ignoreUser(
    { state, commit, dispatch },
    { username, channel }: { username: string; channel: string },
  ) {
    if (!state.ignoredUsers.includes(username)) {
      state.ignoredUsers.push(username);
      commit('postMessage', {
        message: new Message(
          `Ignored ${username}. To unignore this user, either use the options menu again (on a message or the user list) or type /unignore ${username}`,
          channel,
        ),
      });
    } else {
      commit('postMessage', {
        message: new Message(`${username} has already been ignored`, channel),
      });
    }
  },

  reportUser({ state }, { userToReport, message, reportComments } :
                        { userToReport: User, message: Message | null, reportComments: string }) {
    const client = state.client!;
    client.say(
      '#ops-notifications',
      `[REPORT] Reporting ${userToReport.username} (${
        userToReport.uid
      }) by ${state.currentUser.username} (${
        state.currentUser.uid
      }).\r\n`,
    );
    if (message) {
      client.say(
        '#ops-notifications',
        `[REPORTED MESSAGE] ${message.message}\r\n`,
      );
    }
    client.say(
      '#ops-notifications',
      `[REPORT REASON] ${reportComments}\r\n`,
    );
  },

  userKicked(
    { state, commit, dispatch },
    {
      params,
    }: {
      params: Irc.KickEventArgs;
    },
  ) {
    const username = User.parseUsername(params.nick);
    if (username === state.currentUser.username) {
      state.banned[params.channel] = BanStatus.BAN_STATUS_BANNED;
      commit('postMessage', {
        message: new Message(
          `You have been kicked from chat${params.message ? ` - ${params.message}` : ''}`,
        ),
      });
    } else {
      commit('removeUser', { username });
    }
  },

  // TODO: Insert messages based on id order
  onMessageReceived(
    { state, commit, dispatch },
    {
      message, nick, tags, time, type, target,
    }: Irc.MessageEventArgs,
  ) {
    if (!(target in state.postedMessages)) return;
    const username = User.parseUsername(nick);
    const messageObject = new Message(message, target, state.connectedUsers[username], type === 'action', time);
    const postedMessages = state.postedMessages[target];
    const maxMessages = Math.min(state.maxHistoryMessages[target] + 1, postedMessages.length);
    // +1 in case the messages arrive out of order
    if (time) {
      for (let i = 0; i < maxMessages; i++) {
        const historyMessage = postedMessages[postedMessages.length - 1 - i];
        if (historyMessage.message === message
              && historyMessage.time.getTime() - messageObject.time.getTime() < 1000) {
          return;
        }
      }
    }
    commit('postMessage', {
      message: messageObject,
    });
  },

  onUserQuit(
    { state, commit, dispatch },
    {
      message,
    }: {
      message: any;
    },
  ) {
    commit('removeUser', { username: message });
  },

  onModeMessageRecieved({ state, commit, dispatch }, event: Irc.ModeEventArgs) {
    event.modes.forEach((mode) => {
      let mute = false;
      if (mode.param && mode.param.startsWith('m;')) {
        mute = true;
        mode.param = mode.param.substr(2);
      }
      // Check if message has been either banned or muted, if so disable input and notify in chat
      if (mode.mode === '+b') {
        const maskUser = mode.param.match(/(.+)!.+/)![1];
        if (state.nick.match(new RegExp(maskUser.replace('*', '.+').replace('^', '\\^')))) {
          dispatch(mute ? 'onMuted' : 'onBanned', { channel: event.target });
        }
      } else if (mode.mode === '-b') {
        const maskUser = mode.param.match(/(.+)!.+/)![1];
        if (state.nick.match(new RegExp(maskUser.replace('*', '.+').replace('^', '\\^')))) {
          dispatch('onUnbanned', { channel: event.target });
        }
      }
    });
  },

  onIrcError({ state, commit, dispatch }, { error, channel, reason }: Irc.IrcErrorEventArgs) {
    if (reason.indexOf('+m') !== -1) {
      dispatch('onMuted', { channel });
    } else {
      dispatch('onBanned', { channel });
    }
  },

  onBanned({ state, commit }, { channel }: { channel: string }) {
    if (!state.banned[channel]) {
      commit('postMessage', { message: new Message('You have been banned', channel) });
    }
    state.banned[channel] = BanStatus.BAN_STATUS_BANNED;
  },

  onMuted({ state, commit }, { channel }: { channel: string }) {
    if (!state.banned[channel]) {
      commit('postMessage', { message: new Message('You have been muted', channel) });
    }
    state.banned[channel] = BanStatus.BAN_STATUS_QUIET;
  },

  onUnbanned({ state, commit }, { channel }: {channel: string}) {
    state.banned[channel] = BanStatus.BAN_STATUS_NORMAL;
    commit('postMessage', {
      message: new Message('You are now allowed to post in chat', channel),
    });
  },

  onDisconnect({ state, dispatch, commit }) {
    const data = state.connectionData;
    if (data.currentTimer > 0) return;
    // TODO: What if connect is called and then immidiately a late "onDisconnect" arives?
    commit('setConnected', { connected: false });
    commit('setFirstConnection', { firstConnection: false });
    if (data.failedAttempts === 0) {
      data.failedAttempts += 1;
      dispatch('connect');
    } else {
      data.currentTimer = data.disconnectionTimers[Math.min(data.failedAttempts - 1, 3)];
      data.failedAttempts += 1;
      clearInterval(data.timerInterval);
      data.timerInterval = setInterval(() => dispatch('updateTimer'), 1000);
    }
  },

  updateTimer({ state, commit, dispatch }) {
    commit('connectionTimerTick');
    if (state.connectionData.currentTimer <= 0) {
      dispatch('connect');
    }
  },
};

export default actions;