// Markdown-it
import MarkdownIt from 'markdown-it';

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
}).disable('image');
// Via https://github.com/markdown-it/markdown-it/blob/e6f19eab4204122e85e4a342e0c1c8486ff40c2d/docs/architecture.md
const defaultRender = md.renderer.rules.link_open
                      || md.renderer.rules.text
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

  const { content } = tokens[idx + 1];
  // If the text it contains is a screenshot, format it as a link to the screenshot
  if (content.match(/https:\/\/eternagame.org\/sites\/default\/files\/chat_screens\/\d{6}_\d{10}\.png/)) {
    return `<a target="_blank" href="${content}">`;
  }
  return defaultRender(tokens, idx, options, env, self);

  // pass token to default renderer.
  // return defaultRender(tokens, idx, options, env, self);
};
md.renderer.rules.text = function link(tokens, idx, options, env, self) {
  // If it's a screenshot, format it as an image instead
  if (tokens[idx].content.match(/https:\/\/eternagame.org\/sites\/default\/files\/chat_screens\/\d{6}_\d{10}\.png/)) {
    const { content } = tokens[idx];
    return `<img src="${content}" style="width:calc(100% - 25px); max-width:750px">`;
  }
  // If there's a channel, format it and make sure it can be clicked to visit the channel
  if (tokens[idx].content.match(/#.+/)) {
    let { content } = tokens[idx];
    const channel = tokens[idx].content.match(/#\S+/g);
    if (!channel) return defaultRender(tokens, idx, options, env, self);
    // Wraps channel name in <mark> tags and flags it as a channel name
    content = content.replace(channel[0], `<mark class="channel-link" style="cursor:pointer">${channel[0]}</mark>`);
    return content;
  }
  // If there's a username, format it and make sure it can be clicked to display a tooltip
  if (tokens[idx].content.match(/@.+/)) {
    let { content } = tokens[idx];
    const user = tokens[idx].content.match(/@\S+/g);
    if (!user) return defaultRender(tokens, idx, options, env, self);
    // Wraps username in <mark> tags and flags it as a username
    content = content.replace(user[0], `<mark class="user-link" style="cursor:pointer">${user[0]}</mark>`);
    return content;
  }
  return defaultRender(tokens, idx, options, env, self);
};

export default md;
