<template>
  <div style="overflow:hidden; position: relative;">
    <textarea
      v-model="value"
      :style="{
        height: `${height}px`,
        'border-bottom-right-radius': radius,
        'border-bottom-left-radius': radius,
        'font-size': `${fontsize}px`
      }"
      class="scalable-input border-0 pl-1 overflow-hidden"
      :class="{ tabbing: $vxm.chat.tabbing }"
      :disabled="disabled"
      @input="$emit('input', $event.target.value); updateAutocomplete($event)"
      ref="textarea"
      @focus="$emit('focused', true)"
      @blur="$emit('focused', false)"
      @select="updateSelection"
      @click="deselect"
      @keypress="onKeyPress"
    />
    <SendButton @send="send" class='float-right'/>
    <div
      ref="hiddenDiv"
      class="scalable-input-hidden invisible border-0"
    ></div>
  </div>
</template>

<script lang="ts">
  import {
    Component, Prop, Vue, Watch,
  } from 'vue-property-decorator';
  import User from '@/types/user';
  import SendButton from './SendButton.vue';
  import md from '@/tools/Markdown';

  @Component({
    components: {
      SendButton,
    },
  })
  export default class ScalableInput extends Vue {
    height = 0;

    alone : boolean = true;

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
      } else {
        this.$refs.textarea.setSelectionRange(position + char.length, position + char.length);
      }
    }

    // For send button
    send() {
      this.$emit('postMessage');
      this.value = '';
      this.$refs.textarea.value = '';
    }

    // Adds and removes border radius on the bottom depending on whether the toolbar/menu is visible
    get radius() {
      if (!this.alone) {
        return '8px';
      }
      return '0px';
    }

    get fontsize() {
      return this.$vxm.settings.fontSize;
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
    + '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' // domain
    + '((\\d{1,3}\\.){3}\\d{1,3}))' // IP
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
      this.value = newText;
      this.$refs.textarea.value = newText;
      this.$refs.textarea.setSelectionRange( // Reselects previously selected text
        startPosition + inside.length,
        endPosition + inside.length,
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
      // Update self
      this.$nextTick(() => this.$forceUpdate());
    }

    @Prop({ default: false })
    disabled !: boolean;

    value = '';

    $refs!: {
      hiddenDiv: HTMLFormElement;
      textarea: HTMLTextAreaElement;
    };

    timer !: number;

    timeout = 5000;

    stopTyping() {
      if (this.$vxm.chat.channels['#off-topic']?.typing.includes(this.$vxm.chat.username)) {
        this.$vxm.chat.stopTyping(this.$vxm.chat.chatChannel);
      }
    }

    onKeyPress(event: any) {
      if (!this.$vxm.chat.channels['#off-topic']?.typing.includes(this.$vxm.chat.username)) {
        this.$vxm.chat.type(this.$vxm.chat.chatChannel);
      }
      clearTimeout(this.timer);
      this.timer = setTimeout(this.stopTyping, this.timeout);
    }

    updateHeight() {
      if (!this.$refs || !this.$refs.hiddenDiv) return;
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
      this.timer = setTimeout(this.stopTyping, this.timeout);
    }

    updated() {
      this.updateHeight();
    }

    autocompletedText = '';

    manualIndex: number | null = null;

    updateAutocomplete(code:InputEvent) {
      // Converts 1-based index to 0-based index
      const cursor = this.$refs.textarea.selectionStart - 1;
      const word = this.wordAt(cursor);
      if (word.startsWith('@')) { // If it's a username
        if (code.data === null) { // If the user hit backspace
          const text = this.value;
          // Replace the autocompleted text with an empty string
          const idx = text.lastIndexOf(this.autocompletedText);
          const l = this.autocompletedText.length;
          // Removes last instance of autompletedText
          this.value = `${text.slice(0, idx)}${text.slice(0, -idx - l)}`;
          this.autocompletedText = '';
          this.manualIndex = cursor - word.length + 1; // Makes sure it won't be autocorrected again
          return;
        }
        const name = word.substring(1);
        const users = Object.values(this.$vxm.chat.connectedUsers) as User[];
        const autocompleteUsers = users.filter(e => e.username.startsWith(name));
        // If there's only one possibility and it should be autocorrected
        if (autocompleteUsers.length === 1 && cursor - word.length + 1 !== this.manualIndex) {
          let { username } = autocompleteUsers[0];
          username = username.replace(name, '');
          this.insertString(cursor + 1, `${username} `);
          this.autocompletedText = `${username}`;
        }
      }
      if (!this.value.includes('@')) { // If there aren't any usernames, reset
        this.manualIndex = null;
        this.autocompletedText = '';
      }
    }

    // Finds the word (not character) at an index
    wordAt(pos: number) {
      const str = this.value;
      const left = str.slice(0, pos + 1).search(/\S+$/);
      const right = str.slice(pos).search(/\s/);
      if (right < 0) {
        return str.slice(left);
      }
      return str.slice(left, right + pos);
    }

    updateSelection() {
      if (!this.$refs || !this.$refs.textarea) return;
      const { textarea } = this.$refs;
      this.$emit('select', [textarea.selectionStart, textarea.selectionEnd]);
      this.selected = true; // Set selected
      // Avoids deselecting when a click is detected at the end of a selection
      setTimeout(() => { this.selected = false; }, 0);
    }

    selected = false;

    deselect() {
      // If the click isn't the end of the selection
      if (!this.selected) {
        // Deselect so the preview shows the entire string
        this.$emit('select', [0, 0]);
      }
    }
  }
</script>

<style scoped lang="scss">
  .scalable-input {
    resize: none;
    position: absolute;
    bottom: 0px;
    color:white;
    background-color:#21508c;
    border-top-right-radius: 8px;
    border-top-left-radius: 8px;
    outline: none;
    padding-right:24px;
    width:calc(100% - 2px) !important;
  }

  .scalable-input:focus {
    box-shadow: 0px 0px 5px 2px rgba(255,255,255,1);
  }

  .scalable-input:not(.tabbing):focus {
    box-shadow: none;
  }

  .scalable-input,
  .scalable-input-hidden {
    min-height: 24px;
  }

  /* To determine input size */
  .scalable-input-hidden {
    position:relative;
    white-space: pre-wrap;
    word-wrap: break-word;
    padding-right:25px; /* Makes sure height updates when it should */
    width: calc(100% - 2px);
  }
  .send-button { /* Send message button */
    position: absolute;
    right:0;
    width:30px;
    height:30px;
    top:-3px;
  }
</style>
