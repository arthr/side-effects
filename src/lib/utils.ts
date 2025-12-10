import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Valida nome de jogador para multiplayer
 * @param name - Nome a validar
 * @returns Mensagem de erro ou null se valido
 */
export function validatePlayerName(name: string): string | null {
  const trimmed = name.trim()
  if (!trimmed) return 'Digite seu nome'
  if (trimmed.length < 2) return 'Nome muito curto (minimo 2 caracteres)'
  if (trimmed.length > 20) return 'Nome muito longo (maximo 20 caracteres)'
  return null
}
