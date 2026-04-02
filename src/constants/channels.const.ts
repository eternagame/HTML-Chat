/**
 * Channels joined by default.
 * Disables ability to leave listed channels.
 */
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

export const OPERATOR_NOTIFICATION_CHANNEL = '#ops-notifications';
