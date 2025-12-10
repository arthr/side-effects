import { useEffect, useState, useRef, useCallback } from 'react'
import { useMultiplayerStore } from '@/stores/multiplayerStore'
import { realtimeService } from '@/services'

/** Tempo em segundos antes de declarar W.O. por desconexao */
const DISCONNECT_TIMEOUT_SECONDS = 60

/** Intervalo de tentativa de reconexao em ms */
const RECONNECT_INTERVAL_MS = 3000

/**
 * Hook para gerenciar conexao com sala multiplayer
 *
 * Funcionalidades:
 * - Reconexao automatica quando conexao cair
 * - Countdown de timeout para W.O.
 * - Cleanup ao desmontar
 */
export function useRoomConnection() {
  const room = useMultiplayerStore((state) => state.room)
  const connectionStatus = useMultiplayerStore((state) => state.connectionStatus)
  const setConnectionStatus = useMultiplayerStore((state) => state.setConnectionStatus)
  const leaveRoom = useMultiplayerStore((state) => state.leaveRoom)

  // Estado local
  const [isReconnecting, setIsReconnecting] = useState(false)
  const [timeoutRemaining, setTimeoutRemaining] = useState(DISCONNECT_TIMEOUT_SECONDS)
  const [hasTimedOut, setHasTimedOut] = useState(false)

  // Refs para timers
  const reconnectIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  /**
   * Tenta reconectar ao canal
   */
  const attemptReconnect = useCallback(async () => {
    if (!room) return

    try {
      setConnectionStatus('connecting')
      await realtimeService.joinRoom(room.id)
      setConnectionStatus('connected')
      setIsReconnecting(false)
      setTimeoutRemaining(DISCONNECT_TIMEOUT_SECONDS)
    } catch {
      // Falhou, vai tentar novamente no proximo intervalo
      setConnectionStatus('reconnecting')
    }
  }, [room, setConnectionStatus])

  /**
   * Inicia processo de reconexao
   */
  const startReconnection = useCallback(() => {
    if (isReconnecting) return

    setIsReconnecting(true)
    setTimeoutRemaining(DISCONNECT_TIMEOUT_SECONDS)
    setConnectionStatus('reconnecting')

    // Inicia tentativas de reconexao
    reconnectIntervalRef.current = setInterval(() => {
      attemptReconnect()
    }, RECONNECT_INTERVAL_MS)

    // Inicia countdown
    countdownIntervalRef.current = setInterval(() => {
      setTimeoutRemaining((prev) => {
        if (prev <= 1) {
          // Timeout - declara W.O.
          setHasTimedOut(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [isReconnecting, setConnectionStatus, attemptReconnect])

  /**
   * Para processo de reconexao
   */
  const stopReconnection = useCallback(() => {
    if (reconnectIntervalRef.current) {
      clearInterval(reconnectIntervalRef.current)
      reconnectIntervalRef.current = null
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current)
      countdownIntervalRef.current = null
    }
    setIsReconnecting(false)
    setTimeoutRemaining(DISCONNECT_TIMEOUT_SECONDS)
  }, [])

  // Monitora mudancas no status de conexao
  useEffect(() => {
    // Se desconectou e tem sala, inicia reconexao
    if (connectionStatus === 'disconnected' && room && !hasTimedOut) {
      startReconnection()
    }

    // Se reconectou com sucesso, para tentativas
    if (connectionStatus === 'connected' && isReconnecting) {
      stopReconnection()
    }
  }, [connectionStatus, room, hasTimedOut, isReconnecting, startReconnection, stopReconnection])

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      stopReconnection()
    }
  }, [stopReconnection])

  // Formata tempo restante para exibicao
  const formattedTimeRemaining = `${Math.floor(timeoutRemaining / 60)}:${(timeoutRemaining % 60).toString().padStart(2, '0')}`

  /**
   * Forca abandono da partida (W.O. voluntario)
   */
  const forfeit = useCallback(async () => {
    stopReconnection()
    await leaveRoom()
  }, [stopReconnection, leaveRoom])

  return {
    /** Se esta tentando reconectar */
    isReconnecting,
    /** Status atual da conexao */
    connectionStatus,
    /** Segundos restantes antes de W.O. */
    timeoutRemaining,
    /** Tempo formatado (MM:SS) */
    formattedTimeRemaining,
    /** Se o timeout foi atingido (W.O.) */
    hasTimedOut,
    /** Abandona a partida voluntariamente */
    forfeit,
  }
}

