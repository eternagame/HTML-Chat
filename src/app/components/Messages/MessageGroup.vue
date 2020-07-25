<template>
  <div>
    <UserMessage
      v-for="(message, index) in messages"
      :message="message"
      :key="`${message.message || random()}_${index}`"
      :first="index === 0"
      display="true"
      grouped=true
    />
  </div>
</template>
<script lang="ts">
  import { Component, Prop, Vue } from 'vue-property-decorator';
  import UserMessage from './UserMessage.vue';
  import Message from '@/types/message';

  @Component({
    components: {
      UserMessage,
    },
  })
  export default class MessageGroup extends Vue {
    @Prop({ required: true })
    messages !: Message[];

    // This avoids duplicate keys
    random() {
      return Math.round((Math.random() * 1000 * Math.random()));
    }
  }
</script>
<style lang="scss">
</style>
