import { AnimatePresence } from 'framer-motion'
import { useToasts } from '@/hooks/useToast'
import { Toast } from './Toast'
import type { PlayerId } from '@/types'

interface PlayerToastsProps {
  /** ID do jogador para filtrar toasts */
  playerId: PlayerId
}

/**
 * Renderiza toasts filtrados por playerId
 * Posicionado acima da area do jogador (via parent)
 */
export function PlayerToasts({ playerId }: PlayerToastsProps) {
  const toasts = useToasts()

  // Filtra toasts deste jogador
  const playerToasts = toasts.filter((t) => t.playerId === playerId)

  if (playerToasts.length === 0) return null

  return (
    <div className="flex flex-col items-center gap-1">
      <AnimatePresence mode="popLayout">
        {playerToasts.map((toast) => (
          <Toast key={toast.id} toast={toast} />
        ))}
      </AnimatePresence>
    </div>
  )
}
