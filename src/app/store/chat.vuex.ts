import {
  ActionTree, MutationTree, CommitOptions, Store,
} from 'vuex';
import * as Irc from 'irc-framework';
import {
  createModule, mutation, action, extractVuexModule, createProxy,
} from 'vuex-class-component';
import toBool from 'to-bool';
import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';
import { BroadcastChannel } from 'broadcast-channel';
import Message from '../types/message';
import Connection from '@/tools/websocket';
import BanStatus from '@/types/BanStatus';
import User from '@/types/user';
import Ban from '@/types/Ban';
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
  mentioned: boolean,
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

// eslint-disable-next-line prefer-const
let channelNames = ['#general', '#off-topic', '#help', '#labs', '#test'];

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

  tab: Number = 0; // Selected tab. One of the chat channels

  chatChannel: string = '#general'; // Name of channel display in top bar

  slideoutOpen = false; // Whether slideout is open. Updated by App.vue

  broadcast: BroadcastChannel<BroadcastMessage>; // For communication between tabs/windows

  ignoredChannels: { [channel: string]: boolean };

  usernameColor: string = '';

  // Whether user has clicked the tab key - used for enabling outlines for accesibility
  tabbing = false;

  customEmoticons = ['😜', '🤔', '😮'];

  oper = false; // Whether user is logged in as oper

  operLoginUser = ''; // Oper login credentials

  operLoginPassword = '';

  auth = false; // When oper login modal should show

  userToPrivMsg = ''; // User being private messaged

  privMsgModal = false; // Whether to show the private message modal

  updateMessage = ''; // The updated message to be put in the input when the user has pressed the up arrow

  inputUpdate = false; // Whether the user has pressed the up arrow and the input should be updated

  rawHistoryMessages: string[] = []; // Stores history messages

  initialPosition: [number, number] = [0, 0];

  inGamePosition: [string, number, string, number] = ['l', 0, 't', 0];

  initialSize: [number, number] = [400, 500];

  customNick !: string; // Custom nick for oper

  notificationsKeywords!: string[]; // Keywords that trigger notifications

  autoUpdateStatus = true; // If away/online status should update when the tab is focused

  focused = false;

  disconnected = false; // If the user intentionally disconnected

  desktopNotifications = false;

  constructor() {
    super();
    channelNames.forEach((channelName) => {
      this.channels[channelName] = {
        banned: BanStatus.BAN_STATUS_NORMAL,
        postedMessages: [],
        maxHistoryMessages: 50,
        name: channelName,
        notifications: false,
        mentioned: false,
        notificationsEnabled: true,
      };
    });
    // Creates channel through which everything is sent
    this.broadcast = new BroadcastChannel('eterna-chat');
    // Message handler
    this.broadcast.onmessage = (ev) => {
      /* The only messages sent between tabs are channel names.
      When a tab receives a message, it unignores the channel. */
      this.readChannel(`!${ev.message}`);
    };
    this.ignoredChannels = {};
    channelNames.forEach((e) => {
      const channel = this.channels[e];
      this.ignoredChannels[e] = (channel as Channel)?.notificationsEnabled;
    });
  }

  /**
   * Sets a channel as 'read', clearing notifications and syncing with other tabs
   * @param channel {string} - The channel to be read
   */
  @mutation
  readChannel(channel: string) {
    if (channel.startsWith('!')) { // If it came from BroadcastChannel
      const trueChannel = this.channels[channel.substring(1)];
      if (trueChannel) {
        // Set notifications for that channel to false
        trueChannel.notifications = false;
        trueChannel.mentioned = false;
      }
    } else {
      const trueChannel = this.channels[channel];
      if (trueChannel) {
        // Set notifications for that channel to false
        trueChannel.notifications = false;
        trueChannel.mentioned = false;
      }
      /* Only relay the message if it didn't come from BroadcastChannel
      so there isn't a loop of messages */
      this.broadcast.postMessage(new Message(channel));
    }
  }

  /**
   * Turns notifications on for a channel
   * @param channel {string} - The channel notifications should be turned on for
   */
  @mutation
  notify(channel: string) {
    // Again, making sure there is an actual channel with the name
    const trueChannel = this.channels[channel];
    if (trueChannel) {
      // Turning on notifications for that channel
      trueChannel.notifications = true;
      if (this.desktopNotifications) {
        const msg = trueChannel.postedMessages[trueChannel.postedMessages.length - 1];
        const notification = new Notification(`New message in ${channel}`, {
          body: `${msg.user.username}: ${msg.message}`,
          tag: `new-message-${msg.target}`,
        });
      }
    }
  }

  /**
   * Sets a channel as mentioned (the user's username is mentioned in an unread message)
   * @param channel {string} - The channel notifications should be turned on for
   */
  @mutation
  mention(channel: string) {
    // Again, making sure there is an actual channel with the name
    const trueChannel = this.channels[channel];
    if (trueChannel) {
      // Turning on notifications for that channel
      trueChannel.mentioned = true;
    }
  }

  @mutation
  postMessage(message: Message) {
    if (message.target === '*') {
      Object.values(this.channels).forEach((channel) => {
        channel?.postedMessages.push(message);
        this.channels[message.target]?.postedMessages.slice(0, 50);
      });
    } else {
      this.channels[message.target]?.postedMessages.push(message);
      this.channels[message.target]?.postedMessages.slice(0, 50);
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
      if (localStorage.position) {
        try {
          const data = JSON.parse(localStorage.position);
          const values = data.split(' '); // Gets X and Y
          const midpoint = [window.innerWidth / 2, window.innerHeight / 2]; // Gets center
          const point = [Number(values[0]), Number(values[1])];
          // Gets position relative to center
          this.initialPosition = [midpoint[0] - point[0], midpoint[1] - point[1]];
        } catch {
          console.error(
            'Encountered an error while parsing the local data of chat location',
          );
        }
      }
      if (localStorage.gamePosition) {
        try {
          this.inGamePosition = JSON.parse(localStorage.gamePosition);
        } catch {
          console.error(
            'Encountered an error while parsing the local data of in-game chat location',
          );
        }
      }
      if (localStorage.size) {
        try {
          const data = JSON.parse(localStorage.size);
          const values = data.split(' '); // Gets width and height
          this.initialSize = [values[0], values[1]];
        } catch {
          console.error(
            'Encountered an error while parsing the local data of chat size',
          );
        }
      }
      if (localStorage.nick) {
        try {
          this.customNick = localStorage.nick;
        } catch {
          console.error(
            'Encountered an error while parsing the local data of custom nick',
          );
        }
      }
      if (localStorage.notificationsKeywords) {
        try {
          this.notificationsKeywords = JSON.parse(localStorage.notificationsKeywords);
        } catch {
          console.error(
            'Encountered an error while parsing the local data of notifications keywords',
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
    setInterval(this.updateUserStatus, 5000);
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
      .on('notice', this.onNoticeReceived)
      .on('mode', this.onModeMessageRecieved)
      .on('socket close', this.onDisconnect)
      .on('socket connected', () => {
        clearInterval(this.connectionData.timerInterval);
        this.connectionData.currentTimer = 0;
      })
      .on('nick in use', this.onNickInUse)
      .on('irc error', this.onIrcError)
      .on('raw', (e) => {
        if (e.from_server) {
          const commandNumber = parseInt(e.line.substring(20, 23), 10);
          if (e.line.match(/^:irc\.eternagame\.org .+\^\d{3} #*.* /)) {
            switch (commandNumber) { // Might be useful in the future
              default: break;
            }
          }
          if (e.line.startsWith('@server-time')) { // Indicates a message containing history
            this.rawHistoryMessages.push(e.line); // Add it to the list
          }
        }
      });
    this.client = client;
    this.connect();
  }

  /**
   * Loads messages from history for a channel
   * @param channel {string} - The channel history messages should be loaded for
   */
  @action()
  async loadMessagesForChannel(channel:string) {
    // For all raw messages for the given channel
    this.rawHistoryMessages.filter(e => e.split(' ')[3] === channel).forEach(e => {
      this.processAndPost(e);
    });
  }

  /**
   * Takes in a raw string from the server and parses it into a history message that it then posts
   * @param raw - The raw string to parse and post to the chat
   */
  @action()
  async processAndPost(raw:string) {
    const str = raw;
    const parts = str.split(' ');
    const time = parts[0].substring(13, 37);
    const channel = parts[3];
    // eslint-disable-next-line no-control-regex
    let message = str.substring(str.indexOf(channel) + channel.length + 2).replace(/\u0001/g, '').trim();
    if (this.notificationsKeywords) {
      this.notificationsKeywords.forEach(n => {
        message = message.replace(` ${n}`, ` **${n}**`);
      });
    }
    const user = parts[1].substring(1, parts[1].indexOf('@'));
    const username = user.substring(0, user.lastIndexOf('!'));
    const uid = user.substring(user.lastIndexOf('!') + 1);
    const date = new Date(time);
    const msg = new Message(message.replace('ACTION ', ''), channel, new User(User.parseUsername(username), uid), message.includes('ACTION'));
    msg.time = date;
    this.postMessage(msg);
  }

  /**
   * Sets +o for all nicks for all channels
   */
  @action()
  async setChannelOps() {
    // This.connectedUsers[this.currentUser.username].nicks returns a list of the user's nicks
    // Converting the array to a set and then back removes duplicates
    // Iterates through to make sure each nick for the user has proper permissions
    Array.from(new Set(this.connectedUsers[this.currentUser.username]?.nicks)).forEach(i => {
      // Iterates through all channels
      channelNames.forEach(e => this.client?.raw(`SAMODE ${e} +o ${i}`));
    });
  }

  /**
   * Sends the OPER command to log the user in as an operator
   */
  @action()
  async operCommand() {
    if (!this.oper) {
      this.client?.raw(`OPER ${this.operLoginUser} ${this.operLoginPassword}`);
      this.setChannelOps();
      this.joinOpsChannel();
    }
  }

  /**
   * Joins the #ops-notifications channel
   */
  @action()
  async joinOpsChannel() {
    this.client?.join('#ops-notifications');
  }

  @action()
  async connect() {
    this.disconnected = false;
    this.client!.connect();
    (Object.values(this.channels) as Channel[]).forEach(e => { // Removes disconnecting message
      e.postedMessages = e.postedMessages.filter(m => m.message !== 'Disconnecting...');
    });
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
    let nick = `${this.currentUser.username}^${connectionId}`;
    if (this.customNick) {
      nick = `${this.customNick}^${connectionId}`;
    }
    this.currentUser.nicks.push(nick);
    this.nick = nick;
  }

  @action()
  async sendMessage({ rawMessage, channel }: { rawMessage: string; channel: string }) {
    const postMessage = (
      message: string,
      {
        user = User.annonymous, isHistory = false, isAction = false,
      } = {},
    ) => {
      this.postMessage(new Message(message, channel, user, isAction));
    };
    let message = rawMessage.trim() // Replaces text emoticons with Unicode emoji
      .replace(':)', '🙂')
      .replace('(:', '🙂')
      .replace('):', '🙁')
      .replace(':(', '🙁');
    message = `${message} [${this.usernameColor}]`; // Message with tags added on
    let isAction = false;
    // No posting as annon or if nothing has been actually posted
    if (this.currentUser.username && message.replace(/ \[#.*\]\r?$/, '').trim() !== '') {
      let post = true;
      let banned = false;
      let quieted = false;
      this.client?.banlist(channel, (e) => { // Check if user is banned before sending message
        const bans = e.bans.map(i => new Ban(i.banned, i.channel)); // Make an array of Ban objects
        // If the user is banned
        if (bans.some(b => b.username.includes(this.currentUser.username))) {
          const userBans = bans.filter(b => b.username.includes(this.currentUser.username));
          if (userBans.some(b => b.username.includes('m;'))) { // If any bans are quiet bans
            quieted = true;
            this.onMuted(channel);
          }
          if (userBans.some(b => !b.username.includes('m;'))) { // If any bans are NOT quiet bans
            banned = true;
            this.onBanned(channel);
          }
        }
      });
      // Chat commands
      if (message.startsWith('/')) {
        message = message.replace(/ \[.+\]$/, '');
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
              case 'disconnect':
                postMessage('`/disconnect`: Disconnects you from the chat');
                postMessage('Usage: `/disconnect`');
                postMessage('Example: `/disconnect`');
                break;
              case 'ignore':
                postMessage(
                  "`/ignore`: Don't show messages from a particular user. Show currently ignored users with `/ignore-list`. Unignore user with `/unignore.`",
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
              case 'indicator':
                postMessage(
                  '`/indicator`: Changes the notifications indicator that appears in the page title when you have notifications',
                );
                postMessage('Usage: `/indicator <indicator>`');
                postMessage('Example: `/indicator (!)`');
                break;
              case 'size':
                postMessage(
                  '`/size`: Lists the emoticons in the 3 custom emoticon slots',
                );
                postMessage('size: `/size <fontsize>`');
                postMessage('size: `/size` 14');
                break;
              case 'keywords':
                postMessage(
                  '`/keywords`: Modifies or lists the keywords that trigger notifications. If no arguments are given, a list of keywords is returned. If the first command is add or remove, the second argument is added to or removed from the keywords list. If the first command is neither, the list of keywords is overwritten with the list provided as the second argument.',
                );
                postMessage('Usage: `/keywords [command] [keyword]`');
                postMessage('Example: `/keywords`');
                postMessage('Example: `/keywords add keyword1`');
                postMessage('Example: `/keywords keyword1, keyword2`');
                break;
              case 'notifications':
                postMessage(
                  '`notifications`: Modifies whether notifications are enabled in a channel or lists current notifications settings. If arguments not given, a list of notifications settings is returned.',
                );
                postMessage('Usage: `/notifications [channel] [enabled]`');
                postMessage('Example: `/notifications #off-topic off`');
                postMessage('Usage: `/notifications`');
                break;
              case 'color':
                postMessage(
                  '`/color`: Changes the color of your username. The color argument can be a hex, RGB, or text value.',
                );
                postMessage('Usage: `/color <color`');
                postMessage('Example: `/color red`');
                postMessage('Example: `/color #00ff00');
                postMessage('Example: `/color 0, 0, 255`');
                break;
              case 'away':
                postMessage(
                  '`/away`: Sets your status as away. If a reason is not given, a default reason is used.',
                );
                postMessage('Usage: `/away [reason]`');
                postMessage('Example: `/away Lunch`');
                break;
              case 'unaway':
                postMessage(
                  '`/unaway`: Sets your status as online',
                );
                postMessage('Usage: `/unaway`');
                postMessage('Example: `/unaway`');
                break;
              case 'toolbar':
                postMessage(
                  '`/toolbar`: Enables or disables a menu in the toolbar.',
                );
                postMessage('Usage: `/toolbar <menu> <enabled>`');
                postMessage('Example: `/toolbar markdown off`');
                break;
              case 'ban':
                postMessage(
                  '`/ban`: Bans a user from a channel. Bans user from all channels if channel argument is *.',
                );
                postMessage('Usage: `/ban <channel> <username> [reason]`');
                postMessage('Example: `/ban #general ProblematicUser`');
                postMessage('Example: `/ban * ProblematicUser You were banned for being problematic`');
                postMessage('You must be an operator to use this command');
                break;
              case 'unban':
                postMessage(
                  '`/ban`: Unbans a user from a channel. Unbans user from all channels if channel argument is *.',
                );
                postMessage('Usage: `/unban <channel> <username>`');
                postMessage('Example: `/unban #general ProblematicUser`');
                postMessage('Example: `/unban * ProblematicUser`');
                postMessage('You must be an operator to use this command');
                break;
              case 'kick':
                postMessage(
                  '`/kick`: Kicks a user from a channel. Kicks user from all channels if channel argument is *.',
                );
                postMessage('Usage: `/kick <channel> <username>`');
                postMessage('Example: `/kick #general ProblematicUser`');
                postMessage('Example: `/kick * ProblematicUser`');
                postMessage('You must be an operator to use this command');
                break;
              case 'quiet':
                postMessage(
                  '`/quiet`: Quiets a user from a channel. A quieted user can not send messages. Quiets user in all channels if channel argument is *.',
                );
                postMessage('Usage: `/quiet <channel> <username>`');
                postMessage('Example: `/quiet #general ProblematicUser`');
                postMessage('Example: `/quiet * ProblematicUser`');
                postMessage('You must be an operator to use this command');
                break;
              case 'unquiet':
                postMessage(
                  '`/unquiet`: Unquiets a user from a channel. An unquieted user can send messages. Unquiets user in all channels if channel argument is *.',
                );
                postMessage('Usage: `/unquiet <channel> <username>`');
                postMessage('Example: `/unquiet #general ProblematicUser`');
                postMessage('Example: `/unquiet * ProblematicUser`');
                postMessage('You must be an operator to use this command');
                break;
              case 'banlist':
                postMessage(
                  '`/banlist`: Displays a list of bans, showing the channel, username and/or nick, and if the ban is quiet.',
                );
                postMessage('Usage: `/banlist`');
                postMessage('Example: `/banlist`');
                postMessage('You must be an operator to use this command');
                break;
              case 'banmask':
                postMessage(
                  '`/banmask`: Bans a hostmask. Hostmasks are of the form user!nick@host. To get the user or the nick, use the `user` and `nick` commands.',
                );
                postMessage('Usage: `/banmask <channel> <mask>`');
                postMessage('Example: `/banmask #general ProblematicUserNick!*@*`');
                postMessage('You must be an operator to use this command');
                break;
              case 'unbanmask':
                postMessage(
                  '`/unbanmask`: Unbans a hostmask. Hostmasks are of the form user!nick@host. To get the user or the nick, use the `user` and `nick` commands.',
                );
                postMessage('Usage: `/unbanmask <channel> <mask>`');
                postMessage('Example: `/unbanmask #general ProblematicUserNick!*@*`');
                postMessage('You must be an operator to use this command');
                break;
              case 'user':
                postMessage(
                  '`/user`: Gets the username corresponding to a nick',
                );
                postMessage('Usage: `/user <nick>`');
                postMessage('Example: `/user MysteriousNick^293`');
                postMessage('You must be an operator to use this command');
                break;
              case 'nicks':
                postMessage(
                  '`/nicks`: Gets the nicks for a user.',
                );
                postMessage('Usage: `/nicks <user>`');
                postMessage('Example: `/nicks MysteriousUser`');
                postMessage('You must be an operator to use this command');
                break;

              case 'notice':
                postMessage(
                  '`/notice`: Sends a notice to a channel. Sends a notice to all channels if channel argument is *.',
                );
                postMessage('Usage: `/notice <channel> <message>`');
                postMessage('Example: `/notice #general Hello, everyone`');
                postMessage('Example: `/notice * Hello, everyone`');
                postMessage('You must be an operator to use this command');
                break;
              case 'changenick':
                postMessage(
                  '`/changenick`: Changes your nickname that others see when you send a message',
                );
                postMessage('Usage: `/changenick <newnick>`');
                postMessage('Example: `/changenick NewNick`');
                postMessage('You must be an operator to use this command');
                break;
              default:
                postMessage('Available commands: help, me, ignore, ignore-list, unignore, change, emoticon, emoticon-list, disconnect, toolbar, indicator, notifications, size, color, away, unaway, keywords');
                postMessage('Type `/help <command>` for information on individual commands');
                postMessage('Example: `/help ignore`');
                postMessage(` You are ${this.oper ? '' : 'not'} logged in as an operator/moderator. Operators may use the \`/ban\`, \`/unban\`, \`/quiet\`, \`/unquiet\`, \`/notice\`, \`/banmask\`, \`/unbanmask\`, \`/user\`, \`/nick\`, and \`/kick\` commands`);
                postMessage(
                  'Additional commands available via LinkBot (see the [wiki](http://eternawiki.org/wiki/index.php5/HELP) for more information)',
                );
                break;
            }
            break;
          case 'disconnect':
            this.onDisconnect(true);
            postMessage('Disconnecting...');
            setTimeout(() => { // Ensures it doesn't reconnect
              if (this.connectionData.connected) {
                this.onDisconnect(true);
              }
            }, 1000);
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
            if (!first || !second) { // Parameter check
              postMessage(
                'Please include command parameters. Type `/help emoticon` for more usage instructions',
              );
              break;
            } else if (parseInt(second, 10) > 3 || parseInt(second, 10) < 1) {
              postMessage('You have three custom emoticon slots. Type `/help emoticon` for more usage instructions');
              break;
            } else {
              let emoticons : string[];
              if (localStorage.customEmoticons) {
                emoticons = JSON.parse(localStorage.customEmoticons) as string[];
              } else {
                emoticons = this.customEmoticons;
              }
              if (emoticons.some(e => e === first)) {
                postMessage('You already have that emoticon in a custom slot');
                break;
              } else if (!first.match(/[^\w\d\p{P}\p{S}]/)) {
                postMessage('You may only add *emoticons* to custom slots');
                break;
              }
            }
            // Changing the array elements with array[index] = newValue isn't reactive
            Vue.set(this.customEmoticons, (parseInt(second, 10) - 1), first);
            localStorage.customEmoticons = JSON.stringify(this.customEmoticons);
            break;
          case 'emoticon-list':
            postMessage(`Your custom emoticons are ${this.customEmoticons[0]} (slot 1), ${this.customEmoticons[1]} (slot 2), and ${this.customEmoticons[2]} (slot 3).`);
            break;
          case 'ban':
            if (params.split(' ').length < 2) {
              postMessage('Please include command parameters. Type `/help ban` for more usage instructions');
              break;
            }
            if (this.oper) {
              if (params.split(' ')[0] === '*') { // If ban should be in all channels
                channelNames.forEach(c => { // For each channel
                  this.client?.ban(c, `*!${params.split(' ')[1]}@*`); // Ban the user's username
                });
              } else { // Otherwise, just ban them from the one channel
                this.client?.ban(params.split(' ')[0], `*!${params.split(' ')[1]}@*`);
              }
              if (params.split(' ')[2]) {
                const user = this.connectedUsers[params.split(' ')[1]];
                const reason = params.substring(params.indexOf(params.split(' ')[2]));
                if (user && user.nicks) {
                  const nick = user.nicks[0];
                  this.giveReason({
                    reason,
                    nick,
                  });
                }
              }
            } else {
              this.auth = true; // If not an oper, present the modal to log in
              postMessage('You are not an operator or moderator and do not have permission to ban users.');
            }
            break;
          case 'unban': // Exact same as ban, just replacing 'ban' with 'unban'
            if (params.split(' ').length < 2) {
              postMessage('Please include command parameters. Type `/help unban` for more usage instructions');
              break;
            }
            if (this.oper) {
              if (params.split(' ')[0] === '*') {
                channelNames.forEach(c => {
                  this.client?.unban(c, `*!${params.split(' ')[1]}@*`);
                });
              } else {
                this.client?.unban(params.split(' ')[0], `*!${params.split(' ')[1]}@*`);
              }
            } else {
              this.auth = true;
              postMessage('You are not an operator or moderator and do not have permission to unban users.');
            }
            break;
          case 'kick':
            if (params.split(' ').length < 2) {
              postMessage('Please include command parameters. Type `/help kick` for more usage instructions');
              break;
            }
            if (this.oper) {
              if (params.split(' ').length >= 2) {
                this.connectedUsers[params.split(' ')[1]]?.nicks.forEach((e) => { // Kicks each nick
                  if (params.split(' ')[0] === '*') {
                    channelNames.forEach(c => { // If user should be kicked from all channels
                      this.client?.raw(`KICK ${c} ${e}`);
                    });
                  } else { // Otherwise, kick from the one channel
                    this.client?.raw(`KICK ${params.split(' ')[0]} ${e}`);
                  }
                  if (params.split(' ')[2]) {
                    const user = this.connectedUsers[params.split(' ')[1]];
                    const reason = params.substring(params.indexOf(params.split(' ')[2]));
                    if (user && user.nicks) {
                      const nick = user.nicks[0];
                      this.giveReason({
                        reason,
                        nick,
                      });
                    }
                  }
                });
              }
            } else { // Same thing for all oper commands
              this.auth = true;
              postMessage('You are not an operator or moderator and do not have permission to kick users');
            }
            break;
          case 'quiet':
            if (this.oper) {
              if (params.split(' ').length >= 2) {
                if (params.split(' ')[0] === '*') {
                  channelNames.forEach(c => { // If user should be quieted in all channels
                    this.client?.raw(`MODE ${c} +b m;*!${params.split(' ')[1]}@*`);
                  });
                } else {
                  this.client?.raw(`MODE ${params.split(' ')[0]} +b m;*!${params.split(' ')[1]}@*`);
                }
                if (params.split(' ')[2]) {
                  const user = this.connectedUsers[params.split(' ')[1]];
                  const reason = params.substring(params.indexOf(params.split(' ')[2]));
                  if (user && user.nicks) {
                    const nick = user.nicks[0];
                    this.giveReason({
                      reason,
                      nick,
                    });
                  }
                }
              } else {
                postMessage('Please include command parameters. Type `/help quiet` for more usage instructions');
              }
            } else {
              this.auth = true;
              postMessage('You are not an operator or moderator and do not have permission to quiet users');
            }
            break;
          case 'unquiet': // Same as quiet, but 'quiet' is replaced with 'unquiet' and '+b' with '-b'
            if (this.oper) {
              if (params.split(' ').length >= 2) {
                if (params.split(' ')[0] === '*') {
                  channelNames.forEach(c => {
                    this.client?.raw(`MODE ${c} -b m;*!${params.split(' ')[1]}@*`);
                  });
                } else {
                  this.client?.raw(`MODE ${params.split(' ')[0]} -b m;*!${params.split(' ')[1]}@*`);
                }
              } else {
                postMessage('Please include command parameters. Type `/help unquiet` for more usage instructions');
              }
            } else {
              this.auth = true;
              postMessage('You are not an operator or moderator and do not have permission to unquiet users');
            }
            break;
          case 'banlist':
            if (this.oper) {
              channelNames.forEach((c) => { // For each channel
                this.client?.channel(c).banlist((e) => {
                  // eslint-disable-next-line dot-notation
                  e.bans.forEach((b) => {
                    // Type is not actualy IrcUser[]; it's an object. This code works
                    const ban = new Ban(b.banned, b.channel);
                    postMessage(`${ban.username
                      .replace('*!', '') // Remove hostmask formatting
                      .replace('@*', '')
                      .replace('!*', ' (nick) ') // If !* appears, the nick is banned, not a user
                      .replace('m;', '(Quiet) ')} in ${ban.channel}`); // If m; appears, it's a quiet ban
                  });
                });
              });
            } else {
              this.auth = true;
              postMessage('You are not an operator or moderator and do not have permission to view the ban list');
            }
            break;
          case 'notice':
            if (this.oper) {
              if (params.split(' ').length > 1) {
                if (params.split(' ')[0] === '*') {
                  channelNames.forEach(c => {
                    const msg = message
                      .replace('/notice', '')
                      .replace(/ \[#[a-f0-9]{6}\]$/, '')
                      .replace(params.split(' ')[0], '')
                      .trim();
                    this.client?.notice(c, msg);
                    this.postMessage(new Message(msg, c, this.currentUser, false, true));
                  });
                } else {
                  const msg = message
                    .replace('/notice', '')
                    .replace(/ \[#[a-f0-9]{6}\]$/, '')
                    .replace(params.split(' ')[0], '')
                    .trim();
                  this.client?.notice(params.split(' ')[0], msg);
                  this.postMessage(new Message(msg, params.split(' ')[0], this.currentUser, false, true));
                }
              } else {
                postMessage('Please include command parameters. Type `/help notice` for more usage instructions');
              }
            } else {
              this.auth = true;
              postMessage('You are not an operator or moderator and do not have permission to post messages');
            }
            break;
          case 'banmask':
            if (this.oper) {
              if (params.length > 1) {
                this.client?.ban(params.split(' ')[0], params.split(' ')[1]);
              } else {
                postMessage('Please include command parameters. Type `/help banmask` for more usage instructions');
              }
            } else {
              this.auth = true;
              postMessage('You are not an operator or moderator and do not have permission to ban masks');
            }
            break;
          case 'unbanmask':
            if (this.oper) {
              if (params.length > 1) {
                this.client?.unban(params.split(' ')[0], params.split(' ')[1]);
              } else {
                postMessage('Please include command parameters. Type `/help unbanmask` for more usage instructions');
              }
            } else {
              this.auth = true;
              postMessage('You are not an operator or moderator and do not have permission to unban masks');
            }
            break;
          case 'nicks':
            if (this.oper) {
              if (params.length > 0) {
                const nickslist = this.connectedUsers[params.trim()]?.nicks;
                const withoutDuplicates = Array.from(new Set(nickslist));
                postMessage(`Nicks for user ${params.trim()}: ${withoutDuplicates.join(', ')}`);
              } else {
                postMessage('Please include command parameters. Type `/help nicks` for more usage instructions');
              }
            } else {
              this.auth = true;
              postMessage('You are not an operator or moderator and do not have permission to view nicks for a user');
            }
            break;
          case 'user':
            if (this.oper) {
              if (params.length > 0) {
                const users = this.connectedUsers;
                const userlist = Object.keys(users);
                const nickslist = userlist.filter(e => users[e]?.nicks.includes(params.trim()));
                postMessage(`Nick ${params.trim()} belongs to user ${nickslist[0]}`);
              } else {
                postMessage('Please include command parameters. Type `/help user` for more usage instructions');
              }
            } else {
              this.auth = true;
              postMessage('You are not an operator or moderator and do not have permission to view the user for a nick');
            }
            break;
          case 'changenick':
            if (!this.oper) {
              this.auth = true;
              postMessage('You are not an operator or moderator and do not have permission to change your nick');
              break;
            }
            if (params.length < 1) {
              postMessage('Please include command parameters. Type `/help changenick` for more usage instructions');
              break;
            }
            this.changeNick(params);
            break;
          case 'execute': {
            if (!this.oper) {
              this.auth = true;
              postMessage('You are not an operator or moderator and do not have permission to execute commands');
              break;
            }
            if (params.length < 1) {
              postMessage('Please include command parameters. Type `/help execute` for more usage instructions');
              break;
            }
            this.client?.raw(params);
            break;
          }
          case 'unaway' || 'online': this.setUnaway(); this.autoUpdateStatus = true; break;
          case 'away':
            this.setAway(params);
            this.autoUpdateStatus = false;
            break;
          case 'color':
            if (!params) {
              postMessage('Please include command parameters. Type `/help color` for more usage instructions');
              break;
            }
            if (params.match(/#[a-f0-9]{6}/)) {
              this.usernameColor = params;
            } else if (params.match(/(red)|(blue)|(green)|(purple)|(yellow)|(orange)/)) {
              switch (params) {
                case 'red': this.usernameColor = '#ff0000'; break;
                case 'orange': this.usernameColor = '#ff8800'; break;
                case 'yellow': this.usernameColor = '#ffff00'; break;
                case 'blue': this.usernameColor = '#0096ff'; break;
                case 'green': this.usernameColor = '#00ff00'; break;
                case 'purple': this.usernameColor = '#ff00ff'; break;
                default: break;
              }
            } else if (params.match(/(\s?\d+,){2}\s?\d+/)) {
              const colors = params.split(',').map(e => parseInt(e.trim(), 10).toString(16));
              this.usernameColor = `#${colors.join()}`;
            } else {
              console.log('invalid');
            }
            break;
          case 'toolbar':
            if (!params.includes(' ')) {
              postMessage('Please include command parameters. Type `/help toolbar` for more usage instructions');
              break;
            }
            switch (params.split(' ')[0]) {
              case 'emoticons':
              case 'emoticon':
                (this.$store as FullStore).rootState.$_settings.emoticonChatFeatures = Boolean(params.split(' ')[1].match(/(true)|(yes)|(on)/)); break;
              case 'markdown':
                (this.$store as FullStore).rootState.$_settings.markdownChatFeatures = Boolean(params.split(' ')[1].match(/(true)|(yes)|(on)/)); break;
              case 'preview':
                (this.$store as FullStore).rootState.$_settings.previewChatFeatures = Boolean(params.split(' ')[1].match(/(true)|(yes)|(on)/)); break;
              default: break;
            }
            break;
          case 'indicator':
            if (!params) {
              postMessage('Please include command parameters. Type `/help indicator` for more usage instructions');
              break;
            }
            (this.$store as FullStore).rootState.$_settings.indicator = params;
            break;
          case 'notifications':
            if (!params) {
              postMessage(`Notifications are disabled for ${Object.keys(this.ignoredChannels).filter(e => !this.ignoredChannels[e]).join(', ') || 'no channels'}`);
            } else {
              this.ignoredChannels[params.split(' ')[0]] = Boolean(params.split(' ')[1].match(/(true)|(yes)|(on)/));
              if (!this.channels[params.split(' ')[0]]) break;
              this.channels[params.split(' ')[0]]!.notificationsEnabled = Boolean(params.split(' ')[1].match(/(true)|(yes)|(on)/));
            }
            break;
          case 'keywords':
            if (!params) {
              postMessage(`Your notifications keywords are ${this.notificationsKeywords.join(', ') || 'not set'}`);
              break;
            }
            if (params.split(' ')[0] === 'add') {
              console.log(`Adding ${params.split(' ')[1]}`);
              this.notificationsKeywords.push(params.split(' ')[1]);
            } else if (params.split(' ')[0] === 'remove') {
              console.log(`Removing ${params.split(' ')[1]}`);
              this.notificationsKeywords = this.notificationsKeywords.filter(e => e !== params.split(' ')[1]);
            } else {
              console.log(`Setting ${params.split(/, ?/)}`);
              this.notificationsKeywords = params.split(/, ?/);
            }
            break;
          case 'textsize':
          case 'fontsize':
          case 'size':
            if (!params) {
              postMessage('Please include command parameters. Type `/help size` for more usage instructions');
              break;
            }
            if (!parseInt(params, 10) || parseInt(params, 10) > 18 || parseInt(params, 10) < 10) {
              postMessage('Invalid value. Type `/help size` for  usage instructions');
              break;
            }
            (this.$store as FullStore).rootState.$_settings.fontSize = parseInt(params, 10);
            break;
          default:
            postMessage('Invalid command. Type `/help` for more available commands');
            break;
        }
      }
      if (post) {
        if (!this.channels[channel]?.banned && !banned && !quieted) {
          if (isAction) {
              this.client!.action(channel, `${message}`);
          } else {
              this.client!.say(channel, message);
          }
          const name = User.parseUsername(channel);
          // If it's a private message, send to the username, not the nick
          if (this.connectedUsers[User.parseUsername(channel)]?.nicks.includes(channel)) {
            this.postMessage(new Message(message, name, this.currentUser, isAction));
          } else {
            this.postMessage(new Message(message, channel, this.currentUser, isAction));
          }
        } else if (quieted) {
          this.postMessage(new Message("Can't send messages because you are quieted"));
        } else {
          this.postMessage(new Message("Can't send messages because you are banned"));
        } // TODO
      }
    }
  }

  @action()
  async giveReason({ reason, nick }: {reason: string, nick: string}) {
    this.client?.say(nick, reason);
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

  /**
   * Changes the user's nick
   * @param value - The new nick
   */
  @action()
  async changeNick(value:string) {
    let to = value;
    if (this.oper) {
      if (to.length > 0) {
        to = to.trim();
        this.nick = to;
        this.currentUser.nicks = [to];
        this.client?.raw(`NICK ${to}`);
        if (localStorage) {
          localStorage.nick = to;
        }
      } else {
        this.postMessage(new Message('Please include command parameters. Type `/help changenick` for more usage instructions'));
      }
    } else {
      this.auth = true;
      this.postMessage(new Message('You are not an operator or moderator and do not have permission to change your nick'));
    }
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
        new Message(`You have been kicked from chat${params.message ? ` - ${params.message}` : ''}`, channel?.name),
      );
      this.postMessage(new Message('Please read our [code of conduct](https://eternagame.org/about/conduct)', channel?.name));
    } else {
      this.removeUser(username);
    }
  }

  /**
   * Sends a message to a private channel
   * @param {string} message - The user and the message to be sent. Takes the form <nick>|<message>
   */

  @action()
  async postToQuery({ message, channel }: { message:string, channel:string}) {
    /* Splits argument into message and channel
    Will only cause issues if people are putting | in their nick */
    if (this.channels[User.parseUsername(channel)] === undefined) {
      Vue.set(this.channels, User.parseUsername(channel), {
        name: User.parseUsername(channel),
        maxHistoryMessages: 50,
        notifications: false,
        notificationsEnabled: true,
        banned: BanStatus.BAN_STATUS_NORMAL,
        postedMessages: [],
      });
    }
    // Converting from array to set to array removes duplicates
    Array.from(new Set(this.connectedUsers[User.parseUsername(channel)]?.nicks)).forEach(e => {
      this.sendMessage({ rawMessage: message, channel: e }); // Send message to all nicks
    });
  }

  /* This code will only work once the chat is put in the website
  From my observations, the get requests only work coming from eternagame.org
  Once the chat is moved there, they will go through
  Until then, it gives an error and anything that relies on it gives a default fallback
  */
  @action()
  async getUserInfo(arg: { user: User, callback: (data: any | undefined) => any}) {
    const { uid } = arg.user || { uid: 0 }; // UID needed for get request
    const xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function cb() {
      if (xmlHttp.readyState === 4 && xmlHttp.status === 200) {
        arg.callback(xmlHttp.responseText); // Calls callback after response
      }
    };
    xmlHttp.open('GET', `https://eternagame.org/get/?type=user&uid=${uid}`, true); // true for asynchronous
    xmlHttp.send(null);
  }

  @action()
  async onNoticeReceived({
    message, target, time, nick, type,
  }: Irc.MessageEventArgs) {
    const user = this.connectedUsers[User.parseUsername(nick)];
    const msg = new Message(message, target, user, false, true);
    msg.time = time;
    this.postMessage(msg);
  }

  // TODO: Insert messages based on id order
  @action()
  async onMessageReceived({
    message, nick, tags, time, type, target,
  }: Irc.MessageEventArgs) {
    let channel = this.channels[target];
    // If it's a PRIVMSG
    if (this.currentUser.username.includes(User.parseUsername(target)) && nick) {
      if (!this.channels[User.parseUsername(nick)]) { // If the channel doesn't exist yet
        // Vue.set is reactive
        Vue.set(this.channels, User.parseUsername(nick), {
          name: User.parseUsername(nick),
          maxHistoryMessages: 50,
          notifications: false,
          notificationsEnabled: true,
          mentioned: false,
          postedMessages: [],
          banned: BanStatus.BAN_STATUS_NORMAL,
        });
        channelNames.push(User.parseUsername(nick));
      }
      // Add the message
      this.channels[User.parseUsername(nick)]?.postedMessages.push(new Message(message, this.currentUser.username, new User(User.parseUsername(nick)), type === 'action'));
      channel = this.channels[User.parseUsername(nick)];
    }
    if (!channel) {
      return;
    }
    // Notifications should come in if slideout is open, user is in a different channel, or both
    if (
      (this.slideoutOpen || channel.name !== this.chatChannel || !this.focused)
      && channel.notificationsEnabled) {
      // Notify the channel
      this.notify(channel.name);
      if (message.toLowerCase().includes(this.currentUser.username.toLowerCase())) {
        this.mention(channel.name);
      }
    } else if (
      (this.slideoutOpen || channel.name !== this.chatChannel)
      && this.notificationsKeywords.some(e => message.includes(e))) {
      this.notify(channel.name);
    } else {
      // If the user is in the channel and the slideout is closed
      this.readChannel(channel.name); // Set the channel to read
    }
    const username = User.parseUsername(nick);
    let msg = message;
    if (this.notificationsKeywords) {
      this.notificationsKeywords.forEach(n => {
        msg = msg.replace(` ${n}`, ` **${n}**`);
      });
    }
    const messageObject = new Message(
      msg,
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
    if (channel.postedMessages.length === 0) {
      this.loadMessagesForChannel(channel.name);
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
      if (mode.mode === '+o') {
        if (!this.oper) {
          this.oper = true;
        }
      } else if (mode.mode === '-o') {
        this.oper = false;
      }
    });
  }

  /**
   * Bans a user
   * @param user {User} - The user to be banned
   */
  @mutation
  ban(user:User) {
    if (this.oper) {
      this.client?.ban(this.chatChannel, `*!${user.username}@*`);
    }
  }

  /**
   * Kicks a user
   * @param user {User} - The user to be kicked
   */
  @mutation
  kick(user:User) {
    if (this.oper) {
      this.connectedUsers[user.username]?.nicks.forEach((e) => {
        this.client?.raw(`KICK ${this.chatChannel} ${e}`);
      });
    }
  }

  /**
   * Quiets a user
   * @param user {User} - The user to be quieted
   */
  @mutation
  quiet(user:User) {
    if (this.oper) {
      this.client?.raw(`MODE ${this.chatChannel} +b m;*!${user.username}@*`);
    }
  }

  /**
   * Unquiets a user
   * @param user {User} - The user to be unquieted
   */
  @mutation
  unquiet(user:User) {
    if (this.oper) {
      this.client?.raw(`MODE ${this.chatChannel} -b m;*!${user.username}@*`);
    }
  }

  /**
   * Unbans a user
   * @param user {User} - The user to be unbanned
   */
  @mutation
  unban(user:User) {
    if (this.oper) {
      this.client?.unban(this.chatChannel, `*!${user.username}@*`);
    }
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
      this.postMessage(new Message('Please read our [code of conduct](https://eternagame.org/about/conduct)', channelName));
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
      this.postMessage(new Message('Please read our [code of conduct](https://eternagame.org/about/conduct)', channelName));
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
  async onDisconnect(stayDisconnected:boolean = false) {
    const data = this.connectionData;
    if (data.currentTimer > 0) return;
    // TODO: What if connect is called and then immidiately a late "onDisconnect" arives?
    data.connected = false;
    data.firstConnection = false;
    if (!stayDisconnected) { // If the disconnect wasn't intentional
      if (data.failedAttempts === 0) {
        data.failedAttempts += 1;
        this.connect();
      } else {
        data.currentTimer = data.disconnectionTimers[Math.min(data.failedAttempts - 1, 3)];
        data.failedAttempts += 1;
        clearInterval(data.timerInterval);
        data.timerInterval = setInterval(this.updateTimer, 1000);
      }
    } else { // If it was, disconnect and stay disconnected
      this.client?.quit();
      data.timerInterval = 100000000; // Doesn't try to reconnect again
      this.disconnected = true;
    }
  }

  /**
   * Determines whether a user is banned in a channel
   * @param arg - An object containing the user, channel, and a callback.
   */
  @action()
  async bans(arg: {user: User, channel: string, cb: (b:boolean) => void}) {
    const { username } = arg.user;
    const { channel, cb } = arg;
    if (channel === '*') {
      channelNames.forEach(c => {
        this.client?.banlist(c, (e) => {
          const banmap = e.bans.map(i => new Ban(i.banned, i.channel));
          cb(banmap.some(i => i.username.includes(username) && !i.username.includes('m;')));
        });
      });
    } else {
      this.client?.banlist(channel, (e) => {
        const banmap = e.bans.map(i => new Ban(i.banned, i.channel));
        cb(banmap.some(i => i.username.includes(username) && !i.username.includes('m;')));
      });
    }
  }

  /**
   * Determines whether a user is muted in a channel
   * @param arg - An object containing the user, channel, and a callback.
   */
  @action()
  async quiets(arg: {user: User, channel: string, cb: (b:boolean) => void}) {
    const { username } = arg.user;
    const { channel, cb } = arg;
    if (channel === '*') {
      channelNames.forEach(c => {
        this.client?.banlist(c, (e) => {
          const banmap = e.bans.map(i => new Ban(i.banned, i.channel));
          cb(banmap.some(i => i.username.includes(username) && i.username.includes('m;')));
        });
      });
    } else {
      this.client?.banlist(channel, (e) => {
        const banmap = e.bans.map(i => new Ban(i.banned, i.channel));
        cb(banmap.some(i => i.username.includes(username) && i.username.includes('m;')));
      });
    }
  }

  /**
   * Updates the away/online status for all connected users
   */
  @action()
  async updateUserStatus() {
    const usersByNick = Object.values(this.connectedUsers).map(e => e!.nicks[0]);
    usersByNick.forEach(e => {
      this.client?.whois(e, (i) => {
        const username = User.parseUsername(e);
        if (i.away) {
          this.connectedUsers[username]!.away = true;
          this.connectedUsers[username]!.awayReason = i.away;
        } else {
          this.connectedUsers[username]!.away = false;
          this.connectedUsers[username]!.awayReason = '';
        }
      });
    });
  }

  /**
   * Sets the user as away
   */
  @action()
  async setAway(reason: string = 'User is currently away') {
    if (this.currentUser) {
      this.currentUser.away = true;
      this.currentUser.awayReason = reason;
    }
    if (this.connectedUsers[this.currentUser.username]) {
      this.connectedUsers[this.currentUser.username]!.away = true;
    }
    this.client?.raw(`AWAY ${reason}`);
  }

  /**
   * Sets the user as online
   */
  @action()
  async setUnaway() {
    if (this.currentUser) {
      this.currentUser.away = false;
    }
    if (this.connectedUsers[this.currentUser.username]) {
      this.connectedUsers[this.currentUser.username]!.away = false;
    }
    this.client?.raw('AWAY');
  }

  get userStatus() {
    return this.connectedUsers[this.currentUser.username]?.away;
  }

  @action()
  async updateTimer() {
    this.connectionData.currentTimer -= 1;
    if (this.connectionData.currentTimer <= 0) {
      this.connect();
    }
  }
}

// Makes sure TypeScript recognizes the rootState property
class FullStore extends Store<any> {
  rootState !: {
    $_settings: SettingsModule,
    $_chat: ChatModule,
  };
}

export { Channel };
