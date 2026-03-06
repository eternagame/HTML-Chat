import type { User } from './user';

export interface Message {
  time: Date;
  starred: boolean;
  message: string;
  target: string;
  user: User;
  isAction: boolean;
  tags: Record<string, string>;
}
