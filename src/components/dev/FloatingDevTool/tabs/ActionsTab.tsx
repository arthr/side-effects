import { useMemo, useState } from 'react'
import { useGameStore } from '@/stores/gameStore'
import { useToastStore } from '@/stores/toastStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/8bit/card'
import { Button } from '@/components/ui/8bit/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/8bit/select'
import { ScrollArea } from '@/components/ui/8bit/scroll-area'
import { AlertTriangle } from 'lucide-react'
import type { GamePhase, Player, PlayerId } from '@/types'

const MAX_PLAYERS_FOR_LAYOUT_TEST: number = 4

function getPlayerIndex(id: string): number {
  const n = Number(id.replace('player', ''))
  return Number.isFinite(n) ? n : 0
}

function createBotPlayer(id: PlayerId, template: { lives: number; resistance: number }): Player {
  return {
    id,
    userId: null,
    name: `Bot ${getPlayerIndex(id)}`,
    lives: template.lives,
    maxLives: template.lives,
    resistance: template.resistance,
    maxResistance: template.resistance,
    isAI: true,
    inventory: { items: [], maxItems: 5 },
    effects: [],
    pillCoins: 0,
    wantsStore: false,
  }
}

/**
 * Aba de ações rápidas para debug
 * Permite executar ações de teste e debug no jogo
 */
