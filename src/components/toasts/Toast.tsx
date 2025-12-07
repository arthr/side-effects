import { useEffect } from 'react'
import { motion } from 'framer-motion'
import type { Toast as ToastType, ToastType as ToastVariant } from '@/stores/toastStore'
import { useToastDismiss } from '@/hooks/useToast'
import { PILL_LABELS } from '@/utils/constants'

interface ToastProps {
  toast: ToastType
}

/**
 * Estilos por tipo de toast
 */
const toastStyles: Record<ToastVariant, { bg: string; text: string; icon: string }> = {
  damage: { bg: 'bg-red-500/90', text: 'text-white', icon: '-' },
  heal: { bg: 'bg-emerald-500/90', text: 'text-white', icon: '+' },
  collapse: { bg: 'bg-purple-600/90', text: 'text-white', icon: '!' },
  safe: { bg: 'bg-green-500/90', text: 'text-white', icon: '~' },
  fatal: { bg: 'bg-purple-900/90', text: 'text-white', icon: 'X' },
}

/**
 * Componente individual de Toast
 * Auto-dismiss apos duration
 */
export function Toast({ toast }: ToastProps) {
  const dismiss = useToastDismiss()
  const styles = toastStyles[toast.type]

  // Auto-dismiss apos duration
  useEffect(() => {
    const timer = setTimeout(() => {
      dismiss(toast.id)
    }, toast.duration)

    return () => clearTimeout(timer)
  }, [toast.id, toast.duration, dismiss])

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.5, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: -20 }}
      transition={{ duration: 0.3 }}
      className="pointer-events-none"
    >
      <div
        className={`
          ${styles.bg}
          ${styles.text}
          px-6 py-4 rounded-xl shadow-2xl
          flex flex-col items-center gap-2
        `}
      >
        {toast.value !== undefined && (
          <span className="text-4xl font-bold">
            {styles.icon}
            {Math.abs(toast.value)}
          </span>
        )}
        <span className="text-lg font-medium">{toast.message}</span>
        {toast.pillType && (
          <span className="text-sm opacity-80">{PILL_LABELS[toast.pillType]}</span>
        )}
      </div>
    </motion.div>
  )
}

