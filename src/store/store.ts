import Vue from 'vue';
import Vuex, { StoreOptions } from 'vuex';
import { state, State } from './state';
import { mutations } from './mutations';
import actions from './actions';

Vue.use(Vuex);

const store: StoreOptions<State> = {
  state,
  mutations,
  actions,
};
export default new Vuex.Store<State>(store);
