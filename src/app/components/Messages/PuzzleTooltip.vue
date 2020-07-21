<template>
  <div
    class="
      puzzle-tooltip-container
      text-white
      rounded
    "
    ref="container"
    :style="{
      top: `${top + 5}px`,
      left: `${left + 5}px`
    }">
      <div class="user-tooltip-heading-container pr-2 pl-2 pt-2 mb-1">
        <div class="puzzle-name text-center">{{puzzleName}}</div>
        <div class="puzzle-user text-center">
          <a :href="`https://${$vxm.chat.workbranch}/user/${uid}`">{{username}}</a>
        </div>
      </div>
      <div class="user-tooltip-info-container user-tooltip-section pr-2 pl-2 mb-1">
        <li class="w-100">
          <span>Solvers</span>
          <span class="user-rank float-right">{{solved}}</span>
        </li>
        <li class="w-100">
          <span>Reward</span>
          <span class="user-rank float-right">{{reward}}</span>
        </li>
        <li>
          <span>Comments</span>
          <span class="puzzle-status float-right">{{comments}}</span>
        </li>
      </div>
      <div class="puzzle-tooltip-desc-container pr-2 pl-2 pb-2">
        <span class="puzzle-description w-100 d-inline-block" v-html="desc" />
      </div>
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

    uid = '0';

    comments = 'None';

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
          console.log(data);
          this.solved = parseInt(data['num-cleared'], 10) || 0;
          this.reward = parseInt(data.reward, 10);
          this.username = data.username;
          this.uid = data.uid;
          const { comments } = JSON.parse(d).data;
          this.comments = comments.length > 0 ? comments.length : 'None';
        },
      });
    }

    created() {
      window.addEventListener('click', (e) => {
        const clicked = e.target as Element;
        if (!clicked.classList.contains('puzzle-link')) {
          this.$emit('hide');
         }
      });
    }
  }
</script>
<style scoped lang="scss">
  @import "~@/assets/_custom.scss";
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
  a {
    color: $yellow;
  }
</style>
