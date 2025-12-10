# Evolucao: Suporte a Multiplayer Online

## Contexto Atual

O sistema de IA assume:
- Player1 e sempre o jogador humano local
- Player2 e sempre o oponente (IA ou jogador remoto)
- Apenas 1 IA por partida no modo single player

### Arquivos Afetados para Multiplayer
- `src/stores/gameStore.ts` - estado do jogo precisara sincronizar
- `src/hooks/useAIPlayer.ts` - desativar quando oponente for humano
- `src/hooks/useAIStore.ts` - desativar quando oponente for humano

## Modos de Jogo

### Single Player (atual)
- Player1: jogador humano
- Player2: IA (comportamento atual, sem mudancas necessarias)

### Multiplayer Online (futuro)
- Player1: jogador humano local
- Player2: jogador humano remoto (via WebSocket)
- IA desativada quando ambos jogadores sao humanos

## Evolucao Planejada

### Fase 1: Sistema de Salas
- Criar sala de jogo com codigo/link de convite
- Host aguarda oponente entrar na sala
- Sincronizacao inicial de estado do jogo
- **Prioridade alta:** jogadores atuais sao amigos testando juntos

### Fase 2: Lobby e Matchmaking
- Fila de matchmaking para encontrar oponentes aleatorios
- Sistema de ranking basico
- Historico de partidas

### Fase 3: Resiliencia
- Reconexao automatica em caso de queda
- IA assume temporariamente jogador desconectado (opcional)
- Timeout e vitoria por W.O.

## Mudancas Necessarias

### GameConfig (modo de jogo)
```typescript
type GameMode = 'single_player' | 'multiplayer'

interface GameConfig {
  mode: GameMode
  roomId?: string  // apenas multiplayer
  // ...
}
```

### Novo: RoomService
```typescript
interface Room {
  id: string
  hostId: string
  guestId?: string
  status: 'waiting' | 'ready' | 'playing' | 'finished'
  gameState?: GameState
}

// Operacoes basicas
createRoom(): Promise<Room>
joinRoom(roomId: string): Promise<Room>
leaveRoom(roomId: string): Promise<void>
```

### Sincronizacao de Estado
```typescript
// Eventos que precisam sincronizar (mapear demais necessários)
type GameEvent =
  | { type: 'pill_consumed'; playerId: PlayerId; pillId: string }
  | { type: 'item_used'; playerId: PlayerId; itemId: string; targetId?: PlayerId }
  | { type: 'turn_ended'; playerId: PlayerId }
  | { type: 'store_purchase'; playerId: PlayerId; itemId: string }
```

## Consideracoes de Design

1. **Arquitetura atual preservada:** P1 = local, P2 = oponente (IA ou remoto)
2. **Multiplayer sempre online:** sem modo local (complexidade desnecessaria)
3. **Salas antes de matchmaking:** atender primeiro os early adopters (amigos)
4. **IA como fallback:** considerar para desconexoes em fases futuras

## Referencias
- `src/hooks/useAIPlayer.ts` - hook de controle da IA
- `src/stores/gameStore.ts` - estado central do jogo

