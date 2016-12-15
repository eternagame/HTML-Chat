var Application = {
    CURRENT_USER: {}
};

var CHAT_CHANNEL = "global";
location.search.slice(1).split("&").forEach(function(item){
    var param = item.split("=")[0];
    if (param == "name" || param == "uid") {
        Application.CURRENT_USER[param] = item.split("=")[1];
    } else if (param == "channel") {
        CHAT_CHANNEL = item.split("=")[1];
    }
});
if (Application.CURRENT_USER.name == undefined || Application.CURRENT_USER.uid == undefined) {
    Application.CURRENT_USER = undefined;
}