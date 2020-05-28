import { ActionTree, MutationTree, CommitOptions } from 'vuex';
import * as Irc from 'irc-framework';
import {
  createModule, mutation, action, extractVuexModule,
} from 'vuex-class-component';
import toBool from 'to-bool';
import Vue from 'vue';
import { BroadcastChannel } from 'broadcast-channel';
import Message from '../types/message';
import Connection from '@/tools/websocket';
import BanStatus from '@/types/BanStatus';
import User from '@/types/user';
import SettingsModule from './settings.vuex';

// For polyfill
declare type BroadcastMessage = {
  message: string;
};

const VuexModule = createModule({
  strict: false,
});

interface Channel {
  postedMessages: Message[];
  name: string;
  banned: BanStatus;
  maxHistoryMessages: number;
  notifications: boolean;
  notificationsEnabled: boolean;
}

class ConnectionData {
  serverUrl!: string;

  ssl = false;

  connectionNumber = 0;

  firstConnection = true;

  connected = false;

  failedAttempts = 1;

  currentTimer = 0;

  timerInterval = -1;

  disconnectionTimers = [5, 10, 15, 30];

  get tryingToConnect() {
    return !this.connected && this.currentTimer <= 0;
  }
}

const channelNames = ['#general', '#off-topic', '#help', '#labs'] as const;

export default class ChatModule extends VuexModule {
  toBePosted: Message[] = [];

  currentUser!: User;

  nick!: string;

  connectionData = new ConnectionData();

  client?: Irc.Client;

  workbranch!: string;

  connectedUsers: {
    [username: string]: User | undefined;
  } = {};

  channels: {
    [channelName: string]: Channel | undefined;
  } = {};

  ignoredUsers: string[] = [];

  usersByNick: { [nick: string]: User } = {};

  tab: Number = 1; // Selected tab. One of the chat channels

  chatChannel: string = '#off-topic'; // Name of channel display in top bar

  slideoutOpen = false; // Whether slideout is open. Updated by App.vue

  broadcast: BroadcastChannel<BroadcastMessage>; // For communication between tabs/windows

  ignoredChannels: { [channel: string]: boolean };

  usernameColor: string = '';

  tabbing = false;

  customEmoticons = ['😜', '🤔', '😮'];

  constructor() {
    super();
    channelNames.forEach((channelName) => {
      this.channels[channelName] = {
        banned: BanStatus.BAN_STATUS_NORMAL,
        postedMessages: [],
        maxHistoryMessages: 50,
        name: channelName,
        notifications: false,
        notificationsEnabled: true,
      };
    });
    // Creates channel through which everything is sent
    this.broadcast = new BroadcastChannel('eterna');
    // Message handler
    this.broadcast.onmessage = (ev) => {
      /* The only messages sent between tabs are channel names.
      When a tab receives a message, it unignores the channel. */
      this.readChannel(ev.message);
    };
    this.ignoredChannels = {};
    channelNames.forEach((e) => {
      const channel = this.channels[e];
      this.ignoredChannels[e] = (channel as Channel)?.notificationsEnabled;
    });
  }

  channelWithName(name: string) {
    return this.channels[name];
  }

  @mutation
  readChannel(channel: string) {
    // Makes sure channel name corresponds to a channel
    const trueChannel = this.channels[channel];
    if (trueChannel) {
      // Set notifications for that channel to false
      trueChannel.notifications = false;
    }
    // When a channel is read, notify other tabs so they update
    this.broadcast.postMessage(new Message(channel));
  }

  @mutation
  notify(channel: string) {
    // Again, making sure there is an actual channel with the name
    const trueChannel = this.channels[channel];
    if (trueChannel) {
      // Turning on notifications for that channel
      trueChannel.notifications = true;
    }
  }

  @mutation
  postMessage(message: Message) {
    if (message.target === '*') {
      Object.values(this.channels).forEach((channel) => {
        channel?.postedMessages.push(message);
      });
    } else {
      this.channels[message.target]?.postedMessages.push(message);
    }
  }

  @mutation
  addUser({ nick, uid }: { nick: string; uid: string }) {
    const username = User.parseUsername(nick);
    if (!(username in this.connectedUsers)) {
      Vue.set(this.connectedUsers, username, new User(username, uid));
    }
    const user = this.connectedUsers[username];
    if (user) {
      user.nicks.push(nick);
    }
  }

