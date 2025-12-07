import { useCallback } from 'react'
import { useToastStore, type ToastData, type ToastType } from '@/stores/toastStore'

/**
 * Hook para gerenciar toasts
 *
 * @example
 * const { toast, dismiss, clear } = useToast()
 *
 * // Exibir toast
 * toast({ type: 'damage', message: 'Voce sofreu dano!', value: 15 })
 *
 * // Helpers tipados
 * toast.damage('Voce sofreu dano!', 15)
 * toast.heal('Voce se curou!', 10)
 */
export function useToast() {
  const show = useToastStore((s) => s.show)
  const dismiss = useToastStore((s) => s.dismiss)
  const clear = useToastStore((s) => s.clear)
  const toasts = useToastStore((s) => s.toasts)

  /**
   * Exibe um toast com dados completos
   */
  const toast = useCallback(
    (data: ToastData) => {
      show(data)
    },
    [show]
  )

  /**
   * Helper para toast de dano
   */
  const damage = useCallback(
    (message: string, value?: number) => {
      show({ type: 'damage', message, value })
    },
    [show]
  )

  /**
   * Helper para toast de cura
   */
  const heal = useCallback(
    (message: string, value?: number) => {
      show({ type: 'heal', message, value })
    },
    [show]
  )

  /**
   * Helper para toast de colapso
   */
  const collapse = useCallback(
    (message: string) => {
      show({ type: 'collapse', message })
    },
    [show]
  )

  /**
   * Helper para toast seguro
   */
  const safe = useCallback(
    (message: string) => {
      show({ type: 'safe', message })
    },
    [show]
  )

  /**
   * Helper para toast fatal
   */
  const fatal = useCallback(
    (message: string, value?: number) => {
      show({ type: 'fatal', message, value })
    },
    [show]
  )

  // Adiciona helpers como propriedades da funcao toast
  const toastWithHelpers = Object.assign(toast, {
    damage,
    heal,
    collapse,
    safe,
    fatal,
  })

  return {
    toast: toastWithHelpers,
    toasts,
    dismiss,
    clear,
  }
}

/**
 * Selector para lista de toasts (uso em ToastManager)
 */
export function useToasts() {
  return useToastStore((s) => s.toasts)
}

/**
 * Selector para action de dismiss (uso em Toast individual)
 */
export function useToastDismiss() {
  return useToastStore((s) => s.dismiss)
}

// Re-export types
export type { ToastData, ToastType }

