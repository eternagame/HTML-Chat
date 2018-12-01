import {CHAT_CHANNEL, CURRENT_USER, WORKBRANCH} from '../define-user';
import SockJS from 'sockjs-client'

class State {
  postedMessages: Array<string> = [];
  toBePosted: Array<string> = [];
  userData = new UserData();
  connectionData = new ConnectionData();
  sock: any;
  currentChannel = CHAT_CHANNEL;
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
