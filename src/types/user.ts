import { parseUsername } from '../tools/ParseUsername';
import { IrcUser } from 'irc-framework/browser';

export class User {
  static annonymous = new User();
  nicks: string[];
  uid: string;
  username: string;
  constructor(username: string='', uid: string = '0') {
    this.nicks = [];
    this.uid = uid;
    this.username = username;
  }
}
