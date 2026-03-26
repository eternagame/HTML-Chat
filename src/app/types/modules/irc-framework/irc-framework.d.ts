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

    sendMessage(commandName: string, target: string, message: string, tags?: Tags): void;

    say(target: string, message: string, tags?: Tags): void;
    notice(target: string, message: string, tags?: Tags): void;
    tagmsg(target: string, tags?: Tags): void;

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

    ctcpRequest(target: string, type: string, ...params: string[]): void;

    ctcpResponse(target: string, type: string, ...params: string[]): void;

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
      cb: (event: { target: string; users: WhoListEvent['users'] }) => void,
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

    // Reference: https://github.com/kiwiirc/irc-framework/blob/master/docs/events.md
    on(eventType: string | symbol, cb: (event: unknown) => void): this;

    // Registration
    on(eventType: 'registered', cb: (event: RegisteredEvent) => void): this;
    on(eventType: 'connected', cb: (event: RegisteredEvent) => void): this;
    on(eventType: 'connecting', cb: () => void): this;
    on(
      eventType: 'reconnecting',
      cb: (event: { attempt: number; max_retries: number; wait: number }) => void,
    ): this;
    on(eventType: 'close', cb: () => void): this;
    on(eventType: 'socket close', cb: (event: Error | false) => void): this;
    on(eventType: 'socket connected', cb: () => void): this;
    on(eventType: 'raw socket connected', cb: () => void): this;
    on(eventType: 'server options', cb: (event: ServerOptionsEventArgs) => void): this;

    // Raw connection and debugging
    on(eventType: 'raw', cb: (event: RawEventArgs) => void): this;
    on(eventType: 'unknown command', cb: (event: IrcCommand) => void): this;
    on(eventType: 'debug', cb: (message: string) => void): this;

    // Channels
    on(eventType: 'channel info', cb: (event: unknown) => void): this;
    on(eventType: 'channel list start', cb: () => void): this;
    on(eventType: 'channel list', cb: (event: unknown[]) => void): this;
    on(eventType: 'channel list end', cb: () => void): this;
    on(eventType: 'wholist', cb: (event: WhoListEvent) => void): this;
    on(eventType: 'userlist', cb: (event: UserListEventArgs) => void): this;
    on(eventType: 'invitelist', cb: (event: unknown) => void): this;
    on(eventType: 'banlist', cb: (event: BanlistEventArgs) => void): this;
    on(eventType: 'exceptlist', cb: (event: unknown) => void): this;
    on(eventType: 'topic', cb: (event: unknown) => void): this;
    on(eventType: 'topicsetby', cb: (event: unknown) => void): this;
    on(eventType: 'join', cb: (event: JoinEvent) => void): this;
    on(eventType: 'part', cb: (event: PartEvent) => void): this;
    on(eventType: 'kick', cb: (event: KickEvent) => void): this;
    on(eventType: 'quit', cb: (event: QuitEvent) => void): this;
    on(eventType: 'invited', cb: (event: unknown) => void): this;

    // Messaging
    on(eventType: 'message', cb: (event: MessageEventArgs) => void): this;
    on(eventType: 'notice', cb: (event: MessageEvent) => void): this;
    on(eventType: 'action', cb: (event: MessageEvent) => void): this;
    on(eventType: 'privmsg', cb: (event: MessageEvent) => void): this;
    on(eventType: 'tagmsg', cb: (event: TagMessageEvent) => void): this;
    on(eventType: 'ctcp response', cb: (event: unknown) => void): this;
    on(eventType: 'ctcp request', cb: (event: unknown) => void): this;
    on(eventType: 'wallops', cb: (event: unknown) => void): this;

    // Users
    on(eventType: 'nick', cb: (event: unknown) => void): this;
    on(eventType: 'account', cb: (event: unknown) => void): this;
    on(eventType: 'user info', cb: (event: unknown) => void): this;
    on(eventType: 'away', cb: (event: AwayEvent) => void): this;
    on(eventType: 'back', cb: (event: BackEvent) => void): this;
    on(eventType: 'monitorList', cb: (event: MonitorListEventArgs) => void): this;
    on(eventType: 'nick in use', cb: (event: NickInUseEventArgs) => void): this;
    on(eventType: 'nick invalid', cb: (event: NickInvalidEventArgs) => void): this;
    on(eventType: 'users online', cb: (event: unknown) => void): this;
    on(eventType: 'users offline', cb: (event: unknown) => void): this;
    on(eventType: 'whois', cb: (event: WhoIsEventArgs) => void): this;
    on(eventType: 'whowas', cb: (event: WhoWasEventArgs) => void): this;
    on(eventType: 'user updated', cb: (event: unknown) => void): this;

    // Misc
    on(eventType: 'motd', cb: (event: unknown) => void): this;
    on(eventType: 'info', cb: (event: unknown) => void): this;
    on(eventType: 'help', cb: (event: unknown) => void): this;
    on(eventType: 'batch start', cb: (event: unknown) => void): this;
    on<BatchType extends string>(
      eventType: `batch start ${BatchType}`,
      cb: (event: unknown) => void,
    ): this;
    on(eventType: 'batch end', cb: (event: unknown) => void): this;
    on<BatchType extends string>(
      eventType: `batch end ${BatchType}`,
      cb: (event: unknown) => void,
    ): this;
    on(
      eventType: `cap ${'ls' | 'ack' | 'nak' | 'list' | 'new' | 'del'}`,
      cb: (event: unknown) => void,
    ): this;

    // SASL
    on(eventType: 'loggedin', cb: (event: unknown) => void): this;
    on(eventType: 'loggedout', cb: (event: unknown) => void): this;
    on(eventType: 'sasl failed', cb: (event: unknown) => void): this;

    // Undocumented
    on(eventType: 'mode', cb: (event: ModeEvent) => void): this;
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
    tags: Tags;
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

  /** See https://ircv3.net/specs/extensions/message-tags */
  export type Tags = Partial<{
    /** See https://ircv3.net/specs/extensions/account-tag */
    account: string;
    /** See https://ircv3.net/specs/extensions/batch */
    batch: string;
    /** See https://ircv3.net/specs/extensions/labeled-response */
    label: string;
    /** See https://ircv3.net/specs/extensions/message-ids */
    msgid: string;
    /** See https://ircv3.net/specs/extensions/server-time */
    time: string;
    /** See https://ircv3.net/specs/client-tags/typing */
    '+typing': string;
    /** See https://ircv3.net/specs/extensions/message-tags#client-only-tags */
    [clientTagName: `+${string}`]: string;
    [tagName: string]: string;
  }>;

  interface MessageEvent {
    from_server: boolean;
    nick: string;
    ident: string;
    hostname: string;
    target: string;
    group?: string;
    message: string;
    tags: Tags;
    time?: number;
    account?: string;
    batch?: string;
    reply(message: string): void;
  }
  export type MessageEventArgs =
    | (MessageEvent & { type: 'privmsg' })
    | (MessageEvent & { type: 'action' })
    | (MessageEvent & { type: 'notice' });

  export type TagMessageEvent = Pick<
    MessageEvent,
    'from_server' | 'nick' | 'ident' | 'hostname' | 'target' | 'tags' | 'time' | 'account' | 'batch'
  >;

  export interface JoinEvent extends Pick<
    MessageEvent,
    'nick' | 'ident' | 'hostname' | 'message' | 'time' | 'tags' | 'account' | 'batch'
  > {
    channel: string;
    gecos: string;
  }
  export interface AwayEvent extends Pick<MessageEvent, 'nick' | 'message' | 'time' | 'tags'> {
    self: boolean;
  }
  export interface BackEvent extends AwayEvent {
    message: '';
  }
  class IrcCommand implements Pick<MessageEvent, 'tags' | 'nick' | 'ident' | 'hostname'> {
    command: string;
    params: string[];
    prefix: string;
    getTag<Tag extends string>(tag_name: Tag): Tags[Tag];
    getServerTime(): number | undefined;
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
  export interface RegisteredEvent {
    nick: string;
  }
  export interface PartEvent extends Pick<
    MessageEvent,
    'nick' | 'ident' | 'hostname' | 'message' | 'time'
  > {
    channel: string;
  }
  export interface KickEvent extends Pick<
    MessageEvent,
    'nick' | 'ident' | 'hostname' | 'message' | 'time'
  > {
    kicked: string;
    channel: string;
  }
  export type QuitEvent = Pick<MessageEvent, 'nick' | 'ident' | 'hostname' | 'message' | 'time'>;

  interface Mode {
    mode: string;
    param: string | null;
  }
  export interface ModeEvent extends Pick<
    MessageEvent,
    'target' | 'nick' | 'time' | 'tags' | 'batch'
  > {
    modes: Mode[];

    raw_modes: string;
    raw_params: string[];
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
  export interface WhoListEvent {
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
    host: string;
    port?: string;
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
