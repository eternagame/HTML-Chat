let CURRENT_USER = {
  name: "MasterStormer",
  uid: "228064",
  nick: "MasterStormer^" + Math.floor(Math.random() * 90)
};
let CHAT_CHANNEL = "#test";
let WORKBRANCH = "eternagame.org";

location.search
  .slice(1)
  .split("&")
  .forEach(function(item) {
    let param = item.split("=")[0];
    if (param == "name") CURRENT_USER.name = decodeURIComponent(item.split("=")[1]);
    if (param === "uid") CURRENT_USER.uid = decodeURIComponent(item.split("=")[1]);
    if (param == "channel") CHAT_CHANNEL = decodeURIComponent(item.split("=")[1]);
    if (param == "workbranch") WORKBRANCH = decodeURIComponent(item.split("=")[1]);
  });
//CURRENT_USER.nick = CURRENT_USER.name.replace(/^[^a-zA-Z\x5B-\x60\x7B-\x7D]/, "_").replace(/[^a-zA-Z\x5B-\x60\x7B-\x7D\d-]/g, "-").substr(0, 27-CURRENT_USER.uid.length) + "__" + CURRENT_USER.uid + "^1";
export { CHAT_CHANNEL, CURRENT_USER, WORKBRANCH };
