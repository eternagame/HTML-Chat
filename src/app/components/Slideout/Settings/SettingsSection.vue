<template>
  <section>
    <div class="settings-section-header">
      <h5 class="heading mt-1 mb-1 ml-0 d-inline-block">{{title}}</h5>
      <MinimizationTriangle
        class="d-inline-block"
        :settings="true"
        @input="update($event)"
        v-model="open" />
    </div>
    <transition name="settings-slide">
      <div v-show="!open" class="settings-content-container">
        <slot />
      </div>
    </transition>
  </section>
</template>

<script lang="ts" setup>
import MinimizationTriangle from '@/components/Header/MinimizationTriangle.vue';
import { onMounted, ref } from 'vue';

const props = defineProps<{ title: string }>();
const open = ref<boolean>(false);

onMounted(() => {
  // TODO: Extract localStorage interaction
  if (!localStorage?.chat_openMenus) {
    return;
  }

  const menus = JSON.parse(localStorage.chat_openMenus);
  if (menus[props.title]) {
    open.value = menus[props.title];
  }
});

/**
 * Updates self and localStorage when shown/hidden
 * TODO: Extract localStorage interaction
 */
function update(newValue: boolean) {
  open.value = newValue; // Update self

  if (!localStorage) {
    return;
  }
  let menus: any = {};
  if (localStorage.chat_openMenus) { // If the object exists, modify it
    menus = JSON.parse(localStorage.chat_openMenus);
  }
  menus[props.title] = newValue;
  localStorage.chat_openMenus = JSON.stringify(menus); // Update localStorage
}

</script>
<style scoped>
section { /* 'Block' of settings */
  margin-bottom:5px;
  position: relative;
}
.settings-slide-enter-active {
  transition: max-height 0.2s cubic-bezier(1,0,1,0);
  max-height:1000px;
}
.settings-slide-leave-active {
  transition: max-height 0.2s cubic-bezier(0,1,0,1);
  max-height:1000px;
}
.settings-slide-enter, .settings-slide-leave-to {
  max-height:0;
}
.settings-content-container {
  overflow:hidden;
}
.minimization-triangle {
  height:30px;
  width:30px;
  position:absolute;
  right:10px;
  top:0px;
}
</style>
