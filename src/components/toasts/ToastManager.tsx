import { AnimatePresence } from 'framer-motion'
import { useToasts } from '@/hooks/useToast'
import { Toast } from './Toast'

/**
 * Gerenciador de Toasts
 * Renderiza todos os toasts ativos com AnimatePresence
 *
 * Deve ser colocado no nivel raiz da aplicacao (App.tsx)
 */
export function ToastManager() {
  const toasts = useToasts()

  return (
    <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
      <AnimatePresence mode="sync">
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} />
        ))}
      </AnimatePresence>
    </div>
  )
}

