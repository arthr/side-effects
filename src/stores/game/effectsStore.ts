import { create } from 'zustand'
import type { PlayerEffect, PlayerEffectType, PlayerId } from '@/types'

/**
 * Estado dos efeitos de jogadores
 * Separado do Player para melhor escalabilidade e testabilidade
 *
 * @see ADR-001-store-decomposition.md
 */
interface EffectsState {
  /** Efeitos ativos por jogador */
  activeEffects: Record<PlayerId, PlayerEffect[]>
}

/**
 * Actions do store de efeitos
 */
interface EffectsActions {
  /**
   * Aplica um efeito a um jogador
   * Nao adiciona duplicatas do mesmo tipo
   */
  applyEffect: (playerId: PlayerId, effect: PlayerEffect) => void

  /**
   * Remove um tipo especifico de efeito do jogador
   */
  removeEffect: (playerId: PlayerId, effectType: PlayerEffectType) => void

  /**
   * Remove todos os efeitos de um tipo especifico de TODOS os jogadores
   * Usado no resetRound para remover shields
   */
  removeEffectFromAll: (effectType: PlayerEffectType) => void

  /**
   * Decrementa roundsRemaining de todos os efeitos do jogador
   * Remove efeitos que chegam a 0
   * NOTA: Shield NAO e decrementado (dura a rodada inteira)
   */
  decrementEffects: (playerId: PlayerId) => void

  /**
   * Verifica se jogador tem um efeito ativo
   */
  hasEffect: (playerId: PlayerId, effectType: PlayerEffectType) => boolean

  /**
   * Obtem todos os efeitos de um jogador
   */
  getEffects: (playerId: PlayerId) => PlayerEffect[]

  /**
   * Obtem um efeito especifico de um jogador
   */
  getEffect: (playerId: PlayerId, effectType: PlayerEffectType) => PlayerEffect | undefined

  /**
   * Limpa todos os efeitos de um jogador
   */
  clearEffects: (playerId: PlayerId) => void

  /**
   * Reseta o store para estado inicial
   */
  reset: () => void
}

type EffectsStore = EffectsState & EffectsActions

/**
 * Estado inicial
 */
const initialState: EffectsState = {
  activeEffects: {
    player1: [],
    player2: [],
  },
}

/**
 * Zustand Store para gerenciamento de efeitos de jogadores
 *
 * Efeitos suportados:
 * - shield: Imunidade a dano por 1 rodada
 * - handcuffed: Perde proximo turno
 */
export const useEffectsStore = create<EffectsStore>((set, get) => ({
  ...initialState,

  applyEffect: (playerId, effect) => {
    const state = get()
    const playerEffects = state.activeEffects[playerId]

    // Evita duplicatas do mesmo tipo
    const hasEffect = playerEffects.some((e) => e.type === effect.type)
    if (hasEffect) return

    set({
      activeEffects: {
        ...state.activeEffects,
        [playerId]: [...playerEffects, effect],
      },
    })
  },

  removeEffect: (playerId, effectType) => {
    const state = get()

    set({
      activeEffects: {
        ...state.activeEffects,
        [playerId]: state.activeEffects[playerId].filter(
          (e) => e.type !== effectType
        ),
      },
    })
  },

  removeEffectFromAll: (effectType) => {
    const state = get()

    set({
      activeEffects: {
        player1: state.activeEffects.player1.filter((e) => e.type !== effectType),
        player2: state.activeEffects.player2.filter((e) => e.type !== effectType),
      },
    })
  },

  decrementEffects: (playerId) => {
    const state = get()

    const updatedEffects = state.activeEffects[playerId]
      .map((effect) => {
        // Shield dura a rodada inteira, nao decrementa por turno
        if (effect.type === 'shield') {
          return effect
        }
        return {
          ...effect,
          roundsRemaining: effect.roundsRemaining - 1,
        }
      })
      .filter((effect) => effect.roundsRemaining > 0)

    set({
      activeEffects: {
        ...state.activeEffects,
        [playerId]: updatedEffects,
      },
    })
  },

  hasEffect: (playerId, effectType) => {
    const state = get()
    return state.activeEffects[playerId].some((e) => e.type === effectType)
  },

  getEffects: (playerId) => {
    return get().activeEffects[playerId]
  },

  getEffect: (playerId, effectType) => {
    return get().activeEffects[playerId].find((e) => e.type === effectType)
  },

  clearEffects: (playerId) => {
    const state = get()

    set({
      activeEffects: {
        ...state.activeEffects,
        [playerId]: [],
      },
    })
  },

  reset: () => {
    set(initialState)
  },
}))

// ============ HOOKS HELPERS ============

/**
 * Hook para obter efeitos de um jogador especifico
 */
export const usePlayerEffects = (playerId: PlayerId) =>
  useEffectsStore((state) => state.activeEffects[playerId])

/**
 * Hook para verificar se jogador tem shield
 */
export const useHasShield = (playerId: PlayerId) =>
  useEffectsStore((state) =>
    state.activeEffects[playerId].some((e) => e.type === 'shield')
  )

/**
 * Hook para verificar se jogador esta algemado
 */
export const useIsHandcuffed = (playerId: PlayerId) =>
  useEffectsStore((state) =>
    state.activeEffects[playerId].some((e) => e.type === 'handcuffed')
  )

/**
 * Hook para obter efeito de shield (se existir)
 */
export const useShieldEffect = (playerId: PlayerId) =>
  useEffectsStore((state) =>
    state.activeEffects[playerId].find((e) => e.type === 'shield')
  )

/**
 * Hook para obter efeito de handcuffs (se existir)
 */
export const useHandcuffedEffect = (playerId: PlayerId) =>
  useEffectsStore((state) =>
    state.activeEffects[playerId].find((e) => e.type === 'handcuffed')
  )

