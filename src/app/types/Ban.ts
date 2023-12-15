export default class Ban {
  username: string;

  channel: string;

  constructor(user:string, chan:string) {
    this.username = user;
    this.channel = chan;
  }
}
