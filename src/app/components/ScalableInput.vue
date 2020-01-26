<template>
  <div style="overflow: hidden; position: relative;">
    <textarea
      :value="value"
      :style="{height: `${height}px`}"
      class="scalable-input"
      :disabled="disabled"
      @input="$emit('input', $event.target.value)"
    />
    <div
      ref="hiddenDiv"
      class="scalable-input-hidden"
    ></div>
  </div>
</template>

<script lang="ts">
  import { Component, Prop, Vue } from 'vue-property-decorator';


  @Component({})
  export default class ScalableInput extends Vue {
    height = 0;

    @Prop()
    disabled!: boolean;

    @Prop()
    value!: string;

    $refs!: {
      hiddenDiv: HTMLFormElement;
    };

    onInput(event: any) {
      this.$emit('input', event.target.value);
    }

    onKeyPress(event: any) {
      this.$emit('keypress', event);
    }

    updateHeight() {
      const { hiddenDiv } = this.$refs;
      hiddenDiv.textContent = this.value;
      if (this.height !== this.$refs.hiddenDiv.clientHeight) {
        this.height = hiddenDiv.clientHeight;
        this.$emit('updateHeight');
      }
    }

    mounted() {
      window.addEventListener('resize', this.updateHeight);
      this.$nextTick(this.updateHeight);
    }

    updated() {
      this.updateHeight();
    }
  }
</script>

<style scoped lang="scss">
  .scalable-input {
    resize: none;
    overflow: hidden;
    position: absolute;
    top: 0px;
    padding: 0;
  }

  .scalable-input,
  .scalable-input-hidden {
    width: calc(100% - 2px); //100% - border
    min-height: 19px;
  }

  /* To determine input size */
  .scalable-input-hidden {
    position:relative;
    visibility: hidden;
    white-space: pre-wrap;
    word-wrap: break-word;
    border: 1px solid;
  }
</style>
