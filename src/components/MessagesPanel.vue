<template>
    <ul>
        <message v-for="(message, i) in $store.state.postedMessages" :key="i" :msg="message"></message>
    </ul>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import Message from './Message.vue';

@Component({
  components: { Message }
  })
export default class MessagesPanel extends Vue {
  @Prop()
  private channel!: string;
}
</script>
<style lang="scss">
textarea {
  border-radius: 2px;
  font-family: "Open Sans", "Helvetica Neue", Arial, Gulim;
  font-size: 0.85rem;
  border: 1px solid rgb(169, 169, 169);
  width: calc(100% - 10px);
}
</style>
