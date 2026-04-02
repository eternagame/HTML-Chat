import { OPERATOR_NOTIFICATION_CHANNEL } from '#constants';
import { defineStore } from 'pinia';
import { watch } from 'vue';
import { useChannelStore } from './channel.store';
import { useIrcStore } from './irc.store';
import { useUserListStore } from './user-list.store';

export const useOperatorStore = defineStore('operator', () => {
  const channel = useChannelStore();
  const irc = useIrcStore();
  const userList = useUserListStore();

  function signIn(username: string, password: string) {
    if (!irc.client || irc.isOperator) {
      return;
    }
    irc.client.raw(`OPER ${username} ${password}`);
  }

  function kick(username: string, targetChannels: string[]) {
    if (!irc.client || !irc.isOperator || targetChannels.length === 0) {
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
    if (!irc.client) {
      return;
    } else if (!irc.isOperator) {
      channel.addSystemMessage('You currently are not an operator.');
      return;
    } else if (mask.length === 0) {
      channel.addSystemMessage('You need to provide a ban mask.');
      return;
    } else if (targetChannels.length === 0) {
      channel.addSystemMessage('You need to provide channels to apply the ban mask.');
      return;
    }

    for (const targetChannel of targetChannels) {
      irc.client.ban(targetChannel, mask);
    }
  }

  function removeBanMask(mask: string, targetChannels: string[]) {
    if (!irc.client) {
      return;
    } else if (!irc.isOperator) {
      channel.addSystemMessage('You currently are not an operator.');
      return;
    } else if (mask.length === 0) {
      channel.addSystemMessage('You need to provide a ban mask to remove.');
      return;
    } else if (targetChannels.length === 0) {
      channel.addSystemMessage('You need to provide channels to remove the ban mask.');
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
    } else if (!irc.isOperator) {
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

      client.on('banlist', (event) => {
        if (!irc.isOperator) {
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
  watch(
    () => irc.isOperator,
    (isOperator, wasOperator) => {
      if (isOperator) {
        channel.addSystemMessage('You are now an operator.');

        // Allow operator to join the channel
        irc.client?.raw(`SAJOIN ${OPERATOR_NOTIFICATION_CHANNEL}`);
        channel.joinChannel(OPERATOR_NOTIFICATION_CHANNEL, { force: true, skipNavigation: true });
      } else {
        channel.leaveChannel(OPERATOR_NOTIFICATION_CHANNEL);

        if (wasOperator) {
          // Occurs when reconnecting
          channel.addSystemMessage('You are no longer an operator.');
        }
      }
    },
    { immediate: true },
  );
  watch([() => channel.channelNameList, () => irc.isOperator], ([channelList, isOperator]) => {
    if (!isOperator) {
      return;
    }

    // Add channel operator permissions if a server-wide operator
    channelList
      .filter((c) => c.startsWith('#'))
      .forEach((channel) => {
        irc.client?.raw(`SAMODE ${channel} +o ${irc.currentNick}`);
      });
  });

  return {
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
