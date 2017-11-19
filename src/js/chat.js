// jQuery and jQuery-ui
import $ from 'jquery';
import 'jquery-ui/ui/widgets/tabs';
import 'jquery-ui/themes/base/core.css'
import 'jquery-ui/themes/base/tabs.css'

// mCustomScrollbar
import 'malihu-custom-scrollbar-plugin/jquery.mCustomScrollbar.concat.min.js';
import 'malihu-custom-scrollbar-plugin/jquery.mCustomScrollbar.css';

// Markdown-it
import MarkdownIt from "markdown-it";
var md = new MarkdownIt({
    linkify: true,
    typographer: true
}).disable('image');
// Create an instance of markdown-it with no rules enabled, using it just to strip/sanitize HTML
var mdSanitizer = new MarkdownIt('zero');

// SockJS
import SockJS from 'sockjs-client';

// Our assets
import './polyfills';
import {CHAT_CHANNEL, CURRENT_USER} from './define-user';
import '../css/chat.css';

// Username, if not logged in "Annonymous"
var USERNAME = CURRENT_USER ? CURRENT_USER.name : "Anonymous";
// User ID, if not logged in "0"
var UID = CURRENT_USER ? CURRENT_USER.uid : 0;
// Replace invalid IRC nick characters with "-" (or _ if first char), limit its length (max is 32, minux 2 for __ and minus a max of 3 for ^##, then subtract the UID length), and add UID and initial connection number
var NICK = USERNAME.replace(/^[^a-zA-Z\x5B-\x60\x7B-\x7D]/, "_").replace(/[^a-zA-Z\x5B-\x60\x7B-\x7D\d-]/g, "-").substr(0, 27-String(UID).length) + "__" + UID + "^1";
// If no channel has been specified via development-user, connect to #global
var CHANNEL = CHAT_CHANNEL;

// Online users
var onlineUsers = [];

var failedAttempts = 1;
var disconnectionTimers = [5, 10, 15, 30];
var currentTimer = 0;
var timerInterval;

var postedMessages = [];
var toBePosted = [];
var connected = false;
var firstConnection = true;

var postMessageScrollTriggers = 0;

// Initialize saved preferences
try {
    localStorage;
} catch(e) {
    console.warn("Local storage not available (either unsupported or permission denied) - user preferences will not be saved");
    window.localStorage = {}
}
var ignoredUsers = localStorage.chatIgnored || [];

// Chat should start automaticcally scrolling as new messages come in
var autoScroll = true;

var sock;

//DEBUG ONLY
function getSock() {
    return sock;
}

/**
 *  Parse messages sent by server
 *  @param data: Raw data sent by server
 *  @return: Array of parsed messages
 */
function parseCommands(data) {
    var msgs, portions;
    // Split into individual messages (commands)
    msgs = data.split("\r\n");
    // The presence of \r\n at the end causes an extra element, remove it
    msgs.pop();
    for (var i=0; i<msgs.length; i++) {
        // Split into prefix, command, params, and trailer (does not represent RFC1459/2812 specs, only what's needed to parse)
        portions = msgs[i].match(/(?::([^ ]+) )?([^ ]+)((?: (?:[^ :])[^ ]*)*)?(?: :(.+))?/);
        msgs[i] = {};
        msgs[i].origin = portions[1];
        msgs[i].command = portions[2];
        // Fill in params, if a trailer exists, append it (if there are no normal params, sure there's an array)
        msgs[i].params = [];
        if (portions[3]) {
            msgs[i].params = msgs[i].params.concat(portions[3].trim().split(" "));
        }
        if (portions[4]) {
            msgs[i].params.push(portions[4]);
        }
    }
    return msgs;
}

/**
 *  Returns object of onlineUsers which has the given username
 *  @param username: Nick of user to search for
 *  @return: Found element of onlineUsers
 */
function onlineUserWithName( username ) {
    var res = $.grep(onlineUsers, function(o){ return o.name==username.toUpperCase(); })[0];
    if(!res) return false;
    res.index = onlineUsers.indexOf(res);
    return res;
}

