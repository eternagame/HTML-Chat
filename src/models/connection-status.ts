export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'reconnect failed';
export interface ReconnectionStatus {
  isReconnecting: boolean;
  retryCount: number;
  maxRetryCount: number;
}
