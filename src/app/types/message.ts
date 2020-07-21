import User from './user';

class Message {
  message!: string;

  user!: User;

  target!: string;

  tags!: {[key: string] : string};

  isAction!: boolean;

  isNotice !: boolean;

  time!: Date;

  starred = false;

  constructor(message: string, target = '*', user: User = User.annonymous, isAction: boolean = false, isNotice: boolean = false, tags: {[key: string] : string} = {}) {
    this.message = message;
    this.target = target;
    this.tags = tags;
    this.isAction = isAction;
    this.isNotice = isNotice;
    this.user = user;
    this.parseTime();
  }

  parseTime() {
    if (this.tags.time) {
      const timeString = this.tags.time;
      this.time = new Date(Date.parse(timeString));
    } else {
      this.time = new Date(Date.now());
    }
  }
}

export default Message;
