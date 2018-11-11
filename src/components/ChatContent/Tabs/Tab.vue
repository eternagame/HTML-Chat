<template>
  <div style="height: 100%">
    <div
      ref="scrollDiv"
      style="padding: 5.6px 7px;"
      :style="{height: `calc(100% - ${footerHeight}px - 5.6px * 2)`}"
    >
      <VuePerfectScrollbar class="scroll-area" :settings="settings" @ps-scroll-y="scrollHandle">
        <div style="height: 100%; word-wrap: break-word; white-space: normal;">
          <slot ref="slot"></slot>
        </div>
      </VuePerfectScrollbar>
    </div>

    <slot ref="footer" name="footer"></slot>
  </div>
</template>

<script lang="ts">
import Vue from "@/types/vue";
import Component from "vue-class-component";
import VuePerfectScrollbar from "vue-perfect-scrollbar";
import { Prop } from "vue-property-decorator";

@Component({
  components: {
    VuePerfectScrollbar
  }
})
export default class Tab extends Vue {
  settings = {
    maxScrollbarLength: 60
  };

  $refs!: {
    afterScrollbar: Vue;
  }

  autoScroll = true;

  container!: Element;
  footerHeight: number = 0;
  scrollHandle(evt: any) {
    const container = this.container;
    const actualScrollHeight =
      container!.scrollHeight - this.container.clientHeight;
      console.log(evt);
    if (evt.type === "ps-scroll-y") {
      this.$forceUpdate();
      if (container!.scrollTop > actualScrollHeight - 50) {
        // if (
        //   !this.$el.querySelector(".ps-container")!.classList.contains("ps--y")
        // ) {
        //   //The check is to prevent it from teleporting to the bottom while dragging;
        //   //However it makes it so it doesn't execute on mouse drag events at all, which might be a good thing.
        //   container!.scrollTop = actualScrollHeight;
        // }
        this.autoScroll = true;
      } else this.autoScroll = false;
    }
  }

  onContentChanged() {
    if (this.autoScroll) {
      this.$nextTick(() => {
        this.container!.scrollTop = this.container!.scrollHeight;
      });
    }
  }

  updateFooterHeight(height: number) {
    this.footerHeight = height;
    this.onContentChanged();
  }

  created() {
    this.$store.subscribe((mutation, state) => {
      if (mutation.type === "updateScrollbar" || mutation.type === "changeTab") {
        this.onContentChanged();
      }
    });
  }

  mounted() {
    this.container = this.$el.querySelector(".ps-container")!;
  }
}
</script>

<style lang="scss">
.scroll-area {
  position: relative;
  margin: auto;
  width: 100%;
  height: 100%;
}
.ps.ps--active-x > .ps__scrollbar-x-rail,
.ps.ps--active-y > .ps__scrollbar-y-rail {
  background-color: transparent !important;
}
</style>
