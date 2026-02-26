import User from './user';

class Message {
  public time!: Date;

  public starred = false;

  constructor(
    public message: string,
    public target: string = '*',
    public user: User = User.anonymous,
    public isAction: boolean = false,
    public isNotice: boolean = false,
    public tags: { [key: string]: string } = {},
  ) {
    this.parseTime();
  }

  private parseTime() {
    if (this.tags.time) {
      const timeString = this.tags.time;
      this.time = new Date(Date.parse(timeString));
    } else {
      this.time = new Date(Date.now());
    }
  }
}

export default Message;
