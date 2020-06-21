<template>
  <SettingsSection title="Operator" >
    <p>You are {{isOper ? '' : 'not'}} logged in as an operator</p>
        <button
          @click="$emit('auth')"
          :style="{ fontSize:`${11 / 14}rem` }"
          class="btn settings-button"
          v-show="!isOper" >
            Log in as operator
        </button>
        <h6 v-show="isOper">Change nick</h6>
        <input v-show="isOper" @input="setNick" :value="opernick">
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
      if (localStorage.nick) {
        this.opernick = localStorage.nick;
      } else {
        this.opernick = this.$vxm.chat.customNick;
      }
    }
  }
</script>
<style lang="scss" scoped>
@import "@/assets/_custom.scss";
@import "~bootstrap/scss/bootstrap.scss";
@import '~bootstrap-vue/dist/bootstrap-vue.css';
.settings-button {
  background-color:$green;
}
input {
  margin:2px;
  width:calc(100% - 23px); /* Accounts for padding on both sides */
  max-width:150px; /* Big screens don't have arbitrarily large input */
}
</style>
