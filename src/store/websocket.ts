import Connection from 'irc-framework/src/transports/websocket';

const oldWriteLine = Connection.prototype.writeLine;
Connection.prototype.writeLine = function writeLine(line: string, cb: any) {
  oldWriteLine.bind(this, `${line}\r\n`, cb)();
};

export default Connection;
