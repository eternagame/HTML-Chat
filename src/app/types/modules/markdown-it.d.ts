declare class index {
  constructor(presetName: any, options?: any);

  inline: any;

  block: any;

  core: any;

  renderer: any;

  linkify: any;

  validateLink: any;

  normalizeLink: any;

  normalizeLinkText: any;

  utils: any;

  helpers: any;

  options: any;

  configure(presets: any): any;

  disable(list: any, ignoreInvalid?: any): any;

  enable(list: any, ignoreInvalid?: any): any;

  parse(src: any, env: any): any;

  parseInline(src: any, env: any): any;

  render(src: any, env: any): any;

  renderInline(src: any, env: any): any;

  set(options: any): any;

  use(plugin: any, ...args: any[]): any;
}
export = index;
