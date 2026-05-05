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
        <nav
          class="d-flex flex-row flex-wrap justify-content-around w-100"
          aria-label="Sidebar Sections"
        >
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
            label="Online Users"
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
  import { useLayoutStore } from '#stores';
  import { onClickOutside, onKeyDown } from '@vueuse/core';
  import { computed, onUnmounted, ref, type Component } from 'vue';
  import SidebarSectionButton from './SidebarSectionButton.vue';
  import SidebarMenuChats from './chats/SidebarMenuChats.vue';
  import SidebarMenuSettings from './settings/SidebarMenuSettings.vue';
  import SidebarMenuUsers from './users/SidebarMenuUsers.vue';

  const layout = useLayoutStore();

  const sidebarRef = ref<HTMLElement>();

  function closeSidebar() {
    if (layout.isSidebarOpen) {
      // Avoids clashing with SidebarMenuButton toggle
      setTimeout(() => {
        layout.toggleSidebar(false);
      });
    }
  }
  const removeClickListener = onClickOutside(sidebarRef, closeSidebar);
  const removeKeyListener = onKeyDown('Escape', closeSidebar);
  onUnmounted(() => {
    removeClickListener();
    removeKeyListener();
  });

  type TabId = 'chat' | 'user' | 'setting';
  const activeTab = ref<TabId>('chat');
  const tabs: Array<{ id: TabId; component: Component }> = [
    { id: 'chat', component: SidebarMenuChats },
    { id: 'user', component: SidebarMenuUsers },
    { id: 'setting', component: SidebarMenuSettings },
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
    width: 100%;
    max-width: 350px;
    height: 100%;
    background-color: #000000;
    color: white;
    box-shadow: 4px 0 1em rgba(0, 0, 0, 0.5);
    z-index: 10;
    isolation: isolate;
  }

  .sidebar-content {
    padding: 1em;
    overflow-y: auto;
    position: relative;
  }
</style>
