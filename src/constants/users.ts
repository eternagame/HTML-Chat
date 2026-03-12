import type { User } from '#models';

export const ANONYMOUS_USER: User = {
  username: 'anonymous',
  uid: '0',
  nicks: ['anonymous^0'],
  away: false,
  awayReason: '',
};
