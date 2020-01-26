<template>
  <div style="height: 100%">
    <div
      ref="scrollDiv"
      style="padding: 5.6px 7px;"
      :style="{height: `calc(100% - ${footerHeight}px - 5.6px * 2)`}"
    >
      <VuePerfectScrollbar class="scroll-area" :settings="settings" @ps-scroll-y="scrollHandle">
        <div style="height: 100%; word-wrap: break-word; white-space: normal;">
          <slot ref="slot"/>
        </div>
      </VuePerfectScrollbar>
    </div>

    <div ref="footer" style="overflow: auto; padding: 5px; 10px;">
      <slot name="footer"/>
    </div>
  </div>
</template>

<script lang="ts">
  import VuePerfectScrollbar from 'vue-perfect-scrollbar';
  import {
    Prop, Component, Watch, Vue,
  } from 'vue-property-decorator';


  @Component({
    components: {
      VuePerfectScrollbar,
    },
  })
  export default class Pane extends Vue {
    settings = {
      maxScrollbarLength: 60,
      suppressScrollX: true,
    };

    $refs!: {
      afterScrollbar: Vue;
      footer: HTMLElement;
    };

    autoScroll = true;

    container!: Element;

    footerHeight: number = 0;

    @Prop()
    visibility!: boolean;

    scrollHandle(evt: any) {
      const { container } = this;
      const actualScrollHeight = container.scrollHeight - this.container.clientHeight;
      if (evt.type === 'ps-scroll-y') {
        this.$forceUpdate();
        if (container.scrollTop > actualScrollHeight - 50) {
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

    @Watch('visibility')
    updateFooterHeight() {
      this.footerHeight = this.$refs.footer.clientHeight;
      this.onContentChanged();
    }

    mounted() {
      this.container = this.$el.querySelector('.ps-container')!;
      this.container.scrollTop = this.container.scrollHeight;
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
