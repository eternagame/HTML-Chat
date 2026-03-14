export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'reconnect failed';
export interface ReconnectionStatus {
  isReconnecting: boolean;
  retryCount: number;
  retryDelay: number;
  maxRetryCount: number;
}
