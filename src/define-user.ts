import { User } from './types/user';
import { parseUsername } from './tools/ParseUsername';

let NICK = `MasterStormer^${Math.floor(Math.random() * 90)}`;
let UID = '228064';
let CHAT_CHANNEL = '#test';
let WORKBRANCH = 'eternagame.org';

location.search
  .slice(1)
  .split('&')
  .forEach((item) => {
    const param = item.split('=')[0];
    if (param == 'name') NICK = decodeURIComponent(item.split('=')[1]);
    if (param === 'uid') UID = decodeURIComponent(item.split('=')[1]);
    if (param == 'channel') CHAT_CHANNEL = decodeURIComponent(item.split('=')[1]);
    if (param == 'workbranch') WORKBRANCH = decodeURIComponent(item.split('=')[1]);
  });
// CURRENT_USER.nick = CURRENT_USER.name.replace(/^[^a-zA-Z\x5B-\x60\x7B-\x7D]/, "_").replace(/[^a-zA-Z\x5B-\x60\x7B-\x7D\d-]/g, "-").substr(0, 27-CURRENT_USER.uid.length) + "__" + CURRENT_USER.uid + "^1";
const CURRENT_USER = new User(parseUsername(NICK), UID);
export { CHAT_CHANNEL, CURRENT_USER, NICK, WORKBRANCH };
