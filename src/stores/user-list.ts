import { ANONYMOUS_USER } from '#constants';
import type { User } from '#models';
import { parseNick } from '#utils';
import log from 'loglevel';
import { defineStore } from 'pinia';
import { computed, reactive, watch } from 'vue';
import useIrcStore from './irc';

const useUserListStore = defineStore('userList', () => {
  const irc = useIrcStore();
  const connectedUsers = reactive(new Map<string, User>());
  const users = computed(() => Array.from(connectedUsers.values()));

  function addUser(nick: string, uid: string) {
    const username = parseNick(nick);
    if (connectedUsers.has(username)) {
      return;
    }

    connectedUsers.set(username, {
      username,
      uid,
      nicks: [nick],
      away: false,
      awayReason: '',
    });
  }

  function removeUser(nick: string) {
    const username = parseNick(nick);
    const user = connectedUsers.get(username);
    if (!user) {
      log.warn(`Tried to remove user "${nick}" but they weren't in the user list.`);
      return;
    }

    user.nicks = user.nicks.filter((n) => n !== nick);
    if (user.nicks.length === 0) {
      connectedUsers.delete(username);
    }
  }

  function getUser(nick: string) {
    const username = parseNick(nick);
    const user = connectedUsers.get(username);
    if (!user) {
      log.warn(`Could not find user "${nick}" in the user list`);
      return ANONYMOUS_USER;
    }
    return user;
  }

  function setUserAway(nick: string, awayReason: string) {
    const username = parseNick(nick);
    const user = connectedUsers.get(username);
    if (!user) {
      log.warn(`Tried to mark user "${nick}" as away, but they weren't in the user list.`);
      return;
    }
    user.away = true;
    user.awayReason = awayReason;
  }

  function setUserBack(nick: string) {
    const username = parseNick(nick);
    const user = connectedUsers.get(username);
    if (!user) {
      log.warn(
        `Tried to mark user "${nick}" as back (not away), but they weren't in the user list.`,
      );
      return;
    }
    user.away = false;
    user.awayReason = '';
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
        });
    },
  );

  return {
    getUser,
    users,
  };
});

export default useUserListStore;
