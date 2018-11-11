import { MutationTree } from "vuex";
import { State } from "./state";
import Vue from 'vue'

interface PostMessagePayload {
  message: string;
  isHistory: boolean;
}
const mutations: MutationTree<State> = {
  postMessage(state, payload: PostMessagePayload) {
    if (!payload.isHistory && !state.connected) {
      state.toBePosted.push(payload.message);
      return;
    }
    Vue.set(state.postedMessages, state.postedMessages.length, payload.message);
  }
};

export { mutations, PostMessagePayload };
