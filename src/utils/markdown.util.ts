import { useChannelStore, useUserListStore } from '#stores';
import MarkdownIt from 'markdown-it';
import linkAttributes from 'markdown-it-link-attributes';
import markdownItRegex from 'markdown-it-regex';
import markdownItUnderline from 'markdown-it-underline';

const SCREENSHOT_REGEX =
  /((?:https?:\/\/)?eterna(?:game|dev).org\/sites\/default\/files\/chat_screens\/\d+_\d+\.png)/i;
const INTERNAL_LINK_REGEX = /^(?:https?:\/\/)?eterna(?:game|dev).org\/?/i;
const TAG_USER_REGEX = /(?<!\w)@([\w-]+)/i;
const TAG_CHANNEL_REGEX = /(?<!\w)(#[\w-]+)/i;

/**
 * Pattern for puzzle links. Single capture group for the puzzle ID.
 */
export const PUZZLE_LINK_REGEX = /(?:https?:\/\/)?eternagame\.org\/(?:game\/)?puzzles?\/(\d+)\/?/i;

export const md = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true,
})
  .disable(['heading', 'lheading', 'hr', 'image'])
  .use(markdownItUnderline)
  .use(markdownItRegex, {
    name: 'screenshot',
    regex: SCREENSHOT_REGEX,
    replace(url: string) {
      return `<a class="link link--image" href="${url}" target="_blank" data-link-type="internal">
        <img src="${url}" class="screenshot" alt="Screenshot" loading="lazy" />
      </a>`
        .replace(/\s+/g, ' ')
        .trim();
    },
  })
  .use(markdownItRegex, {
    name: 'tag-user',
    regex: TAG_USER_REGEX,
    replace(taggedUser: string) {
      const userList = useUserListStore();
      const isKnownUser = userList.users.some((u) => u.username === taggedUser.toLocaleLowerCase());
      if (isKnownUser) {
        return `<span data-user="${taggedUser.toLocaleLowerCase()}">@${taggedUser}</span>`;
      } else {
        return `<span>@${taggedUser}</span>`;
      }
    },
  })
  .use(markdownItRegex, {
    name: 'tag-channel',
    regex: TAG_CHANNEL_REGEX,
    replace(taggedChannel: string) {
      const channel = useChannelStore();
      const isKnownChannel = channel.channelNameList.includes(taggedChannel.toLocaleLowerCase());
      if (isKnownChannel) {
        return `<button
          type="button"
          class="tag tag--channel"
          data-channel="${taggedChannel.toLocaleLowerCase()}"
        >
          ${taggedChannel}
        </button>`;
      } else {
        return `<span>${taggedChannel}</span>`;
      }
    },
  })
  .use(linkAttributes, [
    {
      attrs: { class: 'link link--puzzle', 'data-link-type': 'internal', target: '_blank' },
      matcher(href: string): boolean {
        return PUZZLE_LINK_REGEX.test(href);
      },
    },
    {
      attrs: {
        class: 'link link--internal',
        'data-link-type': 'internal',
        target: '_blank',
        rel: 'noopener noreferrer',
      },
      matcher(href: string): boolean {
        return INTERNAL_LINK_REGEX.test(href);
      },
    },
    {
      attrs: {
        class: 'link link--external',
        'data-link-type': 'external',
        target: '_blank',
        rel: 'noopener noreferrer',
      },
    },
  ]);

md.linkify.set({ fuzzyEmail: false });
