# Evolucao: Suporte a Multiplayer e IA Flexivel

## Contexto Atual

O sistema de IA assume:
- Player2 e sempre a IA
- Player1 e sempre humano
- Apenas 1 IA por partida

### Arquivos Afetados
- `src/hooks/useAIStore.ts` - hardcoded player2
- `src/hooks/useAIItemSelection.ts` - hardcoded player2

## Evolucao Planejada

### Fase 1: Single Player Flexivel
- Permitir player1 OU player2 ser IA
- Parametrizar IDs nos hooks

### Fase 2: Multiplayer Local
- 2 jogadores humanos no mesmo dispositivo
- IA opcional como terceiro modo

### Fase 3: Multiplayer Online
- Matchmaking e sincronizacao de estado
- IA como fallback para desconexao

## Mudancas Necessarias

### useAIStore.ts
```typescript
// Atual (hardcoded)
const aiPlayer = state.players.player2
const opponent = state.players.player1

// Proposto (parametrizado)
export function useAIStore(aiPlayerId: PlayerId) {
  const opponentId = aiPlayerId === 'player1' ? 'player2' : 'player1'
  const aiPlayer = state.players[aiPlayerId]
  const opponent = state.players[opponentId]
}
```

### useAIItemSelection.ts
```typescript
// Atual (hardcoded)
const isPlayer2AI = useGameStore((state) => state.players.player2.isAI)

// Proposto (parametrizado)
export function useAIItemSelection(playerId: PlayerId) {
  const isAI = useGameStore((state) => state.players[playerId].isAI)
}
```

### GameConfig
```typescript
// Proposto: definir qual(is) jogador(es) sao IA
interface GameConfig {
  player1: { name: string; isAI: boolean }
  player2: { name: string; isAI: boolean }
  // ...
}
```

## Consideracoes de Design

1. **Backwards Compatibility:** Manter comportamento padrao (player2 = IA)
2. **Performance:** Evitar re-renders desnecessarios ao parametrizar hooks
3. **Testing:** Facilitar testes com diferentes configuracoes de IA
4. **Multiplayer:** Preparar arquitetura para sincronizacao de estado

## Referencias
- `src/hooks/useAIStore.ts` - Ver @limitation no JSDoc
- `src/hooks/useAIPlayer.ts` - Ja usa playerId parametrizado