  @mutation
  removeUser(nick: string) {
    const username = User.parseUsername(nick);
    const user = this.connectedUsers[username];
    if (!user) {
      console.error(`Tried to remove user ${nick} but they weren't in the users dictionary.}`);
      return;
    }
    const index = user.nicks.indexOf(nick);
    Vue.delete(user.nicks, index);
    if (user.nicks.length === 0) {
      Vue.delete(this.connectedUsers, user.username);
    }
  }

  @mutation
  openReportModal({
    message,
    defaults,
  }: {
    message: Message;
    defaults: { ignore: boolean; report: boolean };
  }) {
    // Subscribed to in the report modal file
  }

  @mutation
  unignoreUser(username: string) {
    if (this.ignoredUsers.includes(username)) {
      this.ignoredUsers.splice(this.ignoredUsers.indexOf(username), 1);
    }
    if (username === '*') this.ignoredUsers = [];
    localStorage.ignoredUsers = JSON.stringify(this.ignoredUsers);
  }

  @action()
  async init({ username, workbranch, uid }: { username: string; workbranch: string; uid: string }) {
    this.currentUser = new User(username, uid);
    this.workbranch = workbranch;

    if (localStorage) {
      if (localStorage.ignoredUsers) {
        try {
          this.ignoredUsers = JSON.parse(localStorage.ignoredUsers);
        } catch {
          console.error('Encountered an error while parsing the local data of ignored users');
        }
      }
      if (localStorage.ignoredChannels) {
        try {
          const ignored = JSON.parse(localStorage.ignoredChannels);
          Object.values(this.channels).forEach((e) => {
            const eAsChannel = e as Channel;
            eAsChannel.notificationsEnabled = ignored[eAsChannel.name];
          });
        } catch {
          console.error(
            'Encountered an error while parsing the local data of notifications settings',
          );
        }
      }
      if (localStorage.usernameColor) {
        try {
          this.usernameColor = localStorage.usernameColor;
        } catch {
          console.error(
            'Encountered an error while parsing the local data of username color',
          );
        }
      }
      if (localStorage.customEmoticons) {
        try {
          this.customEmoticons = JSON.parse(localStorage.customEmoticons);
        } catch {
          console.error(
            'Encountered an error while parsing the local data of custom emoticons',
          );
        }
      }
    }

    if (process.env.VUE_APP_SERVER_URL) {
      this.connectionData.serverUrl = process.env.VUE_APP_SERVER_URL;
    } else {
      console.error("VUE_APP_SERVER_URL wasn't found in the .env file!");
    }
    if (process.env.VUE_APP_SSL) {
      this.connectionData.ssl = toBool(process.env.VUE_APP_SSL);
    } else {
      console.error("VUE_APP_SSL wasn't found in the .env file!");
    }
    this.initClient();
  }

  @action()
  async initClient() {
    this.generateNick();
    const client = new Irc.Client({
      host: this.connectionData.serverUrl,
      nick: this.nick,
      username: this.currentUser.uid,
      gecos: this.currentUser.username,
      transport: Connection,
      ssl: this.connectionData.ssl,
    });
    client
      .on('registered', (e) => {
        Object.values(this.channels).forEach((c) => {
          const channel = client.channel(c!.name);
          channel.join();

          channel.updateUsers(() => {
            channel.users.forEach((user) => this.addUser({ nick: user.nick, uid: user.ident }));
          });
        });
        this.connectionData.failedAttempts = 0;
        this.connectionData.connected = true;
      })
      .on('join', (e) => this.addUser({ nick: e.nick, uid: e.ident }))
      .on('quit', (e) => this.removeUser(e.nick)) // TODO: Change the param
      .on('part', (e) => this.removeUser(e.nick)) // TODO: Change the param
      // TODO: Make it call another function once we implement joining specific channels
      .on('kick', this.userKicked) // TODO;
      .on('message', this.onMessageReceived)
      .on('notice', this.onMessageReceived)
      .on('mode', this.onModeMessageRecieved)
      .on('socket close', this.onDisconnect)
      .on('socket connected', () => {
        clearInterval(this.connectionData.timerInterval);
        this.connectionData.currentTimer = 0;
      })
      .on('nick in use', this.onNickInUse)
      .on('irc error', this.onIrcError);
    this.client = client;
    this.connect();
  }

  @action()
  async connect() {
    this.client!.connect();
    this.connectionData.currentTimer = 0;
    clearInterval(this.connectionData.timerInterval);
  }

  @action()
  async onNickInUse({ nick }: Irc.NickInvalidEventArgs) {
    this.currentUser.nicks.splice(this.currentUser.nicks.indexOf(nick));
    this.initClient();
  }

