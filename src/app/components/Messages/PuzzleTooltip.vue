<template>
  <div
    class="puzzle-tooltip-container"
    ref="container"
    :style="{
      top: `${top + 5}px`,
      left: `${left + 5}px`
    }">
    <ul>
      <li class="puzzle-tooltip-puzzle">
        {{puzzleName}}
        <span class="puzzle-user">{{username}}</span>
      </li>
      <li class="puzzle-tooltip-puzzle2">
        <span class="three">{{solved}} solvers</span>
        <span class="four" style="float:right">{{reward}}$</span>
      </li>
      <li class="description"><span v-html="desc" /></li>
    </ul>
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

    solved = 0;

    reward = 100;

    fill() {
      this.$vxm.chat.getPuzzleInfo({
        pid: this.pid,
        callback: (d) => {
          const data = JSON.parse(d).data.puzzle;
          if (!data) return;
          this.puzzleName = data.title;
          this.desc = data.body;
          this.solved = parseInt(data['num-cleared'], 10);
          this.reward = parseInt(data.reward, 10);
          this.username = data.username;
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
    z-index: 1501;
    overflow: visible;
    height:auto;
    top:0px;
    left:0px;
    width:250px;
    border-radius:5px;
  }
  li {
    padding:5px;
    list-style-type: none;
  }
  ul {
    border-radius: 5px;
  }
  .puzzle-tooltip-puzzle {
    border-bottom:1px solid white;
    border-top-right-radius: 5px;
    border-top-left-radius: 5px;
  }
  .puzzle-tooltip-puzzle2 {
    border-bottom:1px solid white;
  }
  .description {
    border-bottom-right-radius: 5px;
    border-bottom-left-radius: 5px;
  }
  .puzzle-user {
    float:right;
  }
</style>
