import { useCallback, useMemo } from 'react'
import { useGameStore } from '@/stores/gameStore'
import type { ItemType, PlayerId } from '@/types'

/**
 * Hook para gerenciar a selecao de itens na fase pre-jogo
 * Encapsula o acesso ao inventario e actions de selecao
 *
 * @param playerId - ID do jogador (player1 ou player2)
 */
export function useItemSelection(playerId: PlayerId) {
  // Selectors
  const inventory = useGameStore((state) => state.players[playerId].inventory)
  const phase = useGameStore((state) => state.phase)

  // Actions da store
  const storeSelectItem = useGameStore((state) => state.selectItem)
  const storeDeselectItem = useGameStore((state) => state.deselectItem)
  const storeConfirmSelection = useGameStore((state) => state.confirmItemSelection)

  // Computed values
  const selectedCount = inventory.items.length
  const canSelectMore = selectedCount < inventory.maxItems
  const isSelectionPhase = phase === 'itemSelection'

  // IDs dos itens selecionados para verificacao rapida
  const selectedItemTypes = useMemo(
    () => inventory.items.map((item) => item.type),
    [inventory.items]
  )

  /**
   * Seleciona um item para o inventario
   * Valida se ainda pode selecionar mais itens
   */
  const selectItem = useCallback(
    (itemType: ItemType) => {
      if (!canSelectMore) return
      if (!isSelectionPhase) return
      storeSelectItem(playerId, itemType)
    },
    [storeSelectItem, playerId, canSelectMore, isSelectionPhase]
  )

  /**
   * Remove um item do inventario
   */
  const deselectItem = useCallback(
    (itemId: string) => {
      if (!isSelectionPhase) return
      storeDeselectItem(playerId, itemId)
    },
    [storeDeselectItem, playerId, isSelectionPhase]
  )

  /**
   * Confirma a selecao de itens e inicia o jogo
   */
  const confirmSelection = useCallback(() => {
    if (!isSelectionPhase) return
    storeConfirmSelection(playerId)
  }, [storeConfirmSelection, playerId, isSelectionPhase])

  /**
   * Verifica se um tipo de item ja foi selecionado
   */
  const isItemTypeSelected = useCallback(
    (itemType: ItemType) => selectedItemTypes.includes(itemType),
    [selectedItemTypes]
  )

  return {
    // Estado
    inventory,
    selectedCount,
    maxItems: inventory.maxItems,
    canSelectMore,
    isSelectionPhase,
    selectedItemTypes,

    // Actions
    selectItem,
    deselectItem,
    confirmSelection,

    // Helpers
    isItemTypeSelected,
  }
}
