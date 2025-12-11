# Mapeamento: gameStore -> Stores Modulares

Este documento mapeia cada funcao do gameStore.ts para o store modular destino.

---

## Legenda

| Acao | Significado |
|------|-------------|
| DELEGAR | Chamar store modular internamente |
| ORQUESTRAR | Coordenar multiplos stores |
| MANTER | Permanece no gameStore (orquestracao) |
| REMOVER | Funcao duplicada, usar store diretamente |
| DEPRECAR | Marcar @deprecated, manter por retrocompatibilidade |

---

## Estado (initialState)

| Campo | Store Destino | Acao |
|-------|---------------|------|
| `phase` | gameFlowStore | DELEGAR |
| `turnPhase` | gameFlowStore | DELEGAR |
| `currentTurn` | gameFlowStore | DELEGAR |
| `round` | gameFlowStore | DELEGAR |
| `winner` | gameFlowStore | DELEGAR |
| `difficulty` | gameFlowStore | DELEGAR |
| `mode` | gameFlowStore | DELEGAR |
| `roomId` | gameFlowStore | DELEGAR |
| `actionHistory` | gameFlowStore | DELEGAR |
| `players` | playerStore | DELEGAR |
| `pillPool` | pillPoolStore | DELEGAR |
| `typeCounts` | pillPoolStore | DELEGAR |
| `shapeCounts` | pillPoolStore | DELEGAR |
| `revealedPills` | pillPoolStore | DELEGAR |
| `targetSelection` | itemUsageStore | DELEGAR |
| `itemSelectionConfirmed` | itemUsageStore | DELEGAR |
| `storeState` | shopStore | DELEGAR |
| `shapeQuests` | MANTER | Sem store dedicado ainda |
| `lastQuestReset` | MANTER | Sem store dedicado ainda |
| `revealAtStart` | MANTER | Sem store dedicado ainda |

---

## Actions - Game Flow

| Funcao | Linha | Store Destino | Acao | Complexidade |
|--------|-------|---------------|------|--------------|
| `initGame` | 269 | ORQUESTRAR | Inicializa todos os stores | ALTA |
| `nextTurn` | 623 | gameFlowStore | DELEGAR | BAIXA |
| `resetRound` | 639 | ORQUESTRAR | pillPoolStore + gameFlowStore | MEDIA |
| `endGame` | 749 | gameFlowStore | DELEGAR | BAIXA |
| `resetGame` | 768 | ORQUESTRAR | Reset de todos os stores | MEDIA |

---

## Actions - Pill Consumption

| Funcao | Linha | Store Destino | Acao | Complexidade |
|--------|-------|---------------|------|--------------|
| `consumePill` | 346 | ORQUESTRAR | pillPoolStore + playerStore + gameFlowStore | ALTA |
| `revealPillById` | 598 | pillPoolStore | DELEGAR | BAIXA |

---

## Actions - Item Selection (pre-game)

| Funcao | Linha | Store Destino | Acao | Complexidade |
|--------|-------|---------------|------|--------------|
| `startItemSelectionPhase` | 779 | gameFlowStore | DELEGAR | BAIXA |
| `selectItem` | 789 | playerStore | DELEGAR | BAIXA |
| `deselectItem` | 831 | playerStore | DELEGAR | BAIXA |
| `confirmItemSelection` | 859 | itemUsageStore + gameFlowStore | ORQUESTRAR | MEDIA |

---

## Actions - Item Usage (during game)

| Funcao | Linha | Store Destino | Acao | Complexidade |
|--------|-------|---------------|------|--------------|
| `startItemUsage` | 906 | itemUsageStore | DELEGAR | BAIXA |
| `cancelItemUsage` | 950 | itemUsageStore | DELEGAR | BAIXA |
| `executeItem` | 966 | ORQUESTRAR | Multiplos stores por tipo de item | ALTA |
| `removeItemFromInventory` | 1248 | playerStore | DELEGAR | BAIXA |

---

## Actions - Player Effects

| Funcao | Linha | Store Destino | Acao | Complexidade |
|--------|-------|---------------|------|--------------|
| `applyPlayerEffect` | 1275 | effectsStore | DELEGAR | BAIXA |
| `removePlayerEffect` | 1301 | effectsStore | DELEGAR | BAIXA |
| `decrementEffectRounds` | 1324 | effectsStore | DELEGAR | BAIXA |

