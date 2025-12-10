# Design: Multiplayer Online

## Visao Geral da Arquitetura

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           ARQUITETURA MULTIPLAYER                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────────┐          ┌─────────────────┐                          │
│   │   Cliente A     │          │   Cliente B     │                          │
│   │   (Host/P1)     │          │   (Guest/P2)    │                          │
│   └────────┬────────┘          └────────┬────────┘                          │
│            │                            │                                   │
│            │     WebSocket Events       │                                   │
│            │◄──────────────────────────►│                                   │
│            │                            │                                   │
│            ▼                            ▼                                   │
│   ┌─────────────────────────────────────────────────────────────┐           │
│   │                    Realtime Service                         │           │
│   │           (Supabase Realtime / Socket.io)                   │           │
│   │                                                             │           │
│   │  - Broadcast de eventos entre clientes                      │           │
│   │  - Validacao basica de mensagens                            │           │
│   │  - Gerenciamento de salas/canais                            │           │
│   └─────────────────────────────────────────────────────────────┘           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Novos Types

### `types/multiplayer.ts`

```typescript
/**
 * Modos de jogo suportados
 */
export type GameMode = 'single_player' | 'multiplayer'

/**
 * Status de uma sala multiplayer
 */
export type RoomStatus = 'waiting' | 'ready' | 'playing' | 'finished' | 'abandoned'

/**
 * Papel do jogador local na sala
 */
export type LocalRole = 'host' | 'guest'

/**
 * Estado de uma sala multiplayer
 */
export interface Room {
  /** ID unico da sala (6 caracteres alfanumericos) */
  id: string
  /** Timestamp de criacao */
  createdAt: number
  /** Status atual da sala */
  status: RoomStatus
  /** ID do host (quem criou) */
  hostId: string
  /** Nome do host */
  hostName: string
  /** ID do guest (quem entrou) - null se aguardando */
  guestId: string | null
  /** Nome do guest */
  guestName: string | null
}

/**
 * Estado de conexao do jogador
 */
export type ConnectionStatus = 
  | 'disconnected'
  | 'connecting' 
  | 'connected' 
  | 'reconnecting'

/**
 * Contexto multiplayer local
 */
export interface MultiplayerContext {
  /** Modo de jogo atual */
  mode: GameMode
  /** Sala atual (null se single player ou nao conectado) */
  room: Room | null
  /** Papel do jogador local */
  localRole: LocalRole | null
  /** PlayerId do jogador local (player1 se host, player2 se guest) */
  localPlayerId: PlayerId | null
  /** Status da conexao WebSocket */
  connectionStatus: ConnectionStatus
  /** Erro atual (se houver) */
  error: string | null
}
```

### `types/events.ts`

