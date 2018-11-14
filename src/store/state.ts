import {CHAT_CHANNEL, CURRENT_USER, WORKBRANCH} from '../define-user';
import SockJS from 'sockjs-client'

class State {
  postedMessages: Array<string> = [];
  toBePosted: Array<string> = [];
  userData = new UserData();
  connectionData = new ConnectionData();
  sock: any;
}
class UserData{
  uid: string = CURRENT_USER.uid;
  username: string = CURRENT_USER.name;
  nick: string = CURRENT_USER.nick;
}
class ConnectionData{
  firstConnection : boolean = false;
  connected: boolean = false;
}
const state = new State();

export { State, state };
