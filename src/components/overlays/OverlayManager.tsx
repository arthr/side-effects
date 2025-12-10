import { AnimatePresence } from 'framer-motion'
import { useOverlayStore } from '@/stores/overlayStore'
import { useGameStore } from '@/stores/gameStore'
import { useMultiplayer } from '@/hooks'
import { PillReveal } from './PillReveal'
import { GameOverDialog } from './GameOverDialog'
import { NewRoundOverlay } from './NewRoundOverlay'
import { ItemEffectOverlay } from './ItemEffectOverlay'
import { PillStore } from '../game/PillStore'
import { WaitingForOpponent } from '../game/WaitingForOpponent'
import type { PlayerId } from '@/types'

/**
 * Gerenciador de Overlays
 * Renderiza o overlay ativo com AnimatePresence para transicoes suaves
 *
 * Deve ser colocado no nivel raiz da aplicacao (App.tsx)
 */
export function OverlayManager() {
  const current = useOverlayStore((s) => s.current)
  const pillRevealData = useOverlayStore((s) => s.pillRevealData)
  const gameOverData = useOverlayStore((s) => s.gameOverData)
  const newRoundData = useOverlayStore((s) => s.newRoundData)
  const itemEffectData = useOverlayStore((s) => s.itemEffectData)
  const close = useOverlayStore((s) => s.close)

  // Estado do jogo para fase shopping
  const gamePhase = useGameStore((s) => s.phase)
  const players = useGameStore((s) => s.players)

  // Actions do game store para restart
  const resetGame = useGameStore((s) => s.resetGame)

  // Contexto multiplayer
  const { isMultiplayer, localPlayerId } = useMultiplayer()

  // Determina qual jogador local esta na fase shopping
  // Em multiplayer: usa localPlayerId
  // Em single player: determina pelo isAI flag
  const localPlayer: PlayerId = isMultiplayer
    ? (localPlayerId ?? 'player1')
    : (players.player1.isAI ? 'player2' : 'player1')
  const localPlayerData = players[localPlayer]
  const isShoppingPhase = gamePhase === 'shopping'

  // Handler para restart que fecha o overlay e reinicia o jogo
  const handleRestart = () => {
    close()
    resetGame()
  }

  return (
    <AnimatePresence mode="wait">
      {current === 'pillReveal' && pillRevealData && (
        <PillReveal
          key="pillReveal"
          pill={pillRevealData.pill}
          isAITurn={pillRevealData.isAITurn}
          onComplete={close}
        />
      )}

      {current === 'gameOver' && gameOverData && (
        <GameOverDialog
          key="gameOver"
          winner={gameOverData.winner}
          players={gameOverData.players}
          stats={gameOverData.stats}
          onRestart={handleRestart}
          onClose={close}
        />
      )}

      {current === 'newRound' && newRoundData && (
        <NewRoundOverlay
          key="newRound"
          round={newRoundData.round}
          onComplete={close}
        />
      )}

      {current === 'itemEffect' && itemEffectData && (
        <ItemEffectOverlay
          key="itemEffect"
          itemType={itemEffectData.itemType}
          targetInfo={itemEffectData.targetInfo}
          onComplete={close}
        />
      )}

      {/* Pill Store - fase shopping */}
      {isShoppingPhase && localPlayerData.wantsStore && (
        <PillStore
          key="pillStore"
          playerId={localPlayer}
        />
      )}

      {/* Waiting for Opponent - fase shopping quando jogador nao quer loja */}
      {isShoppingPhase && !localPlayerData.wantsStore && (
        <WaitingForOpponent key="waitingForOpponent" />
      )}
    </AnimatePresence>
  )
}

