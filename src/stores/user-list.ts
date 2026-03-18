import { ANONYMOUS_USER, DEFAULT_COLORS } from '#constants';
import type { User } from '#models';
import { getUserProfile } from '#services';
import { isValidHexColor, parseNick, parseUid } from '#utils';
import log from 'loglevel';
import { defineStore } from 'pinia';
import { computed, reactive, readonly, watch } from 'vue';
import useIrcStore from './irc';

const useUserListStore = defineStore('userList', () => {
  const irc = useIrcStore();
  const knownUsers = reactive(new Map<string, User>());
  const users = computed(() => Array.from(knownUsers.values()));

  function addUser(nick: string, ident: string) {
    const uid = parseUid(nick, ident);
    const username = parseNick(nick);
    if (knownUsers.has(username)) {
      const user = knownUsers.get(username)!;
      user.status = 'online';
      user.nicks.add(nick);
      return;
    }

    const parsedUID = Number.parseInt(uid, 10);
    const color =
      Number.isNaN(parsedUID) || parsedUID === 0
        ? '#ffffff'
        : DEFAULT_COLORS[parsedUID % DEFAULT_COLORS.length];

    knownUsers.set(username, {
      username,
      uid,
      nicks: new Set([nick]),
      status: 'online',
      awayReason: '',
      color,
      profile: null,
      isFetchingProfile: false,
    });
  }

  function removeUser(nick: string) {
    const username = parseNick(nick);
    const user = knownUsers.get(username);
    if (!user) {
      log.warn(`Tried to remove user "${nick}" but they weren't in the user list.`);
      return;
    }

    user.nicks.delete(nick);
    if (user.nicks.size === 0) {
      user.status = 'offline';
    }
  }

  function getUser(nick: string) {
    const username = parseNick(nick);
    const user = knownUsers.get(username);
    if (!user) {
      log.warn(`Could not find user "${nick}" in the user list`);
      return readonly(ANONYMOUS_USER);
    }
    return readonly(user);
  }

  function setUserAway(nick: string, awayReason: string) {
    const username = parseNick(nick);
    const user = knownUsers.get(username);
    if (!user) {
      log.warn(`Tried to mark user "${nick}" as away, but they weren't in the user list.`);
      return;
    }
    user.status = 'away';
    user.awayReason = awayReason;
  }

  function setUserBack(nick: string) {
    const username = parseNick(nick);
    const user = knownUsers.get(username);
    if (!user) {
      log.warn(
        `Tried to mark user "${nick}" as back (not away), but they weren't in the user list.`,
      );
      return;
    }
    user.status = 'online';
    user.awayReason = '';
  }

  function updateUserColor(nick: string, color: string) {
    const username = parseNick(nick);
    const user = knownUsers.get(username);
    if (!user) {
      log.warn(`Tried to update color for user "${nick}", but they weren't in the user list.`);
      return;
    }
    user.color = color;
  }

  async function loadProfile(nick: string) {
    const username = parseNick(nick);
    const user = knownUsers.get(username);
    if (!user || user.isFetchingProfile || user.profile !== null) {
      return;
    }

    user.isFetchingProfile = true;
    try {
      const profile = await getUserProfile(user.uid);
      user.profile = profile;
    } catch (error) {
      log.error(error);
    } finally {
      user.isFetchingProfile = false;
    }
  }

  watch(
    () => irc.client,
    (client) => {
      if (!client) {
        return;
      }
      // Add users who JOIN a channel or are in a channel that we JOIN
      // Remove users who QUIT
      // (Not using KICK and PART since they are channel-specific)
      client
        .on('userlist', (event) => {
          for (const ircUser of event.users) {
            addUser(ircUser.nick, ircUser.ident);
          }
        })
        .on('join', (event) => {
          addUser(event.nick, event.ident);
        })
        .on('quit', (event) => {
          removeUser(event.nick);
        })
        .on('away', (event) => {
          if (event.self) {
            return;
          }
          setUserAway(event.nick, event.message);
        })
        .on('back', (event) => {
          if (event.self) {
            return;
          }
          setUserBack(event.nick);
        })
        .on('tagmsg', (event) => {
          // Using '+color' client-tag for updating username color
          // See https://ircv3.net/specs/extensions/message-tags
          const nick = event.nick;
          const color = event.tags['+color'];
          if (typeof color === 'string' && isValidHexColor(color)) {
            updateUserColor(nick, color);
          }
        });
    },
  );

  return {
    getUser,
    users,
    loadProfile,
  };
});

export default useUserListStore;
