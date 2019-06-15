import { Client } from 'irc-framework';
import { CURRENT_USER, WORKBRANCH } from '../define-user';
import { BanStatus, consts } from '../types/consts';
import User from '../types/user';
import Message from '../types/message';

const channels = ['#general', '#test'];

class ConnectionData {
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

class State {
  activeTab = 0;

  postedMessages: {
    [channel: string]: Message[]
  } = {};

  toBePosted: Message[] = [];

  currentUser = CURRENT_USER;

  nick!: string;

  connectionData = new ConnectionData();

  client?: Client;

  workbranch = WORKBRANCH;

  connectedUsers: {
    [nick: string]: User
  } = {};

  channels = channels;

  tabs = [{
    name: 'General', type: 'MessagesTab', channel: '#general', id: 'general',
  },
  {
    name: 'Test', type: 'MessagesTab', channel: '#test', id: 'test',
  },
  {
    state: this,
    get name() {
      return `Online (${Object.keys(this.state.connectedUsers).length})`;
    },
    type: 'OnlineTab',
    id: 'online',
  }];

  ignoredUsers: string[] = [];

  get currentChannel(): string | undefined {
    return this.tabs[this.activeTab].channel;
  }

  inputBoxHeight: number = 0;

  minimized: boolean = false;

  banned: { [channel: string]: BanStatus } = {};

  usersByNick: { [nick: string]: User } = {}

  constructor() {
    channels.forEach((channel) => {
      this.banned[channel] = consts.BAN_STATUS_NORMAL;
      this.postedMessages[channel] = [];
    });
  }
}

const state = new State();
if (localStorage.ignoredUsers) {
  try {
    state.ignoredUsers = JSON.parse(localStorage.ignoredUsers);
  } catch {
    console.error('Encountered an error while parsing the local data of ignored users');
  }
}
export { State, state };
