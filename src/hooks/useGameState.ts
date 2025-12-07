import { useGameStore } from '@/stores/gameStore'
import type { Player, PlayerId } from '@/types'

/**
 * Hook para selecionar estado do jogo de forma otimizada
 * Cada selector e separado para evitar re-renders desnecessarios
 */

// Selectors individuais para granularidade fina
export const useGamePhase = () => useGameStore((state) => state.phase)
export const useCurrentTurn = () => useGameStore((state) => state.currentTurn)
export const useRound = () => useGameStore((state) => state.round)
export const useWinner = () => useGameStore((state) => state.winner)
export const usePillPool = () => useGameStore((state) => state.pillPool)
export const useTypeCounts = () => useGameStore((state) => state.typeCounts)

/**
 * Hook para obter um jogador especifico
 */
export function usePlayer(playerId: PlayerId): Player {
  return useGameStore((state) => state.players[playerId])
}

/**
 * Hook para obter o jogador do turno atual
 */
export function useCurrentPlayer(): Player {
  return useGameStore((state) => state.players[state.currentTurn])
}

/**
 * Hook para obter o oponente do turno atual
 */
export function useOpponent(): Player {
  return useGameStore((state) => {
    const opponentId: PlayerId =
      state.currentTurn === 'player1' ? 'player2' : 'player1'
    return state.players[opponentId]
  })
}

/**
 * Hook para verificar se e turno do jogador humano
 */
export function useIsHumanTurn(): boolean {
  return useGameStore((state) => {
    const currentPlayer = state.players[state.currentTurn]
    return !currentPlayer.isAI
  })
}

/**
 * Hook para obter ambos os jogadores
 */
export function usePlayers() {
  const player1 = useGameStore((state) => state.players.player1)
  const player2 = useGameStore((state) => state.players.player2)
  return { player1, player2 }
}

/**
 * Hook para obter estatisticas do jogo
 */
export function useGameStats() {
  const getGameStats = useGameStore((state) => state.getGameStats)
  return getGameStats()
}

/**
 * Hook composto para estado completo do jogo (usar com cuidado - causa mais re-renders)
 */
export function useGameSnapshot() {
  const phase = useGamePhase()
  const currentTurn = useCurrentTurn()
  const round = useRound()
  const winner = useWinner()
  const pillPool = usePillPool()
  const typeCounts = useTypeCounts()
  const { player1, player2 } = usePlayers()
  const isHumanTurn = useIsHumanTurn()

  return {
    phase,
    currentTurn,
    round,
    winner,
    pillPool,
    typeCounts,
    player1,
    player2,
    isHumanTurn,
  }
}

