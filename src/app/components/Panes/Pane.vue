<template>
  <div
  style="height: 100%; font-family:'Open Sans','Century Gothic','Didact Gothic,'Arial',sans-serif"
  id="cont"
  >
    <div
      ref="scrollDiv"
      style="padding: 5.6px 7px;"
      :style="{height: `calc(100% - ${footerHeight}px - 5.6px * 0)`}"
    >
      <VuePerfectScrollbar
        class="scroll-area m-auto w-100 h-100"
        :settings="settings"
        @ps-scroll-y="scrollHandle" >
        <div style="height: 100%; word-wrap: break-word; white-space: normal;">
          <slot ref="slot"/>
        </div>
      </VuePerfectScrollbar>
    </div>

    <div ref="footer" id="footer" class='overflow-auto p-1'>
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

    @Prop({ required: true })
    visibility !: boolean;

    scrollHandle(evt: any) {
      const { container } = this;
      if (!container) return;
      const actualScrollHeight = container.scrollHeight - this.container.clientHeight;
      if (evt.type === 'ps-scroll-y') {
        this.$forceUpdate();
        if (container.scrollTop > actualScrollHeight - 50) {
          this.autoScroll = true;
        } else {
          this.autoScroll = false;
        }
      }
    }

    @Watch('autoScroll')
    autoScrollChanged() {
      this.$emit('autoscroll', this.autoScroll);
    }

    scrollDown() {
      this.$nextTick(() => {
        this.container.scrollTop = this.container.scrollHeight;
        this.updateFooterHeight();
      });
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
      if (!this.$refs || !this.$refs.footer) return;
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
  }

  .ps.ps--active-x > .ps__scrollbar-x-rail,
  .ps.ps--active-y > .ps__scrollbar-y-rail {
    background-color: transparent !important;
  }
  #footer {
    bottom:0px;
    position:absolute; /* Necessary to keep it at the bottom */
    width:calc(100% + 2px);
  }
</style>
