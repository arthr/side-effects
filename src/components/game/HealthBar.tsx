import { getHealthBarColor } from '@/utils/constants'

interface HealthBarProps {
  /** Valor atual de resistencia */
  current: number
  /** Valor maximo de resistencia */
  max: number
  /** Mostrar label "Resistencia" */
  showLabel?: boolean
  /** Mostrar valores numericos */
  showValues?: boolean
  /** Altura da barra */
  height?: 'sm' | 'md' | 'lg'
}

const heightClasses = {
  sm: 'h-1.5',
  md: 'h-2',
  lg: 'h-3',
}

/**
 * Barra de resistencia com cores dinamicas baseadas na porcentagem
 * Verde > 66%, Amarelo 33-66%, Vermelho < 33%
 */
export function HealthBar({
  current,
  max,
  showLabel = true,
  showValues = true,
  height = 'md',
}: HealthBarProps) {
  const percentage = max > 0 ? (current / max) * 100 : 0
  const colorClass = getHealthBarColor(current, max)

  return (
    <div className="space-y-1">
      {(showLabel || showValues) && (
        <div className="flex justify-between text-sm">
          {showLabel && (
            <span className="text-muted-foreground">Resistencia</span>
          )}
          {showValues && (
            <span className="text-foreground">
              {current}/{max}
            </span>
          )}
        </div>
      )}
      <div
        className={`${heightClasses[height]} bg-muted rounded-full overflow-hidden`}
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={`Resistencia: ${current} de ${max}`}
      >
        <div
          className={`h-full ${colorClass} transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

