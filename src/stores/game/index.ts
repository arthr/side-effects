/**
 * Game Domain Stores
 *
 * Este modulo contem os stores de dominio do jogo:
 * - effectsStore    - Efeitos de jogador (shield, handcuffs) [EXTRAIDO]
 * - gameFlowStore   - Fases, turnos, rodadas, winner (TODO)
 * - pillPoolStore   - Pool de pilulas, consumo, reveal (TODO)
 * - playerStore     - Vidas, resistencia, maximos (TODO)
 * - inventoryStore  - Itens, selecao, uso (TODO)
 * - shopStore       - Pill Store, carrinho, boosts (TODO)
 *
 * @see ADR-001-store-decomposition.md
 */

// Stores extraidos
export * from './effectsStore'

// TODO: Fase 2 - Extrair stores restantes
// export * from './gameFlowStore'
// export * from './pillPoolStore'
// export * from './playerStore'
// export * from './inventoryStore'
// export * from './shopStore'

// Retrocompatibilidade: re-exporta do store legado
export * from '../gameStore'

