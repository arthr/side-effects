import { useState, useCallback, useRef, useEffect } from 'react'
import type { Pill, PillType, PlayerEffectResult } from '@/types'
import { useGameStore } from '@/stores/gameStore'
import { useOverlayStore } from '@/stores/overlayStore'
import { useToastStore, type ToastType } from '@/stores/toastStore'
import { applyPillEffect } from '@/utils/gameLogic'

type ConsumptionPhase = 'idle' | 'revealing' | 'feedback'

interface ConsumptionState {
  phase: ConsumptionPhase
  revealedPill: Pill | null
  effect: PlayerEffectResult | null
  feedbackType: ToastType | null
  targetPlayer: 'player1' | 'player2' | null
}

/**
 * Hook para gerenciar o fluxo completo de consumo de pilula
 * Integrado com overlay e toast stores
 *
 * Fluxo:
 * 1. startConsumption -> abre PillReveal overlay
 * 2. confirmReveal -> aplica efeito, mostra toast
 * 3. completeFeedback -> volta ao idle
 *
 * Deteccao automatica de nova rodada abre NewRound overlay
 */
export function usePillConsumption() {
  const [state, setState] = useState<ConsumptionState>({
    phase: 'idle',
    revealedPill: null,
    effect: null,
    feedbackType: null,
    targetPlayer: null,
  })

  // Game store
  const consumePill = useGameStore((s) => s.consumePill)
  const currentTurn = useGameStore((s) => s.currentTurn)
  const players = useGameStore((s) => s.players)
  const getPillById = useGameStore((s) => s.getPillById)
  const round = useGameStore((s) => s.round)
  const pillPoolLength = useGameStore((s) => s.pillPool.length)

  // Overlay store
  const openPillReveal = useOverlayStore((s) => s.openPillReveal)
  const openNewRound = useOverlayStore((s) => s.openNewRound)
  const currentOverlay = useOverlayStore((s) => s.current)

  // Toast store
  const showToast = useToastStore((s) => s.show)

  // Ref para rastrear a rodada anterior
  const prevRoundRef = useRef(round)

  // Detecta mudanca de rodada e abre overlay
  useEffect(() => {
    if (round > prevRoundRef.current && prevRoundRef.current > 0) {
      // Abre overlay de nova rodada
      openNewRound(round)
    }
    prevRoundRef.current = round
  }, [round, openNewRound])

  /**
   * Determina tipo de toast baseado no efeito
   */
  const determineFeedbackType = (
    _pillType: PillType,
    effect: PlayerEffectResult
  ): ToastType => {
    if (effect.collapsed) return 'collapse'
    if (effect.eliminated) return 'fatal'
    if (effect.damageDealt > 0) return 'damage'
    if (effect.healReceived > 0) return 'heal'
    return 'safe'
  }

  /**
   * Gera mensagem de feedback baseada no efeito
   */
  const getFeedbackMessage = useCallback((effect: PlayerEffectResult | null): string => {
    if (!effect) return 'Nada aconteceu'

    if (effect.eliminated) {
      return 'FATAL! Eliminado!'
    }
    if (effect.collapsed) {
      return 'COLAPSO! Perdeu 1 vida'
    }
    if (effect.damageDealt > 0) {
      return 'Dano na resistencia'
    }
    if (effect.healReceived > 0) {
      return 'Resistencia restaurada'
    }
    return 'Pilula segura!'
  }, [])

  /**
   * Inicia o fluxo de consumo
   * Abre o overlay de revelacao
   */
  const startConsumption = useCallback(
    (pillId: string) => {
      const pill = getPillById(pillId)
      if (!pill) return

      const currentPlayer = players[currentTurn]
      if (!currentPlayer) return

      // Simula o efeito para preview
      const revealedPill: Pill = { ...pill, isRevealed: true }
      const effect = applyPillEffect(revealedPill, currentPlayer)
      const feedbackType = determineFeedbackType(pill.type, effect)

      // Atualiza estado local
      setState({
        phase: 'revealing',
        revealedPill,
        effect,
        feedbackType,
        targetPlayer: currentTurn,
      })

      // Abre overlay de revelacao
      openPillReveal(revealedPill, currentPlayer.isAI)
    },
    [getPillById, currentTurn, players, openPillReveal]
  )

  /**
   * Chamado quando overlay de revelacao fecha
   * Aplica efeito e mostra toast de feedback
   */
  const confirmReveal = useCallback(() => {
    if (!state.revealedPill || !state.feedbackType) return

    // Aplica o efeito no store
    consumePill(state.revealedPill.id)

    // Mostra toast de feedback
    showToast({
      type: state.feedbackType,
      message: getFeedbackMessage(state.effect),
      pillType: state.revealedPill.type,
      value: state.effect?.damageDealt || state.effect?.healReceived || undefined,
    })

    // Fase 2: Feedback (breve, para animacoes)
    setState((prev) => ({
      ...prev,
      phase: 'feedback',
    }))
  }, [state.revealedPill, state.feedbackType, state.effect, consumePill, showToast, getFeedbackMessage])

  /**
   * Finaliza o fluxo e volta ao idle
   */
  const completeFeedback = useCallback(() => {
    setState({
      phase: 'idle',
      revealedPill: null,
      effect: null,
      feedbackType: null,
      targetPlayer: null,
    })
  }, [])

  // Auto-complete feedback apos um breve delay
  useEffect(() => {
    if (state.phase === 'feedback') {
      const timer = setTimeout(() => {
        completeFeedback()
      }, 100) // Breve delay para permitir animacoes no GameBoard
      return () => clearTimeout(timer)
    }
  }, [state.phase, completeFeedback])

  // Sincroniza com overlay store - quando overlay fecha, confirma revelacao
  useEffect(() => {
    // Se estava revelando e overlay fechou, confirma
    if (state.phase === 'revealing' && currentOverlay === null && state.revealedPill) {
      confirmReveal()
    }
  }, [currentOverlay, state.phase, state.revealedPill, confirmReveal])

  return {
    // Estado
    phase: state.phase,
    revealedPill: state.revealedPill,
    effect: state.effect,
    feedbackType: state.feedbackType,
    targetPlayer: state.targetPlayer,
    isProcessing: state.phase !== 'idle',
    round,
    pillPoolLength,

    // Acoes
    startConsumption,
    confirmReveal,
    completeFeedback,

    // Helpers
    getFeedbackMessage: () => getFeedbackMessage(state.effect),
  }
}
