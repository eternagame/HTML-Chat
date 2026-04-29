/**
 * Channels available to join.
 */
export const AVAILABLE_CHANNELS: ReadonlyArray<string> = [
  '#general',
  '#off-topic',
  '#help',
  '#labs',
].concat(import.meta.env.DEV ? ['#test'] : []);

/**
 * Channels joined by default.
 * Disables ability to leave listed channels.
 */
export const DEFAULT_CHANNELS: ReadonlySet<string> = new Set(
  ['#general'].concat(import.meta.env.DEV ? ['#test'] : []),
);

export const CHANNEL_DESCRIPTIONS: Readonly<Record<string, string>> = {
  '#general': 'General chat',
  '#off-topic': 'Off-topic chat',
  '#help': 'Help requests',
  '#labs': 'Discussion related to labs',
};

export const OPERATOR_NOTIFICATION_CHANNEL = '#ops-notifications';
