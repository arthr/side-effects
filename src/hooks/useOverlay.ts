import { useCallback } from 'react'
import {
  useOverlayStore,
  type OverlayType,
  type PillRevealData,
  type GameOverData,
  type NewRoundData,
} from '@/stores/overlayStore'
import type { Pill, PlayerId, Player, GameStats } from '@/types'

/**
 * Hook para gerenciar overlays bloqueantes
 *
 * @example
 * const { openPillReveal, openGameOver, openNewRound, close } = useOverlay()
 *
 * // Abrir overlay de revelacao
 * openPillReveal(pill, isAITurn)
 *
 * // Abrir overlay de fim de jogo
 * openGameOver(winner, players, stats)
 *
 * // Abrir overlay de nova rodada
 * openNewRound(3)
 *
 * // Fechar overlay atual
 * close()
 */
export function useOverlay() {
  const current = useOverlayStore((s) => s.current)
  const pillRevealData = useOverlayStore((s) => s.pillRevealData)
  const gameOverData = useOverlayStore((s) => s.gameOverData)
  const newRoundData = useOverlayStore((s) => s.newRoundData)

  const openPillRevealAction = useOverlayStore((s) => s.openPillReveal)
  const openGameOverAction = useOverlayStore((s) => s.openGameOver)
  const openNewRoundAction = useOverlayStore((s) => s.openNewRound)
  const closeAction = useOverlayStore((s) => s.close)

  const openPillReveal = useCallback(
    (pill: Pill, isAITurn: boolean) => {
      openPillRevealAction(pill, isAITurn)
    },
    [openPillRevealAction]
  )

  const openGameOver = useCallback(
    (
      winner: PlayerId | null,
      players: { player1: Player; player2: Player },
      stats: GameStats
    ) => {
      openGameOverAction(winner, players, stats)
    },
    [openGameOverAction]
  )

  const openNewRound = useCallback(
    (round: number) => {
      openNewRoundAction(round)
    },
    [openNewRoundAction]
  )

  const close = useCallback(() => {
    closeAction()
  }, [closeAction])

  return {
    // Estado
    current,
    pillRevealData,
    gameOverData,
    newRoundData,
    isOpen: current !== null,

    // Acoes
    openPillReveal,
    openGameOver,
    openNewRound,
    close,
  }
}

/**
 * Selector para tipo de overlay atual
 */
export function useCurrentOverlay(): OverlayType {
  return useOverlayStore((s) => s.current)
}

/**
 * Selector para dados do PillReveal
 */
export function usePillRevealData(): PillRevealData | null {
  return useOverlayStore((s) => s.pillRevealData)
}

/**
 * Selector para dados do GameOver
 */
export function useGameOverData(): GameOverData | null {
  return useOverlayStore((s) => s.gameOverData)
}

/**
 * Selector para dados do NewRound
 */
export function useNewRoundData(): NewRoundData | null {
  return useOverlayStore((s) => s.newRoundData)
}

/**
 * Selector para action de fechar
 */
export function useOverlayClose(): () => void {
  return useOverlayStore((s) => s.close)
}

// Re-export types
export type { OverlayType, PillRevealData, GameOverData, NewRoundData }

