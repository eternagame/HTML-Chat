<template>
  <SettingsGroup title="Notifications">
    <BFormCheckbox
      v-if="notifications.deviceSupported"
      class="mb-3"
      switch
      :model-value="notifications.deviceEnabled"
      @update:model-value="notifications.toggleNotifications($event as boolean)"
      >Enable Device Notifications</BFormCheckbox
    >

    <BForm @submit.prevent class="mb-3">
      <BFormGroup
        label="Indicator"
        description="Appears in the page title if you have notifications"
      >
        <BFormInput v-model="notifications.indicatorText" />
      </BFormGroup>
    </BForm>

    <h6>Channel Notifications</h6>
    <BFormCheckbox
      :model-value="isAllEnabled"
      :indeterminate="isIndeterminate"
      @update:model-value="toggleAll($event as boolean)"
      >Enable All</BFormCheckbox
    >
    <ul class="list-unstyled">
      <li v-for="c in channel.channelList" :key="c.name">
        <BFormCheckbox
          switch
          :model-value="c.notificationsEnabled"
          @update:model-value="channel.toggleChannelNotifications(c.name, $event as boolean)"
          >{{ c.displayName }}</BFormCheckbox
        >
      </li>
    </ul>

    <h6>Keywords</h6>
    <div class="keywords">
      <BForm @submit.prevent="addKeyword">
        <BInputGroup size="sm" label="Keywords">
          <BFormInput v-model.trim="keywordBuffer" autocomplete="off" name="new-keyword" />
          <BButton type="submit" variant="primary" class="px-3" :disabled="!keywordBuffer.trim()"
            >Add</BButton
          >
        </BInputGroup>
      </BForm>

      <div class="keywords-list">
        <span v-if="notifications.keywords.size === 0">No keywords.</span>
        <template v-else>
          <BTooltip v-for="keyword in notifications.keywords" :key="keyword">
            <template #target>
              <BButton
                pill
                size="sm"
                variant="outline-dark"
                type="button"
                @click="notifications.removeKeyword(keyword)"
              >
                {{ keyword }}
              </BButton>
            </template>
            Remove "{{ keyword }}"
          </BTooltip>
        </template>
      </div>
    </div>
  </SettingsGroup>
</template>

<script setup lang="ts">
  import { useChannelStore, useNotificationsStore } from '#stores';
  import {
    BButton,
    BForm,
    BFormCheckbox,
    BFormGroup,
    BFormInput,
    BInputGroup,
    BTooltip,
  } from 'bootstrap-vue-next';
  import { computed, ref } from 'vue';
  import SettingsGroup from './ui/SettingsGroup.vue';

  const channel = useChannelStore();
  const notifications = useNotificationsStore();
  const isAllEnabled = computed(() => channel.channelList.every((c) => c.notificationsEnabled));
  const isIndeterminate = computed(
    () =>
      channel.channelList.some((c) => c.notificationsEnabled) &&
      channel.channelList.some((c) => !c.notificationsEnabled),
  );
  const keywordBuffer = ref('');

  function toggleAll(checked: boolean) {
    for (const c of channel.channelList) {
      channel.toggleChannelNotifications(c.name, checked);
    }
  }

  function addKeyword() {
    if (keywordBuffer.value.length > 0) {
      notifications.addKeyword(keywordBuffer.value);
      keywordBuffer.value = '';
    }
  }
</script>

<style scoped>
  .keywords {
    .keywords-list {
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      gap: 0.25em;
      max-height: 5em;
      overflow-y: auto;
      padding: 0.5em;
      max-width: 20em;
    }

    :deep(.tooltip-inner) {
      color: #fff;
    }
  }
</style>
