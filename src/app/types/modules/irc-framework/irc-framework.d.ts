declare module 'irc-framework' {
  import { EventEmitter } from 'eventemitter3';
  import { DuplexStream } from 'stream';
  import Connection from 'irc-framework/src/transports/websocket';
  import MiddlewareHandler from 'middleware-handler';

  export class Client extends EventEmitter {
    constructor(options?: ClientConstructorParameters);

    static setDefaultTransport<Transport extends typeof BaseTransport>(transport: Transport): void;

    get Message(): typeof IrcMessage;

    /** Applies the default options to the options object given as impot, and returns it. */
    _applyDefaultOptions(user_options: ClientConstructorParameters): ClientConstructorParameters;

    createStructure(): void;

    /** Is connected to the IRC network and successfully registered. */
    connected: boolean;

    /** The object for the connected message, as long as the client is connected. */
    user: User;

    /** Request */
    requestCap(cap: string | string[]): void;

    use(
      middleware_fn: (
        client: this,
        raw_middleware: MiddlewareHandler,
        parsed_middleware: MiddlewareHandler,
      ) => void,
    ): this;

    connect(connect_options?: ClientConstructorParameters): void;

    /**
     * Proxy the command handler events onto the client object, with some added sugar
     * Events are handled in order:
     * 1. Received from the command handler
     * 2. Checked if any extra properties/methods are to be added to the params + re-emitted
     * 3. Routed through middleware
     * 4. Emitted from the client instance
     */
    proxyIrcEvents(): void;

    addCommandHandlerListeners(): void;

    registerToNetwork(): void;

    startPeriodicPing(): void;

    raw(input: string | IrcMessage): void;

    rawString(...parameters: Array<string>): string;
    rawString(parameters: Array<string>): string;

    quit(quit_message?: string): void;

    ping(message?: string): void;

    changeNick(nick: string): void;

    sendMessage(commandName: string, target: string, message: string): void;

    say(target: string, message: string): void;

    notice(target: string, message: string): void;

    join(channel: string, key?: string): void;

    part(channel: string, message?: string): void;

    mode(channel: string, mode: string, extra_args?: string[]): void;

    inviteList(channel: string, cb: (e: Event) => void): void;

    invite(channel: string, nick: string): void;

    addInvite(channel: string, mask: string): void;

    removeInvite(channel: string, mask: string): void;

    banlist(channel: string, cb: (e: BanlistEventArgs) => void): void;

    ban(channel: string, mask: string): void;

    unban(channel: string, mask: string): void;

    setTopic(channel: string, newTopic: string): void;

    ctcpRequest(target: string, type: string /* , ...params: Array<any> */): void;

    ctcpResponse(target: string, type: string /* , params: Array<any> */): void;

    action(target: string, message: string): string[];

    whowas(target: string, cb: (event: WhoWasEventArgs) => void): void;

    whois(target: string, cb: (event: WhoIsEventArgs) => void): void;

    /**
     * WHO requests are queued up to run serially.
     * This is mostly because networks will only reply serially and it makes
     * it easier to include the correct replies to callbacks
     */
    who(
      target: string,
      cb: (event: { target: string; users: WhoListEventArgs['users'] }) => void,
    ): void;

    list(/* params: Array<string> */): void;

    channel(channel_name: string): IrcChannel;

    match(
      match_regex: string,
      cb: (event: Event) => void,
      message_type: string,
    ): { stop: () => void };

    matchNotice(match_regex: string, cb: (event: Event) => void): void;

    matchMessage(match_regex: string, cb: (event: Event) => void): void;

    matchAction(match_regex: string, cb: (event: Event) => void): void;

    stringToBlocks(str: string, block_size?: number): string[];

    on(eventType: string | symbol, cb: (event: unknown) => void): this;

    on(eventType: 'raw', cb: (event: RawEventArgs) => void): this;

    on(eventType: 'join', cb: (event: JoinEventArgs) => void): this;

    on(eventType: 'userlist', cb: (event: UserListEventArgs) => void): this;

    on(eventType: 'monitorList', cb: (event: MonitorListEventArgs) => void): this;
    on(eventType: 'whois', cb: (event: WhoIsEventArgs) => void): this;
    on(eventType: 'whowas', cb: (event: WhoWasEventArgs) => void): this;

    on(eventType: 'registered', cb: (event: RegisteredEventArgs) => void): this;
    on(eventType: 'connected', cb: (event: RegisteredEventArgs) => void): this;
    on(eventType: 'connecting', cb: () => void): this;
    on(
      eventType: 'reconnecting',
      cb: (event: { attempt: number; max_retries: number; wait: number }) => void,
    ): this;

    on(eventType: 'quit', cb: (event: QuitEventArgs) => void): this;
    on(eventType: 'part', cb: (event: QuitEventArgs) => void): this;
    on(eventType: 'kick', cb: (event: KickEventArgs) => void): this;

    on(eventType: 'away', cb: (event: AwayEventArgs) => void): this;
    on(eventType: 'back', cb: (event: BackEventArgs) => void): this;

    on(eventType: 'message', cb: (event: MessageEventArgs) => void): this;
    on(eventType: 'privmsg', cb: (event: MessageEventArgs<'privmsg'>) => void): this;
    on(eventType: 'notice', cb: (event: MessageEventArgs<'notice'>) => void): this;
    on(eventType: 'action', cb: (event: MessageEventArgs<'action'>) => void): this;

    on(eventType: 'mode', cb: (event: ModeEventArgs) => void): this;

    on(eventType: 'socket close', cb: (event: Error | false) => void): this;

    on(eventType: 'socket connected', cb: () => void): this;

    on(eventType: 'raw socket connected', cb: () => void): this;

    on(eventType: 'server options', cb: (event: ServerOptionsEventArgs) => void): this;

    on(eventType: 'debug', cb: (message: string) => void): this;

    on(eventType: 'nick in use', cb: (event: NickInUseEventArgs) => void): this;

    on(eventType: 'nick invalid', cb: (event: NickInvalidEventArgs) => void): this;

    on(eventType: 'irc error', cb: (event: IrcErrorEventArgs) => void): this;
  }
  export class NetworkInfo {
    name: string;
    server: string;
    ircd: string;
    options: Record<string, unknown>;
    cap: {
      negotiating: boolean;
      requested: string[];
      enabled: string[];
      available: Map<string, unknown>;
      isEnabled: (cap_name: string) => boolean;
    };
    time_offsets: number[];
    time_offset: number;
    timeToLocal(serverTimeMs: number): number;
    timeToServer(localTimeMs: number): number;
    getServerTimeOffset(): number;
    addServerTimeOffset(time: number): void;
    supports(support_name: string): boolean;
    supportsTag(tag_name: string): boolean;
    isChannelName(channel_name: string): boolean;
    extractTargetGroup(target: string): null | { target: string; target_group: string };
  }
  export class IrcMessage {
    tags: Record<string, string>;
    prefix: string;
    nick: string;
    ident: string;
    hostname: string;
    command: string;
    params: string[];

    constructor(command?: IrcMessage['command'], ...args: IrcMessage['params']);

    to1459(): string[];
    toJson(): {
      tags: IrcMessage['tags'];
      source: IrcMessage['prefix'];
      command: IrcMessage['command'];
      params: IrcMessage['params'];
    };
  }

  export interface MessageEventArgs<
    Type extends 'privmsg' | 'action' | 'notice' = 'privmsg' | 'action' | 'notice',
  > {
    account?: string;
    group?: string;
    hostname: string;
    ident: string;
    message: string;
    nick: string;
    reply: (message: string) => void;
    tags: { [key: string]: string };
    target: string;
    time?: number;
    type: Type;
  }
  export interface JoinEventArgs {
    account: string;
    channel: string;
    gecos: string;
    hostname: string;
    ident: string;
    nick: string;
    time?: number;
  }
  export interface AwayEventArgs {
    self: boolean;
    nick: string;
    message: string;
    time: number;
  }
  export interface BackEventArgs {
    self: boolean;
    nick: string;
    message: string;
    time: number;
  }
  export interface KickEventArgs {
    kicked: string;
    nick: string;
    ident: string;
    hostname: string;
    channel: string;
    message: string;
    time: number;
  }
  export interface RawEventArgs {
    from_server: boolean;
    line: string;
  }
  export interface MonitorListEventArgs {
    nicks: string[];
  }
  export interface WhoIsEventArgs {
    away: string;
    nick: string;
    hostname: string;
    actual_ip: string;
    actual_hostname: string;
    real_name: string;
    helpop: string;
    bot: string;
    server: string;
    server_info: string;
    operator: string;
    modes: string;
    idel: string;
    logon: string;
    registered_nick: string;
    account: string;
    secure: string;
    special: string;
  }
  export interface WhoWasEventArgs {
    nick: string;
    ident: string;
    hostname: string;
    actual_ip: string;
    actual_hostname: string;
    actual_username: string;
    real_name: string;
    server: string;
    server_info: string;
    account: string;
    error: string;
    whowas: Array<{ nick: string; ident: string; hostname: string; real_name: string }>[];
  }
  export interface RegisteredEventArgs {
    nick: string;
  }
  export interface QuitEventArgs {
    hostname: string;
    ident: string;
    message: string;
    nick: string;
    time?: number;
  }
  interface Mode {
    mode: string;
    param: string;
  }
  export interface ModeEventArgs {
    modes: Mode[];
    nick: string;
    raw_modes: string;
    raw_params: string[];
    target: string;
    time?: number;
  }
  export interface ServerOptionsEventArgs {
    options: Record<string, unknown>;
    cap: string[];
    tags: Record<string, string>;
  }
  export interface NickInvalidEventArgs {
    nick: string;
    reason: string;
  }
  export interface NickInUseEventArgs {
    nick: string;
    reason: string;
  }
  export interface IrcErrorEventArgs {
    error: string;
    channel: string;
    reason: string;
  }

  class User {
    //   /**The current nick you are currently using.*/
    nick: string;
    username: string;
    gecos: string;
    host: string;
    away: boolean;
    modes: Set<string>;

    constructor(
      opts?: Partial<{
        nick: string;
        username: string;
        gecos: string;
        host: string;
        away: boolean;
        modes: Set<string> | string[];
      }>,
    );

    toggleModes(modestr: string[]): void;
  }

  export interface IrcChannelUser {
    nick: string;
    ident: string;
    hostname: string;
    modes: string[];
    tags: Record<string, string>;
  }

  class IrcChannel {
    irc_client: Client;
    name: string;
    users: IrcChannelUser[];

    constructor(irc_client: Client, channel_name: string, key: string);

    say(message: string): ReturnType<Client['say']>;
    notice(message: string): ReturnType<Client['notice']>;
    action(message: string): ReturnType<Client['action']>;
    part(message?: string): ReturnType<Client['part']>;
    join(key?: string): ReturnType<Client['join']>;
    mode(mode: string, extra_args?: string[]): ReturnType<Client['mode']>;
    banlist(cb: (event: BanlistEventArgs) => void): ReturnType<Client['banlist']>;
    ban(mask: string): ReturnType<Client['ban']>;
    unban(mask: string): ReturnType<Client['unban']>;

    /**
     * Relay messages between this channel to another
     * @param {object} opts Extra options
     * @param {object} opts.one_way [Default: false] Only relay messages to target_chan, not the reverse
     * @param {object} opts.replay_nicks [Default: true] Include the sending nick as part of the relayed message
     */
    relay(
      target_chan: IrcChannel | string,
      opts?: Partial<{ one_way: boolean; replay_nicks: boolean }>,
    ): void;
    stream(stream_ops: { replay_nicks?: boolean }): DuplexStream;
    updateUsers(cb?: (channel: this) => void): void;
  }
  export interface ChannelInfoEventArgs {
    channel: string;
    created_at?: number;
    modes?: Mode[]; // TODO: check type
    url?: string;
  }
  export interface UserListEventArgs {
    channel: string;
    users: IrcChannelUser[];
    tags: Record<string, string>;
  }
  export interface WhoListEventArgs {
    target: string;
    users: User[];
    tags: Record<string, string>;
  }
  export interface BanlistEventArgs {
    channel: string;
    bans: BanlistBanObject[]; // TODO: check type
  }
  export interface BanlistBanObject {
    banned: string;
    channel: string;
  }
  export interface TopicEventArgs {
    channel: string;
    topic: string;
    nick?: string;
    time?: number;
  }
  export interface TopicSetByEventArgs {
    channel: string;
    nick: string;
    ident: string;
    hostname: string;
    when?: number;
  }
  interface ClientConstructorParameters {
    host: string; // host?: (?)
    nick?: string;
    username?: string;
    gecos?: string;
    encoding?: string;
    version?: string;
    enable_chghost?: boolean;
    enable_echomessage?: boolean;
    message_max_length?: number;
    auto_reconnect?: boolean;
    auto_reconnect_max_wait?: number;
    auto_reconnect_max_retries?: number;
    ping_interval?: number;
    ping_timeout?: number;
    transport?: typeof BaseTransport;
    ssl?: boolean;
    webirc?: {
      password?: string;
      username?: string;
      hostname?: string;
      ip?: string;
    };
  }

  abstract class BaseTransport extends EventEmitter {
    isConnected(): boolean;
    writeLine(line: string, cb: () => void);
    debugOut(out: string);
    connect(): void;
    close(): void;
    setEncoding(encoding: string): void;
  }
}
