import type { BanStatus } from './ban-status';
import type { Message } from './message';

export interface Channel {
  /**
   * Changed to lowercase
   * - `#channel`
   * - `username`
   */
  name: string;
  /** Original casing */
  displayName: string;
  messages: Message[];
  usersTyping: Set<string>;
  banStatus: BanStatus;
  notificationsEnabled: boolean;
  /** User is mentioned. Cleared when channel is read. */
  hasMention: boolean;
  /** User or keyword mentioned. Cleared when channel is read. */
  hasNotification: boolean;
}
