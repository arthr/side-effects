import { AnimatePresence } from 'framer-motion'
import { useToasts } from '@/hooks/useToast'
import { Toast } from './Toast'

/**
 * Gerenciador de Toasts Globais
 * Renderiza apenas toasts SEM playerId (toasts globais/genericos)
 * Toasts com playerId sao renderizados pelo PlayerToasts dentro do AnimatedPlayerArea
 */
export function ToastManager() {
  const toasts = useToasts()

  // Filtra apenas toasts globais (sem playerId)
  const globalToasts = toasts.filter((t) => !t.playerId)

  if (globalToasts.length === 0) return null

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none z-50">
      <AnimatePresence mode="popLayout">
        {globalToasts.map((toast) => (
          <Toast key={toast.id} toast={toast} />
        ))}
      </AnimatePresence>
    </div>
  )
}

