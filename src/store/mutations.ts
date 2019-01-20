import { MutationTree } from "vuex";
import Vue from "vue";
import { State } from "./state";
import { IrcMessage, IrcUser } from "irc-framework/browser";
interface PostMessagePayload {
  message: IrcMessage;
  isHistory: boolean;
}
const mutations: MutationTree<State> = {
  postMessage(state, payload: PostMessagePayload) {
    state.postedMessages[payload.message.target].push(payload.message);
  },
  addUser(state, { user }: { user: IrcUser }) {
    state.connectedUsers[user.nick] = user;
  },
  removeUser() {},
  postMessageFromText(state, payload: { channel: string; message: string; isHistory: boolean }) {
    let message = payload.message;
    let firstUnderscore = message.indexOf("_");
    let nick = payload.message.substring(
      firstUnderscore + 1,
      message.indexOf("_", firstUnderscore + 1)
    );
    message = message.substr(message.indexOf("UTC_") + 4);
    state.postedMessages[payload.channel].push({ message, nick } as IrcMessage);
  },
  changeTab(state, { tabIndex }: { tabIndex: number }) {
    state.activeTab = tabIndex;
  },
  setConnected(state, { connected }: { connected: boolean }) {
    state.connectionData.connected = connected;
  },
  connectionTimerTick(state){
    state.connectionData.currentTimer--;
  },
};

export { mutations, PostMessagePayload };
