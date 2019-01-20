import Vue from "vue";
import { ActionTree } from "vuex";
import { HttpResponse } from "vue-resource/types/vue_resource";
import { State, state } from "./state";
import { parseCommands } from "../tools/ParseCommands";
//import { discordActions } from './discordActions'
import SockJS from "sockjs-client";
import { Message } from "../types/message";
import Irc, { IrcMessage } from "irc-framework/browser";
import { Connection } from "./websocket";
export const actions: ActionTree<State, any> = {
  //...discordActions,
  loadHistory(context) {
    console.log("Loading History");
    new Vue().$http.get("https://irc.eternagame.org/history").then((e: HttpResponse) => {
      const data = e.data as string;
      const messages = data.trim().split("\n");
      const firstNewMessage = 0;
      let j;
      for (j = 0; j < messages.length; j++)
        //if (context.state.postedMessages.indexOf(messages[j].trim()) == -1) break;
        break;
      if (!context.state.connectionData.firstConnection) {
        context.commit("postMessageFromText", {
          message:
            "Reconnected to chat - Some messages might be missing if you were away for a long time",
          isHistory: true
        });
      }
      for (; j < messages.length; j++) {
        context.commit("postMessageFromText", { message: messages[j], isHistory: true });
      }
      while (context.state.toBePosted.length) {
        context.commit("postMespostMessageFromTextsage", {
          message: context.state.toBePosted.shift(),
          isHistory: true
        });
      }
      context.state.connectionData.firstConnection = false;
      context.state.connectionData.connected = true;
      // $("#reconnect").hide();
      // $("#chat-loading").hide();
      // $("#chat-input").show();
      // $("div#chat-loading").detach();
      // $("#chat-tabs").show();
      /* setTimeout(function(){
            $("#chat-tabs").children().mCustomScrollbar("scrollTo", "bottom", {callbacks: false});
        }, 100);
        if (USERNAME !== "Anonymous") {
            $("#chat-input").prop("disabled", false);
        } else  {
            $("#chat-input").attr("placeholder", "Please log in to chat")
        } */
    });
  },
  initClient({state, commit, dispatch}){
    const client = new Irc.Client({
      host: "irc.eternagame.org/chatws/websocket",
      nick: state.userData.nick,
      username: state.userData.uid,
      gecos: state.userData.username,
      transport: Connection,
      ssl: true
    });
    console.log("nick: " + state.userData.nick + "  " + client.user.nick);
    console.log(client.user);
    client.on("raw", function(e) {
      //console.log(e);
    });
    client.on("registered", function(e) {
      var channel = client.channel("#test");
      console.log(e.nick);
      channel.join();
      console.log("connected");
      channel.updateUsers(function() {
        console.log("users:");
        console.log(channel.users);
        for (let user of channel.users) commit("addUser", { user: user });
      });
      client.on("join", function(e) {
        console.log(e);
        commit("addUser", { user: e });
      });
      commit("setConnected", { connected: true });
      //dispatch('loadHistory');
    });
    client.on("message", function(event) {
      dispatch("onMessageRecieved", { message: event });
    });
    client.on("sock close", function(event) {
      console.log("sock closed normally"); //not necesserally normally
      dispatch("onDisconnect");
    });
    state.client = client;
    dispatch('connect');

  },
  connect({ state, commit, dispatch }) {
    state.client!.connect();
    for(let i = 0; i < 100; i++)
    commit("postMessage", {
      message: { nick: state.userData.nick, message: i, target: state.channels[state.activeTab] }
    });
  },
  sendMessage({ state, commit }, { message }: { message: string }) {
    commit("postMessage", {
      message: { nick: state.userData.nick, message, target: state.channels[state.activeTab] }
    });
    state.client!.sendMessage("privmsg", "#test", message);
    //state.client!.raw(`@+user-color PRIVMSG #test ${message}`);
  },
  sendMessageRaw({ state }) {},
  /* sendMessage({ state, commit }, { channel, message }: { channel: string | undefined; message: string }) {
    if(! channel)
        channel = state.currentChannel;
    // So Flash chat doesn't break
    message = message.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    // Format time to work with Flash chat
    // TODO: Could use a refactor, might be able to remove this necessity after Flash is removed)
    //if (isAction) {
    //    message = UID + '_<I><FONT COLOR="#C0DCE7">' + USERNAME + "</FONT></I>_" + new Date().toUTCString().replace(/(Mon|Tue|Wed|Thu|Fri|Sat|Sun), ([0-3]\d) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) (\d{4}) ([0-2]\d(?::[0-6]\d){2}) GMT/, "$1 $3 $2 $5 $4 UTC") + "_<I>" + message + "</I>";
    //} else {
    message =
      state.userData.uid +
      "_" +
      state.userData.username +
      "_" +
      new Date()
        .toUTCString()
        .replace(
          /(Mon|Tue|Wed|Thu|Fri|Sat|Sun), ([0-3]\d) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) (\d{4}) ([0-2]\d(?::[0-6]\d){2}) GMT/,
          "$1 $3 $2 $5 $4 UTC"
        ) +
      "_" +
      message;
    //}
    state.sock.send("PRIVMSG " + channel + " :" + message + "\r\n");
    console.log("PRIVMSG " + channel + " :" + message + "\r\n");
    commit("postMessage", { message, isHistory: false });
  },*/
  onMessageRecieved({ state, commit, dispatch }, { message }: { message: IrcMessage }) {
    const client = state.client!;
    let NICK = state.userData.nick;
    console.log(message);
    commit("postMessage", { message });
    return;
    var commands = parseCommands(message);
    for (var i = 0; i < commands.length; i++) {
      var cmd = commands[i];
      switch (cmd.command) {
        case "PING":
          client.raw("PONG :0.0.0.0\r\n");
          break;
        case "433":
          // Nick already used, try with fallback
          var nickNum = parseInt(NICK.match(/\^(\d+)/)![1]) + 1;
          NICK = state.userData.nick = NICK.replace(/\^(\d+)/, "^" + nickNum);
          client.raw("NICK " + NICK + "\r\n");
          break;
        case "001":
          // Initial info
          console.log("Authenticated");
          client.raw("JOIN " + state.currentChannel + "\r\n");
          break;
        case "JOIN":
          state.connectionData.failedAttempts = 0;

          //$("#chat-content").css("background-color", "rgba(0,0,0,0)");
          var nick = cmd.origin.split("!")[0];
          if (nick == NICK) {
            console.log("Joined " + cmd.params[0]);
            //dispatch("loadHistory");
            state.connectionData.connected = true;
          } else {
            commit("addUser", { username: cmd.origin.split("!")[0] });
          }
          break;
        case "331":
        case "332":
          // Topic, display?
          break;
        // Part and quit both need to be handled the same way in our case - a user left the room
        case "PART":
        case "QUIT":
          commit("addUser", { username: cmd.origin.split("!")[0] });
          break;
        case "353":
          var users = cmd.params[3].trim().split(" ");
          for (var j = 0; j < users.length; j++) {
            commit("addUser", { username: users[j] });
          }
          break;
        case "366":
          // Signifies end of names, don't think this is needed?
          break;
        case "NOTICE":
        case "PRIVMSG":
          commit("postMessage", { message: new Message(cmd.params[1], undefined, false) });
          break;
        case "MODE":
          // Check if user has been banned, if so disable input and notify in chat
          if (cmd.params[1] == "+b") {
            var maskParts = cmd.params[2].match(/(~q:)?(.+)!.+/);
            if (
              state.userData.nick.match(
                new RegExp(maskParts[2].replace("*", ".+").replace("^", "\\^"))
              )
            ) {
              state.userData.banned = true;
              if (maskParts[1]) {
                commit("postMessage", { message: "You are no longer allowed to post in chat" });
              } else {
                commit("postMessage", { message: "You have been banned from chat" });
              }
            }
          } else if (cmd.params[1] == "-b") {
            var maskUser = cmd.params[2].match(/(?:~q:)?(.+)!.+/)[1];
            if (NICK.match(new RegExp(maskUser.replace("*", ".+").replace("^", "\\^")))) {
              state.userData.banned = false;
              commit("postMessage", { message: "You are now allowed to post in chat" });
            }
          }
          break;
        // Check if user has been kicked, if so disable input and notify in chat, if other user remove them from online list
        case "KICK":
          if (cmd.params[1] == NICK) {
            state.userData.banned = true;
            commit("postMessage", {
              message:
                "You have been kicked from chat" + (cmd.params[2] ? " - " + cmd.params[2] : "")
            });
          } else {
            commit("removeUser", { username: cmd.params[1] });
          }
          break;
        case "404":
          // Can't post message
          if (cmd.params[2].startsWith("You are banned")) {
            state.userData.banned = true;
            commit("postMessage", { message: "You are not allowed to post in chat" });
          }
          break;
        case "474":
          // Can't join channel
          if (cmd.params[1] == "Cannot join channel (+b)") {
            state.userData.banned = true;
            commit("postMessage", { message: "You have been banned from chat" });
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
          console.log(
            "[Chat] Unhandled command recieved. Command: " +
              cmd.command +
              " Origin: " +
              cmd.origin +
              " Params: " +
              cmd.params
          );
      }
    }
  },
  onDisconnect({ state, dispatch, commit }) {
    const data = state.connectionData;
    commit("setConnected", { connected: false });
    if (data.failedAttempts == 0) {
      data.failedAttempts++;
      dispatch("connect");
    } else {
      data.currentTimer = data.disconnectionTimers[Math.min(data.failedAttempts - 1, 3)];
      data.failedAttempts++;
      clearInterval(data.timerInterval);
      data.timerInterval = setInterval(() => dispatch("updateTimer"), 1000);
    }
  },
  updateTimer({ state, commit, dispatch }) {
    commit('connectionTimerTick');
    if (state.connectionData.currentTimer <= 0) {
      dispatch("connect");
    }
  }
};
