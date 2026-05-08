import type { User } from '#models';

export const ANONYMOUS_USER: User = {
  username: 'anonymous',
  displayName: 'Anonymous',
  uid: '0',
  nicks: new Set([]),
  status: 'offline',
  awayReason: '',
  color: '#ffffff',
  profile: {
    avatar: null,
    rank: null,
    description: null,
    roles: ['Player'],
    link: null,
  },
  isFetchingProfile: false,
};

/**
 * These are currently taken from the Discord/Slack roles
 * Eventually, this will be replaced with an API call
 */
export const USER_ROLES: Record<string, string[]> = {
  Developer: ['LFP6', 'Ahalb', 'ElNando888', 'jnicol', 'MasterStormer'],
  Scientist: ['rhiju', 'dosoonkim'],
  Staff: ['LFP6', 'Omei', 'rhiju'],
  Moderator: ['Hoglahoo', 'LFP6', 'Omei'],
};
