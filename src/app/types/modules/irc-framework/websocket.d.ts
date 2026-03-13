declare module 'irc-framework/src/transports/websocket' {
  import type { BaseTransport } from 'irc-framework';

  export default class Connection extends BaseTransport {
    socket: WebSocket | null;
    connected: boolean;
    last_socket_error: Error | null;
    encoding: string;
    incoming_buffer: string;
    protocol?: string | string[];

    constructor(options?: Partial<{ protocol: string | string[] }>);
  }
}
