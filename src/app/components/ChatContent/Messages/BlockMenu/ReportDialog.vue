<template>
  <Modal
    name="reportModal"
    classes="report-dialog"
    class="test"
    :max-width="350"
    height="auto"
    :adaptive="true"
  >
    <h3 style="text-align: center; margin: 0px;">
      Ignore/Report User
    </h3>
    <p>
      Reports will be sent to our current chat moderators,
      <a
        target="_blank"
        href="http://www.eternagame.org/web/player/36921/"
      >Hoglahoo</a>
      and
      <a
        target="_blank"
        href="http://www.eternagame.org/web/player/48290/"
      >LFP6</a>.
    </p>
    <p>User: {{ userToReport.username }}</p>
    <div style="text-align: center; margin-top: 15px;">
      <div style="display: inline-block; margin: 0px 12px;">
        <input
          v-model="ignore"
          type="checkbox"
          id="ignore"
        >
        <label for="ignore">Ignore User</label>
      </div>
      <div style="display: inline-block; margin: 0px 12px;">
        <input
          v-model="report"
          type="checkbox"
          id="report"
        >
        <label for="report">Report User</label>
      </div>
    </div>
    <div
      v-show="report"
      style="margin-top: 15px;"
    >
      <label for="report-message">Additional Comments:</label>
      <textarea
        v-model="reportComments"
        style="resize: none; height: 60px;"
      />
    </div>
    <div style="margin-top: 15px;">
      <div
        class="blue-button"
        style="width: 40%; display: inline-block; vertical-align: middle;"
        @click="closeModal"
      >
        Cancel
      </div>
      <div
        class="green-button"
        style="width: 40%; display: inline-block; float: right; vertical-align: middle;"
        @click="submit"
      >
        Continue
      </div>
    </div>
  </modal>
</template>

<script lang="ts">
  import { Component, Prop } from 'vue-property-decorator';
  import Vue from '@/types/vue';
  import { Client } from 'irc-framework';
  import User from '@/types/user';
  import Message from '@/types/message';

  @Component({})
  export default class ReportDialog extends Vue {
    report: boolean = false;

    ignore: boolean = false;

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
        this.$store.commit('$_chat/ignoreUser', { username: this.userToReport.username });
      }
      const client = this.$store.state.$_chat.client!;
      if (this.report) {
        this.$store.dispatch('$_chat/reportUser', { userToReport: this.userToReport, message: this.message, reportComments: this.reportComments });
      }
      this.closeModal();
    }

    open({ message, defaults }: {message: Message, defaults: {report: boolean, ignore: boolean}}) {
      this.message = message;
      this.report = defaults.report;
      this.ignore = defaults.ignore;
      this.$modal.show('reportModal');
    }

    closeModal() {
      this.$modal.hide('reportModal');
      this.reportComments = '';
    }
  }
</script>

<style scoped lang="scss">
::v-deep .report-dialog{
  background: #123768;
  border-radius: 5px;
  color: white;
  padding: 20px;
}

a {
  color: white;
}

.blue-button,
.green-button {
  padding: 4px 7px !important;
}

//from eterna.css
.blue-button {
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
.blue-button {
  -webkit-border-radius: 5px;
  -moz-border-radius: 5px;
  border-radius: 5px;
  box-shadow: 5px 5px #19576e;
}
.blue-button:hover {
  background-color: #2a98c0;
  box-shadow: 4px 4px #19576e;
  -webkit-transform: translate(1px, 1px);
  -moz-transform: translate(1px, 1px);
  transform: translate(1px, 1px);
}
.blue-button:active {
  background-color: #2a98c0;
  box-shadow: 2px 2px #19576e;
  -webkit-transform: translate(3px, 3px);
  -moz-transform: translate(3px, 3px);
  transform: translate(3px, 3px);
}
.blue-button {
  -webkit-border-radius: 5px;
  -moz-border-radius: 5px;
  border-radius: 5px;
  box-shadow: 0px 5px #19576e;
  margin: 0px 2.5px;
}
.blue-button:hover {
  background-color: #2a98c0;
  box-shadow: 0px 4px #19576e;
  -webkit-transform: translate(0px, 1px);
  -moz-transform: translate(0px, 1px);
  transform: translate(0px, 1px);
}
.blue-button:active {
  background-color: #2a98c0;
  box-shadow: 0px 2px #19576e;
  -webkit-transform: translate(0px, 3px);
  -moz-transform: translate(0px, 3px);
  transform: translate(0px, 3px);
}
.green-button {
  background-color: #4fb748;
  font-weight: normal;
  position: relative;
  text-align: center;
  font-size: 12px;
  text-transform: capitalized;
  font-family: "Century Gothic", "Didact Gothic", Arial, sans-serif;
}
.green-button-bg {
  position: absolute;
}
.green-button {
  -webkit-border-radius: 5px;
  -moz-border-radius: 5px;
  border-radius: 5px;
  text-decoration: none;
  box-shadow: 5px 5px #2c6628;
}
.green-button:hover {
  background-color: #48a641;
  box-shadow: 4px 4px #2c6628;
  -webkit-transform: translate(1px, 1px);
  -moz-transform: translate(1px, 1px);
  transform: translate(1px, 1px);
}
.green-button-interactive:active {
  background-color: #48a641;
  box-shadow: 2px 2px #2c6628;
  -webkit-transform: translate(3px, 3px);
  -moz-transform: translate(3px, 3px);
  transform: translate(3px, 3px);
}
.green-button {
  -webkit-border-radius: 5px;
  -moz-border-radius: 5px;
  border-radius: 5px;
  text-decoration: none;
  box-shadow: 0px 5px #2c6628;
  margin: 0px 2.5px;
}
.green-button:hover {
  background-color: #48a641;
  box-shadow: 0px 4px #2c6628;
  -webkit-transform: translate(0px, 1px);
  -moz-transform: translate(0px, 1px);
  transform: translate(0px, 1px);
}
.green-button:active {
  background-color: #48a641;
  box-shadow: 0px 2px #2c6628;
  -webkit-transform: translate(0px, 3px);
  -moz-transform: translate(0px, 3px);
  transform: translate(0px, 3px);
}
</style>
