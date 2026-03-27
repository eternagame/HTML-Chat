import { defineStore } from 'pinia';
import { readonly, ref, watch } from 'vue';
import useIrcStore from './irc';
import useUserListStore from './user-list';
import useChannelStore from './channel';

const useOperatorStore = defineStore('operator', () => {
  const channel = useChannelStore();
  const irc = useIrcStore();
  const userList = useUserListStore();
  /** Is a server-wide operator */
  const isOperator = ref(false);

  function signIn(username: string, password: string) {
    if (!irc.client || isOperator.value) {
      return;
    }
    irc.client.raw(`OPER ${username} ${password}`);
  }

  function kick(username: string, targetChannels: string[]) {
    if (!irc.client || !isOperator.value || targetChannels.length === 0) {
      return;
    }
    const user = userList.getUserByUsername(username);
    if (!user) {
      return;
    }
    for (const nick of user.nicks) {
      for (const targetChannel of targetChannels) {
        irc.client.raw(`KICK ${targetChannel} ${nick}`);
      }
    }
  }

  function ban(username: string, targetChannels: string[]) {
    if (!irc.client || !isOperator.value || username === '*' || targetChannels.length === 0) {
      return;
    }

    const user = userList.getUserByUsername(username);
    for (const targetChannel of targetChannels) {
      // Ban by username mask
      irc.client.ban(targetChannel, `${user?.username ?? username}^*!*@*`);
    }
  }

  function unban(username: string, targetChannels: string[]) {
    if (!irc.client || !isOperator.value || username === '*' || targetChannels.length === 0) {
      return;
    }
    const user = userList.getUserByUsername(username);
    for (const targetChannel of targetChannels) {
      // Unban by username mask
      irc.client.unban(targetChannel, `${user?.username ?? username}^*!*@*`);
    }
  }

  function mute(username: string, targetChannels: string[]) {
    if (!irc.client || !isOperator.value || username === '*' || targetChannels.length === 0) {
      return;
    }

    const user = userList.getUserByUsername(username);
    for (const targetChannel of targetChannels) {
      // Mute by username mask
      // See https://github.com/ergochat/ergo/blob/master/docs/MANUAL.md#extended-bans
      irc.client.ban(targetChannel, `m:${user?.username ?? username}^*!*@*`);
    }
  }

  function unmute(username: string, targetChannels: string[]) {
    if (!irc.client || !isOperator.value || username === '*' || targetChannels.length === 0) {
      return;
    }

    const user = userList.getUserByUsername(username);
    for (const targetChannel of targetChannels) {
      // Unmute by username mask
      // See https://github.com/ergochat/ergo/blob/master/docs/MANUAL.md#extended-bans
      irc.client.unban(targetChannel, `m:${user?.username ?? username}^*!*@*`);
    }
  }

  watch(
    () => irc.client,
    (client) => {
      if (!client) {
        return;
      }

      isOperator.value = false;
      client.on('mode', (event) => {
        if (event.target !== irc.currentNick) {
          return;
        }

        // Checking if user is a server operator
        for (const mode of event.modes) {
          switch (mode.mode) {
            case '+o':
              isOperator.value = true;
              return;
            case '-o':
              isOperator.value = false;
              return;
          }
        }
      });
    },
  );

  watch([() => channel.channelNameList, isOperator], ([channelList]) => {
    if (!isOperator.value) {
      return;
    }

    // Add channel operator permissions if a server-wide operator
    channelList
      .filter((c) => c.startsWith('#'))
      .forEach((channel) => {
        irc.client?.raw(`SAMODE ${channel} +o ${irc.currentNick}`);
      });
  });

  // TODO: saving credentials
  // TODO: banlist, change nick, ban/unban mask (directly, rather than by username)

  return {
    isOperator: readonly(isOperator),
    signIn,
    kick,
    ban,
    unban,
    mute,
    unmute,
  };
});

export default useOperatorStore;
