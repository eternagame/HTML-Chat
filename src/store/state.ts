import { Client, IrcUser } from 'irc-framework/browser';
import { Message as IrcMessage } from 'irc-framework/browser';
import { CURRENT_USER, WORKBRANCH, NICK } from '../define-user';
import { BanStatus, consts } from '../types/consts';
import { User } from '../types/user';
import { Message } from '../types/message';

const channels = ['#general', '#test']

class State {
  activeTab = 0;

  postedMessages: {
    [channel: string]: Message[]
  } = {};

  toBePosted: Message[] = [];

  currentUser = CURRENT_USER;

  connectionData = new ConnectionData();

  client?: Client;

  workbranch = WORKBRANCH;

  connectedUsers: {
    [nick: string]: User
  } = {};

  channels = channels;

  tabs = [{ name: 'General', type: 'MessagesTab', channel: '#general', id: 'general' },
   { name: 'Test', type: 'MessagesTab', channel: '#test', id: 'test' },
    { get name(){ return `Online (${Object.keys(state.connectedUsers).length})`}, type: 'OnlineTab', id: 'online' }]

  ignoredUsers: string[] = [];

  get currentChannel() : string | undefined {
    return this.tabs[this.activeTab].channel;
  }

  inputBoxHeight: number = 0;

  minimized: boolean = false;

  banned: {[channel: string] : BanStatus} = {};

  nick: string = NICK;

  usersByNick: {[nick: string] : User} = {}

  constructor(){
    for(let channel of this.channels){
      this.banned[channel] = consts.BAN_STATUS_NORMAL;
      this.postedMessages[channel] = [];
    }
  }
}
class ConnectionData {
  firstConnection = true;

  connected = false;

  failedAttempts = 1;

  currentTimer = 0;

  timerInterval = -1;

  disconnectionTimers = [5, 10, 15, 30];

  get tryingToConnect() {
    console.log(!this.connected && this.currentTimer <= 0);
    return !this.connected && this.currentTimer <= 0;
  }
}

const state = new State();
if (localStorage.ignoredUsers) {
  try {
    state.ignoredUsers = JSON.parse(localStorage.ignoredUsers)
  }
  catch{ }
}
export { State, state };
