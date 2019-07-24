import Vue from 'vue';
import Vuex, { StoreOptions, Module } from 'vuex';
import state, { State } from './state';
import mutations from './mutations';
import actions from './actions';
import getters from './getters';

Vue.use(Vuex);

const module: Module<State, any> = {
  getters,
  state,
  mutations,
  actions,
  namespaced: true,
};
export default module;
