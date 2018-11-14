import Vue from "vue";
import { ActionTree } from "vuex";
import { HttpResponse } from "vue-resource/types/vue_resource";
import { State } from "./state";

import SockJS from "sockjs-client";

export const actions: ActionTree<State, any> = {
  loadHistory(context) {
    new Vue().$http.get("https://irc.eternagame.org/history").then((e: HttpResponse) => {
      const data = e.data;
      const messages = data.trim().split("\n");
      const firstNewMessage = 0;
      let j;
      for (j = 0; j < messages.length; j++)
        if (context.state.postedMessages.indexOf(messages[j].trim()) == -1) break;
      if (!context.state.connectionData.firstConnection) {
        context.commit("postMessage", {
          message:
            "Reconnected to chat - Some messages might be missing if you were away for a long time",
          isHistory: true
        });
      }
      for (; j < messages.length; j++) {
        context.commit("postMessage", { message: messages[j], isHistory: true });
      }
      while (context.state.toBePosted.length) {
        context.commit("postMessage", {
          message: context.state.toBePosted.shift(),
          isHistory: true
        });
      }
      context.state.connectionData.firstConnection = false;
      context.state.connectionData.connected = true;
      console.log(context.state.postedMessages);
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
  connect({state, dispatch}) {
    const sock = new SockJS("https://irc.eternagame.org/chatws", [], {
      transports: ["websocket", "xhr-streaming", "xdr-streaming", "eventsource", "iframe-eventsource", "htmlfile", "iframe-htmlfile", "xhr-polling", "xdr-polling", "iframe-xhr-polling"]
    });
    // Initial Chat Connection
    sock.onopen = function() {
      sock.send("NICK " + state.userData.nick + "\r\n");
      sock.send("USER " + "anon" + " 0 * :" + state.userData.username + "\r\n");
      dispatch('loadHistory');
    };

    // Attempt to reconnect
    sock.onclose = function() {
      console.log("sock closed normally");
      dispatch('onDisconnect');
    };
    sock.onerror = function() {
      console.log("sock closed by an error");
      dispatch('onDisconnect');
    };
    state.sock = sock;
  },
  onDisconnect(){

  },
  sendMessage({state, commit}, {channel, message} : {channel: string, message: string}){
      // So Flash chat doesn't break
      message = message.replace(/</g, "&lt;").replace(/>/g, "&gt;");
      // Format time to work with Flash chat
      // TODO: Could use a refactor, might be able to remove this necessity after Flash is removed)
      //if (isAction) {
      //    message = UID + '_<I><FONT COLOR="#C0DCE7">' + USERNAME + "</FONT></I>_" + new Date().toUTCString().replace(/(Mon|Tue|Wed|Thu|Fri|Sat|Sun), ([0-3]\d) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) (\d{4}) ([0-2]\d(?::[0-6]\d){2}) GMT/, "$1 $3 $2 $5 $4 UTC") + "_<I>" + message + "</I>";
      //} else {
          message = state.userData.uid + "_" + state.userData.username + "_" + new Date().toUTCString().replace(/(Mon|Tue|Wed|Thu|Fri|Sat|Sun), ([0-3]\d) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) (\d{4}) ([0-2]\d(?::[0-6]\d){2}) GMT/, "$1 $3 $2 $5 $4 UTC") + "_" + message;
      //}
      state.sock.send("PRIVMSG " + channel + " :" + message + "\r\n");
      console.log("PRIVMSG " + channel + " :" + message + "\r\n")
      commit('postMessage', {message, isHistory: false});
  }
};