```typescript
/**
 * Eventos de jogo que precisam sincronizar
 */
export type GameEventType =
  | 'room_created'
  | 'player_joined'
  | 'player_left'
  | 'game_started'
  | 'item_selected'
  | 'item_deselected'
  | 'selection_confirmed'
  | 'pill_consumed'
  | 'item_used'
  | 'turn_ended'
  | 'wants_store_toggled'
  | 'cart_updated'
  | 'store_confirmed'
  | 'round_reset'
  | 'game_ended'
  | 'player_disconnected'
  | 'player_reconnected'

/**
 * Evento base com metadados
 */
export interface GameEventBase {
  /** Tipo do evento */
  type: GameEventType
  /** ID da sala */
  roomId: string
  /** ID do jogador que originou o evento */
  playerId: PlayerId
  /** Timestamp do evento */
  timestamp: number
  /** Numero de sequencia (para ordenacao) */
  sequence: number
}

/**
 * Evento: pilula consumida
 */
export interface PillConsumedEvent extends GameEventBase {
  type: 'pill_consumed'
  payload: {
    pillId: string
    forcedTarget?: PlayerId
  }
}

/**
 * Evento: item usado
 */
export interface ItemUsedEvent extends GameEventBase {
  type: 'item_used'
  payload: {
    itemId: string
    targetId?: string
  }
}

/**
 * Evento: item selecionado (pre-jogo)
 */
export interface ItemSelectedEvent extends GameEventBase {
  type: 'item_selected'
  payload: {
    itemType: ItemType
  }
}

/**
 * Evento: item desselecionado (pre-jogo)
 */
export interface ItemDeselectedEvent extends GameEventBase {
  type: 'item_deselected'
  payload: {
    itemId: string
  }
}

/**
 * Evento: selecao confirmada
 */
export interface SelectionConfirmedEvent extends GameEventBase {
  type: 'selection_confirmed'
}

/**
 * Evento: toggle wantsStore
 */
export interface WantsStoreToggledEvent extends GameEventBase {
  type: 'wants_store_toggled'
  payload: {
    wantsStore: boolean
  }
}

/**
 * Evento: carrinho atualizado
 */
export interface CartUpdatedEvent extends GameEventBase {
  type: 'cart_updated'
  payload: {
    action: 'add' | 'remove'
    itemId: string
  }
}

/**
 * Evento: compras confirmadas
 */
export interface StoreConfirmedEvent extends GameEventBase {
  type: 'store_confirmed'
}

/**
 * Union de todos os eventos
 */
export type GameEvent =
  | PillConsumedEvent
  | ItemUsedEvent
  | ItemSelectedEvent
  | ItemDeselectedEvent
  | SelectionConfirmedEvent
  | WantsStoreToggledEvent
  | CartUpdatedEvent
  | StoreConfirmedEvent
  // ... outros eventos
```

---

## Modificacoes em Types Existentes

### `types/game.ts`

```typescript
// Adicionar import
import type { GameMode } from './multiplayer'

// Modificar GameConfig
export interface GameConfig {
  player1: { name: string; isAI: boolean }
  player2: { name: string; isAI: boolean }
  startingLives: number
  startingResistance: number
  difficulty: DifficultyLevel
  /** NOVO: Modo de jogo */
  mode: GameMode
  /** NOVO: ID da sala (apenas multiplayer) */
  roomId?: string
}

// Modificar GameState
export interface GameState {
  // ... campos existentes ...
  
  /** NOVO: Modo de jogo atual */
  mode: GameMode
  /** NOVO: ID da sala (apenas multiplayer) */
  roomId: string | null
}
```

---

## Novo Store: `multiplayerStore.ts`

```typescript
import { create } from 'zustand'
import type { 
  MultiplayerContext, 
  Room, 
  ConnectionStatus,
  GameEvent,
  LocalRole 
} from '@/types'

interface MultiplayerStore extends MultiplayerContext {
  // Actions - Room Management
  createRoom: (hostName: string) => Promise<Room>
  joinRoom: (roomId: string, guestName: string) => Promise<Room>
  leaveRoom: () => void
  
  // Actions - Connection
  connect: () => void
  disconnect: () => void
  
  // Actions - Events
  sendEvent: (event: Omit<GameEvent, 'timestamp' | 'sequence'>) => void
  handleEvent: (event: GameEvent) => void
  
  // Actions - State
  setConnectionStatus: (status: ConnectionStatus) => void
  setError: (error: string | null) => void
  reset: () => void
}

const initialState: MultiplayerContext = {
  mode: 'single_player',
  room: null,
  localRole: null,
  localPlayerId: null,
  connectionStatus: 'disconnected',
  error: null,
}

export const useMultiplayerStore = create<MultiplayerStore>((set, get) => ({
  ...initialState,
  
  createRoom: async (hostName: string) => {
    // Implementacao: chama servico para criar sala
    // Conecta ao WebSocket
    // Retorna Room criada
  },
  
  joinRoom: async (roomId: string, guestName: string) => {
    // Implementacao: valida sala, conecta ao WebSocket
    // Sincroniza estado inicial
    // Retorna Room
  },
  
  leaveRoom: () => {
    // Notifica outro jogador
    // Desconecta WebSocket
    // Reset state
  },
  
  connect: () => {
    // Estabelece conexao WebSocket
    // Configura handlers de eventos
  },
  
  disconnect: () => {
    // Fecha conexao WebSocket
    // Limpa listeners
  },
  
  sendEvent: (event) => {
    // Adiciona timestamp e sequence
    // Envia via WebSocket
    // Aplica localmente (otimistic update)
  },
  
  handleEvent: (event) => {
    // Recebe evento do outro jogador
    // Aplica no gameStore
  },
  
  setConnectionStatus: (status) => set({ connectionStatus: status }),
  setError: (error) => set({ error }),
  reset: () => set(initialState),
}))
```