---

## Actions - Revealed Pills (Scanner)

| Funcao | Linha | Store Destino | Acao | Complexidade |
|--------|-------|---------------|------|--------------|
| `addRevealedPill` | 1361 | pillPoolStore | DELEGAR | BAIXA |
| `removeRevealedPill` | 1375 | pillPoolStore | DELEGAR | BAIXA |
| `clearRevealedPills` | 1386 | pillPoolStore | DELEGAR | BAIXA |

---

## Actions - Pill Modifiers

| Funcao | Linha | Store Destino | Acao | Complexidade |
|--------|-------|---------------|------|--------------|
| `invertPill` | 1396 | pillPoolStore | DELEGAR | BAIXA |
| `doublePill` | 1414 | pillPoolStore | DELEGAR | BAIXA |
| `clearPillModifiers` | 1431 | pillPoolStore | DELEGAR | BAIXA |

---

## Actions - Pill Store

| Funcao | Linha | Store Destino | Acao | Complexidade |
|--------|-------|---------------|------|--------------|
| `toggleWantsStore` | 1452 | playerStore | DELEGAR | BAIXA |
| `checkAndStartShopping` | 1500 | ORQUESTRAR | shopStore + gameFlowStore | MEDIA |
| `addToCart` | 1544 | shopStore | DELEGAR | BAIXA |
| `removeFromCart` | 1653 | shopStore | DELEGAR | BAIXA |
| `processCart` | 1704 | ORQUESTRAR | shopStore + playerStore | MEDIA |
| `purchaseStoreItem` | 1797 | DEPRECAR | Usar addToCart | BAIXA |
| `confirmStorePurchases` | 1807 | ORQUESTRAR | shopStore + playerStore | MEDIA |
| `checkShoppingComplete` | 1882 | ORQUESTRAR | shopStore + gameFlowStore | MEDIA |
| `applyPendingBoosts` | 1923 | ORQUESTRAR | shopStore + playerStore | MEDIA |

---

## Actions - Multiplayer Sync

| Funcao | Linha | Store Destino | Acao | Complexidade |
|--------|-------|---------------|------|--------------|
| `applyRemoteEvent` | 1989 | MANTER | Orquestra eventos remotos | ALTA |

---

## Selectors

| Funcao | Linha | Store Destino | Acao | Complexidade |
|--------|-------|---------------|------|--------------|
| `getCurrentPlayer` | 2245 | playerStore | DELEGAR | BAIXA |
| `getOpponent` | 2253 | DEPRECAR | Usar useTargetablePlayers | BAIXA |
| `getPillById` | 2263 | pillPoolStore | DELEGAR | BAIXA |
| `isPillPoolEmpty` | 2271 | pillPoolStore | DELEGAR | BAIXA |
| `getGameStats` | N/A | MANTER | Agrega de varios stores | MEDIA |

---

## Resumo por Complexidade

| Complexidade | Quantidade | Estrategia |
|--------------|------------|------------|
| BAIXA | 22 | Delegar diretamente |
| MEDIA | 10 | Orquestrar 2-3 stores |
| ALTA | 4 | Refatorar com cuidado |

### Funcoes de Alta Complexidade (fazer por ultimo)

1. **initGame** - Inicializa todos os stores, gera pool, quests
2. **consumePill** - Logica de consumo com efeitos, dano, turnos
3. **executeItem** - Switch com 10+ tipos de itens
4. **applyRemoteEvent** - Handler de eventos multiplayer

---

## Ordem de Migracao Recomendada

### Batch 1: Delegacao Simples (22 funcoes)
- Revealed Pills (3)
- Pill Modifiers (3)
- Player Effects (3)
- Item Selection pre-game (3)
- Item Usage basico (3)
- Selectors (4)
- toggleWantsStore, addToCart, removeFromCart (3)

### Batch 2: Orquestracao Media (10 funcoes)
- confirmItemSelection
- checkAndStartShopping
- processCart
- confirmStorePurchases
- checkShoppingComplete
- applyPendingBoosts
- resetRound
- resetGame
- nextTurn
- endGame

### Batch 3: Orquestracao Alta (4 funcoes)
- initGame
- consumePill
- executeItem
- applyRemoteEvent

