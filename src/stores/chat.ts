import { defineStore } from 'pinia';
import useChannelStore from './channel';
import useIrcStore from './irc';

const useChatStore = defineStore('chat', () => {
  // TODO: Add chat input handling for commands
  // TODO: Move `/help` messages to other file
  // TODO: Username color encoding

  const irc = useIrcStore();
  const channel = useChannelStore();

  function say(text: string) {
    if (!irc.client) {
      return;
    }
    const pendingId = channel.addPendingMessage(channel.activeChannelName, text, 'privmsg');
    irc.client.say(channel.activeChannelName, text, { label: pendingId });
  }

  return {
    say,
  };
});

export default useChatStore;
