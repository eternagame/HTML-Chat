export type UserStatus = 'offline' | 'online' | 'away';

export interface UserProfile {
  avatar: string | null;
  rank: number | null;
  /** HTML formatted */
  description: string | null;
  roles: string[];
  /** Profile page link */
  link: string | null;
}

export interface User {
  /** Converted to lowercase */
  username: string;
  displayName: string;
  /** User ID */
  uid: string;
  /** Tracks multiple opened clients for the same user */
  nicks: Set<string>;
  status: UserStatus;
  awayReason: string;
  /** Hex color value */
  color: string;
  profile: UserProfile | null;
  isFetchingProfile: boolean;
}
