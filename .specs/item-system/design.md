# Design: Sistema de Itens (Power-ups)

## Arquitetura Proposta

### Integracao com Arquitetura Existente

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         FLUXO ATUALIZADO                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  [SETUP] ──→ [ITEM_SELECTION] ──→ [PLAYING] ──→ [ENDED]                 │
│     │              │                   │                                │
│     │              │                   │                                │
│     │         Selecao de          Uso de itens                          │
│     │         5 itens             durante turno                         │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Nova Estrutura de Arquivos

```
src/
├── types/
│   └── item.ts                    # NOVO: Item, ItemType, ItemCategory
│
├── utils/
│   ├── itemCatalog.ts             # NOVO: Definicoes de todos os itens
│   └── itemLogic.ts               # NOVO: Logica de efeitos de itens
│
├── stores/
│   └── gameStore.ts               # MODIFICADO: Adicionar inventarios
│
├── hooks/
│   ├── useItemSelection.ts        # NOVO: Logica de selecao pre-jogo
│   └── useItemUsage.ts            # NOVO: Logica de uso durante jogo
│
├── components/
│   ├── game/
│   │   ├── ItemSelectionScreen.tsx  # NOVO: Tela de selecao de itens
│   │   ├── InventoryBar.tsx         # NOVO: Barra de inventario do jogador
│   │   ├── ItemCard.tsx             # NOVO: Card de item (selecao/uso)
│   │   ├── ItemTargetSelector.tsx   # NOVO: Overlay de selecao de alvo
│   │   ├── AnimatedPlayerArea.tsx   # MODIFICADO: Integrar inventario
│   │   └── GameBoard.tsx            # MODIFICADO: Integrar sistema de itens
│   │
│   └── overlays/
│       └── ItemEffectOverlay.tsx    # NOVO: Feedback visual de item usado
```

---

## Modelagem de Dados

### Types (`src/types/item.ts`)

```typescript
// Categorias de itens
export type ItemCategory = 'intel' | 'sustain' | 'control' | 'chaos'

// Tipos de item
export type ItemType = 
  | 'scanner' 
  | 'inverter' 
  | 'double'
  | 'pocket_pill' 
  | 'shield'
  | 'handcuffs' 
  | 'force_feed'
  | 'shuffle' 
  | 'discard'

// Tipo de alvo do item
export type ItemTargetType = 'self' | 'pill' | 'opponent' | 'pill_to_opponent' | 'table'

// Definicao de um item
export interface ItemDefinition {
  type: ItemType
  category: ItemCategory
  name: string
  description: string
  targetType: ItemTargetType
  icon: string // Lucide icon name
  color: string // Tailwind color class
}

// Item no inventario do jogador
export interface InventoryItem {
  id: string
  type: ItemType
}

// Inventario do jogador
export interface PlayerInventory {
  items: InventoryItem[]
  maxItems: 5
}

// Estado de selecao de alvo
export interface TargetSelectionState {
  active: boolean
  itemId: string | null
  itemType: ItemType | null
  validTargets: 'pills' | 'opponent' | null
}
```

### Extensao do Player (`src/types/player.ts`)

```typescript
export interface Player {
  // ... campos existentes ...
  inventory: PlayerInventory
  effects: PlayerEffect[] // Efeitos ativos (ex: Shield)
}

export interface PlayerEffect {
  type: 'shield' | 'handcuffed'
  turnsRemaining: number
}
```

### Extensao do GameState (`src/types/game.ts`)

```typescript
export type GamePhase = 
  | 'setup' 
  | 'itemSelection'  // NOVO
  | 'playing' 
  | 'roundEnding' 
  | 'ended'

export interface GameState {
  // ... campos existentes ...
  targetSelection: TargetSelectionState
  revealedPills: string[] // IDs de pilulas reveladas por Scanner
}
```

---

## Catalogo de Itens (`src/utils/itemCatalog.ts`)

```typescript
export const ITEM_CATALOG: Record<ItemType, ItemDefinition> = {
  scanner: {
    type: 'scanner',
    category: 'intel',
    name: 'Scanner',
    description: 'Revela o tipo de 1 pilula',
    targetType: 'pill',
    icon: 'Search',
    color: 'text-blue-400'
  },
  inverter: {
    type: 'inverter',
    category: 'intel',
    name: 'Inverter',
    description: 'Inverte o efeito de 1 pilula',
    targetType: 'pill',
    icon: 'RefreshCw',
    color: 'text-blue-400'
  },
  // ... demais itens
}

export const ITEMS_BY_CATEGORY: Record<ItemCategory, ItemType[]> = {
  intel: ['scanner', 'inverter', 'double'],
  sustain: ['pocket_pill', 'shield'],
  control: ['handcuffs', 'force_feed'],
  chaos: ['shuffle', 'discard']
}
```

---

## Store: Extensao do gameStore

### Novas Actions

