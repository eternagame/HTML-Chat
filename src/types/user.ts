export default class User {
  static annonymous = new User();

  nicks: string[];

  uid: string;

  username: string;

  constructor(username: string = '', uid: string = '0') {
    this.nicks = [];
    this.uid = uid;
    this.username = username;
  }
}
