import Vue from "vue";
import { ActionTree } from "vuex";
import { State } from "./state";
import { HttpResponse } from 'vue-resource/types/vue_resource';
export const actions: ActionTree<State, any> = {
  loadHistory(context) {
    console.log("started");
    new Vue().$http.get("https://irc.eternagame.org/history").then(function(e: HttpResponse) {
      console.log("History recieved");
      let data = e.data;
      let messages = data.trim().split("\n");
      let firstNewMessage = 0;
      let j;
      for (j = 0; j < messages.length; j++)
        if (context.state.postedMessages.indexOf(messages[j].trim()) == -1) break;
      if (!context.state.firstConnection)
        context.commit("postMessage", {
          message:
            "Reconnected to chat - Some messages might be missing if you were away for a long time",
          isHistory: true
        });
      for (; j < messages.length; j++) {
        context.commit("postMessage", { message: messages[j], isHistory: true });
      }
      while (context.state.toBePosted.length) {
        context.commit("postMessage", {
          message: context.state.toBePosted.shift(),
          isHistory: true
        });
      }
      context.state.firstConnection = false;
      context.state.connected = true;
      console.log(context.state.postedMessages);
      //$("#reconnect").hide();
      //$("#chat-loading").hide();
      //$("#chat-input").show();
      //$("div#chat-loading").detach();
      //$("#chat-tabs").show();
      /*setTimeout(function(){
            $("#chat-tabs").children().mCustomScrollbar("scrollTo", "bottom", {callbacks: false});
        }, 100);
        if (USERNAME !== "Anonymous") {
            $("#chat-input").prop("disabled", false);
        } else  {
            $("#chat-input").attr("placeholder", "Please log in to chat")
        }*/
    });
  }
};
