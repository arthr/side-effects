import type { PillType } from '@/types'

/**
 * Regra de progressao para um tipo de pilula
 */
export interface PillRule {
  /** Rodada minima para a pilula comecar a aparecer */
  unlockRound: number
  /** Probabilidade (%) no momento do desbloqueio */
  startPct: number
  /** Probabilidade (%) na rodada maxima (maxRound) */
  endPct: number
}

/**
 * Configuracao completa de progressao
 */
export interface ProgressionConfig {
  /** Rodada teto para interpolacao */
  maxRound: number
  /** Regras por tipo de pilula */
  rules: Record<PillType, PillRule>
}

/**
 * Configuracao padrao - Single Source of Truth do balanceamento
 *
 * NOTAS DE DESIGN:
 * - Rodada 1 ja tem algum risco (DMG_HIGH 15%) para criar tensao imediata
 * - HEAL desbloqueia rodada 2, ANTES de FATAL, como "valvula de escape"
 * - FATAL limitado a 18% max para evitar late game muito punitivo/aleatorio
 * - LIFE desativado (unlockRound: 99) - ativar quando pronto
 * - maxRound 15 para evitar estagnacao em partidas longas
 */
export const PROGRESSION: ProgressionConfig = {
  maxRound: 15,
  rules: {
    SAFE: { unlockRound: 1, startPct: 45, endPct: 10 },
    DMG_LOW: { unlockRound: 1, startPct: 30, endPct: 15 },
    DMG_HIGH: { unlockRound: 1, startPct: 15, endPct: 25 },
    HEAL: { unlockRound: 2, startPct: 10, endPct: 15 },
    FATAL: { unlockRound: 4, startPct: 5, endPct: 18 },
    LIFE: { unlockRound: 99, startPct: 0, endPct: 0 },
  },
}
