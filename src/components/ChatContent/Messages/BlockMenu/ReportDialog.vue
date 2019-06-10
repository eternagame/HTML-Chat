<template>
  <modal name="reportModal" classes="report-dialog" :maxWidth="350" height="auto" :adaptive="true">
    <h3 style="text-align: center; margin: 0px;">Ignore/Report User</h3>
    <p>
      Reports will be sent to our current chat moderators,
      <a
        target="_blank"
        href="http://www.eternagame.org/web/player/36921/"
      >Hoglahoo</a>
      and
      <a target="_blank" href="http://www.eternagame.org/web/player/48290/">LFP6</a>.
    </p>
    <p>User: {{userToReport.username}}</p>
    <div style="text-align: center; margin-top: 15px;">
      <div style="display: inline-block; margin: 0px 12px;">
        <input type="checkbox" v-model="ignore">
        <label for="report-ignore">Ignore User</label>
      </div>
      <div style="display: inline-block; margin: 0px 12px;">
        <input type="checkbox" v-model="report">
        <label for="report-report">Report User</label>
      </div>
    </div>
    <div style="margin-top: 15px;" v-show="report">
      <label for="report-message">Additional Comments:</label>
      <textarea v-model="reportComments" style="resize: none; height: 60px;"></textarea>
    </div>
    <div style="margin-top: 15px;">
      <div
        class="blue-button blue-button-interactive"
        style="width: 40%; display: inline-block; vertical-align: middle;"
        @click="closeModal"
      >Cancel</div>
      <div
        class="green-button green-button-interactive"
        style="width: 40%; display: inline-block; float: right; vertical-align: middle;"
        @click="submit"
      >Continue</div>
    </div>
  </modal>
</template>

<script lang="ts">
  import { Component, Prop } from 'vue-property-decorator';
  import Vue from '@/types/vue';
  import { Client } from 'irc-framework';
  import parseUsername from '@/tools/parseUsername';
  import User from '../../../../types/user';
  import Message from '../../../../types/message';

@Component({})
  export default class ReportDialog extends Vue {
  report = false;

  ignore = false;

  message: Message | null = null;

  get userToReport(): User {
    return this.message ? this.message.user : User.annonymous;
  }

  $refs!: {
    reportModal: HTMLFormElement;
  };

  reportComments: string = '';

  submit() {
    if (this.ignore) {
      this.$store.commit('ignore', this.userToReport.username);
    }
    const client = this.$store.state.client!;
    if (this.report) {
      client.say(
        '#ops-notifications',
        `[REPORT] Reporting ${this.userToReport.username} (${
          this.userToReport.uid
        }) by ${this.$store.state.currentUser.username} (${
          this.$store.state.currentUser.uid
        }).\r\n`,
      );
      if (this.message) {
        client.say(
          '#ops-notifications',
          `[REPORTED MESSAGE] ${this.message!.message}\r\n`,
        );
      }
      client.say(
        '#ops-notifications',
        `[REPORT REASON] ${this.reportComments}\r\n`,
      );
    }
    this.closeModal();
  }

  closeModal() {
    this.$modal.hide('reportModal');
    this.reportComments = '';
  }

  created() {
    this.$store.subscribe((mutation, state) => {
      if (mutation.type === 'openReportModal') {
        this.message = mutation.payload.message;
        this.report = mutation.payload.defaults.report;
        this.ignore = mutation.payload.defaults.ignore;
        this.$modal.show('reportModal');
      }
    });
  }
  }
</script>

<style lang="scss">
/* Report dialog */
.report-dialog {
  background: #123768;
  border-radius: 5px;
  color: white;
  padding: 20px;
}
</style>

<style scoped lang="scss">
a {
  color: white;
}

.blue-button,
.green-button {
  padding: 4px 7px !important;
}

