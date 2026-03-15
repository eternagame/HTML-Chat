export type MessageType = 'message' | 'action' | 'system';

export interface Message {
  time: Date;
  starred: boolean;
  message: string;
  target: string;
  nick: string;
  type: MessageType;
  tags: Record<string, string>;
}
