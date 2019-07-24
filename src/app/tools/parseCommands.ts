function parseCommands(data: any) {
  const msgs = data.split('\r\n');

  // Split into individual messages (commands)


  for (let i = 0; i < msgs.length; i++) {
    // Split into prefix, command, params, and trailer
    // (does not represent RFC1459/2812 specs, only what's needed to parse)
    const portions = msgs[i].match(/(?::([^ ]+) )?([^ ]+)((?: (?:[^ :])[^ ]*)*)?(?: :(.+))?/);
    msgs[i] = { origin: portions[1], command: portions[2] };
    // Fill in params, if a trailer exists, append it
    // (if there are no normal params, sure there's an array)
    msgs[i].params = [];
    if (portions[3]) {
      msgs[i].params = msgs[i].params.concat(portions[3].trim().split(' '));
    }
    if (portions[4]) {
      msgs[i].params.push(portions[4]);
    }
  }
  return msgs;
}

export default parseCommands;
