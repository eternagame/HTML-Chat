import type { Tags } from 'irc-framework';

export type MessageType = 'privmsg' | 'action' | 'notice' | 'system';
export type MessageStatus = 'pending' | 'sent' | 'error';

export interface Message {
  id: string;
  time: number;
  starred: boolean;
  message: string;
  target: string;
  username: string;
  nick: string;
  type: MessageType;
  tags: Tags;

  status?: MessageStatus;
  pendingId?: string;
}
