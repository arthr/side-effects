/**
 * Tipos de pilulas disponiveis no jogo
 * Conforme documentacao em docs/GAME-IDEA.md
 */
export type PillType = 'SAFE' | 'DMG_LOW' | 'DMG_HIGH' | 'FATAL' | 'HEAL' | 'LIFE'

/**
 * Formas visuais das pilulas (16 shapes com imagens PNG)
 * 
 * SISTEMA DE SHAPES:
 * - Shapes ATIVAS: configuradas em SHAPE_PROGRESSION com startPct/endPct > 0
 * - Shapes SAZONAIS: desabilitadas (pct: 0) e ativadas em eventos especiais
 * 
 * Consulte src/utils/shapeProgression.ts para configuracao atual de shapes ativas.
 */
export type PillShape =
  | 'capsule'    // shape_1 - Sazonal
  | 'round'      // shape_6 - Ativa (base)
  | 'triangle'   // shape_8 - Sazonal
  | 'oval'       // shape_11 - Sazonal
  | 'cross'      // shape_2 - Sazonal
  | 'heart'      // shape_9 - Sazonal
  | 'flower'     // shape_4 - Ativa (rodada 1)
  | 'star'       // shape_13 - Sazonal
  | 'pumpkin'    // shape_12 - Ativa (rodada 3)
  | 'coin'       // shape_14 - Sazonal
  | 'bear'       // shape_5 - Ativa (rodada 5)
  | 'gem'        // shape_15 - Sazonal
  | 'skull'      // shape_3 - Ativa (rodada 3)
  | 'domino'     // shape_16 - Sazonal
  | 'pineapple'  // shape_7 - Sazonal
  | 'fruit'      // shape_10 - Ativa (rodada 1)

/**
 * Estatisticas de efeito da pilula
 */
export interface PillStats {
  /** Dano causado (0 para SAFE/HEAL, 1-2 para DMG_LOW, 3-4 para DMG_HIGH, 999 para FATAL) */
  damage: number
  /** Se a pilula e fatal (zera resistencia instantaneamente) */
  isFatal: boolean
  /** Quantidade de cura (0 para nao-cura, 2+ para HEAL) */
  heal: number
  /** Quantidade de vidas restauradas (para pilula LIFE) */
  livesRestore: number
}

/**
 * Propriedades visuais da pilula
 */
export interface PillVisuals {
  /** Cor da pilula (real quando revelada, neutra quando oculta) */
  color: string
  /** Forma da pilula */
  shape: PillShape
  /** Label exibido (tipo real quando revelada, "???" quando oculta) */
  label: string
}

/**
 * Representa uma pilula no pool da mesa
 */
export interface Pill {
  /** ID unico da pilula */
  id: string
  /** Tipo da pilula (determina o efeito) */
  type: PillType
  /** Se a pilula foi revelada para os jogadores */
  isRevealed: boolean
  /** Estatisticas de efeito */
  stats: PillStats
  /** Propriedades visuais */
  visuals: PillVisuals
  /** Se o efeito da pilula esta invertido (dano vira cura, cura vira dano) */
  inverted?: boolean
  /** Se o efeito da pilula esta dobrado */
  doubled?: boolean
}

/**
 * Configuracao para geracao de pilulas
 */
export interface PillConfig {
  /** Dano minimo e maximo para cada tipo */
  damageRange: {
    DMG_LOW: [number, number]
    DMG_HIGH: [number, number]
  }
  /** Quantidade de cura para HEAL */
  healAmount: number
}

