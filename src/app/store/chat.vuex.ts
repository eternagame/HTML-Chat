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
import Ban from '@/types/Ban';

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

// eslint-disable-next-line prefer-const
let channelNames = ['#general', '#off-topic', '#help', '#labs', '#global', '#test'];

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

  tab: Number = 1; // Selected tab. One of the chat channels

  chatChannel: string = '#off-topic'; // Name of channel display in top bar

  slideoutOpen = false; // Whether slideout is open. Updated by App.vue

  broadcast: BroadcastChannel<BroadcastMessage>; // For communication between tabs/windows

  ignoredChannels: { [channel: string]: boolean };

  usernameColor: string = '';

  tabbing = false;

  customEmoticons = ['😜', '🤔', '😮'];

  oper = false;

  operLoginUser = '';

  operLoginPassword = '';

  banList: Ban[] = [];

  quietList: Ban[] = [];

  auth = false;

  userToPrivMsg = '';

  privMsgModal = false;

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
      }
    } else {
      const trueChannel = this.channels[channel];
      if (trueChannel) {
        // Set notifications for that channel to false
        trueChannel.notifications = false;
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
      .on('irc error', this.onIrcError)
      .on('raw', (e) => {
        if (e.from_server) {
          const commandNumber = parseInt(e.line.substring(20, 23), 10);
          if (e.line.match(/^:irc\.eternagame\.org .+\^\d{3} #*.* /)) {
            switch (commandNumber) {
              case 482: this.postMessage(new Message("You're not a channel operator/moderator")); break;
              case 481: this.postMessage(new Message("You're not an IRC operator/moderator")); break;
              default: break;
            }
          }
        }
      });
    this.client = client;
    this.connect();
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
    this.client?.raw(`OPER ${this.operLoginUser} ${this.operLoginPassword}`);
    setTimeout(this.setChannelOps, 100); // Make sure events happen in order
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
      {
        user = User.annonymous, isHistory = false, isAction = false,
      } = {},
    ) => {
      this.postMessage(new Message(message, channel, user, isAction));
    };
    let message = rawMessage.trim();
    const oldMessage = message;
    message = `${message} [${this.usernameColor}]`; // Message with tags added on
    let isAction = false;
    // No posting as annon or if nothing has been actually posted
    let notBanned = true;
    if (this.banList.some(e => e.username.includes(this.currentUser.username))
      || this.quietList.some(e => e.username.includes(this.currentUser.username))) {
      notBanned = false;
    }
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
              case 'ban':
                postMessage(
                  '`/ban`: Bans a user from a channel',
                );
                postMessage('Usage: `/ban <channel> <username>`');
                postMessage('Example: `/ban #general Ahalb`');
                postMessage('You must be an operator to use this command');
                break;
              case 'unban':
                postMessage(
                  '`/ban`: Unbans a user from a channel',
                );
                postMessage('Usage: `/unban <channel> <username>`');
                postMessage('Example: `/unban #general Ahalb`');
                postMessage('You must be an operator to use this command');
                break;
              case 'kick':
                postMessage(
                  '`/kick`: Kicks a user from a channel',
                );
                postMessage('Usage: `/kick <channel> <username>`');
                postMessage('Example: `/kick #general Ahalb`');
                postMessage('You must be an operator to use this command');
                break;
              default:
                postMessage('Available commands: help, me, ignore, ignore-list, unignore, change, emoticon');
                postMessage('Type `/help <command>` for information on individual commands');
                postMessage('Example: `/help ignore`');
                postMessage(` You are ${this.oper ? '' : 'not'} logged in as an operator/moderator. Operators may use the \`/ban\`, \`/unban\`, and \`/kick\` commands`);
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
            if (!first || !second) { // Parameter check
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
              }
            } else {
              this.auth = true;
              postMessage('You are not an operator or moderator and do not have permission to unquiet users');
            }
            break;
          case 'banlist':
            if (this.oper) {
              this.banList = []; // Resets banlist and quietlist to avoid duplicates
              this.quietList = [];
              channelNames.forEach((c) => { // For each channel
                this.client?.channel(c).banlist((e) => {
                  // eslint-disable-next-line dot-notation
                  e.bans.forEach((b) => {
                    // Type is not actualy IrcUser[]; it's an object. This code works
                    const ban = new Ban(b.banned, b.channel);
                    if (ban.username.includes('m;')) { // If a quiet ban
                      this.quietList.push(ban); // Add to quiet list
                    } else { // If not, add to ban list
                      this.banList.push(ban);
                    }
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
          default:
            postMessage('Invalid command. Type `/help` for more available commands');
            break;
        }
      }
      this.client?.channel(channel).banlist(e => { // Update banlist when message sent
        e.bans.forEach(b => {
          const ban = new Ban(b.banned, b.channel);
          if (ban.username.startsWith('m;')) {
            this.quietList.push(ban);
          } else {
            this.banList.push(ban);
          }
        });
      });
      if (post) {
        if (!this.channels[channel]?.banned && notBanned) {
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
        } else if (this.quietList.some(e => e.username.includes(this.currentUser.username))) {
          this.postMessage(new Message("Can't send messages because you are quieted"));
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

  /**
   * Sends a message to a private channel
   * @param {string} message - The user and the message to be sent. Takes the form <nick>|<message>
   */

  @action()
  async postToQuery(message:string) { /* @action() can only take 1 argument */
    /* Splits argument into message and channel
    Will only cause issues if people are putting | in their nick */
    const chan = message.substring(0, message.indexOf('|'));
    const msg = message.substring(message.indexOf('|') + 1);
    if (this.channels[User.parseUsername(chan)] === undefined) {
      Vue.set(this.channels, User.parseUsername(chan), {
        name: User.parseUsername(chan),
        maxHistoryMessages: 50,
        notifications: false,
        notificationsEnabled: true,
        banned: BanStatus.BAN_STATUS_NORMAL,
        postedMessages: [],
      });
    }
    // Converting from array to set to array removes duplicates
    Array.from(new Set(this.connectedUsers[User.parseUsername(chan)]?.nicks)).forEach(e => {
      this.sendMessage({ rawMessage: msg, channel: e }); // Send message to all nicks
    });
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
  @action()
  async ban(user:User) {
    if (this.oper) {
      this.client?.ban(this.chatChannel, `*!${user.username}@*`);
    }
  }

  /**
   * Kicks a user
   * @param user {User} - The user to be kicked
   */
  @action()
  async kick(user:User) {
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
  @action()
  async quiet(user:User) {
    if (this.oper) {
      this.client?.raw(`MODE ${this.chatChannel} +b m;*!${user.username}@*`);
    }
  }

  /**
   * Unquiets a user
   * @param user {User} - The user to be unquieted
   */
  @action()
  async unquiet(user:User) {
    if (this.oper) {
      this.client?.raw(`MODE ${this.chatChannel} -b m;*!${user.username}@*`);
    }
  }

  /**
   * Unbans a user
   * @param user {User} - The user to be unbanned
   */
  @action()
  async unban(user:User) {
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
