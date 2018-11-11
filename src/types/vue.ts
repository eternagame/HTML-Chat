import V from 'vue'
import { Store } from 'vuex';
import { State } from '@/store/state';

class Vue extends V{
    $store!: Store<State>;
}

export default Vue;