import { GetterTree } from 'vuex';
import { State } from './state';

const getters: GetterTree<State, any> = {
  unignoredMessages(state: State) {
    return (channel: string) => state.postedMessages[channel]
      .filter(message => !state.ignoredUsers.includes(message.user.username));
  },
};

export default getters;