```typescript
// Selecao de itens (pre-jogo)
selectItem: (playerId: PlayerId, itemType: ItemType) => void
deselectItem: (playerId: PlayerId, itemId: string) => void
confirmItemSelection: (playerId: PlayerId) => void

// Uso de itens (durante jogo)
startItemUsage: (itemId: string) => void
cancelItemUsage: () => void
executeItem: (itemId: string, targetId?: string) => void

// Efeitos de itens
applyItemEffect: (itemType: ItemType, targetId?: string) => ItemEffectResult
removePlayerEffect: (playerId: PlayerId, effectType: string) => void

// Scanner especifico
revealPill: (pillId: string) => void
hideRevealedPill: (pillId: string) => void
```

---

## Hooks

### useItemSelection

```typescript
export function useItemSelection() {
  const selectItem = useGameStore(s => s.selectItem)
  const deselectItem = useGameStore(s => s.deselectItem)
  const confirmSelection = useGameStore(s => s.confirmItemSelection)
  const currentPlayerInventory = useGameStore(s => s.players[s.currentPlayerId].inventory)

  return {
    inventory: currentPlayerInventory,
    canSelectMore: currentPlayerInventory.items.length < 5,
    selectItem,
    deselectItem,
    confirmSelection
  }
}
```

### useItemUsage

```typescript
export function useItemUsage() {
  const startUsage = useGameStore(s => s.startItemUsage)
  const cancelUsage = useGameStore(s => s.cancelItemUsage)
  const executeItem = useGameStore(s => s.executeItem)
  const targetSelection = useGameStore(s => s.targetSelection)

  return {
    isSelectingTarget: targetSelection.active,
    selectedItemType: targetSelection.itemType,
    validTargets: targetSelection.validTargets,
    startUsage,
    cancelUsage,
    executeItem
  }
}
```

---

## Componentes

### ItemSelectionScreen
- Exibe catalogo de itens por categoria
- Permite selecionar ate 5 itens
- Contador de itens selecionados
- Botao de confirmar
- Para IA: selecao automatica

### InventoryBar
- Barra horizontal abaixo do card do jogador
- Exibe ate 5 slots de itens
- Itens clicaveis para uso
- Tooltip com descricao

### ItemCard
- Card visual do item
- Icone + nome + descricao
- Estados: disponivel, selecionado, usado
- Estilo 8bit consistente

### ItemTargetSelector
- Overlay quando item requer alvo
- Destaca alvos validos (pilulas ou oponente)
- Botao de cancelar
- Click em alvo executa item

### ItemEffectOverlay
- Animacao de efeito do item
- Ex: Scanner mostra tipo da pilula
- Ex: Shield mostra escudo no jogador
- Auto-dismiss apos animacao

---

## Fluxo de Uso de Item

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      FLUXO DE USO DE ITEM                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  [Jogador clica item no inventario]                                     │
│               │                                                         │
│               ▼                                                         │
│  [useItemUsage.startUsage(itemId)]                                      │
│               │                                                         │
│               ▼                                                         │
│  ┌─────────────────────────────────┐                                    │
│  │ Item requer alvo?               │                                    │
│  └─────────┬───────────┬───────────┘                                    │
│            │           │                                                │
│         NAO           SIM                                               │
│            │           │                                                │
│            ▼           ▼                                                │
│    [Executa efeito]  [Entra modo selecao]                               │
│            │           │                                                │
│            │           ▼                                                │
│            │    [ItemTargetSelector]                                    │
│            │           │                                                │
│            │           ▼                                                │
│            │    [Jogador clica alvo]                                    │
│            │           │                                                │
│            │           ▼                                                │
│            │    [executeItem(itemId, targetId)]                         │
│            │           │                                                │
│            ▼           ▼                                                │
│  [applyItemEffect(itemType, targetId)]                                  │
│               │                                                         │
│               ▼                                                         │
│  [Remove item do inventario]                                            │
│               │                                                         │
│               ▼                                                         │
│  [ItemEffectOverlay + Toast]                                            │
│               │                                                         │
│               ▼                                                         │
│  [Continua turno (ou NAO consome turno se item self, pill ou handcuff)] │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Riscos e Mitigacoes

| Risco | Impacto | Mitigacao |
|-------|---------|-----------|
| Complexidade do Force Feed | Alto | Reutilizar fluxo existente de consumo |
| IA muito forte/fraca | Medio | Balancear chance de uso (35%) e heuristica simples |
| Muitos overlays simultaneos | Medio | Usar overlayStore para controlar stack |
| Scanner + muitas pilulas | Baixo | Limitar tempo de revelacao (5s) |
| Shield + Handcuffs conflito | Baixo | Shield bloqueia Handcuffs |

---

## Dependencias

### Novos Pacotes
- Nenhum (usar Lucide icons existentes)

### Arquivos Modificados
- `src/types/game.ts` - Nova fase, targetSelection
- `src/types/player.ts` - Inventario, efeitos
- `src/stores/gameStore.ts` - Actions de item
- `src/components/game/GameBoard.tsx` - Integrar tela de selecao
- `src/components/game/AnimatedPlayerArea.tsx` - Mostrar inventario
- `src/components/game/Pill.tsx` - Estado "revelado" e "alvo"
- `src/hooks/useAIPlayer.ts` - Logica de uso de itens pela IA
- `src/App.tsx` - Nova fase itemSelection

