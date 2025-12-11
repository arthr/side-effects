import { describe, it, expect, beforeEach } from 'vitest'
import { useEffectsStore } from '../effectsStore'

describe('effectsStore', () => {
  beforeEach(() => {
    // Reset store antes de cada teste
    useEffectsStore.getState().reset()
  })

  describe('estado inicial', () => {
    it('deve iniciar com arrays vazios para ambos jogadores', () => {
      const state = useEffectsStore.getState()
      expect(state.activeEffects.player1).toEqual([])
      expect(state.activeEffects.player2).toEqual([])
    })
  })

  describe('applyEffect', () => {
    it('deve adicionar efeito ao jogador', () => {
      useEffectsStore.getState().applyEffect('player1', {
        type: 'shield',
        roundsRemaining: 1,
      })

      const effects = useEffectsStore.getState().activeEffects.player1
      expect(effects).toHaveLength(1)
      expect(effects[0].type).toBe('shield')
      expect(effects[0].roundsRemaining).toBe(1)
    })

    it('nao deve adicionar duplicata do mesmo tipo de efeito', () => {
      const store = useEffectsStore.getState()
      store.applyEffect('player1', { type: 'shield', roundsRemaining: 1 })
      store.applyEffect('player1', { type: 'shield', roundsRemaining: 2 })

      const effects = useEffectsStore.getState().activeEffects.player1
      expect(effects).toHaveLength(1)
      // Deve manter o primeiro (roundsRemaining: 1)
      expect(effects[0].roundsRemaining).toBe(1)
    })

    it('deve permitir diferentes tipos de efeito no mesmo jogador', () => {
      const store = useEffectsStore.getState()
      store.applyEffect('player1', { type: 'shield', roundsRemaining: 1 })
      store.applyEffect('player1', { type: 'handcuffed', roundsRemaining: 1 })

      const effects = useEffectsStore.getState().activeEffects.player1
      expect(effects).toHaveLength(2)
      expect(effects.map((e) => e.type)).toContain('shield')
      expect(effects.map((e) => e.type)).toContain('handcuffed')
    })

    it('deve manter efeitos de outros jogadores separados', () => {
      const store = useEffectsStore.getState()
      store.applyEffect('player1', { type: 'shield', roundsRemaining: 1 })
      store.applyEffect('player2', { type: 'handcuffed', roundsRemaining: 1 })

      const state = useEffectsStore.getState()
      expect(state.activeEffects.player1).toHaveLength(1)
      expect(state.activeEffects.player2).toHaveLength(1)
      expect(state.activeEffects.player1[0].type).toBe('shield')
      expect(state.activeEffects.player2[0].type).toBe('handcuffed')
    })
  })

  describe('removeEffect', () => {
    it('deve remover efeito especifico do jogador', () => {
      const store = useEffectsStore.getState()
      store.applyEffect('player1', { type: 'shield', roundsRemaining: 1 })
      store.applyEffect('player1', { type: 'handcuffed', roundsRemaining: 1 })

      store.removeEffect('player1', 'shield')

      const effects = useEffectsStore.getState().activeEffects.player1
      expect(effects).toHaveLength(1)
      expect(effects[0].type).toBe('handcuffed')
    })

    it('nao deve afetar outros jogadores ao remover efeito', () => {
      const store = useEffectsStore.getState()
      store.applyEffect('player1', { type: 'shield', roundsRemaining: 1 })
      store.applyEffect('player2', { type: 'shield', roundsRemaining: 1 })

      store.removeEffect('player1', 'shield')

      expect(useEffectsStore.getState().activeEffects.player1).toHaveLength(0)
      expect(useEffectsStore.getState().activeEffects.player2).toHaveLength(1)
    })
  })

  describe('removeEffectFromAll', () => {
    it('deve remover tipo de efeito de todos os jogadores', () => {
      const store = useEffectsStore.getState()
      store.applyEffect('player1', { type: 'shield', roundsRemaining: 1 })
      store.applyEffect('player2', { type: 'shield', roundsRemaining: 1 })
      store.applyEffect('player1', { type: 'handcuffed', roundsRemaining: 1 })

      store.removeEffectFromAll('shield')

      const state = useEffectsStore.getState()
      expect(state.activeEffects.player1).toHaveLength(1)
      expect(state.activeEffects.player1[0].type).toBe('handcuffed')
      expect(state.activeEffects.player2).toHaveLength(0)
    })
  })

  describe('decrementEffects', () => {
    it('deve decrementar roundsRemaining de efeitos nao-shield', () => {
      const store = useEffectsStore.getState()
      store.applyEffect('player1', { type: 'handcuffed', roundsRemaining: 2 })

      store.decrementEffects('player1')

      const effects = useEffectsStore.getState().activeEffects.player1
      expect(effects).toHaveLength(1)
      expect(effects[0].roundsRemaining).toBe(1)
    })

    it('nao deve decrementar shield (dura rodada inteira)', () => {
      const store = useEffectsStore.getState()
      store.applyEffect('player1', { type: 'shield', roundsRemaining: 1 })

      store.decrementEffects('player1')

      const effects = useEffectsStore.getState().activeEffects.player1
      expect(effects).toHaveLength(1)
      expect(effects[0].roundsRemaining).toBe(1)
    })

    it('deve remover efeitos que chegam a 0', () => {
      const store = useEffectsStore.getState()
      store.applyEffect('player1', { type: 'handcuffed', roundsRemaining: 1 })

      store.decrementEffects('player1')

      const effects = useEffectsStore.getState().activeEffects.player1
      expect(effects).toHaveLength(0)
    })
  })

  describe('hasEffect', () => {
    it('deve retornar true se jogador tem o efeito', () => {
      const store = useEffectsStore.getState()
      store.applyEffect('player1', { type: 'shield', roundsRemaining: 1 })

      expect(store.hasEffect('player1', 'shield')).toBe(true)
    })

    it('deve retornar false se jogador nao tem o efeito', () => {
      const store = useEffectsStore.getState()

      expect(store.hasEffect('player1', 'shield')).toBe(false)
    })

    it('deve retornar false se outro jogador tem o efeito', () => {
      const store = useEffectsStore.getState()
      store.applyEffect('player2', { type: 'shield', roundsRemaining: 1 })

      expect(store.hasEffect('player1', 'shield')).toBe(false)
    })
  })

  describe('getEffects', () => {
    it('deve retornar todos os efeitos do jogador', () => {
      const store = useEffectsStore.getState()
      store.applyEffect('player1', { type: 'shield', roundsRemaining: 1 })
      store.applyEffect('player1', { type: 'handcuffed', roundsRemaining: 2 })

      const effects = store.getEffects('player1')
      expect(effects).toHaveLength(2)
    })

    it('deve retornar array vazio se jogador nao tem efeitos', () => {
      const store = useEffectsStore.getState()

      expect(store.getEffects('player1')).toEqual([])
    })
  })

  describe('getEffect', () => {
    it('deve retornar efeito especifico se existir', () => {
      const store = useEffectsStore.getState()
      store.applyEffect('player1', { type: 'shield', roundsRemaining: 3 })

      const effect = store.getEffect('player1', 'shield')
      expect(effect).toBeDefined()
      expect(effect?.type).toBe('shield')
      expect(effect?.roundsRemaining).toBe(3)
    })

    it('deve retornar undefined se efeito nao existir', () => {
      const store = useEffectsStore.getState()

      expect(store.getEffect('player1', 'shield')).toBeUndefined()
    })
  })

  describe('clearEffects', () => {
    it('deve remover todos os efeitos do jogador', () => {
      const store = useEffectsStore.getState()
      store.applyEffect('player1', { type: 'shield', roundsRemaining: 1 })
      store.applyEffect('player1', { type: 'handcuffed', roundsRemaining: 1 })

      store.clearEffects('player1')

      expect(useEffectsStore.getState().activeEffects.player1).toHaveLength(0)
    })

    it('nao deve afetar outros jogadores', () => {
      const store = useEffectsStore.getState()
      store.applyEffect('player1', { type: 'shield', roundsRemaining: 1 })
      store.applyEffect('player2', { type: 'handcuffed', roundsRemaining: 1 })

      store.clearEffects('player1')

      expect(useEffectsStore.getState().activeEffects.player1).toHaveLength(0)
      expect(useEffectsStore.getState().activeEffects.player2).toHaveLength(1)
    })
  })

  describe('reset', () => {
    it('deve resetar para estado inicial', () => {
      const store = useEffectsStore.getState()
      store.applyEffect('player1', { type: 'shield', roundsRemaining: 1 })
      store.applyEffect('player2', { type: 'handcuffed', roundsRemaining: 2 })

      store.reset()

      const state = useEffectsStore.getState()
      expect(state.activeEffects.player1).toEqual([])
      expect(state.activeEffects.player2).toEqual([])
    })
  })
})

