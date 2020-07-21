<template>
  <div
    class="user-tooltip-container text-white rounded overflow-auto"
    ref="container"
    :style="{
      top: `${top + 5}px`,
      left: `${left + 5}px`
    }">
      <div class="user-tooltip-heading-container pr-2 pl-2 pt-2 mb-1">
        <div class="user-profile text-center"><img :src="profileImage"></div>
        <span class="user-name text-center w-100 d-inline-block">
          <span style="color:yellow; font-size:1.25em" v-show="user.away">● </span>
          <a :href="`https://${$vxm.chat.workbranch}/players/${user.uid}`">{{user.username}}</a>
        </span>
      </div>
      <div class="user-tooltip-info-container user-tooltip-section pr-2 pl-2 mb-1">
        <li class="w-100">
          <span>Rank</span>
          <span class="user-rank float-right">{{rank}}</span>
        </li>
        <li>
          <span>Roles</span>
          <span class="user-status float-right">{{status}}</span>
        </li>
      </div>
      <div class="user-tooltip-desc-container pr-2 pl-2 pb-2">
        <span class="user-description w-100 d-inline-block" v-html="desc" />
      </div>
  </div>
</template>
<script lang="ts">
  import {
    Component, Prop, Vue, Watch,
  } from 'vue-property-decorator';
  import User from '@/types/user';
  @Component
  export default class UserTooltip extends Vue {
    @Prop({ required: true })
    user !: User;

    @Prop({ default: 0 })
    top !: number;

    @Prop({ default: 0 })
    left !: number;

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
      status.push('player');
      this.status = status.join(', ');
    }

    status = '';

    created() {
      window.addEventListener('click', (e) => {
        const clicked = e.target as Element;
        if (!clicked.classList.contains('user-link')) {
          this.$emit('hide');
         }
      });
    }
  }
</script>
<style scoped lang="scss">
  @import '~vue-context/src/sass/vue-context';
  @import "~@/assets/_custom.scss";
  .user-tooltip-container {
    position: fixed;
    background-color:$med-dark-blue;
    z-index: 99;
    height:auto;
    top:0px;
    left:0px;
    width:250px;
  }
  .user-status::first-letter {
    text-transform: capitalize;
  }
  .user-status, .user-rank {
    text-align:right;
  }
  img {
    height: 75px;
    background-color: $dark-blue;
    border-radius: 50%;
  }
  .user-tooltip-heading-container {
    background-color: $med-dark-blue;
  }
  .user-name > a {
    color: $yellow;
  }
</style>
