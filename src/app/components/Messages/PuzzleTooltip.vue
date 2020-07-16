<template>
  <div
    class="
      puzzle-tooltip-container
      text-white
      d-flex
      justify-space-between
      flex-row
      flex-wrap
      rounded
    "
    ref="container"
    :style="{
      top: `${top + 5}px`,
      left: `${left + 5}px`
    }">
      <span
        class="puzzle-name puzzle p-1 flex-grow-1 flex-shrink-0 text-left"
      > {{puzzleName}}</span>
      <span
        class="puzzle-user puzzle p-1 flex-grow-1 flex-shrink-0 text-left"
      >{{username}}</span>
      <span
        class="puzzle-solvers puzzle p-1 flex-grow-1 flex-shrink-0 text-right"
      >{{solved}} solvers</span>
      <span
        class="puzzle-reward puzzle p-1 flex-grow-1 flex-shrink-0 text-left"
      >{{reward}}$</span>
      <span
        class="puzzle-comments puzzle p-1 flex-grow-1 flex-shrink-0 text-right"
      >{{comments}} comments</span>
      <span
        class="puzzle-description puzzle p-1 flex-grow-1 flex-shrink-0 border-0"
        v-html="desc"
      />
  </div>
</template>
<script lang="ts">
  import {
    Component, Prop, Vue, Watch,
  } from 'vue-property-decorator';
  @Component
  export default class PuzzleTooltip extends Vue {
    @Prop({ required: true })
    pid !: number;

    @Prop({ default: 0 })
    top !: number;

    @Prop({ default: 0 })
    left !: number;

    $refs !: {
      container: HTMLDivElement;
    };

    puzzleName = 'Untitled';

    desc = 'No description';

    username = 'Anonymous';

    comments = 'No';

    solved = 0;

    reward = 100;

    fill() {
      this.$vxm.chat.getPuzzleInfo({
        pid: this.pid,
        callback: (d) => {
          const data = JSON.parse(d).data.puzzle;
          if (!data) return;
          this.puzzleName = data.title;
          let desc = data.body;
          if (desc.length > 150) {
            desc = desc.slice(0, 147)
              .trim();
            desc += '&hellip;';
          }
          this.desc = desc;
          this.solved = parseInt(data['num-cleared'], 10);
          this.reward = parseInt(data.reward, 10);
          this.username = data.username;
          const { comments } = JSON.parse(d).data;
          this.comments = comments.length > 0 ? comments.length : 'No';
        },
      });
    }
  }
</script>
<style scoped lang="scss">
  @import "../../assets/_custom.scss";
  @import "~bootstrap/scss/bootstrap.scss";
  @import '~bootstrap-vue/dist/bootstrap-vue.css';
  @import '~vue-context/src/sass/vue-context';
  .puzzle-tooltip-container {
    position: fixed;
    background-color:$med-dark-blue;
    z-index: 2;
    height:auto;
    top:0px;
    left:0px;
    min-width:250px;
    max-width: 350px;
  }
  .puzzle {
    flex-basis: 50%;
    border-bottom: white solid 1px;
  }
  .puzzle-name, .puzzle-description {
    flex-basis: 100%;
  }
</style>
