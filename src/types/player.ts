import type { PlayerInventory } from './item'

/**
 * Identificador unico do jogador (UUID de sessao)
 * 
 * PlayerId agora e um UUID v4 gerado na criacao da partida/sala.
 * Nao carrega semantica de ordem/posicao.
 * 
 * Para ordem de turnos/renderizacao, use `playerOrder: PlayerId[]`.
 * Para exibir "P1/P2/P3" na UI, use `getSeatLabel(playerId, playerOrder)`.
 * 
 * @example
 * "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
 * 
 * @see .specs/playerid-uuid/plan.md
 */
export type PlayerId = string

/**
 * Tipo de efeito ativo no jogador
 */
export type PlayerEffectType = 'shield' | 'handcuffed'

/**
 * Efeito ativo no jogador (ex: Shield, Handcuffs)
 */
export interface PlayerEffect {
  /** Tipo do efeito */
  type: PlayerEffectType
  /** Rodadas restantes do efeito */
  roundsRemaining: number
}

/**
 * Representa um jogador no jogo
 */
export interface Player {
  /** ID unico do jogador (UUID de sessao) */
  id: PlayerId
  /**
   * ID do usuario autenticado (Supabase Auth UUID)
   * - null = Guest ou Bot (sem persistencia de stats)
   * - string = Usuario autenticado (com persistencia)
   * @see architecture.md#PlayerId-vs-UserId
   */
  userId: string | null
  /** Nome de exibicao */
  name: string
  /** Vidas atuais (0 = eliminado) */
  lives: number
  /** Maximo de vidas */
  maxLives: number
  /** Resistencia atual (HP temporario) */
  resistance: number
  /** Maximo de resistencia */
  maxResistance: number
  /** Se o jogador e controlado por IA */
  isAI: boolean
  /** Inventario de itens do jogador */
  inventory: PlayerInventory
  /** Efeitos ativos no jogador */
  effects: PlayerEffect[]
  /** Quantidade de Pill Coins acumuladas */
  pillCoins: number
  /** Toggle: jogador quer visitar Pill Store ao fim da rodada */
  wantsStore: boolean
}

/**
 * Configuracao inicial do jogador
 */
export interface PlayerConfig {
  /** Nome do jogador */
  name: string
  /** Vidas iniciais */
  lives: number
  /** Resistencia inicial */
  resistance: number
  /** Se e controlado por IA */
  isAI: boolean
}

/**
 * Resultado de aplicar efeito ao jogador
 */
export interface PlayerEffectResult {
  /** Novo estado do jogador */
  player: Player
  /** Se houve colapso (resistencia <= 0) */
  collapsed: boolean
  /** Se o jogador foi eliminado (vidas <= 0) */
  eliminated: boolean
  /** Dano total recebido */
  damageDealt: number
  /** Cura total recebida */
  healReceived: number
  /** Vidas restauradas (para pilula LIFE) */
  livesRestored: number
}

