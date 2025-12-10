import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import type { PillShape } from '@/types'
import { SHAPE_LABELS } from '@/utils/constants'
import { ShapeIcon } from './ShapeIcon'

interface ShapeSelectorProps {
  /** Se o seletor esta visivel */
  isOpen: boolean
  /** Shapes disponiveis para selecao (apenas as que existem no pool) */
  availableShapes: PillShape[]
  /** Contagem de cada shape */
  shapeCounts: Record<PillShape, number>
  /** Callback quando uma shape e selecionada */
  onSelect: (shape: PillShape) => void
  /** Callback quando a selecao e cancelada */
  onCancel: () => void
  /** Titulo do seletor (opcional) */
  title?: string
}

/**
 * Componente de selecao de shape para itens como Shape Bomb e Shape Scanner
 * Exibe um modal com todas as shapes disponiveis no pool
 */
export function ShapeSelector({
  isOpen,
  availableShapes,
  shapeCounts,
  onSelect,
  onCancel,
  title = 'Selecione uma Forma',
}: ShapeSelectorProps) {
  // Filtra apenas shapes com count > 0
  const selectableShapes = availableShapes.filter((shape) => shapeCounts[shape] > 0)

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop escuro */}
          <motion.div
            className="absolute inset-0 bg-black/60"
            onClick={onCancel}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal */}
          <motion.div
            className="relative bg-card border-2 border-primary rounded-lg p-6 shadow-xl max-w-md w-11/12"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-foreground">{title}</h3>
              <button
                onClick={onCancel}
                className="p-1 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
                aria-label="Cancelar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Grid de shapes */}
            {selectableShapes.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {selectableShapes.map((shape) => (
                  <motion.button
                    key={shape}
                    onClick={() => onSelect(shape)}
                    className="flex flex-col items-center gap-2 p-3 rounded-lg bg-muted/50 hover:bg-primary/20 border border-transparent hover:border-primary/50 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ShapeIcon shape={shape} size="lg" />
                    <span className="text-xs font-medium text-foreground">
                      {SHAPE_LABELS[shape]}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ({shapeCounts[shape]})
                    </span>
                  </motion.button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma shape disponivel no pool.
              </div>
            )}

            {/* Botao cancelar */}
            <div className="mt-4 pt-4 border-t border-border">
              <button
                onClick={onCancel}
                className="w-full py-2 px-4 rounded bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
              >
                Cancelar
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

