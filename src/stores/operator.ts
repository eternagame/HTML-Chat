import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

const userOperatorStore = defineStore('operator', () => {
  const isOperator = ref(false);
  // TODO: Add operator authentication, saving credentials, and operator actions here
  return {
    isOperator: computed(() => isOperator),
  };
});

export default userOperatorStore;
