<template>
  <section class="settings-group" :aria-labelledby="headerId">
    <header class="settings-group-header">
      <h5 :id="headerId" class="m-0 settings-group-title">
        <button
          class="title-toggle"
          :aria-expanded="expanded"
          :aria-controls="groupId"
          @click="expanded = !expanded"
        >
          {{ title }}
        </button>
      </h5>

      <MinimizationTriangle
        class="icon-toggle"
        :controls="groupId"
        :open="expanded"
        @toggle="expanded = $event"
      />
    </header>

    <div :id="groupId" v-show="expanded" class="settings-group-content">
      <slot />
    </div>
  </section>
</template>
<script setup lang="ts">
  import MinimizationTriangle from '#components/ui/MinimizationTriangle.vue';
  import { computed, ref, useId } from 'vue';

  defineProps<{ title: string }>();

  const groupId = useId();
  const headerId = computed(() => `title-${groupId}`);
  const expanded = ref(false);
</script>
<style scoped>
  .settings-group {
    padding: 0.5em 0;
  }

  .settings-group-header {
    display: flex;
    flex-direction: row;
  }

  .settings-group-title {
    flex: 1 1 auto;
    display: flex;
    align-self: stretch;
  }

  .title-toggle {
    flex-grow: 1;
    background-color: transparent;
    border: 0;
    outline-color: currentColor;
    color: inherit;
    padding: 0;
    width: 100%;
    text-align: start;
  }

  .icon-toggle {
    flex: 0 0 auto;
  }

  .settings-group-content {
    margin-top: 0.5em;
  }
</style>
