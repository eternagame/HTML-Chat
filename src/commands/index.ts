import type { CommandHandler } from '#models';
import * as handlers from './handlers';

export function createCommandRegistry() {
  const registry = new Map<string, CommandHandler>();
  for (const handler of Object.values(handlers)) {
    if (!handler) {
      continue;
    }
    // TODO: Check for accidental command name collisions
    // Add commands and their aliases to the registry
    registry.set(handler.name, handler);
    handler.aliases?.forEach((alias) => registry.set(alias, handler));
  }
  return registry;
}
