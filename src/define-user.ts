import User from './types/user';
import parseUsername from './tools/parseUsername';
import generateNick from './tools/generateNick';

let username = 'MasterStormer';// ^${Math.floor(Math.random() * 90)}`;
let uid = '228064';
let chatChannel = '#test';
let workbranch = 'eternagame.org';

window.location.search
  .slice(1)
  .split('&')
  .forEach((item) => {
    const param = item.split('=')[0];
    if (param === 'name') username = decodeURIComponent(item.split('=')[1]);
    if (param === 'uid') uid = decodeURIComponent(item.split('=')[1]);
    if (param === 'channel') chatChannel = decodeURIComponent(item.split('=')[1]);
    if (param === 'workbranch') workbranch = decodeURIComponent(item.split('=')[1]);
  });

const NICK = generateNick(username, 0);
const CURRENT_USER = new User(parseUsername(NICK), uid);
const CHAT_CHANNEL = chatChannel;
const WORKBRANCH = workbranch;

export {
  CHAT_CHANNEL, CURRENT_USER, NICK, WORKBRANCH,
};
