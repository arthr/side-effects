import { TooltipProvider } from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import {
  GameLayout,
  GameAreaLayout,
  PlayerContainer,
  TableContainer,
} from '@/components/layout/GameLayout'
import { useGameStore } from '@/stores/gameStore'
import { InfoPanel } from '@/components/game/InfoPanel'

function GameContent() {
  const phase = useGameStore((state) => state.phase)
  const initGame = useGameStore((state) => state.initGame)
  const players = useGameStore((state) => state.players)
  const currentTurn = useGameStore((state) => state.currentTurn)
  const pillPool = useGameStore((state) => state.pillPool)
  const typeCounts = useGameStore((state) => state.typeCounts)
  const round = useGameStore((state) => state.round)

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

        <Button size="lg" onClick={() => initGame()} className="px-8">
          Iniciar Partida
        </Button>

        {/* Info/Tutorial Panel */}
        <InfoPanel />
      </div>
    )
  }

  // Tela de jogo ativo
  if (phase === 'playing') {
    const player1 = players.player1
    const player2 = players.player2

    return (
      <GameAreaLayout
        statusArea={
          <div className="text-center space-y-1">
            <span className="text-sm text-muted-foreground">Rodada {round}</span>
            <h3 className="text-lg font-semibold text-foreground">
              Turno de {players[currentTurn].name}
            </h3>
          </div>
        }
        playerArea={
          <PlayerContainer isCurrentTurn={currentTurn === 'player1'} position="left">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{player1.name}</h3>
                {player1.isAI && (
                  <span className="text-xs text-muted-foreground">(IA)</span>
                )}
              </div>
              
              {/* Lives */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Vidas:</span>
                <div className="flex gap-1">
                  {Array.from({ length: player1.maxLives }).map((_, i) => (
                    <span
                      key={i}
                      className={`text-lg ${
                        i < player1.lives ? 'text-health-full' : 'text-muted-foreground/30'
                      }`}
                    >
                      {i < player1.lives ? '\u2665' : '\u2661'}
                    </span>
                  ))}
                </div>
              </div>

              {/* Resistance */}
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Resistencia</span>
                  <span>{player1.resistance}/{player1.maxResistance}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-health-full transition-all duration-300"
                    style={{ width: `${(player1.resistance / player1.maxResistance) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </PlayerContainer>
        }
        opponentArea={
          <PlayerContainer isCurrentTurn={currentTurn === 'player2'} position="right">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{player2.name}</h3>
                {player2.isAI && (
                  <span className="text-xs text-muted-foreground">(IA)</span>
                )}
              </div>
              
              {/* Lives */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Vidas:</span>
                <div className="flex gap-1">
                  {Array.from({ length: player2.maxLives }).map((_, i) => (
                    <span
                      key={i}
                      className={`text-lg ${
                        i < player2.lives ? 'text-health-full' : 'text-muted-foreground/30'
                      }`}
                    >
                      {i < player2.lives ? '\u2665' : '\u2661'}
                    </span>
                  ))}
                </div>
              </div>

              {/* Resistance */}
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Resistencia</span>
                  <span>{player2.resistance}/{player2.maxResistance}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-health-full transition-all duration-300"
                    style={{ width: `${(player2.resistance / player2.maxResistance) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </PlayerContainer>
        }
        tableArea={
          <TableContainer>
            <div className="space-y-4">
              <h3 className="text-center font-semibold text-foreground">
                Mesa de Pilulas
              </h3>

              {/* Type Counts */}
              <div className="flex flex-wrap justify-center gap-2 text-xs">
                <span className="px-2 py-1 rounded bg-pill-safe/20 text-pill-safe">
                  Safe: {typeCounts.SAFE}
                </span>
                <span className="px-2 py-1 rounded bg-pill-dmg-low/20 text-pill-dmg-low">
                  Veneno: {typeCounts.DMG_LOW}
                </span>
                <span className="px-2 py-1 rounded bg-pill-dmg-high/20 text-pill-dmg-high">
                  Toxina: {typeCounts.DMG_HIGH}
                </span>
                <span className="px-2 py-1 rounded bg-pill-fatal/20 text-pill-fatal">
                  Fatal: {typeCounts.FATAL}
                </span>
                <span className="px-2 py-1 rounded bg-pill-heal/20 text-pill-heal">
                  Cura: {typeCounts.HEAL}
                </span>
              </div>

              {/* Pills Grid - Placeholder */}
              <div className="flex flex-wrap justify-center gap-3 py-4">
                {pillPool.map((pill) => (
                  <button
                    key={pill.id}
                    className={`
                      w-12 h-12 rounded-full border-2 
                      flex items-center justify-center
                      transition-all duration-200
                      hover:scale-110 hover:shadow-lg
                      ${pill.isRevealed 
                        ? 'border-transparent' 
                        : 'border-border bg-pill-hidden'
                      }
                    `}
                    style={{
                      backgroundColor: pill.isRevealed ? pill.visuals.color : undefined,
                    }}
                  >
                    <span className="text-white font-bold text-xs">
                      {pill.isRevealed ? pill.visuals.label.slice(0, 1) : '?'}
                    </span>
                  </button>
                ))}
              </div>

              <p className="text-center text-xs text-muted-foreground">
                Clique em uma pilula para consumi-la
              </p>
            </div>
          </TableContainer>
        }
      />
    )
  }

  // Tela de fim de jogo
  if (phase === 'ended') {
    const { winner, resetGame, getGameStats } = useGameStore.getState()
    const stats = getGameStats()

    return (
      <div className="flex flex-col items-center justify-center gap-6 py-12">
        <h2 className="text-3xl font-bold text-foreground">
          Fim de Jogo!
        </h2>
        <p className="text-xl text-primary">
          {winner ? `${players[winner].name} venceu!` : 'Empate!'}
        </p>

        <div className="text-sm text-muted-foreground space-y-1 text-center">
          <p>Rodadas: {stats.totalRounds}</p>
          <p>Pilulas consumidas: {stats.pillsConsumed}</p>
          <p>Colapsos: {stats.totalCollapses}</p>
        </div>

        <Button onClick={resetGame}>Jogar Novamente</Button>
      </div>
    )
  }

  return null
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
