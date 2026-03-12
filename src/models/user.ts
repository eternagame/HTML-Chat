export interface User {
  username: string;
  /** User ID */
  uid: string;
  nicks: string[];
  away: boolean;
  awayReason: string;
}
