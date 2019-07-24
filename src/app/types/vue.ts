import V from 'vue';
import { Store } from 'vuex';
import { State } from '@/store/state';

// eslint-disable-next-line
declare type GlobalState = { $_chat: State };
class Vue extends V {
    $store!: Store<GlobalState>;
}

export default Vue;
