import { TooltipProvider } from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { GameLayout } from '@/components/layout/GameLayout'
import {
  useGameActions,
  useGamePhase,
  usePlayers,
  useWinner,
  useGameStats,
} from '@/hooks'
import { InfoPanel } from '@/components/game/InfoPanel'
import { GameBoard } from '@/components/game/GameBoard'

function GameContent() {
  // State
  const phase = useGamePhase()
  const { player1, player2 } = usePlayers()
  const winner = useWinner()

  // Actions
  const { startGame, restartGame } = useGameActions()

  // Tela inicial - Setup
  if (phase === 'setup') {
    return (
      <div className="flex flex-col items-center justify-center gap-8 py-12">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-foreground">
            Bem-vindo ao Side Effects
          </h2>
          <p className="text-muted-foreground">
            Escolha uma pilula. Sobreviva. Seja o ultimo.
          </p>
        </div>

        <Button size="lg" onClick={() => startGame()} className="px-8">
          Iniciar Partida
        </Button>

        {/* Info/Tutorial Panel */}
        <InfoPanel />
      </div>
    )
  }

  // Tela de jogo ativo
  if (phase === 'playing') {
    return <GameBoard />
  }

  // Tela de fim de jogo
  if (phase === 'ended') {
    return (
      <GameOverScreen
        winner={winner}
        players={{ player1, player2 }}
        onRestart={restartGame}
      />
    )
  }

  return null
}

/**
 * Tela de fim de jogo extraida para componente separado
 */
interface GameOverScreenProps {
  winner: 'player1' | 'player2' | null
  players: { player1: { name: string }; player2: { name: string } }
  onRestart: () => void
}

function GameOverScreen({ winner, players, onRestart }: GameOverScreenProps) {
  const stats = useGameStats()

  return (
    <div className="flex flex-col items-center justify-center gap-6 py-12">
      <h2 className="text-3xl font-bold text-foreground">Fim de Jogo!</h2>
      <p className="text-xl text-primary">
        {winner ? `${players[winner].name} venceu!` : 'Empate!'}
      </p>

      <div className="text-sm text-muted-foreground space-y-1 text-center">
        <p>Rodadas: {stats.totalRounds}</p>
        <p>Pilulas consumidas: {stats.pillsConsumed}</p>
        <p>Colapsos: {stats.totalCollapses}</p>
      </div>

      <Button onClick={onRestart}>Jogar Novamente</Button>
    </div>
  )
}

function App() {
  return (
    <TooltipProvider>
      <GameLayout>
        <GameContent />
      </GameLayout>
    </TooltipProvider>
  )
}

export default App
