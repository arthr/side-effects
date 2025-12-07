import { useEffect, useRef } from 'react'
import type { Pill, Player } from '@/types'
import { selectRandomPill, getAIThinkingDelay } from '@/utils/aiLogic'

interface UseAIPlayerOptions {
  /** Jogador atual */
  currentPlayer: Player
  /** Pool de pilulas disponiveis */
  pillPool: Pill[]
  /** Fase atual do consumo (idle, revealing, feedback) */
  phase: 'idle' | 'revealing' | 'feedback'
  /** Funcao para iniciar consumo de pilula */
  startConsumption: (pillId: string) => void
}

/**
 * Hook que gerencia a jogada automatica da IA
 * 
 * - Detecta quando e turno da IA e phase === 'idle'
 * - Aguarda delay simulado (1-2s) para "pensar"
 * - Seleciona pilula aleatoria e inicia consumo
 * - Evita jogar durante animacoes/feedback
 */
export function useAIPlayer({
  currentPlayer,
  pillPool,
  phase,
  startConsumption,
}: UseAIPlayerOptions) {
  // Ref para controlar timeout e evitar memory leaks
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Ref para evitar dupla execucao no StrictMode
  const hasScheduledRef = useRef(false)

  useEffect(() => {
    // Condicoes para IA jogar:
    // 1. E turno da IA (currentPlayer.isAI)
    // 2. Fase e idle (nao esta processando)
    // 3. Tem pilulas disponiveis
    // 4. Nao tem timeout ja agendado
    const shouldAIPlay =
      currentPlayer.isAI &&
      phase === 'idle' &&
      pillPool.length > 0 &&
      !hasScheduledRef.current

    if (shouldAIPlay) {
      hasScheduledRef.current = true

      const delay = getAIThinkingDelay()

      timeoutRef.current = setTimeout(() => {
        // Verifica novamente antes de jogar (estado pode ter mudado)
        const selectedPillId = selectRandomPill(pillPool)

        if (selectedPillId) {
          startConsumption(selectedPillId)
        }

        hasScheduledRef.current = false
      }, delay)
    }

    // Cleanup: cancela timeout se componente desmontar ou condicoes mudarem
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }
  }, [currentPlayer.isAI, phase, pillPool, startConsumption])

  // Reset flag quando turno muda para humano
  useEffect(() => {
    if (!currentPlayer.isAI) {
      hasScheduledRef.current = false
    }
  }, [currentPlayer.isAI])
}

