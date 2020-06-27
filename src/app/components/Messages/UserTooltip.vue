<template>
  <div
    class="user-tooltip-container"
    ref="container"
    :style="{
      top: `${top + 5}px`,
      left: `${left + 5}px`
    }">
    <ul>
      <li class="user-tooltip-user">
        <span style="color:yellow; font-size:1.25em" v-show="user.away">● </span>{{user.username}}
        <span class="user-profile" v-show="profileImage !== ''"><img :src="profileImage"></span>
      </li>
      <li class="user-tooltip-rank">
        <span class="rank">{{rank}}</span>
        <span class="status">{{status}}</span>
      </li>
      <li class="description"><span v-html="desc" /></li>
    </ul>
  </div>
</template>
<script lang="ts">
  import {
    Component, Prop, Vue, Watch,
  } from 'vue-property-decorator';
  import User from '@/types/user';
  @Component
  export default class UserTooltip extends Vue {
    @Prop()
    user!: User;

    @Prop()
    top!: number;

    @Prop()
    left!: number;

    desc = 'This user has not added a description to their profile';

    rank = 'Unranked';

    profileImage = '';

    $refs !: {
      container: HTMLDivElement;
    };

    fillProfile() {
      this.$vxm.chat.getUserInfo({
        user: this.user,
        callback: (d) => {
          const data = JSON.parse(d);
          if (data.data !== undefined) {
            if (data.data.user.Profile) {
              let desc = data.data.user.Profile;
              if (desc.length > 150) {
                desc = desc.slice(0, 150)
                  .replace(/<br>/, '')
                  .trim();
                desc += '...';
              }
              this.desc = desc;
            }
            if (data.data.user.rank) {
              this.rank = `#${data.data.user.rank}`;
            }
            if (data.data.user.picture) {
              this.profileImage = `https://eternagame.org/${data.data.user.picture}`;
            }
          }
        },
      });

      /*
      These are currently taken from the Discord/Slack roles
      Eventually, this will be replaced with an API call
      */
      const statusUsernames: {[key:string]:string[]} = {
        developer: ['LFP6', 'Ahalb', 'ElNando888', 'jnicol', 'MasterStormer', ''],
        scientist: ['rhiju', 'dosoonkim'],
        staff: ['LFP6', 'Omei', 'rhiju'],
        moderator: ['Hoglahoo', 'LFP6', 'Omei'],
      };
      const status: string[] = [];
      const name = this.user.username;
      Object.keys(statusUsernames).forEach(e => {
        if (statusUsernames[e].includes(name)) {
          status.push(e);
        }
      });
      if (status.length > 0) {
        this.status = status.join(', ');
      }
    }

    status = '';
  }
</script>
<style scoped lang="scss">
  @import "../../assets/_custom.scss";
  @import "~bootstrap/scss/bootstrap.scss";
  @import '~bootstrap-vue/dist/bootstrap-vue.css';
  @import '~vue-context/src/sass/vue-context';
  .user-tooltip-container {
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
  .status {
    float:right;
  }
  .status::first-letter {
    text-transform: capitalize;
  }
  .user-profile {
    float:right;
  }
  img {
    height: 1.5rem;
  }
</style>
