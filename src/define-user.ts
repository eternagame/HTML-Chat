import User from './types/user';

let username = 'MasterStormer';
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

username = username.replace(/^[^a-zA-Z\x5B-\x60\x7B-\x7D]/, '_').replace(/[^a-zA-Z\x5B-\x60\x7B-\x7D\d-]/g, '-').substr(0, 27);
const uidMatch = uid.match(/\d+/);
if (uidMatch && uidMatch[0]) { [uid] = uidMatch; } else { uid = ''; }
const CURRENT_USER = new User(username, uid);
const CHAT_CHANNEL = chatChannel;
const WORKBRANCH = workbranch;

export {
  CHAT_CHANNEL, CURRENT_USER, WORKBRANCH,
};
