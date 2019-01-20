<template>
  <div id="app1" style="height:100%;">
    <div id="chat" style="height: 100%; font-family: 'Helvetica Neue', 'Open Sans', Arial, Gulim; font-size: 14px; font-weight: 300;">
        <tabs-panel></tabs-panel>
        <chat-content></chat-content>
    </div>
        <div id="report-dialog" style="display: none;">
        <h3 style="text-align: center; margin: 0px;">Ignore/Report User</h3>
        <p>Reports will be sent to our current chat moderators, <a target="_blank" href="http://www.eternagame.org/web/player/36921/">Hoglahoo</a> and <a target="_blank" href="http://www.eternagame.org/web/player/48290/">LFP6</a>.</p>
        <p>User: <input id="report-username" style="background: none; border: none; color: inherit; font: inherit;" disabled></p>
        <input style="display: none" id="report-uid">
        <input style="display: none" id="report-time">
        <input style="display: none" id="report-offending-message">
        <div style="text-align: center; margin-top: 15px;">
            <div style="display: inline-block; margin: 0px 12px;">
                <input type="checkbox" id="report-ignore">
                <label for="report-ignore">Ignore User</label>
            </div>
            <div style="display: inline-block; margin: 0px 12px;">
                <input type="checkbox" id="report-report">
                <label for="report-report">Report User</label>
            </div>
        </div>
        <div style="margin-top: 15px; display: none;">
            <label for="report-message">Additional Comments</label>
            <textarea id="report-message" style="resize: none; height: 60px;"></textarea>
        </div>
        <div style="margin-top: 15px;">
            <div id="report-cancel" class="blue-button blue-button-interactive" style="width: 40%; display: inline-block;">Cancel</div>
            <div id="report-submit" class="green-button green-button-interactive" style="width: 40%; display: inline-block; float: right;">Continue</div>
        </div>
    </div>

  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import TabsPanel from "./components/tabs/TabsPanel.vue";
import Message from "./components/Messages/IrcMessage.vue";
import ChatContent from "./components/ChatContent/ChatContent.vue";
@Component({
  components: {
    TabsPanel,
    ChatContent,
  }
})
export default class App extends Vue {
  created() {
    this.$store.dispatch("initClient");
  }
}
</script>

<style lang="scss">
@import url(https://fonts.googleapis.com/css?family=Didact+Gothic|Open+Sans:400,300,600,700);
@import url(https://irc.eternagame.org/eterna.css);
textarea {
  border-radius: 2px;
  font-family: "Open Sans", "Helvetica Neue", Arial, Gulim;
  font-size: 0.85rem;
  border: 1px solid rgb(169, 169, 169);
  width: calc(100% - 10px);
}

#chat-input,
#reconnect {
  position: absolute;
  bottom: 0px;
  width: calc(100% - 28px);
  height: 19px;
  resize: none;
  margin: 10px;
}
</style>
