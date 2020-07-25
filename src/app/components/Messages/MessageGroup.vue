<template>
  <div>
    <Username
      :user="messages[0].user"
      v-if="messages && messages[0] && messages[0].user"
      :color="finalColor"
    />
    <span
      v-if="messages && messages[0] && messages[0].time"
      class="message-time ml-2"
    >
      [{{formattedTime}}]
    </span>
    <UserMessage
      v-for="(message, index) in messages"
      :message="message"
      :key="`${message.message || random()}_${index}`"
      display="true"
      grouped=true
    />
  </div>
</template>
<script lang="ts">
  import { Component, Prop, Vue } from 'vue-property-decorator';
  import UserMessage from './UserMessage.vue';
  import Message from '@/types/message';
  import Username from './Username.vue';

  @Component({
    components: {
      UserMessage,
      Username,
    },
  })
  export default class MessageGroup extends Vue {
    @Prop({ required: true })
    messages !: Message[];

    // This avoids duplicate keys
    random() {
      return Math.round((Math.random() * 1000 * Math.random()));
    }

    get formattedTime() {
      return new Date(this.messages[0].time).toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
    }

    get finalColor() {
      // Makes sure the color of the username is the color of the last message sent in the group
      if (!this.messages) return '';
      const len = this.messages.length - 1;
      const msg = this.messages[len];
      if (!msg) return '';
      if (!this.messageHasTags(msg.message)) return '';
      return this.parseMessageTags(msg.message)[0];
    }

    parseMessageTags(message:string) { // Gets tags as array from message
      if (!message) return [];
      const tagsStringPosition = message.search(/\[#(.+,)*.+\]\r?$/); // Searches for [...,...] at end of message
      let tagsString = message.substring(tagsStringPosition); // Gets tags as a string
      if (tagsString.includes('\r')) { // In history messages, message ends with \r
        tagsString = tagsString.substring(1, tagsString.length - 2); // Removes bracket
      } else {
        tagsString = tagsString.substring(1, tagsString.length - 1); // Removes bracket
      }
      return tagsString.split(','); // Returns array split by commas
    }

    messageHasTags(message:string) { // If a message has any tags
      if (!message) return false;
      return message.match(/\[#(.+,)*.+\]\r?$/);
    }
  }
</script>
<style lang="scss" scoped>
.message-time {
  color: #627587;
  white-space: nowrap;
  font-size: 0.8em;
}
</style>
