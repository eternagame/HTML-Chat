// Markdown-it
import MarkdownIt from 'markdown-it';

const md = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true,
}).disable('image');
// Via https://github.com/markdown-it/markdown-it/blob/e6f19eab4204122e85e4a342e0c1c8486ff40c2d/docs/architecture.md
const defaultRender = md.renderer.rules.link_open
                      || function renderToken(tokens: any, idx: any, options: any,
                        env: any, self: any) {
                        return self.renderToken(tokens, idx, options);
                      };
md.renderer.rules.link_open = function linkOpen(tokens: any, idx: any, options: any,
  env: any, self: any) {
  // If you are sure other plugins can't add `target` - drop check below
  const aIndex = tokens[idx].attrIndex('target');

  if (aIndex < 0) {
    tokens[idx].attrPush(['target', '_blank']); // add new attribute
  } else {
    tokens[idx].attrs[aIndex][1] = '_blank'; // replace value of existing attr
  }

  return defaultRender(tokens, idx, options, env, self);

  // pass token to default renderer.
  // return defaultRender(tokens, idx, options, env, self);
};
md.renderer.rules.text = (tokens, idx, options, env, self) => {
  let { content } = tokens[idx];
  if (content.match(/^> ?/)) {
    content = `<blockquote>${content.replace(/^> ?/, '')}</blockquote>`;
  }
  // Detects instances of :: or : indicating fonts
  [...content.matchAll(/:+[^:]+:+/g)].forEach(e => {
    if (e[0].startsWith('::')) { // If it's :: (cursive), remove the colons and wrap it in a styled <span>
      content = content.replace(e[0], `<span class="cursive">${e[0].slice(2, -2)}</span>`);
    } else { // Otherwise, it's : (serif), remove the colons and wrap it in a styled <span>
      content = content.replace(e[0], `<span class="serif">${e[0].slice(1, -1)} </span>`);
    }
  });
  [...content.matchAll(/\|[^|]+\|/g)].forEach(e => {
    content = content.replace(e[0], `<span class="highlight">&nbsp;${e[0].slice(1, -1)}&nbsp;</span>`);
  });
  [...content.matchAll(/#\S+\s/g)].forEach(e => {
    content = content.replace(e[0].trim(), `<mark class="channel-link">${e[0].trim()}</mark>`);
  });
  [...content.matchAll(/@\S+\s/g)].forEach(e => {
    content = content.replace(e[0].trim(), `<mark class="user-link">${e[0].trim()}</mark>`);
  });
  [...content.matchAll(/https?:\/\/eterna(game|dev).org\/sites\/default\/files\/chat_screens\/\d+_\d+\.png/g)].forEach(e => {
    content = content.replace(e[0].trim(), `<img class="screenshot" src="${e[0].trim()}">`);
  });
  [...content.matchAll(/https?:\/\/eterna(game|dev)\.org\/puzzles\/\d+/g)].forEach(e => {
    content = content.replace(e[0].trim(), `<mark class="puzzle-link"><a href="${e[0].trim()}">${e[0].trim()}</a></mark>`);
  });
  return content;
};
export default md;
