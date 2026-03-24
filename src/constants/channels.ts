export const AUTO_JOIN_CHANNELS = new Set<string>(['#test']);

export const DEFAULT_CHANNELS = new Set<string>([
  '#general',
  '#off-topic',
  '#help',
  '#labs',
  '#test',
]);

export const CHANNEL_DESCRIPTIONS: Record<string, string> = {
  '#general': 'General chat',
  '#off-topic': 'Off-topic chat',
  '#help': 'Help requests',
  '#labs': 'Discussion related to labs',
};
