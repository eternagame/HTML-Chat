import type { BanStatus } from './ban-status';
import type { Message } from './message';

export interface Channel {
  name: string;
  messages: Message[];
  usersTyping: string[];
  banStatus: BanStatus;
  notificationsEnabled: boolean;
  /** User is mentioned. Cleared when channel is read. */
  hasMention: boolean;
  /** User or keyword mentioned. Cleared when channel is read. */
  hasNotification: boolean;
}
