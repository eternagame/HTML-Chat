export default class User {
  static annonymous = new User();

  nicks: string[];

  uid: string;

  username: string;

  static parseUsername(nick: string) {
    return nick.substr(0, nick.indexOf('^') === -1 ? nick.length : nick.indexOf('^'));
  }

  constructor(username: string = '', uid: string = '0') {
    this.nicks = [];
    this.uid = uid;
    this.username = username;
  }
}