---

## Servico: `services/realtimeService.ts`

```typescript
/**
 * Servico de comunicacao em tempo real
 * Abstrai implementacao (Supabase, Socket.io, etc)
 */

import type { GameEvent, Room } from '@/types'

export interface RealtimeService {
  /** Conecta ao servico */
  connect(): Promise<void>
  
  /** Desconecta do servico */
  disconnect(): void
  
  /** Cria nova sala */
  createRoom(hostId: string, hostName: string): Promise<Room>
  
  /** Entra em sala existente */
  joinRoom(roomId: string, guestId: string, guestName: string): Promise<Room>
  
  /** Sai da sala atual */
  leaveRoom(roomId: string, playerId: string): Promise<void>
  
  /** Envia evento para a sala */
  sendEvent(roomId: string, event: GameEvent): void
  
  /** Registra handler para eventos recebidos */
  onEvent(handler: (event: GameEvent) => void): () => void
  
  /** Registra handler para mudancas de conexao */
  onConnectionChange(handler: (status: ConnectionStatus) => void): () => void
}

// Implementacao com Supabase Realtime
export function createSupabaseRealtimeService(): RealtimeService {
  // ...
}

// Implementacao alternativa com Socket.io
export function createSocketIOService(serverUrl: string): RealtimeService {
  // ...
}
```

---

## Modificacoes no `gameStore.ts`

### Adapter Pattern para Sincronizacao

```typescript
// Novo: flag para evitar loops de sincronizacao
let isSyncingFromRemote = false

export function setSyncingFromRemote(value: boolean) {
  isSyncingFromRemote = value
}

// Modificar cada action que precisa sincronizar
consumePill: (pillId: string, options?: { forcedTarget?: PlayerId }) => {
  // ... logica existente ...
  
  // NOVO: Emite evento se for multiplayer e nao for sync remoto
  const state = get()
  if (state.mode === 'multiplayer' && !isSyncingFromRemote) {
    const multiplayerStore = useMultiplayerStore.getState()
    multiplayerStore.sendEvent({
      type: 'pill_consumed',
      roomId: state.roomId!,
      playerId: state.currentTurn,
      payload: { pillId, forcedTarget: options?.forcedTarget },
    })
  }
}

// Similar para: executeItem, selectItem, deselectItem, confirmItemSelection,
// toggleWantsStore, addToCart, removeFromCart, confirmStorePurchases
```

### Nova Action: `applyRemoteEvent`

```typescript
/**
 * Aplica evento recebido de jogador remoto
 * Bypassa emissao de eventos (evita loop)
 */
applyRemoteEvent: (event: GameEvent) => {
  setSyncingFromRemote(true)
  
  try {
    switch (event.type) {
      case 'pill_consumed':
        get().consumePill(event.payload.pillId, { 
          forcedTarget: event.payload.forcedTarget 
        })
        break
        
      case 'item_used':
        get().executeItem(event.payload.itemId, event.payload.targetId)
        break
        
      case 'item_selected':
        get().selectItem(event.playerId, event.payload.itemType)
        break
        
      case 'item_deselected':
        get().deselectItem(event.playerId, event.payload.itemId)
        break
        
      case 'selection_confirmed':
        get().confirmItemSelection(event.playerId)
        break
        
      case 'wants_store_toggled':
        // Toggle apenas se estado diferente
        const player = get().players[event.playerId]
        if (player.wantsStore !== event.payload.wantsStore) {
          get().toggleWantsStore(event.playerId)
        }
        break
        
      case 'cart_updated':
        if (event.payload.action === 'add') {
          get().addToCart(event.playerId, event.payload.itemId)
        } else {
          get().removeFromCart(event.playerId, event.payload.itemId)
        }
        break
        
      case 'store_confirmed':
        get().confirmStorePurchases(event.playerId)
        break
    }
  } finally {
    setSyncingFromRemote(false)
  }
}
```

