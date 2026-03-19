import type { Message } from '#models';
import { parseNick } from '#utils';
import { computed, toValue, type MaybeRefOrGetter, type DeepReadonly } from 'vue';

export interface MessageGroup extends Pick<Message, 'nick' | 'type'> {
  id: string;
  messages: Message[];
}

/**
 * Group consecutive messages from same user.
 * Does not group non-`privmsg` entries.
 */
export function useMessageGroups(messages: MaybeRefOrGetter<Message[] | DeepReadonly<Message[]>>) {
  const messageGroups = computed(() => {
    const groups: MessageGroup[] = [];
    for (const message of toValue(messages)) {
      const prevGroup = groups.at(-1) ?? null;

      if (
        !prevGroup ||
        message.type !== 'privmsg' ||
        prevGroup.type !== 'privmsg' ||
        parseNick(prevGroup.nick) !== parseNick(message.nick)
      ) {
        groups.push({
          id: `group-${message.time}-${message.nick}`,
          type: message.type,
          messages: [message],
          nick: message.nick,
        });
      } else {
        prevGroup.messages.push(message);
      }
    }
    return groups;
  });
  return { messageGroups };
}
