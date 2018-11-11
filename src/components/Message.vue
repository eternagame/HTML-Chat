<template>
<li class="chat-message">
  <div class="chat-message-content">
    {{msg}}
  </div>
</li>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class Message extends Vue {
  @Prop()
  private msg!: string;

  @Prop({ default: false })
  private isHistory!: boolean;
}
</script>

<style scoped lang="scss">
a {
    color: #fff;
}

.chat-message {
    color: #C0DCE7;
    display: block;
    position: relative;
}
.chat-message-system {
    font-style: italic;
    text-align: center;
    align-items: center;
    margin-top: 5px;
    margin-bottom: 5px;
}
.chat-message-action {
    font-style: italic;
}
.chat-message-user {
    font-weight: bold;
}
.chat-message-action > .chat-message-content > a > .chat-message-user {
    color: #C0DCE7;
}
.chat-message-user-link {
    text-decoration: none;
}
.chat-message-time {
    color: #627587;
    white-space: nowrap;
    font-size: 0.8em;
}

</style>
