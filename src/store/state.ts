import {CHAT_CHANNEL, CURRENT_USER, WORKBRANCH} from '../define-user';
import {Client, IrcUser} from "irc-framework/browser";
import {IrcMessage} from 'irc-framework/browser';
class State {
  activeTab = 0;
  postedMessages: {
    [channel: string] : IrcMessage[]
  } = {
    '#general': [],
    '#test': [],
  };
  toBePosted: Array<IrcMessage> = [];
  userData = new UserData();
  connectionData = new ConnectionData();
  client?: Client;
  workbranch = WORKBRANCH;
  connectedUsers: {
    [nick: string] : IrcUser 
  } = {};
  channels = ['#general', '#test',];
}
class UserData{
  uid: string = CURRENT_USER.uid;
  username: string = CURRENT_USER.name;
  nick: string = CURRENT_USER.nick;
  banned = false;
}
class ConnectionData{
  firstConnection = false;
  connected = false;
  failedAttempts =  1;
  currentTimer = 0;
  timerInterval = -1;
  disconnectionTimers = [5, 10, 15, 30];
}
const state = new State();

export { State, state };
