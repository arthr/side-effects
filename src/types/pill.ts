/**
 * Tipos de pilulas disponiveis no jogo
 * Conforme documentacao em docs/GAME-IDEA.md
 */
export type PillType = 'SAFE' | 'DMG_LOW' | 'DMG_HIGH' | 'FATAL' | 'HEAL' | 'LIFE'

/**
 * Formas visuais das pilulas (16 shapes com imagens PNG)
 * Desbloqueadas progressivamente conforme rodadas avancam
 */
export type PillShape =
  | 'capsule'    // shape_1 - Rodada 1
  | 'round'      // shape_6 - Rodada 1
  | 'triangle'   // shape_8 - Rodada 2
  | 'oval'       // shape_11 - Rodada 2
  | 'cross'      // shape_2 - Rodada 3
  | 'heart'      // shape_9 - Rodada 3
  | 'flower'     // shape_4 - Rodada 4
  | 'star'       // shape_13 - Rodada 4
  | 'pumpkin'    // shape_12 - Rodada 5
  | 'coin'       // shape_14 - Rodada 5
  | 'bear'       // shape_5 - Rodada 6
  | 'gem'        // shape_15 - Rodada 6
  | 'skull'      // shape_3 - Rodada 7
  | 'domino'     // shape_16 - Rodada 7
  | 'pineapple'  // shape_7 - Rodada 8
  | 'fruit'      // shape_10 - Rodada 8

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

