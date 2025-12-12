import { useState } from 'react'
import {
  Search,
  RefreshCw,
  CopyPlus,
  Pill as PillIcon,
  Shield,
  Lock,
  Utensils,
  Shuffle,
  Trash2,
  Bomb,
  ScanSearch,
  type LucideIcon,
} from 'lucide-react'
import type { ItemType } from '@/types'
import { useItemCatalog } from '@/hooks'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/8bit/tooltip'

// Imports estaticos das imagens para melhor performance e bundling
import scannerImg from '@/assets/items/scanned.JPG'
import inverterImg from '@/assets/items/inverter.JPG'
import doubleImg from '@/assets/items/double.JPG'
import pocketPillImg from '@/assets/items/pill_pocket.JPG'
import shieldImg from '@/assets/items/shield.JPG'
import handcuffsImg from '@/assets/items/handcuffs.JPG'
import forceFeedImg from '@/assets/items/force_feed.JPG'
import shuffleImg from '@/assets/items/shuffle.JPG'
import discardImg from '@/assets/items/discard.JPG'

// ============================================
// Mapeamentos
// ============================================

/** Mapeamento de ItemType para imagem (undefined = sem imagem, usa fallback) */
const IMAGE_MAP: Partial<Record<ItemType, string>> = {
  scanner: scannerImg,
  inverter: inverterImg,
  double: doubleImg,
  pocket_pill: pocketPillImg,
  shield: shieldImg,
  handcuffs: handcuffsImg,
  force_feed: forceFeedImg,
  shuffle: shuffleImg,
  discard: discardImg,
  // shape_bomb e shape_scanner usam fallback visual (sem imagem)
}

/** Mapeamento de ItemType para icone Lucide (fallback) */
const ICON_MAP: Record<ItemType, LucideIcon> = {
  scanner: Search,
  inverter: RefreshCw,
  double: CopyPlus,
  pocket_pill: PillIcon,
  shield: Shield,
  handcuffs: Lock,
  force_feed: Utensils,
  shuffle: Shuffle,
  discard: Trash2,
  shape_bomb: Bomb,
  shape_scanner: ScanSearch,
}

// ============================================
// Componente
// ============================================

interface ItemIconProps {
  /** Tipo do item */
  type: ItemType
  /** Tamanho em pixels */
  size?: number
  /** Classe CSS adicional (cor, etc) */
  className?: string
  /** Estilos inline (para cores dinamicas) */
  style?: React.CSSProperties
  /** Forcar uso do icone (ignorar imagem) */
  forceIcon?: boolean
  /** Exibir tooltip com nome e descricao */
  showTooltip?: boolean
}

/**
 * Componente de fallback visual quando nao ha imagem
 * Exibe icone Lucide estilizado com cor da categoria
 */
/**
 * Icone de item com imagem customizada e fallback elegante
 * 
 * Sistema de fallback:
 * 1. Tenta carregar imagem do IMAGE_MAP
 * 2. Se nao existe ou falha, exibe IconFallback estilizado
 * 
 * Uso:
 * ```tsx
 * <ItemIcon type="scanner" size={24} className="text-blue-400" />
 * ```
 */
export function ItemIcon({
  type,
  size = 24,
  className = '',
  style,
  forceIcon = false,
  showTooltip = false,
}: ItemIconProps) {
  const [imageError, setImageError] = useState(false)

  const { ITEM_CATALOG, CATEGORY_LABELS, CATEGORY_HEX_COLORS } = useItemCatalog()
  
  const imageSrc = IMAGE_MAP[type]
  const itemDef = ITEM_CATALOG[type]
  
  // Usa imagem se disponivel e nao houve erro
  const shouldUseImage = !forceIcon && imageSrc && !imageError
  
  // Renderiza o icone/imagem
  const renderIcon = () => {
    if (shouldUseImage) {
      return (
        <img
          src={imageSrc}
          alt={itemDef.name}
          width={size}
          height={size}
          className={`object-contain ${className}`}
          style={{ width: size, height: size, ...style }}
          onError={() => setImageError(true)}
          draggable={false}
        />
      )
    }
    
    // Fallback visual elegante
    return (
      <IconFallback />
    )
  }
  
  // Sem tooltip - retorna icone diretamente
  if (!showTooltip) {
    return renderIcon()
  }
  
  // Com tooltip - envolve o icone
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex cursor-help">
          {renderIcon()}
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-48">
        <div className="space-y-1">
          <p className="font-normal text-sm">{itemDef.name}</p>
          <p className="text-xs text-muted-foreground">{itemDef.description}</p>
          <p className="text-[10px] text-primary/80 uppercase tracking-wider">
            {CATEGORY_LABELS[itemDef.category]}
          </p>
        </div>
      </TooltipContent>
    </Tooltip>
  )

  function IconFallback() {
    const FallbackIcon = ICON_MAP[type]
    const categoryColor = CATEGORY_HEX_COLORS[itemDef.category]

    // Tamanho do icone interno (70% do container)
    const iconSize = Math.round(size * 0.6)

    return (
      <div
        className={`
          relative flex items-center justify-center
          bg-linear-to-br from-zinc-800 to-zinc-900
          border-2 rounded-sm
          overflow-hidden
          ${className}
        `}
        style={{
          width: size,
          height: size,
          borderColor: categoryColor,
          boxShadow: `0 0 12px ${categoryColor}40, inset 0 1px 0 rgba(255,255,255,0.1)`,
          ...style,
        }}
      >
        {/* Efeito de grid pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(${categoryColor}20 1px, transparent 1px),
              linear-gradient(90deg, ${categoryColor}20 1px, transparent 1px)
            `,
            backgroundSize: '4px 4px',
          }}
        />

        {/* Icone centralizado */}
        <FallbackIcon
          size={iconSize}
          className="relative z-10 drop-shadow-lg"
          style={{
            color: categoryColor,
            filter: `drop-shadow(0 0 4px ${categoryColor}60)`,
          }}
          strokeWidth={2.5}
        />

        {/* Brilho no canto superior */}
        <div
          className="absolute top-0 left-0 w-full h-1/3 opacity-20"
          style={{
            background: `linear-gradient(to bottom, ${categoryColor}, transparent)`,
          }}
        />
      </div>
    )
  }
}

/**
 * Hook para preload de imagens de itens
 * Pode ser usado no inicio do jogo para evitar flash
 */
export function usePreloadItemImages() {
  const preload = () => {
    Object.values(IMAGE_MAP).forEach((src) => {
      const img = new Image()
      img.src = src
    })
  }
  
  return { preload }
}