//from eterna.css
.blue-button,
.blue-button-interactive,
.blue-button-interactive2D {
  /*border-color: #0099CC;
        border-width: 2px;
        border-style: outset;
        */
  background-color: #33b5e5;
  font-weight: bolder;
  position: relative;
  text-align: center;
  text-transform: capitalized;
  font-family: "Century Gothic", "Didact Gothic", Arial, sans-serif;
  text-decoration: none;
  font-size: 12px;
}
.blue-button-bg {
  opacity: 0.8;
  filter: alpha(opacity=80);
  position: absolute;
}
.blue-button-interactive {
  -webkit-border-radius: 5px;
  -moz-border-radius: 5px;
  border-radius: 5px;
  box-shadow: 5px 5px #19576e;
}
.blue-button-interactive:hover,
.blue-button-interactive.hover {
  background-color: #2a98c0;
  box-shadow: 4px 4px #19576e;
  -webkit-transform: translate(1px, 1px);
  -moz-transform: translate(1px, 1px);
  transform: translate(1px, 1px);
}
.blue-button-interactive:active,
.blue-button-interactive.active {
  background-color: #2a98c0;
  box-shadow: 2px 2px #19576e;
  -webkit-transform: translate(3px, 3px);
  -moz-transform: translate(3px, 3px);
  transform: translate(3px, 3px);
}
.blue-button,
.blue-button-interactive2D {
  -webkit-border-radius: 5px;
  -moz-border-radius: 5px;
  border-radius: 5px;
  box-shadow: 0px 5px #19576e;
  margin: 0px 2.5px;
}
.blue-button:hover,
.blue-button.hover,
.blue-button-interactive2D:hover,
.blue-button-interactive2D.hover {
  background-color: #2a98c0;
  box-shadow: 0px 4px #19576e;
  -webkit-transform: translate(0px, 1px);
  -moz-transform: translate(0px, 1px);
  transform: translate(0px, 1px);
}
.blue-button:active,
.blue-button.active,
.blue-button-interactive2D:active,
.blue-button-interactive2D.active {
  background-color: #2a98c0;
  box-shadow: 0px 2px #19576e;
  -webkit-transform: translate(0px, 3px);
  -moz-transform: translate(0px, 3px);
  transform: translate(0px, 3px);
}
.green-button a,
.blue-button a,
.red-button a,
.yellow-button a,
.gray-button a,
.green-button.centered-button-text,
.blue-button.centered-button-text,
.red-button.centered-button-text,
.yellow-button.centered-button-text,
.gray-button.centered-button-text {
  outline: 0;
  text-decoration: none;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  -webkit-transform: translate(-50%, -50%);
  -moz-transform: translate(-50%, -50%);
  -o-transform: translate(-50%, -50%);
  -ms-transform: translate(-50%, -50%);
}
.green-button,
.green-button-interactive,
.green-button-interactive2D {
  /*border-color: #2f4a68;
        border-width: 2px;
        border-style: solid;
        */
  background-color: #4fb748;
  font-weight: normal;
  position: relative;
  text-align: center;
  font-size: 12px;
  text-transform: capitalized;
  font-family: "Century Gothic", "Didact Gothic", Arial, sans-serif;
}
.green-button-bg {
  /*opacity: 0.8;
        filter: alpha(opacity=80);
         */
  position: absolute;
}
.green-button-interactive {
  -webkit-border-radius: 5px;
  -moz-border-radius: 5px;
  border-radius: 5px;
  text-decoration: none;
  box-shadow: 5px 5px #2c6628;
}
.green-button-interactive:hover,
.green-button-interactive.hover {
  background-color: #48a641;
  box-shadow: 4px 4px #2c6628;
  -webkit-transform: translate(1px, 1px);
  -moz-transform: translate(1px, 1px);
  transform: translate(1px, 1px);
}
.green-button-interactive:active,
.green-button-interactive.active {
  background-color: #48a641;
  box-shadow: 2px 2px #2c6628;
  -webkit-transform: translate(3px, 3px);
  -moz-transform: translate(3px, 3px);
  transform: translate(3px, 3px);
}
.green-button,
.green-button-interactive2D {
  -webkit-border-radius: 5px;
  -moz-border-radius: 5px;
  border-radius: 5px;
  text-decoration: none;
  box-shadow: 0px 5px #2c6628;
  margin: 0px 2.5px;
}
.green-button:hover,
.green-button.hover,
.green-button-interactive2D:hover,
.green-button-interactive2D.hover {
  background-color: #48a641;
  box-shadow: 0px 4px #2c6628;
  -webkit-transform: translate(0px, 1px);
  -moz-transform: translate(0px, 1px);
  transform: translate(0px, 1px);
}
.green-button:active,
.green-button.active,
.green-button-interactive2D:active,
.green-button-interactive2D.active {
  background-color: #48a641;
  box-shadow: 0px 2px #2c6628;
  -webkit-transform: translate(0px, 3px);
  -moz-transform: translate(0px, 3px);
  transform: translate(0px, 3px);
}
</style>
