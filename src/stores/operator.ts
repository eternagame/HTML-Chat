import { defineStore } from 'pinia';
import { readonly, ref, watch } from 'vue';
import useChannelStore from './channel';
import useIrcStore from './irc';
import useUserListStore from './user-list';

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

  function addBanMask(mask: string, targetChannels: string[]) {
    if (!irc.client || !isOperator.value || mask.length === 0 || targetChannels.length === 0) {
      if (!isOperator.value) {
        channel.addSystemMessage('You currently are not an operator.');
      } else if (mask.length === 0) {
        channel.addSystemMessage('You need to provide a ban mask.');
      } else if (targetChannels.length === 0) {
        channel.addSystemMessage('You need to provide channels to apply the ban mask.');
      }
      return;
    }

    for (const targetChannel of targetChannels) {
      irc.client.ban(targetChannel, mask);
    }
  }

  function removeBanMask(mask: string, targetChannels: string[]) {
    if (!irc.client || !isOperator.value || mask.length === 0 || targetChannels.length === 0) {
      if (!isOperator.value) {
        channel.addSystemMessage('You currently are not an operator.');
      } else if (mask.length === 0) {
        channel.addSystemMessage('You need to provide a ban mask to remove.');
      } else if (targetChannels.length === 0) {
        channel.addSystemMessage('You need to provide channels to remove the ban mask.');
      }
      return;
    }

    for (const targetChannel of targetChannels) {
      irc.client.unban(targetChannel, mask);
    }
  }

  function ban(username: string, targetChannels: string[]) {
    if (username === '*') {
      channel.addSystemMessage(
        `**Careful!** Passing (*) in the username parameter will ban everyone.`,
      );
      return;
    }

    const user = userList.getUserByUsername(username);
    // Ban by username mask
    addBanMask(`${user?.username ?? username}^*!*@*`, targetChannels);
  }

  function unban(username: string, targetChannels: string[]) {
    if (username === '*') {
      channel.addSystemMessage(`Passing (*) in the username parameter will unban everyone.`);
      return;
    }

    const user = userList.getUserByUsername(username);
    // Unban by username mask
    removeBanMask(`${user?.username ?? username}^*!*@*`, targetChannels);
  }

  function mute(username: string, targetChannels: string[]) {
    if (username === '*') {
      channel.addSystemMessage(
        `**Careful!** Passing (*) in the username parameter will mute everyone.`,
      );
      return;
    }

    const user = userList.getUserByUsername(username);
    // Mute by username mask
    // See https://github.com/ergochat/ergo/blob/master/docs/MANUAL.md#extended-bans
    addBanMask(`m:${user?.username ?? username}^*!*@*`, targetChannels);
  }

  function unmute(username: string, targetChannels: string[]) {
    if (username === '*') {
      channel.addSystemMessage(`Passing (*) in the username parameter will unmute everyone.`);
      return;
    }

    const user = userList.getUserByUsername(username);
    // Unmute by username mask
    // See https://github.com/ergochat/ergo/blob/master/docs/MANUAL.md#extended-bans
    removeBanMask(`m:${user?.username ?? username}^*!*@*`, targetChannels);
  }

  function getBanList() {
    if (!irc.client) {
      return;
    } else if (!isOperator.value) {
      channel.addSystemMessage('You currently are not an operator.');
      return;
    }

    for (const channelName of channel.channelNameList) {
      if (!channelName.startsWith('#')) {
        continue;
      }
      irc.client.banlist(channelName);
    }
  }

  watch(
    () => irc.client,
    (client) => {
      if (!client) {
        return;
      }

      isOperator.value = false;
      client
        .on('mode', (event) => {
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
        })
        .on('banlist', (event) => {
          if (!isOperator.value) {
            return;
          }
          if (event.bans.length === 0) {
            channel.addSystemMessage(`No bans in ${event.channel}`);
          } else {
            channel.addSystemMessage(
              `Users banned from ${event.channel}: ${event.bans.map((b) => b.banned.replaceAll('*', '\\*'))}`,
            );
          }
        });
    },
  );
  watch(isOperator, () => {
    if (isOperator.value) {
      channel.addSystemMessage('You are now an operator.');
    }
  });
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

  // TODO: change nick

  return {
    isOperator: readonly(isOperator),
    signIn,
    kick,
    getBanList,
    addBanMask,
    removeBanMask,
    ban,
    unban,
    mute,
    unmute,
  };
});

export default useOperatorStore;
