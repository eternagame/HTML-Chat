declare module 'irc-framework/src/transports/websocket' {
  import { EventEmitter } from 'eventemitter3';

  export default class Connection extends EventEmitter {
    socket: WebSocket | null;
    connected: boolean;
    last_socket_error: Error | null;
    encoding: string;
    incoming_buffer: string;
    protocol?: string | string[];

    constructor(options?: Partial<{ protocol: string | string[] }>);

    isConnected(): boolean;

    writeLine(line: string, cb: () => void): void;

    debugOut(out: string): void;

    connect(): void;

    close(): void;

    setEncoding(encoding: string): void;
  }
}
