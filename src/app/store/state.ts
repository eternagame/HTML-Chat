import { Client } from 'irc-framework';
import toBool from 'to-bool';
import BanStatus from '../types/BanStatus';
import User from '../types/user';
import Message from '../types/message';

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

class State {
  postedMessages: {
    [channel: string]: Message[]
  } = {};

  maxHistoryMessages: {
    [channel: string]: number
  } = {};

  toBePosted: Message[] = [];

  currentUser!: User;

  nick!: string;

  connectionData = new ConnectionData();

  client?: Client;

  workbranch!: string;

  connectedUsers: {
    [username: string]: User
  } = {};

  channels = ['#general', '#test', '#test2'];

  tabs = [{
    name: 'General', channel: '#general', id: 'general',
  },
  {
    name: 'Test', channel: '#test', id: 'test',
  },
  {
    name: 'Test 2', channel: '#test2', id: 'test2',
  },
  {
    state: this,
    get name() {
      return `Online (${Object.keys(this.state.connectedUsers).length})`;
    },
    type: 'UserPane',
    id: 'online',
  }];

  ignoredUsers: string[] = [];

  banned: { [channel: string]: BanStatus } = {};

  usersByNick: { [nick: string]: User } = {};

  constructor() {
    this.channels.forEach((channel) => {
      this.banned[channel] = BanStatus.BAN_STATUS_NORMAL;
      this.postedMessages[channel] = [];
      this.maxHistoryMessages[channel] = 50;
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

if (process.env.VUE_APP_SERVER_URL) {
  state.connectionData.serverUrl = process.env.VUE_APP_SERVER_URL;
} else {
  console.error("VUE_APP_SERVER_URL wasn't found in the .env file!");
}
if (process.env.VUE_APP_SSL) {
  state.connectionData.ssl = toBool(process.env.VUE_APP_SSL);
} else {
  console.error("VUE_APP_SSL wasn't found in the .env file!");
}
export { State };
export default state;
