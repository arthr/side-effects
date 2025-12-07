import { AnimatePresence, motion } from 'framer-motion'
import type { PlayerId, InventoryItem } from '@/types'
import { InventorySlot } from './InventorySlot'

interface InventoryBarProps {
  /** ID do jogador dono do inventario */
  playerId: PlayerId
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

/**
 * Barra horizontal de inventario
 * Exibe os itens do jogador durante a partida
 */
export function InventoryBar({
  items,
  maxSlots = 5,
  usingItemId = null,
  disabled = false,
  onItemClick,
}: InventoryBarProps) {
  // Cria array de slots (preenchidos + vazios)
  const slots: (InventoryItem | undefined)[] = []
  for (let i = 0; i < maxSlots; i++) {
    slots.push(items[i])
  }

  return (
    <motion.div
      className="flex gap-1.5 p-2 bg-muted/30 rounded-lg"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <AnimatePresence mode="popLayout">
        {slots.map((item, index) => (
          <motion.div
            key={item?.id ?? `empty-${index}`}
            layout
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <InventorySlot
              item={item}
              disabled={disabled || !item}
              isUsing={item?.id === usingItemId}
              onClick={item && onItemClick ? () => onItemClick(item.id) : undefined}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  )
}
