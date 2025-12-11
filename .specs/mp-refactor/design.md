# Design: MP-Refactor (Multiplayer State Architecture Refactor)

## Arquitetura Atual (Problematica)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        ARQUITETURA ATUAL (COM PROBLEMAS)                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  gameStore                           multiplayerStore                       │
│  ┌─────────────────────┐            ┌─────────────────────┐                │
│  │ mode: GameMode      │◄──DUPLICA──│ mode (implicito)    │                │
│  │ roomId: string|null │◄──DUPLICA──│ room.id             │                │
│  │ players, pillPool...│            │ localRole, room...  │                │
│  └─────────────────────┘            └─────────────────────┘                │
│           │                                   │                             │
│           │ emitMultiplayerEvent()           │                             │
│           │ (se mode === 'multiplayer'       │                             │
│           │  && !isSyncingFromRemote)        │                             │
│           ▼                                   │                             │
│  ┌─────────────────────┐                     │                             │
│  │  FLAG GLOBAL        │                     │                             │
│  │  isSyncingFromRemote│◄────────────────────┘                             │
│  └─────────────────────┘     (usado em applyRemoteEvent)                   │
│           │                                                                 │
│           ▼                                                                 │
│  [Eventos individuais: pill_consumed, item_used, selection_confirmed...]   │
│           │                                                                 │
│           ▼                                                                 │
│  [4+ caminhos de sync: applyRemoteEvent, state_sync, game_started, ...]    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Arquitetura Proposta

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          ARQUITETURA PROPOSTA                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  gameStore                           multiplayerStore                       │
│  ┌─────────────────────┐            ┌─────────────────────┐                │
│  │ (estado puro)       │            │ mode: GameMode      │ ◄── UNICA      │
│  │ players, pillPool   │            │ room: Room | null   │     FONTE      │
│  │ phase, currentTurn  │            │ localRole, etc      │                │
│  │ (sem mode/roomId)   │            └─────────────────────┘                │
│  └─────────────────────┘                     │                             │
│           ▲                                   │                             │
│           │                                   │                             │
│           │ setState() direto                │ isMultiplayerMode()         │
│           │ (Guest apenas recebe)            │ getLocalRole()              │
│           │                                   ▼                             │
│  ┌─────────────────────────────────────────────────────────────┐           │
│  │                    FLUXO HOST AUTHORITATIVE                  │           │
│  │                                                              │           │
│  │  GUEST                              HOST                     │           │
│  │  [intent_*] ──────────────────────► [Executa acao]          │           │
│  │                                          │                   │           │
│  │                                          ▼                   │           │
│  │  [setState] ◄─── state_update ◄── [broadcastState()]        │           │
│  │                                                              │           │
│  │  Um unico evento de sincronizacao: state_update              │           │
│  │  Eventos legados mantidos apenas para feedback visual        │           │
│  └─────────────────────────────────────────────────────────────┘           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Fase 1: Unificar Fonte de Verdade do Modo

### Objetivo
Remover duplicacao de `mode` e `roomId` entre os stores.

### Mudancas em Types

#### `src/types/game.ts`

```typescript
// ANTES
export interface GameState {
  mode: GameMode          // REMOVER
  roomId: string | null   // REMOVER
  // ... resto
}

export interface GameConfig {
  mode: GameMode          // REMOVER
  roomId?: string         // REMOVER
  // ... resto
}

// DEPOIS
export interface GameState {
  // Sem mode/roomId - vem do multiplayerStore
  phase: GamePhase
  currentTurn: PlayerId
  players: Record<PlayerId, Player>
  // ... resto
}

export interface GameConfig {
  // Sem mode/roomId
  player1: { name: string; isAI: boolean }
  player2: { name: string; isAI: boolean }
  startingLives: number
  startingResistance: number
  difficulty: DifficultyLevel
}
```

### Novos Helpers

#### `src/stores/multiplayerStore.ts` (adicoes)

```typescript
// Helpers exportados para uso em todo o app
export function isMultiplayerMode(): boolean {
  return useMultiplayerStore.getState().mode === 'multiplayer'
}

export function getLocalRole(): LocalRole | null {
  return useMultiplayerStore.getState().localRole
}

export function getLocalPlayerId(): PlayerId | null {
  return useMultiplayerStore.getState().localPlayerId
}

export function getRoomId(): string | null {
  return useMultiplayerStore.getState().room?.id ?? null
}

// Hook para uso em componentes React
export function useIsMultiplayer(): boolean {
  return useMultiplayerStore((state) => state.mode === 'multiplayer')
}
```

### Mudancas em `gameStore.ts`

