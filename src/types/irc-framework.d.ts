declare module "irc-framework/browser" {
  import { EventEmitter } from "eventemitter3";
  import { DuplexStream } from "stream";
  export class Client extends EventEmitter {
    constructor(options: ClientConstructorParameters);
    static setDefaultTransport(transport: any): void;
    //get Message(): ClassDecorator;//TODO
    /**Applies the default options to the options object given as impot, and returns it.*/
    _applyDefaultOptions(user_options: ClientConstructorParameters): ClientConstructorParameters;
    createStructure(): void;
    /**Is connected to the IRC network and successfully registered.*/
    connected: boolean; //TODO
    /**The object for the connected user, as long as the client is connected.*/ user: User; //TODO
    /**Request*/ requestCap(capability: string): void;
    use(a: any): any;
    connect(connect_options?: Object): void;
    /**
     * Proxy the command handler events onto the client object, with some added sugar
     * Events are handled in order:
     * 1. Received from the command handler
     * 2. Checked if any extra properties/methods are to be added to the event + re-emitted
     * 3. Routed through middleware
     * 4. Emitted from the client instance
     */
    proxyIrcEvents(): void;
    addCommandHandlerListeners(): void;
    registerToNetwork(): void;
    startPeriodicPing(): void;
    raw(raw_data_line: string): void;
    rawString(...parameters: Array<string>): string;
    rawString(parameters: Array<string>): string;
    quit(quit_message?: string): void;
    ping(message?: string): void;
    changeNick(nick: string): void;
    sendMessage(commandName: string, target: string, message: string): string[];
    say(target: string, message: string): string[];
    notice(target: string, message: string): string[];
    join(channel: string, key?: string): void;
    part(channel: string, message?: string): void;
    mode(channel: string, mode: string, extra_args?: string[]): void;
    inviteList(channel: string, cb: (e: Event) => any): void; //TODO: typeof e?
    invite(channel: string, nick: string): void;
    addInvite(channel: String, mask: string): void;
    removeInvite(channel: string, mask: string): void;
    banlist(channel: string, cb: (e: Event) => any): void;
    ban(channel: string, mask: string): void;
    unban(channel: string, mask: string): void;
    setTopic(channel: string, newTopic: string): void;
    ctcpRequest(target: string, type: string /*, ...params: Array<any>*/): void;
    ctcpResponse(target: string, type: string /*, params: Array<any>*/): void;
    action(target: string, message: string): string[];
    whowas(target: string, cb: (event: Event) => any): void;
    whois(nick: string, cb: (event: any) => void): void;

    /**
     * WHO requests are queued up to run serially.
     * This is mostly because networks will only reply serially and it makes
     * it easier to include the correct replies to callbacks
     */
    who(target: string, cb: (event: any) => void): void;
    list(/*params: Array<string>*/): void;
    channel(channel_name: string): IrcChannel;
    match(
      match_regex: string,
      cb: (event: Event) => any,
      message_type: string
    ): { stop: () => void };
    matchNotice(match_regex: string, cb: (event: Event) => any): void;
    matchMessage(match_regex: string, cb: (event: Event) => any): void;
    matchAction(match_regex: string, cb: (event: Event) => any): void;
    stringToBlocks(str: string, block_size?: number): string[];
  }
  export class IrcMessage {
    constructor(command?: string, ...args: string[]);
    account?: IrcUser;
    group?: any;
    hostname: string;
    ident: string;
    message: string;
    nick: string;
    reply(e: any) : any;
    tags: Object;//any
    target: string;
    time?: any; 
    type: string;
  }

  interface IrcUser {
    /**The current nick you are currently using.*/
    nick: string;
    /**Your username (ident) that the network sees you as using.*/
    username: string;
    /**Your current gecos (realname).*/
    gecos: string;
    /**On supported servers, the hostname that the networksees you are using.*/
    host: string;
    /**Your current away status. Empty for not away.*/
    away: string;
    /**A set() instance with your current user modes.*/
    modes: Set<string>;
  }
  class IrcChannel {
    constructor(irc_client: Client, channel_name: string, key: string);
    irc_client: Client;
    name: string;
    say(message: string): string[];
    notice(message: string): string[];
    join(key?: string): void;
    part(message?: string): void;
    mode(mode: string, extra_args?: string[]): void;
    banlist(cb: (e: Event) => any): void;
    ban(mask: string): void;
    unban(mask: string): void;
    users: IrcUser[];
    /**
     * Relay messages between this channel to another
     * @param  {IrcChannel|String} target_chan Target channel
     * @param  {Object} opts        Extra options
     *
     * opts may contain the following properties:
     * one_way (false) Only relay messages to target_chan, not the reverse
     * replay_nicks (true) Include the sending nick as part of the relayed message
     */
    relay(target_chan: IrcChannel | String, opts: Object): void;
    stream(stream_ops: Object): DuplexStream;
    updateUsers(cb: (a: any) => any): void;
  }
  interface ClientConstructorParameters {
    nick?: string;
    username?: string;
    gecos?: string;
    encoding?: string;
    version?: string;
    enable_chghost?: boolean;
    enable_echomessage?: boolean;
    auto_reconnect?: boolean;
    auto_reconnect_wait?: number;
    auto_reconnect_max_retries?: number;
    ping_interval?: number;
    ping_timeout?: number;
    webirc?: {
      password?: string;
      username?: string;
      hostname?: string;
      ip?: string;
    };
  }
}
