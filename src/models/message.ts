import type { Tags } from 'irc-framework';

export type MessageType = 'privmsg' | 'action' | 'notice' | 'system';

export interface Message {
  id: string;
  time: number;
  starred: boolean;
  message: string;
  target: string;
  nick: string;
  type: MessageType;
  tags: Tags;
}
