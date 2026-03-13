export interface User {
  username: string;
  /** User ID */
  uid: string;
  /** Tracks multiple opened clients for the same user */
  nicks: Set<string>;
  away: boolean;
  awayReason: string;
}