  @action()
  async generateNick() {
    const connectionId = Math.floor(Math.random() * 1000);
    const nick = `${this.currentUser.username}^${connectionId}`;
    this.currentUser.nicks.push(nick);
    this.nick = nick;
  }

  @action()
  async sendMessage({ rawMessage, channel }: { rawMessage: string; channel: string }) {
    const postMessage = (
      message: string,
      { user = User.annonymous, isHistory = false, isAction = false } = {},
    ) => {
      this.postMessage(new Message(message, channel, user, isAction));
    };
    let message = rawMessage.trim();
    let isAction = false;
    // No posting as annon or if nothing has been actually posted
    if (this.currentUser.username && message !== '') {
      let post = true;
      // Chat commands
      if (message.startsWith('/')) {
        post = false;
        let parts = message.match(/^\/([^ ]+)/);
        const command = parts ? parts[1] : '';
        parts = message.match(/^\/\w+ (.+)/);
        const params = parts ? parts[1] : '';
        const first = params.split(' ')[0];
        const second = params.split(' ')[1];
        switch (command) {
          case 'help':
            switch (params) {
              case 'me':
                postMessage('`/me`: Posts message formatted as an action');
                postMessage('Usage: `/me <message>`');
                postMessage('Example: `/me laughs`');
                break;
              case 'ignore':
                postMessage(
                  "`/ignore`: Don't show messages from a particular message. Show currently ignored users with `/ignore-list`. Unignore message with `/unignore.`",
                );
                postMessage('Usage: `/ignore <username>`');
                postMessage('Example: `/ignore player1`');
                break;
              case 'ignore-list':
                postMessage(
                  '`/ignore-list`: Shows currently ignored users. Ignore a user with `/ignore`. Unignore the user with `/unignore.` or use the settings tab in the slideout',
                );
                postMessage('Usage: `/ignore-list`');
                postMessage('Example: `/ignore-list`');
                break;
              case 'unignore':
                postMessage(
                  '`/unignore`: Shows messages from a previously ignored user. Unignores all users when argument is *. Ignore a user with `/ignore`. Show currently ignored users with /ignore-list. Alternatively, use the settings tab in the slideout.',
                );
                postMessage('Usage: `/unignore <username>`');
                postMessage('Example: `/unignore player1`');
                postMessage('Example: `/unignore *`');
                break;
              case 'change':
                postMessage(
                  '`/change`: Changes the current channel to the channel specified',
                );
                postMessage('Usage: `/change <channel>`');
                postMessage('Example: `/change general`');
                postMessage('Example: `/change #general`');
                break;
              case 'emoticon':
                postMessage(
                  '`/emoticon`: Changes the emoticon in one of the 3 custom emoticon slots. To see the current emoticons, click the emoticon icon the the menu under the text field or use the `/emoticon-list` command',
                );
                postMessage('Usage: `/emoticon <emoticon> <slot>`');
                postMessage('Example: `/emoticon 🐔 1`');
                break;
              case 'emoticon-list':
                postMessage(
                  '`/emoticon-list`: Lists the emoticons in the 3 custom emoticon slots',
                );
                postMessage('Usage: `/emoticon-list`');
                postMessage('Example: `/emoticon-list`');
                break;
              default:
                postMessage('Available commands: help, me, ignore, ignore-list, unignore, change, emoticon');
                postMessage('Type `/help <command>` for information on individual commands');
                postMessage('Example: `/help ignore`');
                postMessage(
                  'Additional commands available via LinkBot (see the [wiki](http://eternawiki.org/wiki/index.php5/HELP) for more information)',
                );
                break;
            }
            break;
          case 'disconnect':
            postMessage('Disconnecting...');
            this.onDisconnect();
            break;
          case 'spam':
            for (let i = 0; i < 100; i++) {
              postMessage(`Spam ${i}`);
            }
            break;
          case 'me':
            if (!params) {
              postMessage(
                'Please include command parameters. Type `/help me` for usage instructions',
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
                'Please include command parameters. Type `/help ignore` for more usage instructions',
              );
              break;
            }
            this.ignoreUser({ username: params });
            break;
          case 'ignore-list':
            postMessage(`Currently ignored users: ${this.ignoredUsers.join(', ') || 'none'}`);
            break;
          case 'unignore':
            if (!params) {
              postMessage(
                'Please include command parameters. Type `/help unignore` for more usage instructions',
              );
              break;
            }
            this.unignoreUser(params);
            break;
          case 'change':
            if (!params) {
              postMessage(
                'Please include command parameters. Type `/help change` for more usage instructions',
              );
              break;
            }
            /* There's a lot going on here.
             - channelNames.slice() returns a copy of the channelNames array
             - channelNames.slice() as [string] ensures that it can be indexed
             by any string, not just the specific channel names
             - `#${params}`.replace('##', '#') makes sure that the channel name has a # in front
             It adds one and then removes it if there are duplicates
             - .indexOf() gets the position of params in the array
             This gets the tab number.

             If the number is -1, the name was invalid. It gives an error message and a channel list
             If the number was not -1, the name worked. It sets the tab to the channel.
            */
            if ((channelNames.slice() as [string]).indexOf(`#${params}`.replace('##', '#')) === -1) {
              postMessage(`Channel name invalid. Channels are ${channelNames.join(', ')}`);
            } else {
              this.tab = (channelNames.slice() as [string]).indexOf(`#${params}`.replace('##', '#'));
              this.chatChannel = params;
            }
            break;
          case 'emoticon':
            if (!first || !second) {
              postMessage(
                'Please include command parameters. Type `/help emoticon` for more usage instructions',
              );
              break;
            } else if (parseInt(second, 10) > 3 || parseInt(second, 10) < 1) {
              postMessage('You have three custom emoticon slots. Type `/help emoticon` for more usage instructions');
              break;
            } else if (
              (JSON.parse(localStorage.customEmoticons) as string[]).some(e => e === first)) {
              postMessage('You already have that emoticon in a custom slot');
              break;
            } else if (!first.match(/(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/)) {
              postMessage('You may only add emoticons to custom slots');
              break;
            }
            // Changing the array elements with array[index] = newValue isn't reactive
            Vue.set(this.customEmoticons, (parseInt(second, 10) - 1), first);
            localStorage.customEmoticons = JSON.stringify(this.customEmoticons);
            break;
          case 'emoticon-list':
            postMessage(`Your custom emoticons are ${this.customEmoticons[0]} (slot 1), ${this.customEmoticons[1]} (slot 2), and ${this.customEmoticons[2]} (slot 3).`);
            break;
          default:
            postMessage('Invalid command. Type `/help` for more available commands');
            break;
        }
      }

      if (post && this.channels[channel] !== undefined) {
        if (!this.channels[channel]!.banned) {
          if (isAction) {
            this.client!.action(channel, `@test:123 ${message}`);
          } else {
            this.client!.say(channel, message);
          }
          const msg = new Message(message, channel, this.currentUser, isAction);
          if (this.usernameColor !== undefined && this.usernameColor !== '') {
            msg.tags['username-color'] = this.usernameColor;
          }
          this.postMessage(msg);
        } else {
          this.postMessage(new Message("Can't send messages because you are banned"));
        } // TODO
      }
    }
  }

  @action()
  async ignoreUser({ username, channel }: { username: string; channel?: string }) {
    if (!this.ignoredUsers.includes(username)) {
      this.ignoredUsers.push(username);
      localStorage.ignoredUsers = JSON.stringify(this.ignoredUsers);
      if (channel) {
        this.postMessage(
          new Message(
            `Ignored ${username}. To unignore this user, either use the options menu again (on a message or the user list) or type /unignore ${username}`,
            channel,
          ),
        );
      }
    } else if (channel) this.postMessage(new Message(`${username} has already been ignored`, channel));
  }

  @action()
  async reportUser({
    userToReport,
    message,
    reportComments,
  }: {
    userToReport: User;
    message: Message | null;
    reportComments: string;
  }) {
    const client = this.client!;
    client.say(
      '#ops-notifications',
      `[REPORT] Reporting ${userToReport.username} (${userToReport.uid}) by ${this.currentUser.username} (${this.currentUser.uid}).\r\n`,
    );
    if (message) {
      client.say('#ops-notifications', `[REPORTED MESSAGE] ${message.message}\r\n`);
    }
    client.say('#ops-notifications', `[REPORT REASON] ${reportComments}\r\n`);
  }

  @action()
  async userKicked(params: Irc.KickEventArgs) {
    const username = User.parseUsername(params.nick);
    if (username === this.currentUser.username) {
      const channel = this.channels[params.channel];
      if (channel) channel.banned = BanStatus.BAN_STATUS_BANNED;
      this.postMessage(
        new Message(`You have been kicked from chat${params.message ? ` - ${params.message}` : ''}`),
      );
    } else {
      this.removeUser(username);
    }
  }

  // TODO: Insert messages based on id order
  @action()
  async onMessageReceived({
    message, nick, tags, time, type, target,
  }: Irc.MessageEventArgs) {
    const channel = this.channels[target];
    if (!channel) return;
    // Notifications should come in if slideout is open, user is in a different channel, or both
    if ((this.slideoutOpen || channel.name !== this.chatChannel) && channel.notificationsEnabled) {
      // Notify the channel
      this.notify(channel.name);
    } else {
      // If the user is in the channel and the slideout is closed
      this.readChannel(channel.name); // Set the channel to read
    }
    const username = User.parseUsername(nick);
    const messageObject = new Message(
      message,
      target,
      this.connectedUsers[username],
      type === 'action',
      time,
    );
    if (time) {
      const { postedMessages } = channel;
      // +1 in case the messages arrive out of order
      const maxMessages = Math.min(channel.maxHistoryMessages + 1, postedMessages.length);
      for (let i = 0; i < maxMessages; i++) {
        const historyMessage = postedMessages[postedMessages.length - 1 - i];
        if (
          historyMessage.message === message
          && historyMessage.time.getTime() - messageObject.time.getTime() < 1000
        ) {
          return;
        }
      }
    }
    this.postMessage(messageObject);
  }

  // TODO
  @action()
  async onUserQuit(message: any) {
    this.removeUser(message);
  }

  @action()
  async onModeMessageRecieved(event: Irc.ModeEventArgs) {
    event.modes.forEach((mode) => {
      let mute = false;
      if (mode.param && mode.param.startsWith('m;')) {
        mute = true;
        mode.param = mode.param.substr(2);
      }
      // Check if message has been either banned or muted, if so disable input and notify in chat
      if (mode.mode === '+b') {
        const maskUser = mode.param.match(/(.+)!.+/)![1];
        if (this.nick.match(new RegExp(maskUser.replace('*', '.+').replace('^', '\\^')))) {
          if (mute) {
            this.onMuted(event.target);
          } else {
            this.onBanned(event.target);
          }
        }
      } else if (mode.mode === '-b') {
        const maskUser = mode.param.match(/(.+)!.+/)![1];
        if (this.nick.match(new RegExp(maskUser.replace('*', '.+').replace('^', '\\^')))) {
          this.onUnbanned(event.target);
        }
      }
    });
  }

  @action()
  async onIrcError(error: Irc.IrcErrorEventArgs) {
    console.error('IRC Error:', error);
    if (error.reason.indexOf('+m') !== -1) {
      this.onMuted(error.channel);
    } else {
      this.onBanned('onBanned');
    }
  }

  @action()
  async onBanned(channelName: string) {
    const channel = this.channels[channelName];
    if (!channel) return;
    if (!channel.banned) {
      this.postMessage(new Message('You have been banned', channelName));
    }
    channel.banned = BanStatus.BAN_STATUS_BANNED;
    Object.values(this.channels).forEach((c) => {
      if (c) c.banned = BanStatus.BAN_STATUS_BANNED;
    });
  }

  @action()
  async onMuted(channelName: string) {
    const channel = this.channels[channelName];
    if (!channel) return;
    if (!channel.banned) {
      this.postMessage(new Message('You have been muted', channelName));
    }
    channel.banned = BanStatus.BAN_STATUS_QUIET;
  }

  @action()
  async onUnbanned(channelName: string) {
    const channel = this.channels[channelName];
    if (!channel) return;
    channel.banned = BanStatus.BAN_STATUS_NORMAL;
    this.postMessage(new Message('You are now allowed to post in chat', channelName));
  }

  @action()
  async onDisconnect() {
    const data = this.connectionData;
    if (data.currentTimer > 0) return;
    // TODO: What if connect is called and then immidiately a late "onDisconnect" arives?
    data.connected = false;
    data.firstConnection = false;
    if (data.failedAttempts === 0) {
      data.failedAttempts += 1;
      this.connect();
    } else {
      data.currentTimer = data.disconnectionTimers[Math.min(data.failedAttempts - 1, 3)];
      data.failedAttempts += 1;
      clearInterval(data.timerInterval);
      data.timerInterval = setInterval(this.updateTimer, 1000);
    }
  }

  @action()
  async updateTimer() {
    this.connectionData.currentTimer -= 1;
    if (this.connectionData.currentTimer <= 0) {
      this.connect();
    }
  }
}

export { Channel };