export function ActionsTab() {
  const [selectedPhase, setSelectedPhase] = useState<GamePhase>('playing')
  const [selectedPlayer, setSelectedPlayer] = useState<'player1' | 'player2'>('player1')

  // Game Store actions and state
  const resetGame = useGameStore((s) => s.resetGame)
  const setPhase = useGameStore((s) => s.setPhase)
  const addLivesToPlayer = useGameStore((s) => s.addLivesToPlayer)
  const forceEndRound = useGameStore((s) => s.forceEndRound)
  const currentPhase = useGameStore((s) => s.phase)
  const players = useGameStore((s) => s.players)

  // Toast Store actions
  const clearToasts = useToastStore((s) => s.clear)
  const showToast = useToastStore((s) => s.show)

  const playerIds = useMemo(() => {
    return (Object.keys(players).sort((a, b) => getPlayerIndex(a) - getPlayerIndex(b)) as PlayerId[])
  }, [players])

  const extraBotIds = useMemo(() => {
    return playerIds.filter((id) => getPlayerIndex(id) >= 3 && players[id]?.isAI)
  }, [playerIds, players])

  const handleResetGame = () => {
    if (window.confirm('⚠️ Tem certeza que deseja resetar o jogo? Esta ação não pode ser desfeita.')) {
      resetGame()
      showToast({
        type: 'info',
        message: 'Jogo resetado com sucesso',
      })
    }
  }

  const handleSkipToPhase = () => {
    if (currentPhase === selectedPhase) {
      showToast({
        type: 'info',
        message: 'Já está nesta fase',
      })
      return
    }

    setPhase(selectedPhase)
    showToast({
      type: 'info',
      message: `Fase alterada para: ${selectedPhase}`,
    })
  }

  const handleAddLives = () => {
    addLivesToPlayer(selectedPlayer, 1)
    showToast({
      type: 'info',
      message: `+1 vida para ${selectedPlayer}`,
    })
  }

  const handleForceRoundEnd = () => {
    if (currentPhase !== 'playing') {
      showToast({
        type: 'info',
        message: 'Só funciona durante gameplay (fase playing)',
      })
      return
    }

    forceEndRound()
    showToast({
      type: 'info',
      message: 'Rodada encerrada forçadamente',
    })
  }

  const handleClearToasts = () => {
    clearToasts()
    // Não mostra toast aqui pois acabamos de limpar todos :)
  }

  const handleAddBot = () => {
    const state = useGameStore.getState()
    const ids = (Object.keys(state.players).sort((a, b) => getPlayerIndex(a) - getPlayerIndex(b)) as PlayerId[])

    if (ids.length >= MAX_PLAYERS_FOR_LAYOUT_TEST) {
      showToast({ type: 'info', message: `Limite atingido (${MAX_PLAYERS_FOR_LAYOUT_TEST} jogadores)` })
      return
    }

    const maxIndex = ids.reduce((acc, id) => Math.max(acc, getPlayerIndex(id)), 2)
    const nextId = `player${maxIndex + 1}` as PlayerId

    const template = {
      lives: state.players.player1?.maxLives ?? 3,
      resistance: state.players.player1?.maxResistance ?? 6,
    }

    const bot = createBotPlayer(nextId, template)

    useGameStore.setState((prev) => {
      const nextPlayers = { ...prev.players, [nextId]: bot }
      const nextShapeQuests = { ...prev.shapeQuests, [nextId]: null }
      const nextItemSelectionConfirmed = { ...prev.itemSelectionConfirmed, [nextId]: false }
      const nextRevealAtStart = { ...prev.revealAtStart, [nextId]: 0 }

      const nextStoreState = prev.storeState
        ? {
            ...prev.storeState,
            confirmed: { ...prev.storeState.confirmed, [nextId]: false },
            cart: { ...prev.storeState.cart, [nextId]: [] },
            pendingBoosts: { ...prev.storeState.pendingBoosts, [nextId]: [] },
          }
        : prev.storeState

      return {
        players: nextPlayers,
        shapeQuests: nextShapeQuests,
        itemSelectionConfirmed: nextItemSelectionConfirmed,
        revealAtStart: nextRevealAtStart,
        storeState: nextStoreState,
      }
    })

    showToast({ type: 'info', message: `Bot adicionado: ${nextId}` })
  }

  const handleRemoveBot = () => {
    const state = useGameStore.getState()
    const ids = (Object.keys(state.players).sort((a, b) => getPlayerIndex(a) - getPlayerIndex(b)) as PlayerId[])

    const removable = ids
      .filter((id) => getPlayerIndex(id) >= 3 && state.players[id]?.isAI)
      .sort((a, b) => getPlayerIndex(b) - getPlayerIndex(a))

    const removeId = removable[0]
    if (!removeId) {
      showToast({ type: 'info', message: 'Nenhum bot extra para remover (apenas player1/player2)' })
      return
    }

    useGameStore.setState((prev) => {
      const restPlayers = { ...prev.players }
      delete restPlayers[removeId]

      const restQuests = { ...prev.shapeQuests }
      delete restQuests[removeId]

      const restConfirmed = { ...prev.itemSelectionConfirmed }
      delete restConfirmed[removeId]

      const restRevealAtStart = { ...prev.revealAtStart }
      delete restRevealAtStart[removeId]

      const nextStoreState = prev.storeState
        ? {
            ...prev.storeState,
            confirmed: (() => {
              const next = { ...prev.storeState!.confirmed }
              delete next[removeId]
              return next
            })(),
            cart: (() => {
              const next = { ...prev.storeState!.cart }
              delete next[removeId]
              return next
            })(),
            pendingBoosts: (() => {
              const next = { ...prev.storeState!.pendingBoosts }
              delete next[removeId]
              return next
            })(),
          }
        : prev.storeState

      const nextCurrentTurn = prev.currentTurn === removeId ? 'player1' : prev.currentTurn

      return {
        players: restPlayers,
        shapeQuests: restQuests,
        itemSelectionConfirmed: restConfirmed,
        revealAtStart: restRevealAtStart,
        storeState: nextStoreState,
        currentTurn: nextCurrentTurn,
      }
    })

    showToast({ type: 'info', message: `Bot removido: ${removeId}` })
  }

  return (
    <ScrollArea className="h-[450px]">
      <div className="p-3 space-y-3">
      {/* Aviso */}
      <div className="bg-yellow-500/10 border border-yellow-500 p-2 rounded flex items-start gap-2">
        <AlertTriangle className="h-3.5 w-3.5 text-yellow-500 shrink-0 mt-0.5" />
        <p className="text-[10px] text-yellow-700 dark:text-yellow-300">
          <span className="font-normal">Cuidado:</span> Estas ações são para debug e podem quebrar o estado do jogo.
        </p>
      </div>

      {/* Bots (AI) - teste de layout N-jogadores */}
      <Card className="border gap-0">
        <CardHeader className="pb-4 px-3">
          <CardTitle className="text-[10px] font-normal">Bots (AI) - Teste de Layout</CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-2 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-muted-foreground">
              Jogadores: {playerIds.length}/{MAX_PLAYERS_FOR_LAYOUT_TEST}
              {extraBotIds.length > 0 ? ` (bots extras: ${extraBotIds.length})` : ''}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleAddBot}
              size="sm"
              borderSize="sm"
              variant="outline"
              className="flex-1 text-xs"
              disabled={playerIds.length >= MAX_PLAYERS_FOR_LAYOUT_TEST}
              title="Adiciona um bot extra (player3/player4) para testar layout"
            >
              + Bot
            </Button>
            <Button
              onClick={handleRemoveBot}
              size="sm"
              borderSize="sm"
              variant="outline"
              className="flex-1 text-xs"
              disabled={extraBotIds.length === 0}
              title="Remove o ultimo bot extra (player4 -> player3)"
            >
              - Bot
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground italic">
            Dica: adicione 1 bot (3 players) ou 2 bots (4 players) para validar o grid do GameBoard.
          </p>
        </CardContent>
      </Card>

      {/* Reset Game */}
      <Card className="border gap-0">
        <CardHeader className="pb-4 px-3">
          <CardTitle className="text-[10px] font-normal">Reset Completo</CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-2">
          <Button
            onClick={handleResetGame}
            size="sm"
            borderSize="sm"
            variant="destructive"
            className="w-full text-xs"
          >
            Reset Game
          </Button>
          <p className="text-xs text-muted-foreground mt-2 italic">
            Reinicia o jogo completamente (volta para setup)
          </p>
        </CardContent>
      </Card>

      {/* Skip to Phase */}
      <Card className="borde gap-0">
        <CardHeader className="pb-4 px-3">
          <CardTitle className="text-[10px] font-normal">Pular para Fase</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1.5 px-3 pb-2">
          <Select value={selectedPhase} onValueChange={(v) => setSelectedPhase(v as GamePhase)}>
            <SelectTrigger className="w-full text-[10px]">
              <SelectValue placeholder="Selecione uma fase" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="setup">Setup</SelectItem>
              <SelectItem value="itemSelection">Item Selection</SelectItem>
              <SelectItem value="playing">Playing</SelectItem>
              <SelectItem value="shopping">Shopping</SelectItem>
              <SelectItem value="roundEnding">Round Ending</SelectItem>
              <SelectItem value="ended">Ended</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={handleSkipToPhase}
            size="sm"
            borderSize="sm"
            variant="outline"
            className="w-full text-xs"
          >
            Ir para {selectedPhase}
          </Button>
        </CardContent>
      </Card>

      {/* Add Lives */}
      <Card className="border gap-0">
        <CardHeader className="pb-4 px-3">
          <CardTitle className="text-[10px] font-normal">Adicionar Vidas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1.5 px-3 pb-2">
          <Select value={selectedPlayer} onValueChange={(v) => setSelectedPlayer(v as 'player1' | 'player2')}>
            <SelectTrigger className="w-full text-[10px]">
              <SelectValue placeholder="Selecione um jogador" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="player1">Player 1</SelectItem>
              <SelectItem value="player2">Player 2</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={handleAddLives}
            size="sm"
            borderSize="sm"
            variant="outline"
            className="w-full text-xs"
          >
            +1 Vida para {selectedPlayer}
          </Button>
        </CardContent>
      </Card>

      {/* Force Round End */}
      <Card className="border gap-0">
        <CardHeader className="pb-4 px-3">
          <CardTitle className="text-[10px] font-normal">Controle de Rodada</CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-2">
          <Button
            onClick={handleForceRoundEnd}
            size="sm"
            borderSize="sm"
            variant="outline"
            className="w-full text-xs"
            disabled={currentPhase !== 'playing'}
          >
            Forçar Fim de Rodada
          </Button>
          <p className="text-[10px] text-muted-foreground mt-4 italic">
            {currentPhase === 'playing' 
              ? 'Encerra a rodada atual imediatamente' 
              : 'Disponível apenas durante gameplay'}
          </p>
        </CardContent>
      </Card>

      {/* Clear Toasts */}
      <Card className="border gap-0">
        <CardHeader className="pb-4 px-3">
          <CardTitle className="text-[10px] font-normal">Limpar UI</CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-2">
          <Button
            onClick={handleClearToasts}
            size="sm"
            borderSize="sm"
            variant="outline"
            className="w-full text-xs"
          >
            Limpar Todos os Toasts
          </Button>
        </CardContent>
      </Card>
      </div>
    </ScrollArea>
  )
}