---

## Modificacoes nos Hooks de IA

### `useAIPlayer.ts`

```typescript
export function useAIPlayer({ ... }: UseAIPlayerOptions) {
  // NOVO: Obter modo de jogo
  const mode = useGameStore((state) => state.mode)
  
  useEffect(() => {
    // NOVO: Nao executa em multiplayer
    if (mode === 'multiplayer') return
    
    // ... resto da logica existente ...
  }, [mode, /* outras deps */])
}
```

### `useAIItemSelection.ts`

```typescript
export function useAIItemSelection({ ... }: Options) {
  const mode = useGameStore((state) => state.mode)
  
  useEffect(() => {
    // NOVO: Nao executa em multiplayer
    if (mode === 'multiplayer') return
    
    // ... resto da logica existente ...
  }, [mode, /* outras deps */])
}
```

### `useAIStore.ts`

```typescript
export function useAIStore() {
  const mode = useGameStore((state) => state.mode)
  
  useEffect(() => {
    // NOVO: Nao executa em multiplayer
    if (mode === 'multiplayer') return
    
    // ... resto da logica existente ...
  }, [mode, /* outras deps */])
}
```

---

## Novos Hooks

### `useMultiplayer.ts`

```typescript
/**
 * Hook principal para funcionalidades multiplayer
 */
export function useMultiplayer() {
  const store = useMultiplayerStore()
  const gameStore = useGameStore()
  
  // Determina se e turno do jogador local
  const isLocalTurn = useMemo(() => {
    if (store.mode !== 'multiplayer') return true
    return gameStore.currentTurn === store.localPlayerId
  }, [store.mode, store.localPlayerId, gameStore.currentTurn])
  
  // Determina se pode interagir (turno local + fase correta)
  const canInteract = useMemo(() => {
    if (store.mode !== 'multiplayer') return true
    return isLocalTurn && gameStore.phase === 'playing'
  }, [store.mode, isLocalTurn, gameStore.phase])
  
  return {
    ...store,
    isLocalTurn,
    canInteract,
  }
}
```

### `useRoomConnection.ts`

```typescript
/**
 * Hook para gerenciar conexao com sala
 */
export function useRoomConnection() {
  const { room, connectionStatus, connect, disconnect } = useMultiplayerStore()
  const [isReconnecting, setIsReconnecting] = useState(false)
  
  // Reconexao automatica
  useEffect(() => {
    if (connectionStatus === 'disconnected' && room) {
      setIsReconnecting(true)
      const timer = setTimeout(() => {
        connect()
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [connectionStatus, room])
  
  // Cleanup ao desmontar
  useEffect(() => {
    return () => disconnect()
  }, [])
  
  return { isReconnecting, connectionStatus }
}
```

---

## Novos Componentes

### `components/multiplayer/`

```
components/multiplayer/
├── LobbyScreen.tsx          # Tela inicial multiplayer (criar/entrar)
├── CreateRoomForm.tsx       # Formulario de criacao de sala
├── JoinRoomForm.tsx         # Formulario de entrada em sala
├── WaitingRoom.tsx          # Host aguardando guest
├── RoomCodeDisplay.tsx      # Exibe codigo da sala para compartilhar
├── ConnectionStatus.tsx     # Indicador de status de conexao
├── DisconnectedOverlay.tsx  # Overlay quando oponente desconecta
└── index.ts                 # Barrel export
```

