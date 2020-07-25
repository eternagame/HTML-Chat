<template>
  <span>
    <span
      v-if="user"
      target="_blank"
      class="username text-decoration-none font-weight-bold"
      @focus="$emit('focus')"
      @blur="$emit('blur'); hide()"
      :style="{ color: displayedColor }"
      @click="showTooltip"
      tabindex="0"
      v-on-clickaway="hide"
      @keypress.enter="toggleTooltip"
    >
      <span
        class="away-indicator"
        :title="`${user.username} is away (${user.awayReason || 'No reason given'})`"
        v-show="away"> <!-- Away indicator -->
        ●
      </span>
      {{ uniqueNicks[0] || user.username }}<slot/>
    </span>
    <transition name="fade" @after-enter="enter">
      <UserTooltip
        :top="top"
        :left="left"
        v-if="tooltipVisible"
        :user="user"
        ref="tooltip"
      />
    </transition>
  </span>
</template>

<script lang="ts">
  import { Component, Prop, Vue } from 'vue-property-decorator';
  import { mixin as clickaway } from 'vue-clickaway';
  import User from '@/types/user';
  import UserTooltip from './UserTooltip.vue';

  @Component({
    components: {
      UserTooltip,
    },
    mixins: [clickaway],
  })
  export default class Username extends Vue {
    @Prop({ required: true })
    user!: User;

    @Prop()
    color?: string;

    tooltipVisible = false;

    top = 0;

    left = 0;

    showTooltip(e:MouseEvent) {
      e.preventDefault();
      if (e.clientX && e.clientY) {
        this.top = e.clientY;
        this.left = e.clientX;
      } else {
        const rect = (e.target as Element).getBoundingClientRect();
        this.top = rect.y;
        this.left = rect.x;
      }
      this.tooltipVisible = true;
    }

    hide() {
      this.tooltipVisible = false;
    }

    toggleTooltip(e: KeyboardEvent) {
      if (this.tooltipVisible) this.hide();
      else {
        const rect = (e.target as Element).getBoundingClientRect();
        const event = new MouseEvent('click', {
          clientX: rect.x,
          clientY: rect.y,
        });
        this.showTooltip(event);
      }
    }

    private defaultColor = '#ffffff';

    get computedColor() {
      const numUid = parseInt(this.user.uid, 10);
      if (!numUid && numUid !== 0) {
        return '#ffffff';
      }

      const colors = ['#f39191', '#f39691', '#f39b91', '#f39f91', '#f3a491', '#f3a891', '#f3ad91', '#f3b191', '#f3b691', '#f3ba91', '#f3bf91', '#f3c491', '#f3c891', '#f3cd91', '#f3d191', '#f3d691', '#f3da91', '#f3df91', '#f3e491', '#f3e891', '#f3ed91', '#f3f191', '#f0f391', '#ebf391', '#e7f391', '#e2f391', '#ddf391', '#d9f391', '#d4f391', '#d0f391', '#cbf391', '#c7f391', '#c2f391', '#bef391', '#b9f391', '#b4f391', '#b0f391', '#abf391', '#a7f391', '#a2f391', '#9ef391', '#99f391', '#94f391', '#91f393', '#91f398', '#91f39c', '#91f3a1', '#91f3a5', '#91f3aa', '#91f3ae', '#91f3b3', '#91f3b7', '#91f3bc', '#f391ba', '#f391b6', '#f391b1', '#f391ad', '#f391a8', '#f391a4', '#f3919f', '#f3919b', '#f39196'];
      const c = colors[numUid % colors.length];
      return c;
    }

    get uniqueNicks() { // Gets custom nick
      // Returns an array of nicks that aren't in the standard user^connectionid format
      return this.user.nicks.filter(e => !e.match(/^.+\^\d+/));
    }

    enter() {
      this.$refs.tooltip.fillProfile();
    }

    $refs !: {
      tooltip:UserTooltip;
    };

    get away() {
      return this.user.away;
    }

    get displayedColor() {
      let red;
      let green;
      let blue;
      if (this.color && this.color.length === 7) { // If valid color (part 1)
        red = this.color.substring(1, 3);
        blue = this.color.substring(3, 5);
        green = this.color.substring(5, 7);
      } else {
        return this.computedColor; // If invalid, return computed color
      }
      if (!red.match(/^[a-f0-9]{2}$/) || !green.match(/^[a-f0-9]{2}$/) || !blue.match(/^[a-f0-9]{2}$/)) { // If colors aren't valid hex string
        return this.computedColor; // If invalid, return computed color
      }
      if (!this.validColor(red, green, blue)) { // If color doesn't have enough contrast
        return this.computedColor; // Return computed
      }
       // After it's passed all that, return the color; if it somehow fails, return a computed
      return this.color || this.computedColor;
    }

    validColor(red:string, green:string, blue:string) {
      const backgroundValue = this.brightness(4, 52, 104); // Brightness of background
      const colorValue = this.brightness( // Brightness of input color
        parseInt(red, 16),
        parseInt(green, 16),
        parseInt(blue, 16),
      );
      // If it contrasts well enough
      return Math.abs((colorValue + 0.05) / (backgroundValue + 0.05)) > 4;
    }

    brightness(r:number, g:number, b:number) { // Brightness of a color
      return (299 * r + 587 * g + 114 * b) / 1000;
    }
  }
</script>

<style scoped lang="scss">
  .username:focus {
    outline: 1px dotted #212121;
    outline: 5px auto -webkit-focus-ring-color;
  }
  .fade-enter-active, .fade-leave-active {
    transition: opacity .5s;
  }
  .fade-enter, .fade-leave-to {
    opacity: 0;
  }
  .away-indicator {
    color:yellow;
  }
</style>
