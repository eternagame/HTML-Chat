import MarkdownIt from 'markdown-it';
import linkAttributes from 'markdown-it-link-attributes';
import markdownItRegex from 'markdown-it-regex';

const SCREENSHOT_REGEX =
  /((?:https?:\/\/)?eterna(?:game|dev).org\/sites\/default\/files\/chat_screens\/\d+_\d+\.png)/i;
const PUZZLE_REGEX = /((?:https?:\/\/)?eternagame\.org\/(?:game\/)?puzzles?\/\d+\/?)/i;
const TAG_USER_REGEX = /(?<!\w)@([\w-]+)/i;
const TAG_CHANNEL_REGEX = /(?<!\w)(#[\w-]+)/i;
const BLOCKQUOTE_REGEX = /^>\s+(.*)/;
const HIGHLIGHT_REGEX = /\|([^|]+)\|/;

const md = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true,
})
  .disable('image')
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
      return `<button type="button" class="tag tag--user">${taggedUser}</button>`;
    },
  })
  .use(markdownItRegex, {
    name: 'tag-channel',
    regex: TAG_CHANNEL_REGEX,
    replace(taggedChannel: string) {
      return `<button type="button" class="tag tag--channel">${taggedChannel}</button>`;
    },
  })
  .use(markdownItRegex, {
    name: 'blockquote',
    regex: BLOCKQUOTE_REGEX,
    replace(content: string) {
      const safeContent = md.renderInline(content);
      return `<blockquote>${safeContent}</blockquote>`;
    },
  })
  .use(markdownItRegex, {
    name: 'highlight',
    regex: HIGHLIGHT_REGEX,
    replace(content: string) {
      const safeContent = md.renderInline(content);
      return `<mark class="highlight">${safeContent}</mark>`;
    },
  })
  .use(linkAttributes, [
    {
      attrs: { class: 'link link--puzzle', 'data-link-type': 'internal', target: '_blank' },
      matcher(href: string): boolean {
        return PUZZLE_REGEX.test(href);
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

export default md;
