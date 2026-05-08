import type { CommandHandler } from '#models';
import * as handlers from './handlers';
import { createHelpCommand } from './help';

export function createCommandRegistry() {
  const registry = new Map<string, CommandHandler>();
  const allCommands = Object.values(handlers).filter((h): h is CommandHandler => h !== null);

  for (const handler of allCommands) {
    // Add commands and their aliases to the registry
    registry.set(handler.name, handler);
    handler.aliases?.forEach((alias) => registry.set(alias, handler));
  }
  const helpHandler = createHelpCommand(allCommands);
  registry.set(helpHandler.name, helpHandler);

  return registry;
}