### `LobbyScreen.tsx`

```tsx
export function LobbyScreen() {
  const [view, setView] = useState<'menu' | 'create' | 'join'>('menu')
  
  return (
    <div className="...">
      {view === 'menu' && (
        <div className="flex flex-col gap-4">
          <Button onClick={() => setView('create')}>
            Criar Sala
          </Button>
          <Button onClick={() => setView('join')}>
            Entrar em Sala
          </Button>
        </div>
      )}
      
      {view === 'create' && (
        <CreateRoomForm onBack={() => setView('menu')} />
      )}
      
      {view === 'join' && (
        <JoinRoomForm onBack={() => setView('menu')} />
      )}
    </div>
  )
}
```

### `WaitingRoom.tsx`

```tsx
export function WaitingRoom() {
  const { room, leaveRoom } = useMultiplayerStore()
  const [copied, setCopied] = useState(false)
  
  const handleCopy = () => {
    navigator.clipboard.writeText(room?.id ?? '')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  
  return (
    <Card className="...">
      <h2>Aguardando oponente...</h2>
      
      <RoomCodeDisplay code={room?.id} onCopy={handleCopy} copied={copied} />
      
      <p>Compartilhe o codigo com seu amigo</p>
      
      <Button variant="outline" onClick={leaveRoom}>
        Cancelar
      </Button>
    </Card>
  )
}
```

### `DisconnectedOverlay.tsx`

```tsx
export function DisconnectedOverlay() {
  const { connectionStatus, error } = useMultiplayerStore()
  const [timeLeft, setTimeLeft] = useState(30)
  
  // Countdown para timeout
  useEffect(() => {
    if (connectionStatus === 'reconnecting') {
      const interval = setInterval(() => {
        setTimeLeft((t) => Math.max(0, t - 1))
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [connectionStatus])
  
  if (connectionStatus !== 'reconnecting') return null
  
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <Card className="text-center">
        <h2>Oponente desconectado</h2>
        <p>Aguardando reconexao... {timeLeft}s</p>
        <Spinner />
        <Button variant="destructive" onClick={...}>
          Encerrar partida
        </Button>
      </Card>
    </div>
  )
}
```

---

## Modificacoes em Componentes Existentes

### `App.tsx`

```tsx
function GameContent() {
  const phase = useGameStore((state) => state.phase)
  const mode = useGameStore((state) => state.mode)
  const { room } = useMultiplayerStore()
  
  // Fase de lobby multiplayer (antes de iniciar jogo)
  if (mode === 'multiplayer' && !room) {
    return <LobbyScreen />
  }
  
  // Host aguardando guest
  if (mode === 'multiplayer' && room?.status === 'waiting') {
    return <WaitingRoom />
  }
  
  // ... resto do switch de fases existente ...
}
```

### `GameBoard.tsx`

```tsx
export function GameBoard() {
  const { canInteract, isLocalTurn } = useMultiplayer()
  
  // Desabilita interacoes quando nao e turno local
  const handlePillSelect = (pillId: string) => {
    if (!canInteract) return
    // ... logica existente ...
  }
  
  // Feedback visual quando aguardando oponente
  return (
    <div>
      {!isLocalTurn && (
        <TurnIndicator showWaitingMessage />
      )}
      
      <PillPool 
        disabled={!canInteract} 
        // ... outras props ...
      />
      
      {/* Overlay de desconexao */}
      <DisconnectedOverlay />
    </div>
  )
}
```

### `InfoPanel.tsx` (Tela Setup)

```tsx
export function InfoPanel() {
  // NOVO: Selector de modo de jogo
  const [selectedMode, setSelectedMode] = useState<GameMode>('single_player')
  
  return (
    <div>
      {/* Selector de modo */}
      <div className="flex gap-2 mb-4">
        <Button 
          variant={selectedMode === 'single_player' ? 'default' : 'outline'}
          onClick={() => setSelectedMode('single_player')}
        >
          Single Player
        </Button>
        <Button 
          variant={selectedMode === 'multiplayer' ? 'default' : 'outline'}
          onClick={() => setSelectedMode('multiplayer')}
        >
          Multiplayer
        </Button>
      </div>
      
      {/* Conteudo condicional */}
      {selectedMode === 'single_player' ? (
        <DifficultySelect />
      ) : (
        <LobbyScreen />
      )}
    </div>
  )
}
```

