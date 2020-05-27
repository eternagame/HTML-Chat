<template>
  <div style="overflow: hidden; position: relative;">
    <textarea
      v-model="value"
      :style="{
        height: `${height}px`,
      }"
      class="scalable-input"
      :disabled="disabled"
      @input="$emit('input', $event.target.value)"
      ref="textarea"
    />
    <div
      ref="hiddenDiv"
      class="scalable-input-hidden"
    ></div>
  </div>
</template>

<script lang="ts">
  import {
    Component, Prop, Vue, Watch,
  } from 'vue-property-decorator';
  @Component
  export default class ScalableInput extends Vue {
    height = 0;

    insertCharacter(char:string, keepCursor:Boolean) {
      // Set focus back on textarea
      this.$refs.textarea.focus();
      // Get cursor position
      const position = this.$refs.textarea.selectionStart;
      const text = this.$refs.textarea.value;
      /* Concatenates
       - Textarea value up to cursor position
       - Character(s) to be inserted
       - Textarea value after cursor position
      Returns 'text_before_cursor+char+text_after_cursor */
      const newText = `${text.slice(0, position)}${char}${text.slice(position)}`;
      this.$refs.textarea.value = newText;
      this.value = this.$refs.textarea.value;
      if (!keepCursor) {
        this.$refs.textarea.setSelectionRange(position, position);
      }
      this.$emit('input', new KeyboardEvent('keypress', { key: char }));
    }

    // Puts string at index in another string. Used for /me and /help insertions
    insertString(at:number, str:string) {
      this.$refs.textarea.focus();
      const text = this.$refs.textarea.value;
      const newText = `${text.slice(0, at)}${str}${text.slice(at)}`;
      this.$refs.textarea.value = newText;
      this.value = newText;
    }

    insertLink() {
      this.$refs.textarea.focus(); // Focus on textarea
      const startPosition = this.$refs.textarea.selectionStart; // Start and end of selection
      const endPosition = this.$refs.textarea.selectionEnd;
      const text = this.$refs.textarea.value; // All text
      const selection = text.substring(startPosition, endPosition); // Selected text
      if (startPosition !== endPosition) { // If the user selected text
        if (this.validURL(text)) { // If the user selected a URL
          // New text is 'text_before_selection[](selection)text_after_selection
          const newString = `${text.slice(0, startPosition)}[text](${selection})${text.slice(endPosition)}`;
          this.$refs.textarea.value = newString;
          this.value = newString;
          // Put cursor in other [] field
          this.$refs.textarea.setSelectionRange(startPosition + 1, startPosition + 5);
        } else { // If they didn't
          // New text is 'text_before_selection(selection)[]text_after_selection'
          const newString = `${text.slice(0, startPosition)}[${selection}](url)${text.slice(endPosition)}`;
          this.$refs.textarea.value = newString;
          this.value = newString;
          this.$refs.textarea.setSelectionRange( // Put cursor in other [] field
            startPosition + selection.length + 3,
            startPosition + selection.length + 6,
          );
        }
      } else { // If the user has not selected text
        const newString = `${text.slice(0, startPosition)}[text](url)${text.slice(endPosition)}`;
        this.$refs.textarea.value = newString;
        this.value = newString;
        this.$refs.textarea.setSelectionRange( // Put cursor in other [] field
          startPosition + 1,
          endPosition + 5,
        );
      }
    }

    validURL(str:string) { // Used for hyperlink detection
      const pattern = new RegExp('^(https?:\\/\\/)?' // protocol
    + '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' // domain name
    + '((\\d{1,3}\\.){3}\\d{1,3}))' // OR ip (v4) address
    + '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' // port and path
    + '(\\?[;&a-z\\d%_.~+=-]*)?' // query string
    + '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
      return !!pattern.test(str);
    }

    wrapText(inside:string) {
      // Place focus back on textarea
      this.$refs.textarea.focus();
      // Get bounds of selection
      const startPosition = this.$refs.textarea.selectionStart;
      const endPosition = this.$refs.textarea.selectionEnd;
      const text = this.$refs.textarea.value;
      /* Concatenates:
       - Textarea value up to selection
       - What selection should be wrapped in
       - Text in selection
       - What selection should be wrapped in
       - Textarea value after selection

       Returns 'text_before_selection+char+selection+char+text_after_selection'
      */
      const newText = `${text.slice(0, startPosition)}${inside}${text.slice(startPosition, endPosition)}${inside}${text.slice(endPosition)}`;
      this.$refs.textarea.value = newText;
      this.value = newText;
      this.$refs.textarea.setSelectionRange( // Moves cursor after selection
        endPosition + inside.length / 2 + 1,
        endPosition + inside.length / 2 + 1,
      );
    }

    wrapOrInsert(str:string, two:Boolean) {
      const startPosition = this.$refs.textarea.selectionStart; // Gets bounds of selection
      const endPosition = this.$refs.textarea.selectionEnd;
      if (startPosition === endPosition) { // If text is not selected, insert at cursor location
        this.insertCharacter(str, true); // For the first insertion, keep the cursor location
        if (two) { // If there should be two characters (for markdown when no selection)
          this.insertCharacter(str, false); // Insert again and move the cursor back
        }
      } else { // If text selected, wrap selection
        this.wrapText(str);
      }
      this.$nextTick(() => this.$forceUpdate());
    }

    @Prop()
    disabled!: boolean;

    value = '';

    $refs!: {
      hiddenDiv: HTMLFormElement;
      textarea: HTMLTextAreaElement;
    };

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
    bottom: 0px;
    padding: 0;
    color:black;
    background-color:white;
    border:#343a40 1px solid;
    border-radius:8px;
    outline: none;
    padding-right:20px;
    width:calc(100% - 22px) !important;
  }

  .scalable-input:focus {
    border-color: #7b8a8b;
  }

  .scalable-input,
  .scalable-input-hidden {
    min-height: 24px;
  }

  /* To determine input size */
  .scalable-input-hidden {
    position:relative;
    visibility: hidden;
    white-space: pre-wrap;
    word-wrap: break-word;
    border: 1px solid;
    padding-right:25px;
  }
</style>
