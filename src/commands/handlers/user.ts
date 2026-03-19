import type { TODO } from '#models';

/**
 * Post message as an action.
 * `/me <message>`
 */
export const me: TODO = null;
/**
 * Hide messages from a user.
 * `/ignore <username>`
 */
export const ignore: TODO = null;
/**
 * Show currently ignored users.
 * `/ignore-list`
 */
export const ignoreList: TODO = null;
/**
 * Show messages from user.
 */
export const unignore: TODO = null;
/**
 * Disconnect from chat.
 * `/disconnect`
 */
export const disconnect: TODO = null;
/**
 * Set self as away.
 *
 * `/away <reason>`
 * If `<reason>` is not given, the default away message is provided instead.
 */
export const away: TODO = null;
/**
 * Set self as back.
 *
 * `/unaway`
 */
export const unaway: TODO = null;
