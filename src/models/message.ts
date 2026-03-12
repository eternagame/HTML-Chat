import type { User } from './user';

export type MessageType = 'message' | 'action' | 'system';

export interface Message {
  time: Date;
  starred: boolean;
  message: string;
  target: string;
  user: User;
  type: MessageType;
  tags: Record<string, string>;
}
