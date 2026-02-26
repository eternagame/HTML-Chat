<template>
  <SettingsSection title="Operator">
    <div class="setting">
      <span>You are {{isOper ? '' : 'not'}} an operator</span>
      <span class="float-right w-100">
        <button
          type="button"
          aria-label="Log in as operator"
          @click="emit('auth')"
          class="btn btn-primary btn-sm w-100"
          v-show="!isOper">
          Log in
        </button>
      </span>
    </div>
    <div class="setting">
      <span v-show="isOper" class="align-sub">Nick</span>
      <span class="float-right">
        <input v-show="isOper" @input="setNick" :value="opernick">
      </span>
    </div>
  </SettingsSection>
</template>
<script lang="ts" setup>
import { vxm } from '#store/vxm';
import { computed, onMounted, ref } from 'vue';
import SettingsSection from '../SettingsSection.vue';

const emit = defineEmits<{
  (event: 'auth'): void;
}>();

const isOper = computed(() => vxm.chat.oper);

const opernick = ref<string>('');
function validateNick(nick:string) {
  // eslint-disable-next-line no-useless-escape
  return nick.match(/^[a-z_\-\[\]\\^{}|`][a-z0-9_\-\[\]\\^{}|`]*$/i);
}
function setNick(e:Event) {
  const { value } = e.target as HTMLInputElement;
  opernick.value = value;
  if (validateNick(value)) {
    vxm.chat.changeNick(value);
  }
}

onMounted(() => {
  if (localStorage.chat_nick) {
    opernick.value = localStorage.chat_nick;
  } else {
    opernick.value = vxm.chat.customNick;
  }
});
</script>
<style lang="scss" scoped>
input {
  margin:2px;
  font-size: 0.85rem;
  max-width:150px; /* Big screens don't have arbitrarily large input */
}
.setting {
  width: calc(100% - 40px);
  margin-bottom: 10px;
}
</style>
