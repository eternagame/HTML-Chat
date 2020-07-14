<template>
  <div>
    <UserMessage
      v-for="(message, index) in messages"
      :message="message"
      :key="message.message"
      :first="index === 0"
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
    messages: Message[];
  }
</script>
<style lang="scss">
</style>
