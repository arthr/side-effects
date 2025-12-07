interface LivesDisplayProps {
  /** Vidas atuais do jogador */
  lives: number
  /** Maximo de vidas */
  maxLives: number
  /** Tamanho dos icones */
  size?: 'sm' | 'md' | 'lg'
  /** Mostrar label "Vidas:" */
  showLabel?: boolean
}

const sizeClasses = {
  sm: 'text-base',
  md: 'text-lg',
  lg: 'text-xl',
}

/**
 * Exibe as vidas do jogador como icones de coracao
 * Coracoes cheios = vidas ativas, vazios = vidas perdidas
 */
export function LivesDisplay({
  lives,
  maxLives,
  size = 'md',
  showLabel = true,
}: LivesDisplayProps) {
  return (
    <div className="flex items-center gap-2">
      {showLabel && (
        <span className="text-sm text-muted-foreground">Vidas:</span>
      )}
      <div className="flex gap-1">
        {Array.from({ length: maxLives }).map((_, index) => {
          const isActive = index < lives
          return (
            <span
              key={index}
              className={`${sizeClasses[size]} transition-colors duration-200 ${
                isActive ? 'text-health-full' : 'text-muted-foreground/30'
              }`}
              aria-label={isActive ? 'Vida ativa' : 'Vida perdida'}
            >
              {isActive ? '\u2665' : '\u2661'}
            </span>
          )
        })}
      </div>
    </div>
  )
}

