import { CHANNEL_DESCRIPTIONS, DEFAULT_CHANNELS } from '#constants';
import { findOriginalString } from './text.util';

const CHANNELS_WITH_DESCRIPTIONS = Object.keys(CHANNEL_DESCRIPTIONS);

export function getChannelDescription(channelOrUsername: string): string {
  const channelDescriptionKey = findOriginalString(CHANNELS_WITH_DESCRIPTIONS, channelOrUsername);

  if (channelDescriptionKey) {
    return CHANNEL_DESCRIPTIONS[channelDescriptionKey];
  } else if (channelOrUsername.startsWith('#')) {
    return `${channelOrUsername} channel`;
  } else {
    return `Direct chat with ${channelOrUsername}`;
  }
}

export function isDefaultChannel(channelOrUsername: string): boolean {
  return DEFAULT_CHANNELS.has(channelOrUsername.toLocaleLowerCase());
}
