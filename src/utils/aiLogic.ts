import type { Pill } from '@/types'

/**
 * Logica da IA para selecao de pilulas
 * Estrategia basica: selecao aleatoria
 */

/**
 * Seleciona uma pilula aleatoria do pool disponivel
 * @param pillPool Array de pilulas disponiveis (nao reveladas)
 * @returns ID da pilula selecionada ou null se pool vazio
 */
export function selectRandomPill(pillPool: Pill[]): string | null {
  // Filtra apenas pilulas nao reveladas
  const availablePills = pillPool.filter((pill) => !pill.isRevealed)

  if (availablePills.length === 0) {
    return null
  }

  // Seleciona indice aleatorio
  const randomIndex = Math.floor(Math.random() * availablePills.length)
  return availablePills[randomIndex].id
}

/**
 * Retorna um delay aleatorio para simular "pensamento" da IA
 * @returns Delay em milissegundos (entre 1000ms e 2000ms)
 */
export function getAIThinkingDelay(): number {
  const minDelay = 1000 // 1 segundo
  const maxDelay = 2000 // 2 segundos
  return Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay
}

