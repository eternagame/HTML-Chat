<template>
  <div class="chats-container d-flex flex-column h-100">
    <header>
      <h4>Channels</h4>
    </header>

    <ul class="channel-list list-unstyled flex-grow-1">
      <li
        v-for="c in channel.channelList"
        :key="c.name"
        class="channel-list-item d-flex flex-row flex-nowrap"
      >
        <button
          type="button"
          class="channel-button"
          :class="{
            'channel-button--current': channel.currentChannelName === c.name,
            'channel-button--has-mention': c.hasMention,
            'channel-button--has-notification': c.hasNotification,
          }"
          :aria-pressed="channel.currentChannelName === c.name"
          @click="channel.goToChannel(c.name)"
        >
          <span class="channel-button-name">{{ c.displayName }}</span>
          <span class="channel-button-description">{{ getChannelDescription(c.name) }}</span>
        </button>

        <button
          v-if="!isDefaultChannel(c.name)"
          type="button"
          class="channel-button-leave"
          @click="channel.leaveChannel(c.name)"
        >
          <span aria-hidden="true">x</span>
          <span class="visually-hidden">Leave {{ c.displayName }}</span>
        </button>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
  import { useChannelStore } from '#stores';
  import { getChannelDescription, isDefaultChannel } from '#utils';
  const channel = useChannelStore();
</script>

<style scoped>
  .channel-list {
    overflow-y: auto;
  }

  .channel-button,
  .channel-button-leave {
    display: flex;
    flex-direction: column;
    align-items: start;
    border: 0;
    color: #fff;
  }

  .channel-button-leave {
    background-color: #e74c3c;
    display: none;
    align-items: center;
    justify-content: center;
    padding-inline: 0.75em;
  }
  .channel-list-item:hover,
  .channel-list-item:focus-within {
    .channel-button-leave {
      display: flex;
    }
  }

  .channel-button {
    background-color: #000;
    border-left: 10px solid transparent;
    padding: 0.4em 1.25em;
    flex-grow: 1;
  }
  .channel-button--current {
    border-left-color: #4a90e2;
  }
  .channel-button--has-notification {
    border-left-color: #ff0000;
  }
  .channel-button--has-mention {
    border-left-color: #ffa500;
  }

  .channel-button-name,
  .channel-button-description {
    text-align: start;
    text-wrap: balance;
    word-break: break-word;
  }

  .channel-button-name {
    font-size: 1.5em;
  }
  .channel-button-description {
    font-size: 0.75em;
  }
</style>
