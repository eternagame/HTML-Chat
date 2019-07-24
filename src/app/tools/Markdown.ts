// Markdown-it
import MarkdownIt from 'markdown-it';

const md = new MarkdownIt({
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

  // pass token to default renderer.
  return defaultRender(tokens, idx, options, env, self);
};

export default md;
