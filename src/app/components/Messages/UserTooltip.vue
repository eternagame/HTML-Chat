<template>
  <div class="user-tooltip-container">
    <ul>
      <li class="user-tooltip-user">{{user.username}}</li>
      <li class="user-tooltip-rank"><span class="rank">{{rank}}</span></li>
      <li class="description">{{desc}}</li>
    </ul>
  </div>
</template>
<script lang="ts">
  import { Component, Prop, Vue } from 'vue-property-decorator';
  import User from '@/types/user';
  @Component
  export default class UserTooltip extends Vue {
    @Prop()
    user!: User;

    desc = '';

    rank = '';

    created() {
      this.description();
      this.findRank();
    }

    description() {
      this.$vxm.chat.getUserInfo({
        user: this.user,
        callback: (d) => {
          const data = JSON.parse(d);
          if (d.data !== undefined) {
            this.desc = d.data.user.profile;
          } else {
            this.desc = 'This user has not added a description to their profile';
          }
        },
      });
            this.desc = 'This user has not added a description to their profile';
    }

    findRank() {
      this.$vxm.chat.getUserInfo({
        user: this.user,
        callback: (d) => {
          const data = JSON.parse(d);
          if (d.data !== undefined) {
            this.rank = `#${d.data.user.rank}`;
          } else {
            this.rank = 'Unranked';
          }
        },
      });
      this.rank = 'Unranked';
    }
  }
</script>
<style scoped lang="scss">
  @import "../../assets/_custom.scss";
  @import "~bootstrap/scss/bootstrap.scss";
  @import '~bootstrap-vue/dist/bootstrap-vue.css';
  @import '~vue-context/src/sass/vue-context';
  .user-tooltip-container {
    color:white;
    position:absolute;
    background-color:$med-dark-blue;
    z-index: 5;
    width:95%;
    border-radius:5px;
  }
  li {
    padding:5px;
    list-style-type: none;
  }
  ul {
    border-radius: 5px;
  }
  .user-tooltip-user {
    border-bottom:1px solid white;
    border-top-right-radius: 5px;
    border-top-left-radius: 5px;
  }
  .user-tooltip-rank {
    border-bottom:1px solid white;
  }
  .description {
    border-bottom-right-radius: 5px;
    border-bottom-left-radius: 5px;
  }
</style>
