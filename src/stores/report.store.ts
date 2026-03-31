import { defineStore } from 'pinia';
import { readonly, ref } from 'vue';

export const useReportStore = defineStore('report', () => {
  const isReportOpen = ref(false);

  return {
    isReportOpen: readonly(isReportOpen),
  };
});