---

## Fluxo de Dados Multiplayer

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    FLUXO: JOGADOR LOCAL FAZ ACAO                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  [Usuario clica pilula]                                                      │
│         │                                                                    │
│         ▼                                                                    │
│  [useMultiplayer.canInteract?]                                              │
│         │                                                                    │
│        SIM                                                                   │
│         │                                                                    │
│         ▼                                                                    │
│  [gameStore.consumePill()]                                                  │
│         │                                                                    │
│         ├──────────────────────────────┐                                    │
│         │                              │                                    │
│         ▼                              ▼                                    │
│  [Atualiza estado local]    [multiplayerStore.sendEvent()]                  │
│         │                              │                                    │
│         │                              ▼                                    │
│         │                   [WebSocket envia para servidor]                 │
│         │                              │                                    │
│         │                              ▼                                    │
│         │                   [Servidor broadcast para sala]                  │
│         │                              │                                    │
│         │                              ▼                                    │
│         │                   [Cliente B recebe evento]                       │
│         │                              │                                    │
│         │                              ▼                                    │
│         │                   [gameStore.applyRemoteEvent()]                  │
│         │                              │                                    │
│         │                              ▼                                    │
│         │                   [Estado atualizado em B]                        │
│         │                              │                                    │
│         ▼                              ▼                                    │
│  [UI atualiza em A]          [UI atualiza em B]                             │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Consideracoes de Seguranca

### Validacao no Cliente (Fase 1 - Simplificado)

Para a Fase 1, a validacao sera feita no cliente receptor:

```typescript
// Em applyRemoteEvent
case 'pill_consumed':
  // Valida que pilula existe
  const pill = get().pillPool.find(p => p.id === event.payload.pillId)
  if (!pill) {
    console.warn('Pilula invalida recebida:', event.payload.pillId)
    return
  }
  
  // Valida que e turno do jogador que enviou
  if (get().currentTurn !== event.playerId) {
    console.warn('Evento fora de turno:', event)
    return
  }
  
  // Aplica acao
  get().consumePill(event.payload.pillId, ...)
```

### Validacao no Servidor (Fase Futura)

Para versao mais robusta, o servidor validaria:
- Turno correto
- Acao valida para o estado atual
- Jogador tem permissao
- Dados sao validos

---

## Escolha de Tecnologia: Supabase Realtime

**Recomendacao:** Supabase Realtime (via Broadcast)

**Justificativa:**
1. Ja usado em muitos projetos React
2. Setup simples (sem servidor custom)
3. Suporta salas (channels)
4. Tier gratuito generoso
5. SDK TypeScript bem documentado

**Alternativas Consideradas:**
- Socket.io: Requer servidor custom
- Ably/Pusher: Mais caro, overkill para Fase 1
- Firebase Realtime: Mais complexo de configurar

---

## Riscos e Mitigacoes

| Risco | Impacto | Probabilidade | Mitigacao |
|-------|---------|---------------|-----------|
| Dessincronizacao de estado | Alto | Media | Validacao + sequence numbers |
| Latencia alta | Medio | Baixa | Feedback visual, otimistic updates |
| Trapaças | Medio | Media | Validacao no cliente (Fase 1) |
| Perda de conexao | Alto | Media | Timeout + W.O. |
| Complexidade excessiva | Alto | Alta | Escopo minimo, iteracao |

---

## Referencias

- [Supabase Realtime Docs](https://supabase.com/docs/guides/realtime)
- Spec inicial: `.specs/future/multiplayer-ai.md`
- Arquitetura atual: `.cursor/rules/architecture.md`

