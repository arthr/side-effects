import { create } from 'zustand'
import type { ItemType, ItemTargetType, PlayerId, TargetSelectionState } from '@/types'

/**
 * Estado do sistema de uso de itens
 * Gerencia selecao de alvos e confirmacao de selecao pre-jogo
 *
 * @see ADR-001-store-decomposition.md
 */
interface ItemUsageState {
    /** Estado de selecao de alvo para uso de item */
    targetSelection: TargetSelectionState
    /** Confirmacao de selecao de itens (fase itemSelection) */
    selectionConfirmed: Record<PlayerId, boolean>
}

/**
 * Actions do store de uso de itens
 */
interface ItemUsageActions {
    /**
     * Inicializa confirmacoes para N jogadores
     * @param playerIds - IDs dos jogadores
     */
    initializeForPlayers: (playerIds: PlayerId[]) => void

    /**
     * Inicia uso de um item (ativa modo selecao de alvo)
     * @param itemId - ID do item sendo usado
     * @param itemType - Tipo do item
     * @param targetType - Tipo de alvo requerido
     */
    startItemUsage: (itemId: string, itemType: ItemType, targetType: ItemTargetType) => void

    /**
     * Cancela uso de item (reseta targetSelection)
     */
    cancelItemUsage: () => void

    /**
     * Marca item usage como completo (reseta targetSelection)
     */
    completeItemUsage: () => void

    /**
     * Marca jogador como confirmado na selecao de itens
     * @param playerId - ID do jogador
     */
    confirmSelection: (playerId: PlayerId) => void

    /**
     * Verifica se jogador confirmou selecao
     * @param playerId - ID do jogador
     */
    isConfirmed: (playerId: PlayerId) => boolean

    /**
     * Verifica se todos os jogadores confirmaram
     */
    isAllConfirmed: () => boolean

    /**
     * Obtem IDs dos jogadores que confirmaram
     */
    getConfirmedPlayers: () => PlayerId[]

    /**
     * Obtem IDs dos jogadores pendentes
     */
    getPendingPlayers: () => PlayerId[]

    /**
     * Reseta confirmacoes (para nova rodada/jogo)
     */
    resetConfirmations: () => void

    /**
     * Verifica se esta em modo de selecao de alvo
     */
    isSelectingTarget: () => boolean

    /**
     * Obtem informacoes do item em uso
     */
    getActiveItem: () => { itemId: string; itemType: ItemType } | null

    /**
     * Reseta store para estado inicial
     */
    reset: () => void
}

type ItemUsageStore = ItemUsageState & ItemUsageActions

/**
 * Estado inicial de selecao de alvo
 */
const INITIAL_TARGET_SELECTION: TargetSelectionState = {
    active: false,
    itemId: null,
    itemType: null,
    validTargets: null,
}

/**
 * Estado inicial
 */
const initialState: ItemUsageState = {
    targetSelection: { ...INITIAL_TARGET_SELECTION },
    selectionConfirmed: {},
}

/**
 * Mapeia ItemTargetType para validTargets do TargetSelectionState
 */
function mapTargetType(targetType: ItemTargetType): 'pills' | 'opponent' | null {
    switch (targetType) {
        case 'pill':
        case 'pill_to_opponent':
            return 'pills'
        case 'opponent':
            return 'opponent'
        case 'self':
        case 'table':
        default:
            return null
    }
}

/**
 * Zustand Store para gerenciamento de uso de itens
 *
 * Responsabilidades:
 * - Estado de selecao de alvo (targetSelection)
 * - Confirmacao de selecao pre-jogo
 * - UI state do sistema de itens
 *
 * NAO gerencia:
 * - Inventario do jogador (playerStore)
 * - Execucao de efeitos (gameStore/hooks)
 * - Definicoes de itens (itemCatalog)
 */
export const useItemUsageStore = create<ItemUsageStore>((set, get) => ({
    ...initialState,

    initializeForPlayers: (playerIds) => {
        const selectionConfirmed: Record<PlayerId, boolean> = {}
        playerIds.forEach((id) => {
            selectionConfirmed[id] = false
        })

        set({ selectionConfirmed })
    },

    startItemUsage: (itemId, itemType, targetType) => {
        const validTargets = mapTargetType(targetType)

        // Itens sem alvo (self, table) nao ativam selecao
        if (validTargets === null) {
            return
        }

        set({
            targetSelection: {
                active: true,
                itemId,
                itemType,
                validTargets,
            },
        })
    },

    cancelItemUsage: () => {
        set({
            targetSelection: { ...INITIAL_TARGET_SELECTION },
        })
    },

    completeItemUsage: () => {
        set({
            targetSelection: { ...INITIAL_TARGET_SELECTION },
        })
    },

    confirmSelection: (playerId) => {
        const state = get()

        set({
            selectionConfirmed: {
                ...state.selectionConfirmed,
                [playerId]: true,
            },
        })
    },

    isConfirmed: (playerId) => {
        const state = get()
        return state.selectionConfirmed[playerId] ?? false
    },

    isAllConfirmed: () => {
        const state = get()
        const playerIds = Object.keys(state.selectionConfirmed)

        if (playerIds.length === 0) return false

        return playerIds.every((id) => state.selectionConfirmed[id])
    },

    getConfirmedPlayers: () => {
        const state = get()
        return Object.entries(state.selectionConfirmed)
            .filter(([, confirmed]) => confirmed)
            .map(([id]) => id)
    },

    getPendingPlayers: () => {
        const state = get()
        return Object.entries(state.selectionConfirmed)
            .filter(([, confirmed]) => !confirmed)
            .map(([id]) => id)
    },

    resetConfirmations: () => {
        const state = get()
        const resetConfirmed: Record<PlayerId, boolean> = {}

        Object.keys(state.selectionConfirmed).forEach((id) => {
            resetConfirmed[id] = false
        })

        set({ selectionConfirmed: resetConfirmed })
    },

    isSelectingTarget: () => {
        return get().targetSelection.active
    },

    getActiveItem: () => {
        const state = get()
        if (!state.targetSelection.active || !state.targetSelection.itemId || !state.targetSelection.itemType) {
            return null
        }

        return {
            itemId: state.targetSelection.itemId,
            itemType: state.targetSelection.itemType,
        }
    },

    reset: () => {
        set(initialState)
    },
}))

// ============ HOOKS HELPERS ============

/**
 * Hook para obter estado de selecao de alvo
 */
export const useTargetSelection = () =>
    useItemUsageStore((state) => state.targetSelection)

/**
 * Hook para verificar se esta selecionando alvo
 */
export const useIsSelectingTarget = () =>
    useItemUsageStore((state) => state.targetSelection.active)

/**
 * Hook para obter tipo de alvos validos
 */
export const useValidTargets = () =>
    useItemUsageStore((state) => state.targetSelection.validTargets)

/**
 * Hook para verificar se jogador confirmou selecao
 */
export const useIsSelectionConfirmed = (playerId: PlayerId) =>
    useItemUsageStore((state) => state.selectionConfirmed[playerId] ?? false)

/**
 * Hook para obter todos os estados de confirmacao
 */
export const useSelectionConfirmed = () =>
    useItemUsageStore((state) => state.selectionConfirmed)

