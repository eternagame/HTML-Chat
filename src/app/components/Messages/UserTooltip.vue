<template>
  <div
    class="user-tooltip-container"
    ref="container"
    :style="{
      top: `${top + 5}px`,
      left: `${left + 5}px`
    }">
      <span class="user-name user">
        <span style="color:yellow; font-size:1.25em" v-show="user.away">● </span>{{user.username}}
      </span>
      <span class="user-profile user"><img :src="profileImage"></span>
      <span class="user-rank user">{{rank}}</span>
      <span class="user-status user">{{status}}</span>
      <span class="user-description user" v-html="desc" />
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
                desc = desc.slice(0, 147)
                  .trim();
                desc += '&hellip;';
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
    display: flex;
    flex-flow: row wrap;
  }
  .user {
    flex: 0 1 50%;
    padding: 5px;
    border-bottom: 1px solid white;
  }
  .user-status::first-letter {
    text-transform: capitalize;
  }
  .user-profile, .user-status {
    text-align:right;
  }
  .user-description {
    flex-basis: 100%;
    border: none;
  }
  img {
    height: 1.5rem;
  }
</style>
