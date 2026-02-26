export default class User {
  public static readonly anonymous = new User();

  public nicks: string[] = [];

  public away: boolean = false;

  public awayReason: string = '';

  static parseUsername(nick: string) {
    if (nick.includes('^')) {
      return nick.split('^')[0];
    }
    return nick;
  }

  constructor(public username: string = '', public uid: string = '0') {}
}
