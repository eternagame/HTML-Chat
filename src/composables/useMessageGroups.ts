import type { Message } from '#models';
import { computed, toValue, type MaybeRefOrGetter, type DeepReadonly } from 'vue';

export interface MessageGroup extends Pick<Message, 'nick' | 'username' | 'type'> {
  id: string;
  messages: Message[];
}

/**
 * Group consecutive messages from same user.
 * Does not group `notice` messages.
 */
export function useMessageGroups(messages: MaybeRefOrGetter<Message[] | DeepReadonly<Message[]>>) {
  const messageGroups = computed(() => {
    const groups: MessageGroup[] = [];
    for (const message of toValue(messages)) {
      const prevGroup = groups.at(-1) ?? null;

      if (
        !prevGroup ||
        prevGroup.type !== message.type ||
        message.type === 'notice' ||
        prevGroup.username !== message.username
      ) {
        groups.push({
          id: `group-${message.username}-${message.time}`,
          type: message.type,
          messages: [message],
          nick: message.nick,
          username: message.username,
        });
      } else {
        prevGroup.messages.push(message);
      }
    }
    return groups;
  });
  return { messageGroups };
}
