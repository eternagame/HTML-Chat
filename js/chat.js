(function(){
    // Define username/uid, if not logged in "Annonymous" and 0
    var USERNAME = Application.CURRENT_USER ? Application.CURRENT_USER.name : "Anonymous",
    UID = Application.CURRENT_USER ? Application.CURRENT_USER.uid : 0,
    // Replace invalid IRC nick characters with "-" (or _ if first char), add UID and initial connection number
    NICK = USERNAME.replace(/^[^a-zA-Z\x5B-\x60\x7B-\x7D]/, "_").replace(/[^a-zA-Z\x5B-\x60\x7B-\x7D\d-]/g, "-") + "__" + UID + "^1",
    onlineUsers = [],
    ignoredUsers = localStorage.chatIgnored || [],
    autoScroll = true,
    // Using test server, update when live
    sock = new SockJS("http://45.55.234.16");

    /**
        Parse messages sent by server
        @param data: Raw data sen by server
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
        When a user joins, make sure they're on the online list
        @param username: Nick of joining user
     */
    function addUser( username ) {
        var portions, uid, userli, currClients, usernamesToIgnore = ["Anonymous", "history", "ChatBot"]
        , ircIds = {
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
        portions = username.match(/(?:^(.+)(?:__(\d+)\^[1-5]))|(.+)/);
        // If userid is included, get it, if it's an IRC regular, get their userID from the list
        uid = portions[2]|| ircIds[username];
        // Get actual username
        username = portions[1] || portions[3];
        // Remove @ from Op's username
        if (username[0] == "@") {
            username = username.slice(1);
        }

        // If the user isn't online and isn't to be ignored, add it to the page in the right place and keep track of it
        if (!onlineUsers.includes(username.toUpperCase()) && !usernamesToIgnore.includes(username)) {
            onlineUsers.push(username.toUpperCase());
            onlineUsers.sort();
            userli = "<li id=chat-userlist-user-" + username + " class=chat-userlist-user><a target=\"_blank\" href=\"http://www.eternagame.org/web/player/" + uid + "/\">" + username + "</a></li>";
            // If there's a user ahead of this one in the array, insert it before that one in the list, else add to the end
            if (onlineUsers[onlineUsers.indexOf(username.toUpperCase())+1]) {
                $( userli ).insertBefore( "li#chat-userlist-user-" + onlineUsers[onlineUsers.indexOf(username.toUpperCase())+1] );
            } else {
                $("#chat-users-list").append(userli);
            }
            // TODO: This should really just be dealt with by making onlineUsers an array of objects (ie [{name: "username", numClients: n}])
            $("li#chat-userlist-user-" + username).prop("data-numclients", 1);
            $("#chat-users-online").html(parseInt($("#chat-users-online").html()) + 1);
        } else {
            // TODO: See above
            currClients = $("li#chat-userlist-user-" + username).prop("data-numclients");
            $("li#chat-userlist-user-" + username).prop("data-numclients", currClients + 1);
        }
    }

    /**
        When a user leaves, remove them from the list
        @param username: Nick of parting/quitting user
     */
    function removeUser( username ) {
        var currClients;
        username = username.match(/(?:^(.+)(?:__(\d+)\^[1-5]))|(.+)/);
        // Get actual username
        username = username[1] || username[3];
        // Remove @ from Op's username
        if (username[0] == "@") {
            username = username.slice(1);
        }
        // TODO: See addUser, should be dealt with in onlineUsers not a data property
        currClients = $("li#chat-userlist-user-" + username).prop("data-numclients");
        if (currClients == 1) {
            onlineUsers.splice(onlineUsers.indexOf(username), 1);
            $("li#chat-userlist-user-" + username).remove();
            $("#chat-users-online").html(parseInt($("#chat-users-online").html()) - 1);
        } else {
            $("li#chat-userlist-user-" + username).prop("data-numclients", currClients - 1);
        }
    }

    /**
        Unencode data entity encoded by entityEncode so that it can be re-encoded by some other method
        @param data: String to be unencoded
     */
    function unEntityEncode( data ) {
        return data.replace(/&amp;/g, "&")
                   .replace(/&lt;/g, "<")
                   .replace(/&gt;/g, ">")
                   .replace(/&quot;/g, '"')
                   .replace(/&#x27;/g, "'")
                   .replace(/&#x2F;/g, "\/");
    }

    /**
        Escape HTML, render links/underline/italics (carefully)
        @param data: String to entity encode
     */
    function entityEncode( data ) {
        // TODO: In the future, remove the &lt;/&gt; reverting thing, it's due to Flash chat's pre-escaping before sending.
        return data.replace(/&lt;/g, "<")
                   .replace(/&gt;/g, ">")
                   .replace(/&/g, "&amp;")
                   .replace(/</g, "&lt;")
                   .replace(/>/g, "&gt;")
                   .replace(/"/g, "&quot;")
                   .replace(/'/g, "&#x27;")
                   .replace(/\//g, "&#x2F;")
                   // Render a link from anchor tags
                   // Unencoded this looks like: /<a .*href=('|")?(https?:\/\/[^ ]+)\1(?: .*|(?=>))>(.+)<\/a>/
                   .replace(/&lt;a .*href=(&quot;|&#x27;)?(https?:&#x2F;&#x2F;[^ ]+)\1(?: .*|(?=&gt;))&gt;(.+)&lt;&#x2F;a&gt;/gi, function(match, p1, url, contents) {
                        // Unencode url, reencode it properly, and put it in an anchor
                        return '<a target="_blank" style="color:#FFF;" href="' + unEntityEncode( url ).replace(/[\W-]/g, function(match) {
                            return "&#x" + match.charCodeAt(0).toString(16) + ";";
                        }) + '">' +  contents + '</a>';
                   })
                   // Render a link from anything starting with http/https/www.
                   //       /(https?://www.)|(https?://)|(www.)([^ ]+)/
                   .replace(/(?:(https?:&#x2F;&#x2F;www.)|(https?:&#x2F;&#x2F;)|(www.))([^ ]+)/g, function(match, h1, h2, h3, url) {
                        // Unencode url, reencode it properly, and put it in an anchor
                        return '<a target="_blank" style="color:#FFF;" href="' + unEntityEncode( (h1||h2||"http://"+h3) + url ).replace(/[\W-]/g, function(match) {
                            return "&#x" + match.charCodeAt(0).toString(16) + ";";
                        }) + '">' +  (h1?h1.replace(/&#x2F;/g,"\/"):h2?h2.replace(/&#x2F;/g,"\/"):h3) + url + '</a>';
                   })
                   // TODO: Probably remove eventually, only needed for ChatBot to underline links with Flash chat, which is handled automatically in this chat
                   .replace(/&lt;U&gt;(.+)&lt;&#x2F;U&gt;/g, '<span style="text-decoration: underline;">$1</span>')
                   // TODO: Probably remove eventually, only needed for existing /me (once the Flash app is removed ACTION should be used)
                   .replace(/&lt;I&gt;(.+)&lt;&#x2F;I&gt;/g, '<span style="font-style: italic;">$1</span>');
    }

    /**
        Add color to a username based on the UID in the message or font tags
        @param data: Username to be colored
        @param uid: UID to use for determining default color
        @param isAction: If the message is an action, for apropriate formatting. Not being used at this point for compatibility with Flash chat. May need to be refactored to work once that constraint is removed (and messages are no longer prepended) to better coincide with IRC specs
     */
    function colorizeUser ( data, uid, isAction ) {
        var colors = ["#f39191", "#f39691", "#f39b91", "#f39f91", "#f3a491", "#f3a891", "#f3ad91", "#f3b191", "#f3b691", "#f3ba91", "#f3bf91", "#f3c491", "#f3c891", "#f3cd91", "#f3d191", "#f3d691", "#f3da91", "#f3df91", "#f3e491", "#f3e891", "#f3ed91", "#f3f191", "#f0f391", "#ebf391", "#e7f391", "#e2f391", "#ddf391", "#d9f391", "#d4f391", "#d0f391", "#cbf391", "#c7f391", "#c2f391", "#bef391", "#b9f391", "#b4f391", "#b0f391", "#abf391", "#a7f391", "#a2f391", "#9ef391", "#99f391", "#94f391", "#91f393", "#91f398", "#91f39c", "#91f3a1", "#91f3a5", "#91f3aa", "#91f3ae", "#91f3b3", "#91f3b7", "#91f3bc", "#f391ba", "#f391b6", "#f391b1", "#f391ad", "#f391a8", "#f391a4", "#f3919f", "#f3919b", "#f39196"];
        // Find escaped font tags, and replace them with a span and the hex color signified, if it's an action remove the tag
        // Unencoded, the regex would look like /<font color=(?:'|")?#([a-fA-F\d]{6})(?:'|")?>(.+)</font>/i
        var customColored = data.replace(/&lt;font color=(?:&quot;|&#x27;)?(#[a-fA-F\d]{6})(?:&quot;|&#x27;)?&gt;(.+)&lt;&#x2F;font&gt;/i, isAction ? '$2':'<span style="color:$1;">$2</span>')
                                // TODO: Probably remove eventually, only needed for existing /me (once the Flash app is removed ACTION should be used)
                                .replace(/&lt;I&gt;(.+)&lt;&#x2F;I&gt;/, '<span style="font-style: italic;">$1</span>');
        // Construct span, if it's an action omit the coloring
        return '<a target="_blank" class="chat-message-user-link" href="http://www.eternagame.org/web/player/' + uid + '/"><span class="chat-message-user" ' + (isAction ? '' : 'style="color:' + colors[uid % colors.length] + ';"') + '>' + customColored + '</span></a>' + (!isAction ? ': ' : ' ');
    }

    /**
        Format the current time to a timestamp
        @param time: Timestamp at beginning of message
     */
    function formatTime( string ) {
        // Construct date from string, get the time
        return new Date(Date.parse(string)).toTimeString().replace(/(\d{2}):(\d{2}).+/, function(match, hour, minutes) {
            // Format to non-millitary, add brackets
            return "[" + (hour%12||12) + ":" + minutes + " " + (hour > 11 ? "PM" : "AM") + "]";
        });
    }

    /**
        Display a message in the chat window
        @param raw_msg: The contents of the privmsg to be posted
        @param isHistory: If true, it should be pushed at the top, as it is an older message (and may be coming in late)
     */
    function postMessage( raw_msg, isHistory ) {
        var parts, prefix, uid, name, time, isAction, message, classes='';
        // In a readable format, the regex looks like: ((UID)_(Display Name)_(Date/Time)_)?(Message)
        // Time format: ShortDay ShortMonth Date HH:MM:SS Year UTC
        parts = raw_msg.match(/((\d+)_(.+)_((?:Mon|Tue|Wed|Thu|Fri|Sat|Sun) (?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) [0-3]?\d [0-2]\d(?::[0-6]\d){2} \d{4} UTC)_)?(.+)/);
        prefix = parts[1];
        uid = parts[2];
        name = parts[3];
        time = parts[4];
        raw_msg = entityEncode(parts[5]);

        // Don't show quiet commands or messages from user on ignore list
        if ( raw_msg.startsWith("!") || ignoredUsers.includes(name) ){return;}

        // For /me
        // NOTE: Not being used at this point for compatibility with Flash chat. May need to be refactored to work once that constraint is removed (and messages are no longer prepended) to better coincide with IRC specs
        isAction = raw_msg.startsWith("ACTION ") | raw_msg.match(/(<I><FONT COLOR="#C0DCE7">(\d+)<\/FONT><\/I>_(.+)_((?:Mon|Tue|Wed|Thu|Fri|Sat|Sun) (?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) [0-3]\d [0-2]\d(?::[0-6]\d){2} \d{4} UTC)_)<I>(.+)<\/I>/);
        raw_msg = raw_msg.replace(/ACTION /, '');

        // Determine possible message classes
        if (isAction) { classes += " chat-message-action"; } if (!prefix) { classes += " chat-message-system"; }

        // Fill template and post
        message = '<li class="chat-message{MSG_CLASS}">{USER}{MESSAGE}<span class="chat-message-time"> {TIME}</span></li>';
        message = message.replace("{MSG_CLASS}", classes)
                         .replace("{USER}", prefix ? colorizeUser(entityEncode(name), uid, isAction):'')
                         .replace("{MESSAGE}", raw_msg)
                         .replace("{TIME}", prefix ? formatTime(time):'');
        $(isHistory ? "#global-chat-historical" : "#global-chat-messages").append(message);
        if (autoScroll) {
            $("#chat-tab-global").mCustomScrollbar("scrollTo","bottom");
        }
    }

    $( document ).ready(function() {
        // Initialize UI
        // Initialize tabs
        $( "#chat" ).tabs({
            // If we're automatically scrolling, scroll to the bottom. NOTE: This is because Eterna uses an old version of jQuery UI, it's now "activate" (needs to be updated of jQuery UI is updated)
            show: function( event, ui ) {
                if (ui) {
                    if (ui.panel.id == "chat-tab-global" && autoScroll) {
                        $(ui.panel).mCustomScrollbar("scrollTo","bottom");
                    }
                }
            }
        });
        // Initialize scrollbar
        $( "#chat-tabs" ).children().mCustomScrollbar({
            // No fancy animation, it makes it feel awkward
            scrollInertia: 0,
            callbacks:{
                // The user has scrolled, so don't automatically move to the bottom on a new message
                onScrollStart: function() {autoScroll = false;},
                // We've hit the bottom, resume scrolling
                onTotalScroll: function() {autoScroll = true;}
            }
        });
        // Fill out max length of message
        // TODO: This may change with the new IRC server, check into it
        $("#chat-input").prop("maxLength", 460 - UID.length - USERNAME.length);
        // Auto-resize chat input (adapted from https://www.impressivewebs.com/textarea-auto-resize/)
        $(function() {
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
        });

        // Initial Chat Connection
        sock.onopen = function() {
            sock.send("NICK " + NICK + "\r\n");
            sock.send("USER " + "anon" + " 0 * :" + USERNAME + "\r\n");
        };
        // Key bindings
        $('#chat-input').keypress(function (e) {
            var isAction = false;
            // Hit enter in chat
            if (e.which == 13) {
                // No posting as annon or if nothing has been actually posted
                if (USERNAME !== "Anonymous" && $('#chat-input').val() !== '') {
                    var message = $('#chat-input').val();

                    // Chat commands
                    if (message.startsWith("/")) {
                        var command = message.match(/^\/(\w+)/)[1];
                        var params = message.match(/^\/\w+ (.+)/)[1];
                        switch (command) {
                            case "me":
                                isAction = true;
                                message = params;
                                break;
                            case "ignore":
                                ignoredUsers.push(params);
                                localStorage.chatIgnored = ignoredUsers;
                                postMessage("Ignored " + params);
                                return;
                            case "unignore":
                                if (params == "*") {
                                    ignoredUsers = [];
                                    postMessage("Unignored all");
                                } else {
                                    ignoredUsers.splice(ignoredUsers.indexOf(params), 1);
                                    postMessage("Unignored " + params);
                                }
                                localStorage.chatIgnored = ignoredUsers;
                                return;
                            default:
                                postMessage("Invalid Command");
                                return;
                        }
                    }

                    // Format time to work with Flash chat
                    // TODO: Could use a refactor, might be able to remove this necessity after Flash is removed)
                    if (isAction) {
                        message = UID + '_<I><FONT COLOR="#C0DCE7">' + USERNAME + "</FONT></I>_" + new Date().toUTCString().replace(/(Mon|Tue|Wed|Thu|Fri|Sat|Sun), ([0-3]\d) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) (\d{4}) ([0-2]\d(?::[0-6]\d){2}) GMT/, "$1 $3 $2 $5 $4 UTC") + "_<I>" + message + "</I>";
                    } else {
                        message = UID + "_" + USERNAME + "_" + new Date().toUTCString().replace(/(Mon|Tue|Wed|Thu|Fri|Sat|Sun), ([0-3]\d) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) (\d{4}) ([0-2]\d(?::[0-6]\d){2}) GMT/, "$1 $3 $2 $5 $4 UTC") + "_" + message;
                    }
                    sock.send("PRIVMSG #" + CHANNEL + " :" + message + "\r\n");
                    postMessage(message);
                    $('#chat-input').val('');
                }
                return false;
            }
        });
    });

    sock.onmessage = function (e) {
        var commands = parseCommands(e.data);
        for (var i=0; i<commands.length; i++) {
            var cmd = commands[i];
            switch(cmd.command) {
                case "NOTICE":
                    console.log("Connection established");
                    break;
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
                    var nick = cmd.origin.split("!")[0];
                    if (nick == NICK) {
                        console.log("Joined " + cmd.params[0]);
                        $("#chat-loading").hide();
                        $("#chat-tabs").show();
                        $("#chat-tabs").children().mCustomScrollbar("scrollTo","bottom");
                        if (USERNAME !== "Anonymous") {
                            $("#chat-input").prop('disabled', false);
                        }
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
                    for (var j=0; j<users.length; j++) {
                        addUser(users[j]);
                    }
                    break;
                case "366":
                    // Signifies end of names, don't think this is needed?
                    break;
                case "PRIVMSG":
                    postMessage(cmd.params[1], cmd.origin == "history!history@0.0.0.0");
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
                        postMessage("You have been kicked from chat");
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
})();