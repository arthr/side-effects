import { describe, it, expect, beforeEach } from 'vitest'
import { useItemUsageStore } from '../itemUsageStore'

describe('itemUsageStore', () => {
    beforeEach(() => {
        useItemUsageStore.getState().reset()
    })

    describe('estado inicial', () => {
        it('deve iniciar com targetSelection inativo', () => {
            const state = useItemUsageStore.getState()
            expect(state.targetSelection.active).toBe(false)
            expect(state.targetSelection.itemId).toBeNull()
            expect(state.targetSelection.itemType).toBeNull()
            expect(state.targetSelection.validTargets).toBeNull()
        })

        it('deve iniciar com selectionConfirmed vazio', () => {
            const state = useItemUsageStore.getState()
            expect(state.selectionConfirmed).toEqual({})
        })
    })

    describe('initializeForPlayers', () => {
        it('deve inicializar confirmacoes para 2 jogadores', () => {
            useItemUsageStore.getState().initializeForPlayers(['player1', 'player2'])

            const state = useItemUsageStore.getState()
            expect(state.selectionConfirmed.player1).toBe(false)
            expect(state.selectionConfirmed.player2).toBe(false)
        })

        it('deve inicializar confirmacoes para 4 jogadores', () => {
            useItemUsageStore.getState().initializeForPlayers([
                'player1', 'player2', 'player3', 'player4'
            ])

            const state = useItemUsageStore.getState()
            expect(Object.keys(state.selectionConfirmed)).toHaveLength(4)
            expect(state.selectionConfirmed.player1).toBe(false)
            expect(state.selectionConfirmed.player4).toBe(false)
        })

        it('deve sobrescrever confirmacoes anteriores', () => {
            const store = useItemUsageStore.getState()
            store.initializeForPlayers(['player1', 'player2'])
            store.confirmSelection('player1')

            store.initializeForPlayers(['player1', 'player2', 'player3'])

            const state = useItemUsageStore.getState()
            expect(state.selectionConfirmed.player1).toBe(false)
            expect(Object.keys(state.selectionConfirmed)).toHaveLength(3)
        })
    })

    describe('startItemUsage', () => {
        it('deve ativar selecao para item tipo pill', () => {
            useItemUsageStore.getState().startItemUsage('item-1', 'scanner', 'pill')

            const state = useItemUsageStore.getState()
            expect(state.targetSelection.active).toBe(true)
            expect(state.targetSelection.itemId).toBe('item-1')
            expect(state.targetSelection.itemType).toBe('scanner')
            expect(state.targetSelection.validTargets).toBe('pills')
        })

        it('deve ativar selecao para item tipo pill_to_opponent', () => {
            useItemUsageStore.getState().startItemUsage('item-2', 'force_feed', 'pill_to_opponent')

            const state = useItemUsageStore.getState()
            expect(state.targetSelection.active).toBe(true)
            expect(state.targetSelection.validTargets).toBe('pills')
        })

        it('deve ativar selecao para item tipo opponent', () => {
            useItemUsageStore.getState().startItemUsage('item-3', 'handcuffs', 'opponent')

            const state = useItemUsageStore.getState()
            expect(state.targetSelection.active).toBe(true)
            expect(state.targetSelection.validTargets).toBe('opponent')
        })

        it('NAO deve ativar selecao para item tipo self', () => {
            useItemUsageStore.getState().startItemUsage('item-4', 'pocket_pill', 'self')

            const state = useItemUsageStore.getState()
            expect(state.targetSelection.active).toBe(false)
        })

        it('NAO deve ativar selecao para item tipo table', () => {
            useItemUsageStore.getState().startItemUsage('item-5', 'shuffle', 'table')

            const state = useItemUsageStore.getState()
            expect(state.targetSelection.active).toBe(false)
        })
    })

    describe('cancelItemUsage', () => {
        it('deve resetar targetSelection', () => {
            const store = useItemUsageStore.getState()
            store.startItemUsage('item-1', 'scanner', 'pill')

            store.cancelItemUsage()

            const state = useItemUsageStore.getState()
            expect(state.targetSelection.active).toBe(false)
            expect(state.targetSelection.itemId).toBeNull()
            expect(state.targetSelection.itemType).toBeNull()
            expect(state.targetSelection.validTargets).toBeNull()
        })

        it('deve funcionar mesmo sem selecao ativa', () => {
            useItemUsageStore.getState().cancelItemUsage()
            // Nao deve lancar erro
            expect(useItemUsageStore.getState().targetSelection.active).toBe(false)
        })
    })

    describe('completeItemUsage', () => {
        it('deve resetar targetSelection apos uso', () => {
            const store = useItemUsageStore.getState()
            store.startItemUsage('item-1', 'scanner', 'pill')

            store.completeItemUsage()

            const state = useItemUsageStore.getState()
            expect(state.targetSelection.active).toBe(false)
            expect(state.targetSelection.itemId).toBeNull()
        })
    })

    describe('confirmSelection', () => {
        beforeEach(() => {
            useItemUsageStore.getState().initializeForPlayers(['player1', 'player2'])
        })

        it('deve marcar jogador como confirmado', () => {
            useItemUsageStore.getState().confirmSelection('player1')

            expect(useItemUsageStore.getState().isConfirmed('player1')).toBe(true)
            expect(useItemUsageStore.getState().isConfirmed('player2')).toBe(false)
        })

        it('deve permitir confirmar todos os jogadores', () => {
            const store = useItemUsageStore.getState()
            store.confirmSelection('player1')
            store.confirmSelection('player2')

            expect(store.isConfirmed('player1')).toBe(true)
            expect(store.isConfirmed('player2')).toBe(true)
        })
    })

    describe('isConfirmed', () => {
        it('deve retornar false para jogador nao inicializado', () => {
            expect(useItemUsageStore.getState().isConfirmed('player99')).toBe(false)
        })

        it('deve retornar false antes de confirmar', () => {
            useItemUsageStore.getState().initializeForPlayers(['player1'])
            expect(useItemUsageStore.getState().isConfirmed('player1')).toBe(false)
        })

        it('deve retornar true apos confirmar', () => {
            const store = useItemUsageStore.getState()
            store.initializeForPlayers(['player1'])
            store.confirmSelection('player1')

            expect(store.isConfirmed('player1')).toBe(true)
        })
    })

    describe('isAllConfirmed', () => {
        it('deve retornar false se nenhum jogador inicializado', () => {
            expect(useItemUsageStore.getState().isAllConfirmed()).toBe(false)
        })

        it('deve retornar false se ninguem confirmou', () => {
            useItemUsageStore.getState().initializeForPlayers(['player1', 'player2'])
            expect(useItemUsageStore.getState().isAllConfirmed()).toBe(false)
        })

        it('deve retornar false se apenas alguns confirmaram', () => {
            const store = useItemUsageStore.getState()
            store.initializeForPlayers(['player1', 'player2', 'player3'])
            store.confirmSelection('player1')
            store.confirmSelection('player2')

            expect(store.isAllConfirmed()).toBe(false)
        })

        it('deve retornar true se todos confirmaram (2 jogadores)', () => {
            const store = useItemUsageStore.getState()
            store.initializeForPlayers(['player1', 'player2'])
            store.confirmSelection('player1')
            store.confirmSelection('player2')

            expect(store.isAllConfirmed()).toBe(true)
        })

        it('deve retornar true se todos confirmaram (4 jogadores)', () => {
            const store = useItemUsageStore.getState()
            store.initializeForPlayers(['player1', 'player2', 'player3', 'player4'])
            store.confirmSelection('player1')
            store.confirmSelection('player2')
            store.confirmSelection('player3')
            store.confirmSelection('player4')

            expect(store.isAllConfirmed()).toBe(true)
        })
    })

    describe('getConfirmedPlayers / getPendingPlayers', () => {
        beforeEach(() => {
            useItemUsageStore.getState().initializeForPlayers([
                'player1', 'player2', 'player3', 'player4'
            ])
        })

        it('deve retornar jogadores confirmados', () => {
            const store = useItemUsageStore.getState()
            store.confirmSelection('player1')
            store.confirmSelection('player3')

            const confirmed = store.getConfirmedPlayers()
            expect(confirmed).toContain('player1')
            expect(confirmed).toContain('player3')
            expect(confirmed).not.toContain('player2')
            expect(confirmed).not.toContain('player4')
        })

        it('deve retornar jogadores pendentes', () => {
            const store = useItemUsageStore.getState()
            store.confirmSelection('player1')
            store.confirmSelection('player3')

            const pending = store.getPendingPlayers()
            expect(pending).toContain('player2')
            expect(pending).toContain('player4')
            expect(pending).not.toContain('player1')
            expect(pending).not.toContain('player3')
        })

        it('deve retornar lista vazia quando todos confirmaram', () => {
            const store = useItemUsageStore.getState()
            store.confirmSelection('player1')
            store.confirmSelection('player2')
            store.confirmSelection('player3')
            store.confirmSelection('player4')

            expect(store.getPendingPlayers()).toHaveLength(0)
            expect(store.getConfirmedPlayers()).toHaveLength(4)
        })
    })

    describe('resetConfirmations', () => {
        it('deve resetar todas as confirmacoes mantendo jogadores', () => {
            const store = useItemUsageStore.getState()
            store.initializeForPlayers(['player1', 'player2', 'player3'])
            store.confirmSelection('player1')
            store.confirmSelection('player2')
            store.confirmSelection('player3')

            store.resetConfirmations()

            const state = useItemUsageStore.getState()
            expect(state.selectionConfirmed.player1).toBe(false)
            expect(state.selectionConfirmed.player2).toBe(false)
            expect(state.selectionConfirmed.player3).toBe(false)
            expect(Object.keys(state.selectionConfirmed)).toHaveLength(3)
        })
    })

    describe('isSelectingTarget', () => {
        it('deve retornar false quando inativo', () => {
            expect(useItemUsageStore.getState().isSelectingTarget()).toBe(false)
        })

        it('deve retornar true quando selecionando', () => {
            useItemUsageStore.getState().startItemUsage('item-1', 'scanner', 'pill')
            expect(useItemUsageStore.getState().isSelectingTarget()).toBe(true)
        })
    })

    describe('getActiveItem', () => {
        it('deve retornar null quando nenhum item ativo', () => {
            expect(useItemUsageStore.getState().getActiveItem()).toBeNull()
        })

        it('deve retornar info do item ativo', () => {
            useItemUsageStore.getState().startItemUsage('item-123', 'inverter', 'pill')

            const activeItem = useItemUsageStore.getState().getActiveItem()
            expect(activeItem).not.toBeNull()
            expect(activeItem?.itemId).toBe('item-123')
            expect(activeItem?.itemType).toBe('inverter')
        })

        it('deve retornar null apos cancelar', () => {
            const store = useItemUsageStore.getState()
            store.startItemUsage('item-1', 'scanner', 'pill')
            store.cancelItemUsage()

            expect(store.getActiveItem()).toBeNull()
        })
    })

    describe('reset', () => {
        it('deve resetar para estado inicial', () => {
            const store = useItemUsageStore.getState()
            store.initializeForPlayers(['player1', 'player2'])
            store.confirmSelection('player1')
            store.startItemUsage('item-1', 'scanner', 'pill')

            store.reset()

            const state = useItemUsageStore.getState()
            expect(state.targetSelection.active).toBe(false)
            expect(state.selectionConfirmed).toEqual({})
        })
    })

    describe('cenarios de jogo', () => {
        it('deve simular fase de selecao de itens com 4 jogadores', () => {
            const store = useItemUsageStore.getState()

            // Inicializa para 4 jogadores
            store.initializeForPlayers(['player1', 'player2', 'player3', 'player4'])
            expect(store.isAllConfirmed()).toBe(false)

            // Jogadores confirmam gradualmente
            store.confirmSelection('player2')
            expect(store.getPendingPlayers()).toHaveLength(3)

            store.confirmSelection('player4')
            store.confirmSelection('player1')
            expect(store.isAllConfirmed()).toBe(false)

            store.confirmSelection('player3')
            expect(store.isAllConfirmed()).toBe(true)
        })

        it('deve simular uso de item com selecao de alvo', () => {
            const store = useItemUsageStore.getState()

            // Jogador usa Scanner (requer pilula como alvo)
            store.startItemUsage('scanner-001', 'scanner', 'pill')
            expect(store.isSelectingTarget()).toBe(true)
            expect(store.getActiveItem()?.itemType).toBe('scanner')

            // Jogador seleciona pilula -> efeito aplicado externamente
            // Store completa o uso
            store.completeItemUsage()
            expect(store.isSelectingTarget()).toBe(false)
        })

        it('deve permitir cancelar uso de item', () => {
            const store = useItemUsageStore.getState()

            store.startItemUsage('inverter-001', 'inverter', 'pill')
            expect(store.isSelectingTarget()).toBe(true)

            // Jogador cancela
            store.cancelItemUsage()
            expect(store.isSelectingTarget()).toBe(false)
            expect(store.getActiveItem()).toBeNull()
        })
    })
})

