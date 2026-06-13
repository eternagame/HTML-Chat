import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useConfigurationStore = defineStore('configuration', () => {
  const appContext = ref('default');

  return { appContext };
});
