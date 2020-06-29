<template>
  <div
    class="puzzle-tooltip-container"
    ref="container"
    :style="{
      top: `${top + 5}px`,
      left: `${left + 5}px`
    }">
      <span class="puzzle-name puzzle">{{puzzleName}}</span>
      <span class="puzzle-user puzzle">{{username}}</span>
      <span class="puzzle-solvers puzzle">{{solved}} solvers</span>
      <span class="puzzle-reward puzzle">{{reward}}$</span>
      <span class="puzzle-comments puzzle">{{comments}} comments</span>
      <span class="puzzle-description puzzle" v-html="desc" />
  </div>
</template>
<script lang="ts">
  import {
    Component, Prop, Vue, Watch,
  } from 'vue-property-decorator';
  @Component
  export default class PuzzleTooltip extends Vue {
    @Prop()
    pid !: number;

    @Prop()
    top!: number;

    @Prop()
    left!: number;

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
    color:white;
    position: fixed;
    background-color:$med-dark-blue;
    z-index: 2;
    overflow: visible;
    height:auto;
    top:0px;
    left:0px;
    min-width:250px;
    max-width: 350px;
    border-radius:5px;
    display: flex;
    flex-flow: row wrap;
    justify-content: space-between;
  }
  .puzzle {
    flex-basis: 50%;
    flex-grow: 1;
    flex-shrink: 0;
    border-bottom: white solid 1px;
    padding: 5px;
  }
  .puzzle-name, .puzzle-description {
    flex-basis: 100%;
  }
  .puzzle-user, .puzzle-reward {
    text-align: left;
  }
  .puzzle-solvers, .puzzle-comments {
    text-align: right;
  }
  .puzzle-description {
    border: none;
  }
</style>
