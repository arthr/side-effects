import type { PlayerId } from '@/types'

/**
 * Funcoes puras para gerenciamento de turnos em partidas N-jogadores
 *
 * @see .specs/refactor-game-store/plan.md
 */

/**
 * Retorna o proximo jogador na rotacao circular
 *
 * @param currentTurn - Jogador com o turno atual
 * @param playerOrder - Array com a ordem dos jogadores na partida
 * @param alivePlayers - Jogadores ainda vivos (opcional, filtra eliminados)
 * @returns PlayerId do proximo jogador
 *
 * @example
 * // Rotacao simples
 * getNextTurn('player1', ['player1', 'player2', 'player3'])
 * // => 'player2'
 *
 * @example
 * // Rotacao circular (volta ao inicio)
 * getNextTurn('player3', ['player1', 'player2', 'player3'])
 * // => 'player1'
 *
 * @example
 * // Pula jogador eliminado
 * getNextTurn('player1', ['player1', 'player2', 'player3'], ['player1', 'player3'])
 * // => 'player3' (player2 esta eliminado)
 */
export function getNextTurn(
  currentTurn: PlayerId,
  playerOrder: PlayerId[],
  alivePlayers?: PlayerId[]
): PlayerId {
  if (playerOrder.length === 0) {
    throw new Error('playerOrder cannot be empty')
  }

  // Se alivePlayers fornecido, filtra apenas jogadores vivos
  const activePlayers = alivePlayers
    ? playerOrder.filter((p) => alivePlayers.includes(p))
    : playerOrder

  if (activePlayers.length === 0) {
    throw new Error('No active players remaining')
  }

  // Se apenas 1 jogador ativo, retorna ele mesmo
  if (activePlayers.length === 1) {
    return activePlayers[0]
  }

  const currentIndex = activePlayers.indexOf(currentTurn)

  // Se jogador atual nao esta na lista (foi eliminado), retorna primeiro ativo
  if (currentIndex === -1) {
    return activePlayers[0]
  }

  // Rotacao circular
  const nextIndex = (currentIndex + 1) % activePlayers.length
  return activePlayers[nextIndex]
}

/**
 * Retorna jogadores que podem ser alvos de acoes
 * Exclui o jogador atual e opcionalmente jogadores eliminados
 *
 * @param currentPlayer - Jogador executando a acao
 * @param allPlayers - Todos os jogadores da partida
 * @param alivePlayers - Jogadores ainda vivos (opcional)
 * @returns Array de PlayerIds que podem ser alvos
 *
 * @example
 * // Todos podem ser alvos exceto o jogador atual
 * getTargetablePlayers('player1', ['player1', 'player2', 'player3'])
 * // => ['player2', 'player3']
 *
 * @example
 * // Filtra eliminados
 * getTargetablePlayers('player1', ['player1', 'player2', 'player3'], ['player1', 'player3'])
 * // => ['player3'] (player2 esta eliminado)
 */
export function getTargetablePlayers(
  currentPlayer: PlayerId,
  allPlayers: PlayerId[],
  alivePlayers?: PlayerId[]
): PlayerId[] {
  // Filtra jogadores vivos se fornecido
  const activePlayers = alivePlayers
    ? allPlayers.filter((p) => alivePlayers.includes(p))
    : allPlayers

  // Remove o jogador atual da lista de alvos
  return activePlayers.filter((p) => p !== currentPlayer)
}

/**
 * Verifica se ainda existem jogadores suficientes para continuar o jogo
 *
 * @param alivePlayers - Array de jogadores vivos
 * @param minPlayers - Minimo de jogadores para continuar (default: 2)
 * @returns true se jogo pode continuar
 */
export function canGameContinue(
  alivePlayers: PlayerId[],
  minPlayers: number = 2
): boolean {
  return alivePlayers.length >= minPlayers
}

/**
 * Retorna o vencedor se apenas 1 jogador restante
 *
 * @param alivePlayers - Array de jogadores vivos
 * @returns PlayerId do vencedor ou null se jogo continua
 */
export function getWinner(alivePlayers: PlayerId[]): PlayerId | null {
  if (alivePlayers.length === 1) {
    return alivePlayers[0]
  }
  return null
}

