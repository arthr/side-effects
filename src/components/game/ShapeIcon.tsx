import { useState } from 'react'
import type { PillShape } from '@/types'
import { SHAPE_IMAGES, SHAPE_LABELS, SHAPE_CLASSES, SHAPE_CLIP_PATHS } from '@/utils/constants'

interface ShapeIconProps {
  /** Shape a ser renderizada */
  shape: PillShape
  /** Tamanho do icone */
  size?: 'sm' | 'md' | 'lg'
  /** Classes CSS adicionais */
  className?: string
  /** Cor de destaque (hex) para o fallback */
  accentColor?: string
}

const sizeClasses = {
  sm: 'w-5 h-5',
  md: 'w-7 h-7',
  lg: 'w-9 h-9',
}

/** Cores padrao para fallback de shapes */
const SHAPE_FALLBACK_COLORS: Record<PillShape, string> = {
  capsule: '#60a5fa',   // blue
  round: '#4ade80',     // green
  triangle: '#f87171',  // red
  oval: '#facc15',      // yellow
  cross: '#a78bfa',     // purple
  heart: '#fb7185',     // pink
  flower: '#f472b6',    // pink
  star: '#4ade80',      // green
  pumpkin: '#fb923c',   // orange
  coin: '#fbbf24',      // amber
  bear: '#4ade80',      // green
  gem: '#c084fc',       // violet
  skull: '#a78bfa',     // purple
  domino: '#fb923c',    // orange
  pineapple: '#f472b6', // pink
  fruit: '#f472b6',     // pink
}

/**
 * Fallback visual quando imagem da shape nao carrega
 * Usa CSS (clip-path, border-radius) para renderizar a forma
 */
function ShapeFallback({
  shape,
  size,
  className = '',
  accentColor,
}: {
  shape: PillShape
  size: 'sm' | 'md' | 'lg'
  className?: string
  accentColor?: string
}) {
  const label = SHAPE_LABELS[shape]
  const shapeClass = SHAPE_CLASSES[shape]
  const clipPath = SHAPE_CLIP_PATHS[shape]
  const color = accentColor || SHAPE_FALLBACK_COLORS[shape]
  
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
      <div
        className={`
          w-full h-full
          ${shapeClass}
          transition-all duration-200
        `}
        style={{
          clipPath: clipPath || undefined,
          background: `linear-gradient(135deg, ${color}, ${color}90)`,
          boxShadow: `0 2px 8px ${color}50, inset 0 1px 0 rgba(255,255,255,0.3)`,
          border: `1px solid ${color}`,
        }}
      />
    </div>
  )
}

/**
 * Componente para exibir uma shape isolada
 * Usado em ShapeQuestDisplay, ShapeSelector e outros contextos
 * 
 * Sistema de fallback:
 * 1. Tenta carregar imagem PNG
 * 2. Se falhar, renderiza forma CSS com cor e estilo
 */
export function ShapeIcon({
  shape,
  size = 'md',
  className = '',
  accentColor,
}: ShapeIconProps) {
  const [imageError, setImageError] = useState(false)
  
  const shapeImage = SHAPE_IMAGES[shape]
  const label = SHAPE_LABELS[shape]

  // Se imagem falhou, mostra fallback CSS
  if (imageError || !shapeImage) {
    return (
      <ShapeFallback 
        shape={shape} 
        size={size} 
        className={className}
        accentColor={accentColor}
      />
    )
  }

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
        className="w-full h-full object-contain drop-shadow-md drop-shadow-black"
        draggable={false}
        onError={() => setImageError(true)}
      />
    </div>
  )
}
