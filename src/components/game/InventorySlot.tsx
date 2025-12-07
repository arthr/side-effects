import { motion } from 'framer-motion'
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
} from 'lucide-react'
import type { InventoryItem } from '@/types'
import { ITEM_CATALOG, CATEGORY_BG_COLORS } from '@/utils/itemCatalog'

// Mapeamento de nomes de icones para componentes
const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Search,
  RefreshCw,
  CopyPlus,
  Pill: PillIcon,
  Shield,
  Lock,
  Utensils,
  Shuffle,
  Trash2,
}

interface InventorySlotProps {
  /** Item no slot (undefined = vazio) */
  item?: InventoryItem
  /** Se o slot esta desabilitado */
  disabled?: boolean
  /** Se o item esta sendo usado (highlight) */
  isUsing?: boolean
  /** Callback ao clicar */
  onClick?: () => void
}

/**
 * Slot individual do inventario
 * Exibe um item ou um espaco vazio
 */
export function InventorySlot({
  item,
  disabled = false,
  isUsing = false,
  onClick,
}: InventorySlotProps) {
  // Slot vazio
  if (!item) {
    return (
      <div
        className="
          w-10 h-10 rounded-md
          border-2 border-dashed border-muted-foreground/30
          bg-muted/20
        "
        aria-label="Slot vazio"
      />
    )
  }

  // Slot com item
  const itemDef = ITEM_CATALOG[item.type]
  const IconComponent = ICON_MAP[itemDef.icon]
  const bgColor = CATEGORY_BG_COLORS[itemDef.category]

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={`
        w-10 h-10 rounded-md
        flex items-center justify-center
        border-2 transition-all duration-200
        focus:outline-none focus-visible:ring-2 focus-visible:ring-primary
        ${bgColor}
        ${disabled
          ? 'opacity-40 cursor-not-allowed border-muted'
          : 'cursor-pointer hover:brightness-125'
        }
        ${isUsing
          ? 'border-primary ring-2 ring-primary/50'
          : 'border-transparent hover:border-primary/50'
        }
      `}
      whileHover={!disabled ? { scale: 1.1 } : undefined}
      whileTap={!disabled ? { scale: 0.95 } : undefined}
      // Animacao de pulse quando usando
      animate={
        isUsing
          ? {
              scale: [1, 1.05, 1],
              transition: {
                duration: 1,
                repeat: Infinity,
                ease: 'easeInOut',
              },
            }
          : undefined
      }
      aria-label={`${itemDef.name}: ${itemDef.description}`}
      title={`${itemDef.name}: ${itemDef.description}`}
    >
      {IconComponent && (
        <IconComponent
          size={20}
          className={itemDef.color}
        />
      )}
    </motion.button>
  )
}