/**
 *  When a user joins, make sure they're on the online list
 *  @param username: Nick of joining user
 */
function addUser( username ) {
    var portions, uid, userli;
    var usernamesToIgnore = ["Anonymous", "history", "ChatBot"];
    var ircIds = {
        hoglahoo: 36921,
        Nando: 49507,
        machinelves: 2577,
        LinkBot: 126938,
        LFP6: 48290,
        jnicol: 48166,
        staryjess: 11775,
        bro: 24263,
        brourd: 24263
    };
    
    // Parse automatic suffix
    portions = username.match(/(?:^(.+)(?:__(\d+)\^\d+))|(.+)/);
    // If userid is included, get it, if it's an IRC regular, get their userID from the list
    uid = portions[2]|| ircIds[username] || 0;
    // Get actual username
    username = portions[1] || portions[3];
    // Remove @ from Op's username
    if (username[0] == "@") {
        username = username.slice(1);
    }

    // If the user isn't online and isn't to be ignored, add it to the page in the right place and keep track of it
    if (usernamesToIgnore.includes(username)) return;

    if (!onlineUserWithName(username)) {
        onlineUsers.push({ name: username.toUpperCase(), connections: 1, id: uid });
        onlineUsers.sort(function (userA, userB){
            if (userA.name < userB.name) return -1;
            if (userA.name > userB.name) return 1;
            return 0;
        });

        userli = "<li id=chat-userlist-user-" + username.toUpperCase() + " class=chat-userlist-user><a target=\"_blank\" href=\"http://www.eternagame.org/web/player/" + uid + "/\">" + username + "</a></li>";

        // If there's a user ahead of this one in the array, insert it before that one in the list, else add to the end
        if (onlineUsers[onlineUserWithName(username).index+1]) {
            $( userli ).insertBefore( "li#chat-userlist-user-" + onlineUsers[onlineUserWithName(username).index+1]["name"] );
        } else {
            $("#chat-users-list").append(userli);
        }
        $("#chat-users-online").html(parseInt($("#chat-users-online").html()) + 1);
    } else {
        onlineUsers[onlineUserWithName(username).index]["connections"]++;
    }
}

/**
 *  When a user leaves, remove them from the list
 *  @param username: Nick of parting/quitting user
 */
function removeUser( username ) {
    var usernamesToIgnore = ["Anonymous", "history", "ChatBot"];

    username = username.match(/(?:^(.+)(?:__(\d+)\^\d+))|(.+)/);
    // Get actual username
    username = username[1] || username[3];
    // Remove @ from Op's username
    if (username[0] == "@") {
        username = username.slice(1);
    }

    if (usernamesToIgnore.includes(username)) return;

    if (onlineUsers[onlineUserWithName(username).index]["connections"] == 1) {
        onlineUsers.splice(onlineUserWithName(username).index, 1);
        $("li#chat-userlist-user-" + username.toUpperCase()).remove();
        $("#chat-users-online").html(parseInt($("#chat-users-online").html()) - 1);
    } else {
        onlineUsers[onlineUserWithName(username).index]["connections"]--;
    }
}

/**
 *  HTML escape regular expression
 *  @param search: Regex search stirng
 *  @param mod: Regex modifier string
 *  @return: Encoded regex
 */
