import { useMemo } from 'react'
import { useGameFlowStore } from '@/stores/game/gameFlowStore'
import { getSeatLabel } from '@/utils/playerManager'
import type { PlayerId } from '@/types'

/**
 * Hook para obter label de assento (P1/P2/P3) baseado em playerOrder.
 * Importante: não depende de parsing do PlayerId.
 */
export function useSeatLabel(playerId: PlayerId): string {
  const playerOrder = useGameFlowStore((s) => s.playerOrder)

  return useMemo(() => {
    if (playerOrder.length === 0) return 'P?'
    return getSeatLabel(playerId, playerOrder)
  }, [playerId, playerOrder])
}


