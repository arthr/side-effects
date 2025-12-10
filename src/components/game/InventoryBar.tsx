import { AnimatePresence, motion } from 'framer-motion'
import type { InventoryItem, ItemType } from '@/types'
import { InventorySlot } from './InventorySlot'

interface InventoryBarProps {
  /** Itens no inventario */
  items: InventoryItem[]
  /** Numero maximo de slots */
  maxSlots?: number
  /** ID do item sendo usado (para highlight) */
  usingItemId?: string | null
  /** Se a barra esta desabilitada (turno do oponente) */
  disabled?: boolean
  /** Callback ao clicar em um item */
  onItemClick?: (itemId: string) => void
}

/** Representa um grupo de itens do mesmo tipo */
interface GroupedItem {
  /** Primeiro item do grupo (usado para ID e referencia) */
  item: InventoryItem
  /** Tipo do item */
  type: ItemType
  /** Quantidade total deste tipo */
  count: number
  /** IDs de todos os itens neste grupo */
  ids: string[]
}

/**
 * Agrupa itens do mesmo tipo para exibicao compacta
 * Mantém a ordem de primeira aparicao de cada tipo
 */
function groupItemsByType(items: InventoryItem[]): GroupedItem[] {
  const groups = new Map<ItemType, GroupedItem>()
  
  for (const item of items) {
    const existing = groups.get(item.type)
    if (existing) {
      existing.count++
      existing.ids.push(item.id)
    } else {
      groups.set(item.type, {
        item,
        type: item.type,
        count: 1,
        ids: [item.id],
      })
    }
  }
  
  return Array.from(groups.values())
}

/**
 * Variantes para container da barra
 */
const barVariants = {
  initial: { opacity: 0, y: 10 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      staggerChildren: 0.05,
    },
  },
}

/**
 * Variantes para cada slot wrapper (entrada/saida)
 */
const slotWrapperVariants = {
  initial: {
    scale: 0,
    opacity: 0,
    y: 20,
  },
  animate: {
    scale: 1,
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 400,
      damping: 20,
    },
  },
  exit: {
    scale: 0,
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.2,
      ease: 'easeIn' as const,
    },
  },
}

/**
 * Barra horizontal de inventario
 * Exibe os itens do jogador durante a partida
 * Itens do mesmo tipo sao agrupados com contador
 */
export function InventoryBar({
  items,
  maxSlots = 5,
  usingItemId = null,
  disabled = false,
  onItemClick,
}: InventoryBarProps) {
  // Agrupa itens do mesmo tipo
  const groupedItems = groupItemsByType(items)
  
  // Cria array de slots (grupos + vazios)
  const slots: (GroupedItem | undefined)[] = []
  for (let i = 0; i < maxSlots; i++) {
    slots.push(groupedItems[i])
  }

  return (
    <motion.div
      className="flex gap-1.5 p-2 bg-muted/30 rounded-lg"
      variants={barVariants}
      initial="initial"
      animate="animate"
    >
      <AnimatePresence mode="popLayout">
        {slots.map((group, index) => {
          // Verifica se algum item do grupo esta sendo usado
          const isUsingGroup = group?.ids.includes(usingItemId ?? '') ?? false
          
          return (
            <motion.div
              key={group?.type ?? `empty-${index}`}
              layout
              variants={slotWrapperVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <InventorySlot
                item={group?.item}
                count={group?.count}
                disabled={disabled || !group}
                isUsing={isUsingGroup}
                onClick={
                  group && onItemClick
                    ? () => onItemClick(group.item.id)
                    : undefined
                }
              />
            </motion.div>
          )
        })}
      </AnimatePresence>
    </motion.div>
  )
}
