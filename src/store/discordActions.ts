/* import Vue from "vue";
import { ActionTree } from "vuex";
import { HttpResponse } from "vue-resource/types/vue_resource";
import { State } from "./state";
import { Client, Message, Guild, TextChannel, MessageOptions, GuildAuditLogs } from "discord.js";

const client = new Client();
let guild : Guild;
const token = "NDc1MzA1MTk2ODY0NTM2NTg3.DuWgvg.mzjwXz6AKL_mfaffuKA1egaKvig";

export const discordActions: ActionTree<State, any> = {
  init({ dispatch, commit }) {
    console.log("init");
    client.once("ready", () => {
    guild = client.guilds.get('256131046012092416')!;
      dispatch('loadDiscordHistory');
    });
    client.on("message", message => commit("postMessage", { message }));
    client.login(token);
  },
  async loadDiscordHistory({commit}){
    const messages = await (guild.channels.get('256131046012092416') as TextChannel).fetchMessages();
    console.log(messages);
    const toPost = [];
    for (let message of messages)
        toPost.unshift(message[1]);
    for (let message of toPost)
        commit('postMessage', {message: message});
  },
  async sendMessage({commit}, {message} :{message: string}){
     console.log(message);
    const discordMessage = await (guild.channels.get('256131046012092416') as TextChannel).send(message);
    //(await (guild.channels.get('256131046012092416') as TextChannel).fetchWebhooks()).
    console.log(discordMessage);
    //commit('postMessage', {message: discordMessage});
  }
};
*/
