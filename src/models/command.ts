import type {
  useChannelStore,
  useIrcStore,
  useOperatorStore,
  useProfileStore,
  useSettingsStore,
  useUserListStore,
} from '#stores';
import type { MessageType } from './message';

export interface CommandContext {
  currentChannel: string;
  fullText: string;
  args: string[];
  sendMessage(channelOrUsername: string, text: string, type?: Exclude<MessageType, 'system'>): void;
  stores: {
    channel: ReturnType<typeof useChannelStore>;
    irc: ReturnType<typeof useIrcStore>;
    operator: ReturnType<typeof useOperatorStore>;
    profile: ReturnType<typeof useProfileStore>;
    settings: ReturnType<typeof useSettingsStore>;
    userList: ReturnType<typeof useUserListStore>;
  };
}

export interface CommandHandler {
  name: string;
  description: string;
  usage: string;
  examples?: string[];
  aliases?: string[];
  requiresOperator?: boolean;
  execute(context: CommandContext): void;
}
