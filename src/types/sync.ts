import type { GameEventType } from './events'

/**
 * Tipos relacionados a sincronizacao de estado multiplayer
 *
 * @see ADR-001-store-decomposition.md
 */

/**
 * Payload para emissao de evento multiplayer
 * Usado internamente pelo gameStore para emitir eventos
 */
export interface MultiplayerEventEmit {
  /** Tipo do evento (deve ser um GameEventType valido) */
  type: GameEventType | string
  /** Dados adicionais do evento */
  payload?: Record<string, unknown>
}

/**
 * Callback para aplicar evento remoto
 */
export type RemoteEventHandler = (event: unknown) => void

/**
 * Estado de sincronizacao
 */
export interface SyncState {
  /** Se esta sincronizando de fonte remota (evita loops) */
  isSyncingFromRemote: boolean
  /** Numero de sequencia do ultimo evento enviado */
  lastSequenceSent: number
  /** Numero de sequencia do ultimo evento recebido */
  lastSequenceReceived: number
}

/**
 * Opcoes para emissao de eventos
 */
export interface EmitOptions {
  /** Se deve aguardar confirmacao do outro cliente */
  waitForAck?: boolean
  /** Timeout para aguardar confirmacao (ms) */
  ackTimeout?: number
  /** Callback de sucesso */
  onSuccess?: () => void
  /** Callback de erro */
  onError?: (error: Error) => void
}