function encodedRegex( search ) {
    var mod= '';
    if (search.global) {mod += "g";}
    if (search.multiline) {mod += "m";}
    if (search.ignoreCase) {mod += "i";}
    
    return new RegExp(search.source.replace(/&/g, "&amp;")
                                   .replace(/</g, "&lt;")
                                   .replace(/>/g, "&gt;")
                                   .replace(/"/g, "&quot;")
                                   .replace(/'/g, "&#x27;")
                                   .replace(/\//g, "&#x2F;"),
                      mod);
}

/**
 *  Add color to a username based on the UID in the message or font tags
 *  @param data: Username to be colored
 *  @param uid: UID to use for determining default color
 *  @param isAction: boolean indicating if the message is an action. May need to be reworked once Flash chat is dropped to better coincide with IRC specs
 *  @return: Formatted username HTML
 */
function colorizeUser ( data, uid, isAction ) {
    var colors = ["#f39191", "#f39691", "#f39b91", "#f39f91", "#f3a491", "#f3a891", "#f3ad91", "#f3b191", "#f3b691", "#f3ba91", "#f3bf91", "#f3c491", "#f3c891", "#f3cd91", "#f3d191", "#f3d691", "#f3da91", "#f3df91", "#f3e491", "#f3e891", "#f3ed91", "#f3f191", "#f0f391", "#ebf391", "#e7f391", "#e2f391", "#ddf391", "#d9f391", "#d4f391", "#d0f391", "#cbf391", "#c7f391", "#c2f391", "#bef391", "#b9f391", "#b4f391", "#b0f391", "#abf391", "#a7f391", "#a2f391", "#9ef391", "#99f391", "#94f391", "#91f393", "#91f398", "#91f39c", "#91f3a1", "#91f3a5", "#91f3aa", "#91f3ae", "#91f3b3", "#91f3b7", "#91f3bc", "#f391ba", "#f391b6", "#f391b1", "#f391ad", "#f391a8", "#f391a4", "#f3919f", "#f3919b", "#f39196"];
    // Find escaped font tags, and replace them with a span and the hex color signified, if it's an action remove the tag
    var customColored = data.replace(/&lt;font color=(?:&#x27;|\&quot;)?(#[a-fA-F\d]{6})(?:&#x27;|\&quot;)?&gt;(.+)&lt;\/font&gt;/i, isAction ? '$2':'<span style="color:$1;">$2</span>')
    // Construct span, if it's an action omit the coloring
    return '<a target="_blank" class="chat-message-user-link" href="http://www.eternagame.org/web/player/' + uid + '/"><span class="chat-message-user" ' + (isAction ? '' : 'style="color:' + colors[uid % colors.length] + ';"') + '>' + customColored + '</span></a>' + (!isAction ? ': ' : ' ');
}

/**
 *  Format the current time to a Flash-chat compatible timestamp
 *  @param time: Timestamp at beginning of message
 *  @return: Formatted timestamp
 */
function formatTime( string ) {
    // Construct date from string, get the time
    return new Date(Date.parse(string)).toTimeString().replace(/(\d{2}):(\d{2}).+/, function(match, hour, minutes) {
        // Format to non-millitary, add brackets
        return "[" + (hour%12||12) + ":" + minutes + " " + (hour > 11 ? "PM" : "AM") + "]";
    });
}

/**
 *  Display a message in the chat window
 *  @param raw_msg: The contents of the privmsg to be posted
 *  @param isHistory: If true, it should be pushed at the top, as it is an older message (and may be coming in late)
 *  
 */
function postMessage( raw_msg, isHistory ) {
    if (!isHistory && !connected) {
        toBePosted.push(raw_msg);
        return;
    }
    postedMessages.push(raw_msg.trim());

    var parts, prefix, uid, name, time, isAction, message, classes = '';
    // In a readable format, the regex looks like: ((UID)_(Display Name)_(Date/Time)_)?(Message)
    // Time format: ShortDay ShortMonth Date HH:MM:SS Year UTC
    parts = raw_msg.match(/((\d+)_(.+)_((?:Mon|Tue|Wed|Thu|Fri|Sat|Sun) (?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) [0-3]?\d [0-2]\d(?::[0-6]\d){2} \d{4} UTC)_)?(.+)/);
    prefix = parts[1];
    uid = parts[2];
    name = parts[3];
    time = parts[4];
    raw_msg = parts[5];
    // TODO: In the future, remove this, it's due to Flash chat's pre-escaping before sending.
    raw_msg = raw_msg.replace(/&lt;/g, "<").replace(/&gt;/g, ">");
    // TODO: Eventually remove, only needed for Flash chat compatible /me (once the Flash app is removed ACTION should be used)
    raw_msg = raw_msg.replace(/<I>(.+)<\/I>/g, '*$1*');
    // TODO: Because of how chat works right now, we can only handle the inline styles,
    // but some of the block-level pieces could be nice too once we have multiline messages (lists, blockquotes, and fences mostly).
    // Also, the `code` should be styled (ie have a background color and maybe a different text color), and it currently isn't.
    // Images are also disabled, as we currently don't have a way to format them properly.
    raw_msg = md.renderInline(raw_msg);
    
    
    // Don't show messages from user on ignore list
    if ( ignoredUsers.includes(name) ){return;}

    // For /me
    // NOTE: May need to be reworked once Flash chat is dropped to better coincide with IRC specs
    isAction = raw_msg.startsWith("ACTION ") || name ? name.match(/<I><FONT COLOR="#C0DCE7">(.*)<\/FONT><\/I>/) : false;
    raw_msg = raw_msg.replace(/ACTION /, '');

    // Determine possible message classes
    if (isAction) { classes += " chat-message-action"; }
    if (!prefix) { classes += " chat-message-system"; }

    // Fill template and post
    message = '<li class="chat-message{MSG_CLASS}">{USER}{MESSAGE}<span class="chat-message-time"> {TIME}</span></li>';
    message = message.replace("{MSG_CLASS}", classes)
                     // TODO: Eventually remove the italicise replacement, only needed for Flash chat compatible /me (once the Flash app is removed ACTION should be used)
                     .replace("{USER}", prefix ? colorizeUser(mdSanitizer.renderInline(name.replace(/<I>(.+)<\/I>/g, '*$1*')), uid, isAction) : '')
                     .replace("{MESSAGE}", raw_msg)
        .replace("{TIME}", prefix ? formatTime(time) : '');
    postMessageScrollTriggers++;
    $("#global-chat-messages").append(message);
    if (message.includes('@' + NICK.substr(0, NICK.lastIndexOf('_') - 1))) {
        Notification.requestPermission().then(function (result) {
            var notification = new Notification(name ? name : 'Eterna Not', {
                body: raw_msg,
                tag: 'eterna-chat-ping-' + message,
                icon: 'https://pbs.twimg.com/profile_images/902198585789366272/BRGnomZw.jpg'
            });
        });
    }
}
$(document).ready(function () {
    $("#disconnect").click(function () {
        sock.close();
    });

    initSock();
    // Initialize UI
    // Initialize tabs
    $( "#chat" ).tabs({
        // If we're automatically scrolling, scroll to the bottom. NOTE: This is because Eterna uses an old version of jQuery UI, it's now "activate" (needs to be updated of jQuery UI is updated)
        activate: function( event, ui ) {
            console.log(ui);
            if (ui) {
                if (ui.newPanel[0].id == "chat-tab-global" && autoScroll) {
                    $(ui.newPanel).mCustomScrollbar("scrollTo","bottom");
                }
            }
        }
    });
    // Initialize scrollbar
    $( "#chat-tabs" ).children().mCustomScrollbar({
        // No fancy animation, it makes it feel awkward
        scrollInertia: 0,
        callbacks: {
            // The user has scrolled, so don't automatically move to the bottom on a new message
            onScrollStart: function () {
                if (postMessageScrollTriggers) {
                    postMessageScrollTriggers--;
                    if (autoScroll)
                        $(this).mCustomScrollbar("scrollTo", "bottom");
                }
                else {
                    autoScroll = false;
                }
            },
            // We've hit the bottom, resume scrolling
            onTotalScroll: function() { autoScroll = true;}
        }
    });
    // Fill out max length of message
    // Breakdown - IRC server max: 324, timestamp: 28, underscores: 3, max length of username formatting (for /me, discounting the 3 characters for the command): 40, username: dynamic, UID: dynamic
    $("#chat-input").prop("maxLength", 253 - UID.toString().length - USERNAME.length);

    // Auto-resize chat input (adapted from https://www.impressivewebs.com/textarea-auto-resize/)
    // Set up input and duplicated div
    var input = $('#chat-input'),
    hiddenDiv = '<div id="chat-input-hidden"></div>',
    content = null;
    $(hiddenDiv).insertAfter("#chat-input");
    hiddenDiv = $("#chat-input-hidden");
    input.css("overflow", "hidden");

    input.on('keydown keypress keyup', function () {
        content = $(this).val();
        // Fill content apropriately
        content = content.replace(/\n/g, '<br>');
        hiddenDiv.html(content + '');
        // Determine height from duplicate div
        $(this).css('height', hiddenDiv.height());
    });

    // Key bindings
    $('#chat-input').keypress(function (e) {
        var isAction = false;
        var channel = "#" + CHANNEL;
        // Hit enter in chat
        if (e.which == 13) {
            // No posting as annon or if nothing has been actually posted
            if (USERNAME !== "Anonymous" && $('#chat-input').val().trim() !== '') {
                var message = $('#chat-input').val();
                var post = true;
                // Chat commands
                if (message.startsWith("/")) {
                    var post = false;
                    var command = message.match(/^\/([^ ]+)/)[1];
                    try {
                        var params = message.match(/^\/\w+ (.+)/)[1];
                    } catch(e){}
                    switch (command) {
                        case "help":
                            switch(params) {
                                case "me":
                                    postMessage("/me: Posts message formatted as an action")
                                    postMessage("Usage: /me <message>");
                                    postMessage("Example: /me laughs");
                                    break;
                                case "ignore":
                                    postMessage("/ignore: Don't show messages from a particular user. Show currently ignored users with /ignore-list. Unignore user with /unignore.")
                                    postMessage("Usage: /ignore <username>");
                                    postMessage("Example: /ignore player1");
                                    break;
                                case "ignore-list":
                                    postMessage("/ignore-list: Shows currently ignored users. Ignore a user with /ignore. Unignore user with /unignore.")
                                    postMessage("Usage: /ignore-list");
                                    postMessage("Example: /ignore-list");
                                    break;
                                case "unignore":
                                    postMessage("/unignore: Shows messages from a user after being igored. Unignores all users when username is *. Ignore a user with /ignore. Show currently ignored users with /ignore-list.")
                                    postMessage("Usage: /unignore <username>");
                                    postMessage("Example: /unignore player1");
                                    postMessage("Example: /unignore *");
                                    break;  
                                default:
                                    postMessage("Available commands: help, me, ignore, ignore-list, unignore");
                                    postMessage("Type /help <command> for information on individual commands");
                                    postMessage("Example: /help me");
                                    postMessage("Additional commands available via LinkBot (see the [wiki](http://eternawiki.org/wiki/index.php5/HELP) for more information)");
                                    break;
                            }
                            break;
                        case "me":
                            if (!params){ postMessage("Please include command parameters. Type /help me for usage instructions"); break; }
                            isAction = true;
                            post = true;
                            message = params;
                            break;
                        case "ignore":
                            if (!params){ postMessage("Please include command parameters. Type /help ignore for more usage instructions"); break; }
                            ignoredUsers.push(params);
                            localStorage.chatIgnored = ignoredUsers;
                            postMessage("Ignored " + params);
                            break;
                        case "ignore-list":
                            postMessage("Currently ignored users: " + ignoredUsers.join(", "));
                            break;
                        case "unignore":
                            if (!params){ postMessage("Please include command parameters. Type /help unignore for more usage instructions"); break; }
                            if (params == "*") {
                                ignoredUsers = [];
                                postMessage("Unignored all");
                            } else {
                                ignoredUsers.splice(ignoredUsers.indexOf(params), 1);
                                postMessage("Unignored " + params);
                            }
                            localStorage.chatIgnored = ignoredUsers;
                            break;
                        default:
                            postMessage("Invalid command. Type /help for more available commands");
                            break;
                    }
                }
                
                if (post) {
                    // So Flash chat doesn't break
                    message = message.replace(/</g, "&lt;").replace(/>/g, "&gt;");
                    // Format time to work with Flash chat
                    // TODO: Could use a refactor, might be able to remove this necessity after Flash is removed)
                    if (isAction) {
                        message = UID + '_<I><FONT COLOR="#C0DCE7">' + USERNAME + "</FONT></I>_" + new Date().toUTCString().replace(/(Mon|Tue|Wed|Thu|Fri|Sat|Sun), ([0-3]\d) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) (\d{4}) ([0-2]\d(?::[0-6]\d){2}) GMT/, "$1 $3 $2 $5 $4 UTC") + "_<I>" + message + "</I>";
                    } else {
                        message = UID + "_" + USERNAME + "_" + new Date().toUTCString().replace(/(Mon|Tue|Wed|Thu|Fri|Sat|Sun), ([0-3]\d) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) (\d{4}) ([0-2]\d(?::[0-6]\d){2}) GMT/, "$1 $3 $2 $5 $4 UTC") + "_" + message;
                    }
                    sock.send("PRIVMSG " + channel + " :" + message + "\r\n");
                    postMessage(message, false);
                }
            }
            $('#chat-input').val('');
            return false;
        }
    });
    $("#reconnect").click(initSock);
});
function initSock() {
    clearInterval(timerInterval);
    $("#reconnect").addClass("active");
    $("#reconnect").prop('onclick', null); 
    $("#chat-loading > #connecting").show();
    $("#chat-loading > #failed").hide();

    sock = new SockJS("http://irc.eternagame.org:8081", [], { transports: ['websocket', 'xhr-streaming', 'xdr-streaming', 'eventsource', 'iframe-eventsource', 'htmlfile', 'iframe-htmlfile', 'xhr-polling', 'xdr-polling', 'iframe-xhr-polling'] });
    // Initial Chat Connection
    sock.onopen = function () {
        sock.send("NICK " + NICK + "\r\n");
        sock.send("USER " + "anon" + " 0 * :" + USERNAME + "\r\n");
    };

    // Attempt to reconnect
    sock.onclose = function () {
        console.log("sock closed normally");
        onDisconnect();
    }
    sock.onerror = function () {
        console.log("sock closed by an error");
        onDisconnect();
    }
    function onDisconnect() {
        connected = false;
        $("#reconnect").removeClass("active");
        $("#global-chat-messages").append($("chat-loading").detach());
        $("#chat-loading").show();
        if (failedAttempts == 0) {
            $("#chat-loading > #connecting").show();
            failedAttempts++;
            initSock();
        }
        else {
            currentTimer = disconnectionTimers[Math.min(failedAttempts - 1, 3)];
            $("#chat-loading > #connecting").hide();
            $("#chat-loading > #failed").show();
            $("#chat-loading > #failed > #timer").text(currentTimer);
            $("#reconnect").show();
            $('#chat-input').hide();
            failedAttempts++;
            clearInterval(timerInterval);
            timerInterval = setInterval(updateTimer, 1000);
        }
    };
    function updateTimer() {
        currentTimer--;
        $("#chat-loading > #failed > #timer").text(currentTimer);
        if (currentTimer <= 0) {
            initSock();
        }
    }


    sock.onmessage = function (e) {
        var commands = parseCommands(e.data);
        for (var i = 0; i < commands.length; i++) {
            var cmd = commands[i];
            switch (cmd.command) {
                case "PING":
                    sock.send("PONG :0.0.0.0\r\n");
                    break;
                case "433":
                    // Nick already used, try with fallback
                    var nickNum = parseInt(NICK.match(/\^(\d+)/)[1]) + 1;
                    NICK = NICK.replace(/\^(\d+)/, "^" + nickNum);
                    sock.send("NICK " + NICK + "\r\n");
                    sock.send("USER " + "anon" + " 0 * :" + USERNAME + "\r\n");
                    break;
                case "001":
                    // Initial info
                    console.log("Authenticated");
                    sock.send("JOIN #" + CHANNEL + "\r\n");
                    break;
                case "JOIN":
                    failedAttempts = 0;

                    //$("#chat-content").css("background-color", "rgba(0,0,0,0)");
                    var nick = cmd.origin.split("!")[0];
                    if (nick == NICK) {
                        console.log("Joined " + cmd.params[0]);
                        console.log("Loading history...");
                        $.get("http://irc.eternagame.org:8082/history.html", function (data) {
                            console.log("History recieved");
                            var messages = data.trim().split("\n");
                            var firstNewMessage = 0;
                            var j;
                            for (j = 0; j < messages.length; j++)
                                if (postedMessages.indexOf(messages[j].trim()) == -1) break;
                            if (!firstConnection)
                                postMessage("Reconnected to chat - Some messages might be missing if you were away for a long time", true);
                            for (; j < messages.length; j++) {
                                postMessage(messages[j], true);
                            }
                            while (toBePosted.length) {
                                postMessage(toBePosted.shift(), true);
                            }
                            firstConnection = false;
                            connected = true;
                            $("#reconnect").hide();
                            $("#chat-loading").hide();
                            $("#chat-input").show();
                            $("div#chat-loading").detach();
                            $("#chat-tabs").show();
                            $("#chat-tabs").children().mCustomScrollbar("scrollTo", "bottom");
                            if (USERNAME !== "Anonymous") {
                                $("#chat-input").prop('disabled', false);
                            }
                        });
                    } else {
                        addUser(cmd.origin.split("!")[0]);
                    }
                    break;
                case "331":
                case "332":
                    // Topic, display?
                    break;
                // Part and quit both need to be handled the same way in our case - a user left the room
                case "PART":
                case "QUIT":
                    removeUser(cmd.origin.split("!")[0]);
                    break;
                case "353":
                    var users = cmd.params[3].trim().split(" ");
                    for (var j = 0; j < users.length; j++) {
                        addUser(users[j]);
                    }
                    break;
                case "366":
                    // Signifies end of names, don't think this is needed?
                    break;
                case "NOTICE":
                case "PRIVMSG":
                    postMessage(cmd.params[1], false);
                    break;
                case "MODE":
                    // Check if user has been banned, if so disable input and notify in chat
                    if (cmd.params[1] == "+b") {
                        var maskParts = cmd.params[2].match(/(~q:)?(.+)!.+/);
                        if (NICK.match(new RegExp(maskParts[2].replace("*", ".+").replace("^", "\\^")))) {
                            $("#chat-input").prop('disabled', true);
                            if (maskParts[1]) {
                                postMessage("You are no longer allowed to post in chat");
                            } else {
                                postMessage("You have been banned from chat");
                            }
                        }
                    } else if (cmd.params[1] == "-b") {
                        var maskUser = cmd.params[2].match(/(?:~q:)?(.+)!.+/)[1];
                        if (NICK.match(new RegExp(maskUser.replace("*", ".+").replace("^", "\\^")))) {
                            $("#chat-input").prop('disabled', false);
                            postMessage("You are now allowed to post in chat");
                        }
                    }
                    break;
                // Check if user has been kicked, if so disable input and notify in chat, if other user remove them from online list
                case "KICK":
                    if (cmd.params[1] == NICK) {
                        $("#chat-input").prop('disabled', true);
                        postMessage("You have been kicked from chat" + (cmd.params[2] ? " - " + cmd.params[2] : ''));
                    } else {
                        removeUser(cmd.params[1]);
                    }
                    break;
                case "404":
                    // Can't post message
                    if (cmd.params[2].startsWith("You are banned")) {
                        $("#chat-input").prop('disabled', true);
                        postMessage("You are not allowed to post in chat");
                    }
                    break;
                case "474":
                    // Can't join channel
                    if (cmd.params[1] == "Cannot join channel (+b)") {
                        $("#chat-input").prop('disabled', true);
                        postMessage("You have been banned from chat");
                    }
                    break;
                // Ignore information stuff
                case "002":
                case "003":
                case "004":
                case "005":
                case "251":
                case "252":
                case "253":
                case "254":
                case "255":
                case "265":
                case "266":
                case "333":
                // Topic set by _ at _
                case "422":
                    break;

                default:
                    console.log("[Chat] Unhandled command recieved. Command: " + cmd.command + " Origin: " + cmd.origin + " Params: " + cmd.params);
            }
        }

    };
}