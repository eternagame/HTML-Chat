<template>
  <section>
      <li class="settings-section-header">
      <h5 class="heading" >{{title}}</h5>
      <MinimizationTriangle
        style="display:inline-block"
        settings="true"
        @input="update($event)"
        v-model="open" />
      </li>
      <transition name="settings-slide">
      <div v-show="!open" class="settings-content-container">
        <slot></slot>
      </div>
      </transition>
  </section>
</template>

<script lang="ts">
  import {
    Component, Watch, Prop, Vue,
  } from 'vue-property-decorator';
  import MinimizationTriangle from '../../MinimizationTriangle.vue';

  @Component({
    components: {
      MinimizationTriangle,
    },
  })
  export default class SettingsSection extends Vue {
    open = false;

    @Prop()
    title !: string;

    mounted() {
      if (localStorage && localStorage.openMenus) {
        const menus = JSON.parse(localStorage.openMenus);
        if (menus[this.title] !== undefined) {
          this.open = menus[this.title];
        }
      }
    }

    // Updates self and localStorage when shown/hidden
    update(newValue: boolean) {
      this.open = newValue; // Update self
      const { title } = this;
      if (localStorage) {
        let menus: any = {};
        if (localStorage.openMenus) { // If the object exists, modify it
          menus = JSON.parse(localStorage.openMenus);
        }
        menus[title] = newValue;
        localStorage.openMenus = JSON.stringify(menus); // Update localStorage
      }
    }
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
li {
  list-style-type: none;
}
.minimization-triangle {
  height:30px;
  width:30px;
  position:absolute;
  right:10px;
  top:0px;
}
.heading {
  display:inline-block;
  margin:4px;
  margin-left:0;
}
</style>
