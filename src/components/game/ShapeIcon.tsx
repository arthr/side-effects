import type { PillShape } from '@/types'
import { SHAPE_IMAGES, SHAPE_LABELS } from '@/utils/constants'

interface ShapeIconProps {
  /** Shape a ser renderizada */
  shape: PillShape
  /** Tamanho do icone */
  size?: 'sm' | 'md' | 'lg'
  /** Classes CSS adicionais */
  className?: string
}

const sizeClasses = {
  sm: 'w-5 h-5',
  md: 'w-7 h-7',
  lg: 'w-9 h-9',
}

/**
 * Componente para exibir uma shape isolada
 * Usado em ShapeQuestDisplay, ShapeSelector e outros contextos
 */
export function ShapeIcon({
  shape,
  size = 'md',
  className = '',
}: ShapeIconProps) {
  const shapeImage = SHAPE_IMAGES[shape]
  const label = SHAPE_LABELS[shape]

  return (
    <div
      className={`
        ${sizeClasses[size]}
        flex items-center justify-center
        ${className}
      `}
      title={label}
      aria-label={label}
    >
      <img
        src={shapeImage}
        alt={label}
        className="w-full h-full object-contain"
        draggable={false}
      />
    </div>
  )
}