```typescript
// REMOVER do initialState
const initialState: GameState = {
  // mode: 'single_player',  // REMOVER
  // roomId: null,           // REMOVER
  phase: 'setup',
  // ... resto
}

// REMOVER de initGame
initGame: (config) => {
  // NAO setar mode/roomId - vem do multiplayerStore
  set({
    phase: 'itemSelection',
    // mode: config.mode,     // REMOVER
    // roomId: config.roomId, // REMOVER
    // ... resto
  })
}

// MODIFICAR emitMultiplayerEvent
function emitMultiplayerEvent(event: MultiplayerEventEmit): void {
  // Usa helper ao inves de state.mode
  if (!isMultiplayerMode() || isSyncingFromRemote) {
    return
  }
  // ... resto
}

// DEPRECATED: Getter de retrocompatibilidade
// Adicionar ao store para migracao gradual
get mode() {
  console.warn('[DEPRECATED] gameStore.mode - use isMultiplayerMode()')
  return isMultiplayerMode() ? 'multiplayer' : 'single_player'
}
```

### Impacto em Arquivos

| Arquivo | Mudanca |
|---------|---------|
| `gameStore.ts` | Remover `mode`, `roomId`, modificar `initGame` |
| `multiplayerStore.ts` | Adicionar helpers |
| `useMultiplayer.ts` | Usar helpers ao inves de gameStore.mode |
| `useAIPlayer.ts` | Usar `isMultiplayerMode()` |
| `useAIItemSelection.ts` | Usar `isMultiplayerMode()` |
| `useAIStore.ts` | Usar `isMultiplayerMode()` |
| `App.tsx` | Usar `useIsMultiplayer()` |
| Todos que usam `gameStore.mode` | Migrar para helpers |

---

## Fase 2: Implementar State Broadcast

### Objetivo
Host envia snapshot de estado apos cada acao, Guest aplica diretamente.

### Novo Evento

#### `src/types/events.ts`

```typescript
/**
 * Evento: atualizacao completa de estado (Host -> Guest)
 * Substitui multiplos eventos individuais para sincronizacao
 */
export interface StateUpdateEvent extends GameEventBase {
  type: 'state_update'
  payload: {
    // Campos mutaveis do gameStore
    phase: GamePhase
    currentTurn: PlayerId
    turnPhase: TurnPhase
    players: Record<PlayerId, Player>
    pillPool: Pill[]
    round: number
    winner: PlayerId | null
    revealedPills: string[]
    shapeQuests: Record<PlayerId, ShapeQuest | null>
    typeCounts: Record<PillType, number>
    shapeCounts: Record<PillShape, number>
    storeState: StoreState | null
    itemSelectionConfirmed: Record<PlayerId, boolean>
    targetSelection: TargetSelectionState
  }
}

// Adicionar ao GameEventType
export type GameEventType =
  | // ... existentes
  | 'state_update'

// Adicionar ao GameEvent union
export type GameEvent =
  | // ... existentes
  | StateUpdateEvent
```

### Funcao de Broadcast

#### `src/stores/gameStore.ts`

```typescript
/**
 * Broadcast estado atual para Guest (apenas Host chama)
 * Chamado apos cada mutacao que afeta o estado do jogo
 */
export function broadcastGameState(): void {
  // Verifica se e multiplayer e se e Host
  if (!isMultiplayerMode()) return
  if (getLocalRole() !== 'host') return

  const state = useGameStore.getState()
  const mp = useMultiplayerStore.getState()

  mp.sendEvent({
    type: 'state_update',
    payload: {
      phase: state.phase,
      currentTurn: state.currentTurn,
      turnPhase: state.turnPhase,
      players: state.players,
      pillPool: state.pillPool,
      round: state.round,
      winner: state.winner,
      revealedPills: state.revealedPills,
      shapeQuests: state.shapeQuests,
      typeCounts: state.typeCounts,
      shapeCounts: state.shapeCounts,
      storeState: state.storeState,
      itemSelectionConfirmed: state.itemSelectionConfirmed,
      targetSelection: state.targetSelection,
    },
  })
}

// Modificar cada action para chamar broadcast no final (apenas em MP)
consumePill: (pillId, options) => {
  // ... logica existente ...
  
  // Broadcast estado atualizado (substitui emitMultiplayerEvent)
  broadcastGameState()
}
```

### Handler no Guest

#### `src/stores/multiplayerStore.ts`

```typescript
case 'state_update': {
  if (state.localRole === 'guest') {
    // Aplica estado diretamente - Guest NAO executa logica
    useGameStore.setState(payload)
    console.log('[MultiplayerStore] Guest aplicou state_update')
  }
  break
}
```

---

## Fase 3: Intents para Guest

### Objetivo
Guest envia intencoes ao Host, Host executa e broadcast resultado.

### Novos Eventos de Intent

#### `src/types/events.ts`

