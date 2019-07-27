import { Client } from 'irc-framework';
import BanStatus from '../types/BanStatus';
import User from '../types/user';
import Message from '../types/message';

const channels = ['#general', '#test', '#test2'];

class ConnectionData {
  serverUrl!: string;

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

  currentUser!: User;

  nick!: string;

  connectionData = new ConnectionData();

  client?: Client;

  workbranch!: string;

  connectedUsers: {
    [username: string]: User
  } = {};

  channels = channels;

  tabs = [{
    name: 'General', type: 'MessagesTab', channel: '#general', id: 'general',
  },
  {
    name: 'Test', type: 'MessagesTab', channel: '#test', id: 'test',
  },
  {
    name: 'Test 2', type: 'MessagesTab', channel: '#test2', id: 'test2',
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
      this.banned[channel] = BanStatus.BAN_STATUS_NORMAL;
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

if (process.env.VUE_APP_SERVER_URL) {
  state.connectionData.serverUrl = process.env.VUE_APP_SERVER_URL;
} else {
  console.error("VUE_APP_SERVER_URL wasn't found in the .env file!");
}
export { State };
export default state;
