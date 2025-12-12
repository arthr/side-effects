import { useMemo } from 'react'
import { useGameStore } from '@/stores/gameStore'
import { useGameFlowStore } from '@/stores/game/gameFlowStore'
import { getSeatLabel } from '@/utils/playerManager'
import type { PlayerId } from '@/types'

/**
 * Hook para o DevTool consumir estado do jogo sem acessar stores diretamente.
 * Mantém a fronteira: Components -> Hooks -> Stores/Utils.
 */
export function useDevToolGameSnapshot() {
  const phase = useGameStore((s) => s.phase)
  const round = useGameStore((s) => s.round)
  const currentTurn = useGameStore((s) => s.currentTurn)
  const players = useGameStore((s) => s.players)
  const pillPool = useGameStore((s) => s.pillPool)
  const typeCounts = useGameStore((s) => s.typeCounts)
  const shapeQuests = useGameStore((s) => s.shapeQuests)
  const actionHistory = useGameStore((s) => s.actionHistory)
  const mode = useGameStore((s) => s.mode)
  const playerOrder = useGameFlowStore((s) => s.playerOrder)

  const playerIds: PlayerId[] = useMemo(() => {
    const fallbackIds = Object.keys(players) as PlayerId[]
    const ids = (playerOrder.length > 0 ? playerOrder : fallbackIds)
      .filter((id) => players[id] !== undefined)
    return ids
  }, [players, playerOrder])

  const seatLabelsById: Record<PlayerId, string> = useMemo(() => {
    const effectiveOrder = playerOrder.length > 0 ? playerOrder : playerIds
    const next: Record<PlayerId, string> = {}
    for (const id of playerIds) {
      next[id] = getSeatLabel(id, effectiveOrder)
    }
    return next
  }, [playerIds, playerOrder])

  return {
    phase,
    round,
    currentTurn,
    players,
    playerIds,
    seatLabelsById,
    pillPool,
    typeCounts,
    shapeQuests,
    actionHistory,
    mode,
  }
}


