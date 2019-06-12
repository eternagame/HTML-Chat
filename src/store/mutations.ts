import { MutationTree, CommitOptions } from 'vuex';
import Vue from '@/types/vue';
import { State } from './state';
import parseUsername from '../tools/parseUsername';
import User from '../types/user';
import Message from '../types/message';

interface PostMessagePayload {
  message: Message;
  isHistory: boolean;
}
const mutations: MutationTree<State> = {
  postMessage(state, payload: PostMessagePayload) {
    if (payload.message.target === '*') {
      Object.keys(state.postedMessages).forEach((channel) => {
        state.postedMessages[channel].push(payload.message);
      });
    } else if (payload.message.target in state.postedMessages) {
      state.postedMessages[payload.message.target].push(payload.message);
    }
  },
  addUser(state, { nick, uid }: { nick: string, uid: string }) {
    const username = parseUsername(nick);
    if (!(username in state.connectedUsers)) {
      Vue.set(state.connectedUsers, username, new User(username, uid));
    }
    const user = state.connectedUsers[username];
  },
  removeUser(state, { nick }: { nick: string }) {
    const username = parseUsername(nick);
    const user = state.connectedUsers[username];
    if (!user) return;
    const index = user.nicks.indexOf(nick);
    Vue.delete(user.nicks, index);
    if (user.nicks.length === 0) {
      Vue.delete(state.connectedUsers, user.username);
    }
  },
  changeNick(state, { nick }: { nick: string }) {
    const index = state.currentUser.nicks.indexOf(state.nick);
    if (index !== -1) { state.currentUser.nicks.splice(index, 1); }
    state.currentUser.nicks.push(nick);
    state.nick = nick;
  },
  changeTab(state, { tabIndex }: { tabIndex: number }) {
    state.activeTab = tabIndex;
  },
  setConnected(state, { connected }: { connected: boolean }) {
    state.connectionData.connected = connected;
    if (connected) { state.connectionData.firstConnection = false; }
  },
  setFirstConnection(state, { firstConnection }: { firstConnection: boolean }) {
    state.connectionData.firstConnection = firstConnection;
  },
  connectionTimerTick(state) {
    state.connectionData.currentTimer -= 1;
  },
  openContextMenu(state, { event, message }: { event: any; message: Message }) {
    // Subscribed to
  },
  openReportModal(state) {
    // Subscribed to in the report modal file
  },
  ignoreUser(state, { username }: { username: string }) {
    if (!state.ignoredUsers.includes(username)) state.ignoredUsers.push(username);
  },
  unignoreUser(state, { username }: { username: string }) {
    if (state.ignoredUsers.includes(username)) {
      state.ignoredUsers.splice(state.ignoredUsers.indexOf(username), 1);
    }
    if (username === '*') state.ignoredUsers = [];
  },
  updatedHeight(state) {
    // Subscribed to
  },
  updateScrollbar(state) {
    // Subscribed to
  },
};

export { mutations, PostMessagePayload };