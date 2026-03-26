<template>
  <Transition name="slide">
    <aside
      :id="layout.sidebarId"
      ref="sidebarRef"
      class="sidebar"
      v-show="layout.isSidebarOpen"
      aria-label="Sidebar menu"
    >
      <header class="sidebar-nav flex-shrink-0">
        <nav class="d-flex flex-row justify-content-around w-100" aria-label="Sidebar Sections">
          <SidebarSectionButton
            @click="activeTab = 'chat'"
            :active="activeTab === 'chat'"
            label="Chat"
            :icon="chatIcon"
            :icon-active="chatIconActive"
          />
          <SidebarSectionButton
            @click="activeTab = 'user'"
            :active="activeTab === 'user'"
            label="User"
            :icon="userIcon"
            :icon-active="userIconActive"
          />
          <SidebarSectionButton
            @click="activeTab = 'setting'"
            :active="activeTab === 'setting'"
            label="Settings"
            :icon="settingsIcon"
            :icon-active="settingsIconActive"
          />
        </nav>
      </header>

      <div class="sidebar-content flex-grow-1">
        <KeepAlive>
          <component :is="activeComponent" />
        </KeepAlive>
      </div>
    </aside>
  </Transition>
</template>
<script setup lang="ts">
  import chatIconActive from '#assets/chat-icon-green.png';
  import chatIcon from '#assets/chat-icon-white.png';
  import settingsIconActive from '#assets/settings-icon-green.png';
  import settingsIcon from '#assets/settings-icon-white.png';
  import userIconActive from '#assets/user-icon-green.png';
  import userIcon from '#assets/user-icon-white.png';
  import LoadingSpinner from '#components/ui/LoadingSpinner.vue';
  import { useLayoutStore } from '#stores';
  import { onClickOutside } from '@vueuse/core';
  import { computed, defineAsyncComponent, ref, type Component } from 'vue';
  import SidebarSectionButton from './SidebarSectionButton.vue';

  const ChatsTab = defineAsyncComponent({
    loadingComponent: LoadingSpinner,
    loader: () => import('./chats/SidebarMenuChats.vue'),
  });
  const UsersTab = defineAsyncComponent({
    loadingComponent: LoadingSpinner,
    loader: () => import('./users/SidebarMenuUsers.vue'),
  });
  const SettingsTab = defineAsyncComponent({
    loadingComponent: LoadingSpinner,
    loader: () => import('./settings/SidebarMenuSettings.vue'),
  });

  const layout = useLayoutStore();

  const sidebarRef = ref<HTMLElement>();
  onClickOutside(
    sidebarRef,
    () => {
      layout.toggleSidebar(false);
    },
    { ignore: [`button[aria-controls=${layout.sidebarId}]`] },
  );

  type TabId = 'chat' | 'user' | 'setting';
  const activeTab = ref<TabId>('chat');
  const tabs: Array<{ id: TabId; component: Component }> = [
    { id: 'chat', component: ChatsTab },
    { id: 'user', component: UsersTab },
    { id: 'setting', component: SettingsTab },
  ] as const;
  const activeComponent = computed(() => tabs.find((t) => t.id === activeTab.value)?.component);
</script>
<style scoped>
  .sidebar {
    position: absolute;
    display: flex;
    flex-direction: column;
    top: 0;
    left: 0;
    width: 70%;
    max-width: 350px;
    height: 100%;
    background-color: #000000;
    color: white;
    box-shadow: 4px 0 1em rgba(0, 0, 0, 0.5);
  }

  .sidebar-content {
    padding: 1em;
    overflow-y: auto;
    position: relative;
  }
</style>
