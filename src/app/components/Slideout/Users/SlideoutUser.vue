<template>
  <div class="user-wrapper" :style="{ fontSize: `${fontSize}px` }">
    <h4>Online ({{userCount}})</h4>
    <ul class="list-group list-style-type-none">
      <SlideoutUsername
        v-for="user in connectedUsers"
        :key="user.username"
        :user="user" />
    </ul>
  </div>
</template>
<script lang="ts" setup>
import { vxm } from '#store/vxm';
import useSettingsStore from '#stores/settings';
import { computed } from 'vue';
import SlideoutUsername from './SlideoutUsername.vue';

const settings = useSettingsStore();
const connectedUsers = computed(() => vxm.chat.connectedUsers);
const userCount = computed(() => Object.keys(vxm.chat.connectedUsers).length);
const fontSize = computed(() => settings.fontSize);
</script>
<style scoped>
.user-wrapper {
  padding:5px;
  padding-left:20px;
  overflow: auto;
  height:calc(100% - 50px); /* Fills slideout and accounts for top bar */
}

::-webkit-scrollbar {
    width: 10px;
    height:10px;
}

::-webkit-scrollbar-thumb {
  background-color:#343a40; /* Make scrollbar visible */
  border-radius:5px;
}

::-webkit-scrollbar-corner {
  background-color:#343a40;
  border-radius:5px;
}

li {
  list-style-type: none; /* Remove bullet points */
}
h3 {
  margin-bottom:2px; /* Title */
}
</style>
