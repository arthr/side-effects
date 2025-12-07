import {
  useGameActions,
  usePlayers,
  useCurrentTurn,
  usePillPool,
  useTypeCounts,
  useRound,
  useCurrentPlayer,
  useIsHumanTurn,
} from '@/hooks'
import {
  GameAreaLayout,
  PlayerContainer,
  TableContainer,
} from '@/components/layout/GameLayout'
import { PlayerArea } from './PlayerArea'
import { PillPool } from './PillPool'
import { TurnIndicator } from './TurnIndicator'

/**
 * Tabuleiro completo do jogo
 * Compoe: Areas dos jogadores, Mesa de pilulas, Indicador de turno
 * Conectado ao gameStore via hooks customizados
 */
export function GameBoard() {
  // State selectors otimizados
  const { player1, player2 } = usePlayers()
  const currentTurn = useCurrentTurn()
  const pillPool = usePillPool()
  const typeCounts = useTypeCounts()
  const round = useRound()
  const currentPlayer = useCurrentPlayer()
  const isHumanTurn = useIsHumanTurn()

  // Actions
  const { selectPill } = useGameActions()

  // Mensagem de instrucao baseada no estado
  const getInstructionMessage = () => {
    if (!isHumanTurn) {
      return 'Aguardando jogada da IA...'
    }
    return 'Clique em uma pilula para consumi-la'
  }

  return (
    <GameAreaLayout
      statusArea={
        <TurnIndicator
          currentPlayer={currentPlayer}
          round={round}
          isHumanTurn={isHumanTurn}
        />
      }
      playerArea={
        <PlayerContainer
          isCurrentTurn={currentTurn === 'player1'}
          position="left"
        >
          <PlayerArea
            player={player1}
            isCurrentTurn={currentTurn === 'player1'}
          />
        </PlayerContainer>
      }
      opponentArea={
        <PlayerContainer
          isCurrentTurn={currentTurn === 'player2'}
          position="right"
        >
          <PlayerArea
            player={player2}
            isCurrentTurn={currentTurn === 'player2'}
          />
        </PlayerContainer>
      }
      tableArea={
        <TableContainer>
          <PillPool
            pills={pillPool}
            typeCounts={typeCounts}
            onSelectPill={selectPill}
            disabled={!isHumanTurn}
            instructionMessage={getInstructionMessage()}
          />
        </TableContainer>
      }
    />
  )
}
