import type { Tags } from 'irc-framework';

export type MessageType = 'privmsg' | 'action' | 'notice' | 'system';
export type MessageStatus = 'pending' | 'sent' | 'error';

export interface Message {
  id: string;
  time: number;
  message: string;
  /** Either channel or nick */
  target: string;
  username: string;
  nick: string;
  type: MessageType;
  tags: Tags;

  status?: MessageStatus;
  pendingId?: string;
}
