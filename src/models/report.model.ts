import type { Message } from './message.model';
import type { User } from './user.model';

export interface Report {
  targetUser: Pick<User, 'username' | 'uid'>;
  targetMessage?: Pick<Message, 'id' | 'time' | 'message' | 'type' | 'target' | 'nick'>;
}
