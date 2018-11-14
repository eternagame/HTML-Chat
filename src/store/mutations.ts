import { MutationTree } from 'vuex';
import Vue from 'vue';
import { State } from './state';

interface PostMessagePayload {
  message: string;
  isHistory: boolean;
}
const mutations: MutationTree<State> = {
  postMessage(state, payload: PostMessagePayload) {
    if (!payload.isHistory && !state.connectionData.connected) {
      state.toBePosted.push(payload.message);
      return;
    }
    Vue.set(state.postedMessages, state.postedMessages.length, payload.message);
  },
};

export { mutations, PostMessagePayload };
