import type { CommandHandler } from '#models';
import { isCaseInsensitiveMatch } from '#utils';

/**
 * - `/help` - Get list of commands available
 * - `/help <command>` - Get command-specific help message
 */
export function createHelpCommand(commands: CommandHandler[]): CommandHandler {
  const availableCommands = commands.toSorted((a, b) => a.name.localeCompare(b.name));
  return {
    name: 'help',
    description: 'Displays list of available commands or details about a command',
    usage: '/help [command]',
    examples: ['/help', '/help join'],
    execute({ args, stores }) {
      if (args.length === 0) {
        stores.channel.addSystemMessage(
          `Available commands: ${availableCommands.map((c) => `\`${c.name}\``).join(', ')}`,
        );
        return;
      }

      const [commandName] = args;
      const foundCommand = availableCommands.find((c) =>
        isCaseInsensitiveMatch(c.name, commandName),
      );
      if (foundCommand) {
        stores.channel.addSystemMessage(
          `\`${foundCommand.name}\` ${foundCommand.aliases ? `(Aliases: ${foundCommand.aliases?.join(',')})` : ''} ${foundCommand.requiresOperator ? '_Operator-only_' : ''} - ${foundCommand.description}`,
        );
        stores.channel.addSystemMessage(`Usage: \`${foundCommand.usage}\``);
        if (foundCommand.examples) {
          stores.channel.addSystemMessage(
            `${foundCommand.examples ? `Examples:\n${foundCommand.examples.map((e) => `"\`${e}\`"`).join(', ')}` : ''}`,
          );
        }
      } else {
        stores.channel.addSystemMessage(`No command found for "${commandName}"`);
      }
    },
  };
}
