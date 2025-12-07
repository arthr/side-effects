import { AnimatePresence } from 'framer-motion'
import { useOverlayStore } from '@/stores/overlayStore'
import { useGameStore } from '@/stores/gameStore'
import { PillReveal } from './PillReveal'
import { GameOverDialog } from './GameOverDialog'
import { NewRoundOverlay } from './NewRoundOverlay'
import { ItemEffectOverlay } from './ItemEffectOverlay'

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

  // Actions do game store para restart
  const resetGame = useGameStore((s) => s.resetGame)

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
    </AnimatePresence>
  )
}

