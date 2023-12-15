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
  </Modal>
</template>

<script lang="ts">
  import { Component, Prop, Vue } from 'vue-property-decorator';
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
        this.$vxm.chat.ignoreUser({ username: this.userToReport.username });
      }
      const client = this.$vxm.chat.client!;
      if (this.report) {
        this.$vxm.chat.reportUser({
          userToReport: this.userToReport,
          message: this.message,
          reportComments: this.reportComments,
        });
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

input {
  width: auto;
}
</style>