```typescript
/**
 * Intent: Guest quer consumir pilula
 */
export interface IntentConsumePillEvent extends GameEventBase {
  type: 'intent_consume_pill'
  payload: {
    pillId: string
    forcedTarget?: PlayerId  // Se usando Force Feed
  }
}

/**
 * Intent: Guest quer usar item
 */
export interface IntentUseItemEvent extends GameEventBase {
  type: 'intent_use_item'
  payload: {
    itemId: string
    targetId?: string
  }
}

/**
 * Intent: Guest quer selecionar item (pre-jogo)
 */
export interface IntentSelectItemEvent extends GameEventBase {
  type: 'intent_select_item'
  payload: {
    itemType: ItemType
  }
}

// ... outros intents conforme necessario
```

### Fluxo de Intent

```typescript
// Em hooks/usePillConsumption.ts (ou similar)
function handlePillClick(pillId: string) {
  const localRole = getLocalRole()
  
  if (localRole === 'guest') {
    // Guest envia intent
    useMultiplayerStore.getState().sendEvent({
      type: 'intent_consume_pill',
      payload: { pillId },
    })
  } else {
    // Host executa diretamente
    useGameStore.getState().consumePill(pillId)
    broadcastGameState()
  }
}

// Em multiplayerStore.ts handleEvent
case 'intent_consume_pill': {
  if (state.localRole === 'host') {
    // Host executa a acao do Guest
    useGameStore.getState().consumePill(
      payload.pillId, 
      { forcedTarget: payload.forcedTarget }
    )
    broadcastGameState()
  }
  break
}
```

---

## Fase 4: Remover Flag e Eventos Legados

### Objetivo
Eliminar `isSyncingFromRemote` e eventos individuais de sincronizacao.

### Remocoes

```typescript
// REMOVER de gameStore.ts
let isSyncingFromRemote = false

export function setSyncingFromRemote(value: boolean): void {
  isSyncingFromRemote = value
}

export function getIsSyncingFromRemote(): boolean {
  return isSyncingFromRemote
}

// REMOVER de emitMultiplayerEvent
// (funcao inteira pode ser removida ou simplificada)

// SIMPLIFICAR applyRemoteEvent
// Eventos legados mantidos apenas para:
// 1. Feedback visual (toasts, overlays)
// 2. Retrocompatibilidade durante migracao
```

### Eventos Legados -> Feedback Only

```typescript
// Eventos como pill_consumed mantidos APENAS para feedback
// NAO modificam estado - apenas disparam UI

case 'pill_consumed': {
  // NAO chama consumePill() - estado ja veio via state_update
  
  // Apenas feedback visual
  if (payload.feedback) {
    const consumerName = state.players[payload.feedback.consumerId]?.name
    useToastStore.getState().show({
      type: mapPillTypeToToast(payload.feedback.pillType),
      message: `${consumerName} consumiu pilula`,
      duration: 2000,
    })
  }
  break
}
```

---

## Diagrama de Fluxo Final

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         FLUXO FINAL (HOST AUTHORITATIVE)                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  GUEST                                    HOST                              │
│  ======                                   ====                              │
│                                                                             │
│  [User clica pilula]                                                        │
│         │                                                                   │
│         ▼                                                                   │
│  [sendEvent('intent_consume_pill')]  ────────►  [handleEvent]              │
│                                                      │                      │
│                                                      ▼                      │
│                                              [consumePill()]                │
│                                                      │                      │
│                                                      ▼                      │
│                                              [broadcastGameState()]         │
│                                                      │                      │
│                                                      ▼                      │
│  [handleEvent] ◄───────────────────────  [sendEvent('state_update')]       │
│         │                                                                   │
│         ▼                                                                   │
│  [gameStore.setState(payload)]                                              │
│         │                                                                   │
│         ▼                                                                   │
│  [UI atualiza automaticamente]                                              │
│                                                                             │
│  Eventos feedback (pill_consumed, etc) enviados em PARALELO                 │
│  para animacoes/toasts, mas NAO modificam estado                           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Riscos e Mitigacoes

| Risco | Probabilidade | Impacto | Mitigacao |
|-------|---------------|---------|-----------|
| Regressao em single player | Baixa | Alto | Testes isolados antes de cada fase |
| Latencia perceptivel (intent -> update) | Media | Medio | Manter optimistic updates para feedback |
| Eventos legados conflitam com state_update | Media | Alto | Ordem clara: state_update primeiro, feedback depois |
| Migracao incompleta | Media | Alto | Feature flags por fase, rollback possivel |

---

## Ordem de Execucao

1. **Fase 1** - Unificar Fonte de Verdade (menor risco, prepara terreno)
2. **Fase 2** - Implementar State Broadcast (mudanca principal)
3. **Fase 3** - Intents para Guest (completa modelo Host Authoritative)
4. **Fase 4** - Remover Legado (limpeza final)

Cada fase pode ser deployada independentemente e testada antes de prosseguir.

