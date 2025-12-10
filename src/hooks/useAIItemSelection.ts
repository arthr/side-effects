import { useEffect, useRef } from 'react'
import { useGameStore } from '@/stores/gameStore'
import { getAllItemsForInitialSelection } from '@/utils/itemCatalog'
import { selectAIInitialItems } from '@/utils/aiLogic'

/** Delay antes de comecar a selecionar itens (ms) */
const AI_SELECTION_START_DELAY = 500

/** Delay entre cada item selecionado (ms) */
const AI_SELECTION_ITEM_DELAY = 200

/** Delay antes de confirmar a selecao (ms) */
const AI_CONFIRM_DELAY = 800

/**
 * Hook que gerencia a selecao automatica de itens pela IA
 * Usa selectAIInitialItems para selecao baseada na dificuldade
 * NAO executa em modo multiplayer - oponente e humano real
 */
export function useAIItemSelection() {
  // Selectors granulares - retornam primitivos para evitar re-renders
  const phase = useGameStore((state) => state.phase)
  const mode = useGameStore((state) => state.mode)
  const isPlayer2AI = useGameStore((state) => state.players.player2.isAI)

  // Refs para controle de estado
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([])
  const hasStartedRef = useRef(false)

  // Em multiplayer, IA nao deve selecionar itens - oponente e humano real
  const isMultiplayer = mode === 'multiplayer'

  useEffect(() => {
    // Nao executa em multiplayer
    if (isMultiplayer) return

    // Cleanup e reset quando sair da fase de selecao
    if (phase !== 'itemSelection') {
      hasStartedRef.current = false
      timeoutsRef.current.forEach(clearTimeout)
      timeoutsRef.current = []
      return
    }

    // Guards
    if (!isPlayer2AI) return
    if (hasStartedRef.current) return

    // Verifica se IA ja confirmou (via getState para evitar dependencia)
    const { itemSelectionConfirmed, difficulty } = useGameStore.getState()
    if (itemSelectionConfirmed.player2) return

    hasStartedRef.current = true

    // Obtem actions via getState (referencias estaveis)
    const { selectItem, confirmItemSelection } = useGameStore.getState()

    // Seleciona itens baseado na dificuldade
    const availableItems = getAllItemsForInitialSelection()
    const selectedItems = selectAIInitialItems(difficulty, availableItems)

    // Agenda selecao com delays
    let currentDelay = AI_SELECTION_START_DELAY

    selectedItems.forEach((itemType) => {
      const timeout = setTimeout(() => {
        // Verifica fase antes de executar (pode ter mudado)
        if (useGameStore.getState().phase === 'itemSelection') {
          selectItem('player2', itemType)
        }
      }, currentDelay)
      timeoutsRef.current.push(timeout)
      currentDelay += AI_SELECTION_ITEM_DELAY
    })

    // Confirma apos selecionar todos
    const confirmTimeout = setTimeout(() => {
      if (useGameStore.getState().phase === 'itemSelection') {
        confirmItemSelection('player2')
      }
    }, currentDelay + AI_CONFIRM_DELAY)
    timeoutsRef.current.push(confirmTimeout)

    // Nao retorna cleanup - timeouts sao limpos apenas quando fase muda
  }, [phase, isPlayer2AI, isMultiplayer])
}
