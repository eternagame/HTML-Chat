<template>
  <div class="tooltip dictionary-word" @mouseover="hover = true" @mouseleave="hover = false">
    <slot></slot>
    <dictionary-tooltip v-if="hover">
      <component :is="components[keyword]"></component>
    </dictionary-tooltip>
  </div>
</template>

<script lang="ts">
  import {Component, Prop} from 'vue-property-decorator'
import Vue from '@/types/vue'
  import DictionaryTooltip from '@/components/ChatContent/Messages/Dictionary/DictionaryTooltip.vue';
  import GC from '@/components/ChatContent/Messages/Dictionary/Tooltips/GC.vue';

  @Component({
    components: {
      DictionaryTooltip,
      GC,
    }
  })
  export default class DictionaryWord extends Vue {
    hover = false;

    components = {
      'GC': 'GC',
      'CG': 'GC',
    }

    get keyword() {
      console.log({hover: this.hover});
      console.log(this.$slots.default![0]!.text!.trim());
      return this.$slots.default![0]!.text!.trim(); // TODO: Which invisible character is there?
    }
  }
</script>

<style scoped lang="scss">
  .dictionary-word {
    display: inline-block;
    border-bottom: 2px dotted currentColor;
    position: relative;
  }

  /*.tooltip {*/
  /*position: relative;*/
  /*display: inline-block;*/
  /*border-bottom: 1px dotted black;*/
  /*}*/

  .tooltip .tooltiptext {
    width: 120px;
    background-color: black;
    color: #fff;
    text-align: center;
    border-radius: 6px;
    padding: 5px 0;
    position: absolute;
    z-index: 1;
    bottom: 110%;
    left: 50%;
    margin-left: -60px;
  }

  .tooltip .tooltiptext::after {
    content: "";
    position: absolute;
    top: 100%;
    left: 50%;
    margin-left: -5px;
    border-width: 5px;
    border-style: solid;
    border-color: black transparent transparent transparent;
  }

</style>
