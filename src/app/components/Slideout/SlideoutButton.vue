<template>
  <!-- Centers images -->
  <button
    type="button"
    class='border-0'
    @click="emit('input')"
    :aria-label="`${name} tab`"
  >
    <center
      class='border-0 font-weight-bold text-white d-inline-block'
      @click="emit('input')"
    >
      <img
        :alt="`${selected ? 'Selected' : 'Unselected'} ${name} tab`"
        :src="require(`@/assets/${name}-icon-${selected ? 'green' : 'white'}.png`)"
      >
      <slot />
    </center>
  </button>
</template>

<script lang="ts" setup>
defineProps({
  name: {
    type: String,
    required: true,
  },
  selected: {
    type: Boolean,
    required: true,
  },
});
const emit = defineEmits<{
  (event: 'input'): void;
}>();
</script>

<style lang="scss" scoped>
  /* Style the buttons that are used to open the tab content */
  center {
    outline: none;
    cursor: pointer;
    transition: 0.3s;
    font-family: "Century Gothic", "Didact Gothic", Arial, sans-serif;
    font-size: 12px;
    width:40px;
  }
  button {
    background-color:transparent;
  }
</style>
