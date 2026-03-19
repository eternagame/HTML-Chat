import type { TODO } from '#models';

/**
 * Ban user from channel(s).
 * `/ban <channel> <username> [reason]`
 * `/ban * <username> [reason]`
 */
export const ban: TODO = null;
/**
 * Unban user from channel(s).
 * `/unban <channel> <username>`
 * `/unban * <username>`
 */
export const unban: TODO = null;
/**
 * Quiet user from channel(s).
 * `/quiet <channel> <username>`
 * `/quiet * <username>`
 */
export const quiet: TODO = null;
/**
 * Unquiet user from channel(s).
 * `/unquiet <channel> <username>`
 * `/unquiet * <username>`
 */
export const unquiet: TODO = null;
/**
 * Send notice to channel(s).
 * `/notice <channel> <message>`
 * `/notice * <message>`
 */
export const notice: TODO = null;
/**
 * Ban hostmask (form: `user!nick@host`).
 * `/banmask <channel> <mask>`
 */
export const banmask: TODO = null;
/**
 * Unban hostmask.
 * `/unbanmask <channel> <mask>`
 */
export const unbanmask: TODO = null;
/**
 * Get username by nick.
 * `/user <nick>`
 */
export const user: TODO = null;
/**
 * Get nicks by username.
 * `/nicks <username>`
 */
export const nicks: TODO = null;
/**
 * Kick user from channel(s).
 * `/kick <channel> <username> [reason]`
 */
export const kick: TODO = null;
/**
 * Get list of bans
 * `/banlist`
 */
export const banlist: TODO = null;
/**
 * Change your nickname.
 * `/changenick <newNick>`
 */
export const changenick: TODO = null;
/**
 * Allow operator to send a RAW command through the websocket.
 * `/execute <line>`
 */
export const execute: TODO = null;
