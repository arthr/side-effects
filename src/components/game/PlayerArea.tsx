import type { Player } from '@/types'
import { LivesDisplay } from './LivesDisplay'
import { HealthBar } from './HealthBar'

interface PlayerAreaProps {
  /** Dados do jogador */
  player: Player
  /** Se e o turno deste jogador */
  isCurrentTurn?: boolean
}

/**
 * Area completa de stats do jogador
 * Inclui: Nome, tag IA, vidas e barra de resistencia
 */
export function PlayerArea({ player, isCurrentTurn = false }: PlayerAreaProps) {
  return (
    <div className="space-y-3">
      {/* Header: Nome + Tag IA */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{player.name}</h3>
        {player.isAI && (
          <span className="text-xs text-muted-foreground">(IA)</span>
        )}
      </div>

      {/* Lives */}
      <LivesDisplay lives={player.lives} maxLives={player.maxLives} />

      {/* Resistance Bar */}
      <HealthBar current={player.resistance} max={player.maxResistance} />

      {/* Turn Indicator (visual) */}
      {isCurrentTurn && (
        <div className="text-xs text-primary font-medium">
          Seu turno
        </div>
      )}
    </div>
  )
}

