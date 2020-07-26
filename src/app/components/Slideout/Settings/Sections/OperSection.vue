<template>
  <SettingsSection title="Operator" >
    <li>
      <span>You are {{isOper ? '' : 'not'}} an operator</span>
      <span class="float-right w-100">
        <button
          aria-label="Log in as operator"
          @click="$emit('auth')"
          class="btn btn-primary btn-sm w-100"
          v-show="!isOper" >
            Log in
        </button>
      </span>
    </li>
    <li>
      <span v-show="isOper" class="align-sub">Nick</span>
      <span class="float-right">
        <input v-show="isOper" @input="setNick" :value="opernick">
      </span>
    </li>
  </SettingsSection>
</template>
<script lang="ts">
  import {
    Component, Watch, Prop, Vue,
  } from 'vue-property-decorator';
  import SettingsSection from '../SettingsSection.vue';

  @Component({
    components: {
      SettingsSection,
    },
  })
  export default class OperSection extends Vue {
    validateNick(nick:string) {
      // eslint-disable-next-line no-useless-escape
      return nick.match(/^[a-z_\-\[\]\\^{}|`][a-z0-9_\-\[\]\\^{}|`]*$/i);
    }

    setNick(e:Event) {
      const { value } = e.target as HTMLInputElement;
      if (!this.validateNick(value)) return;
      this.$vxm.chat.changeNick(value);
    }

    opernick = '';

    get isOper() {
      return this.$vxm.chat.oper;
    }

    created() {
      if (localStorage.chat_nick) {
        this.opernick = localStorage.chat_nick;
      } else {
        this.opernick = this.$vxm.chat.customNick;
      }
    }
  }
</script>
<style lang="scss" scoped>
input {
  margin:2px;
  font-size: 0.85rem;
  max-width:150px; /* Big screens don't have arbitrarily large input */
}
li {
  width: calc(100% - 40px);
  list-style-type: none;
  margin-bottom: 10px;
}
</style>
