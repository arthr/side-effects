# Tasks: MP-Refactor (Multiplayer State Architecture Refactor)

## Resumo

Refatoracao da arquitetura de estado multiplayer em 4 fases incrementais.
Cada fase pode ser deployada independentemente.

---

## Fase 1: Unificar Fonte de Verdade do Modo

**Objetivo:** Eliminar duplicacao de `mode` e `roomId` entre stores.
**Risco:** Baixo
**Estimativa:** 2-3 horas

### TASK-MPR-001: Criar helpers no multiplayerStore
- [ ] Adicionar funcao `isMultiplayerMode(): boolean`
- [ ] Adicionar funcao `getLocalRole(): LocalRole | null`
- [ ] Adicionar funcao `getLocalPlayerId(): PlayerId | null`
- [ ] Adicionar funcao `getRoomId(): string | null`
- [ ] Adicionar hook `useIsMultiplayer(): boolean`
- [ ] Exportar helpers no barrel export

**Arquivos:**
- `src/stores/multiplayerStore.ts`

---

### TASK-MPR-002: Migrar hooks de IA para usar helpers
- [ ] `useAIPlayer.ts` - substituir `gameStore.mode` por `isMultiplayerMode()`
- [ ] `useAIItemSelection.ts` - substituir `gameStore.mode` por `isMultiplayerMode()`
- [ ] `useAIStore.ts` - substituir `gameStore.mode` por `isMultiplayerMode()`

**Arquivos:**
- `src/hooks/useAIPlayer.ts`
- `src/hooks/useAIItemSelection.ts`
- `src/hooks/useAIStore.ts`

---

### TASK-MPR-003: Migrar useMultiplayer hook
- [ ] Remover dependencia de `gameStore.mode`
- [ ] Usar `useIsMultiplayer()` internamente
- [ ] Verificar que todos os campos sao derivados do multiplayerStore

**Arquivos:**
- `src/hooks/useMultiplayer.ts`

---

### TASK-MPR-004: Migrar componentes para helpers
- [ ] `App.tsx` - usar `useIsMultiplayer()`
- [ ] `GameBoard.tsx` - verificar usos de mode
- [ ] Outros componentes que usam `gameStore.mode`

**Arquivos:**
- `src/App.tsx`
- `src/components/game/GameBoard.tsx`
- Componentes identificados durante migracao

---

### TASK-MPR-005: Modificar emitMultiplayerEvent
- [ ] Remover parametro `mode` da funcao
- [ ] Usar `isMultiplayerMode()` internamente
- [ ] Atualizar todas as chamadas (remover primeiro argumento)

**Arquivos:**
- `src/stores/gameStore.ts`

---

### TASK-MPR-006: Remover mode/roomId do gameStore
- [ ] Remover `mode` do `initialState`
- [ ] Remover `roomId` do `initialState`
- [ ] Remover de `initGame` config
- [ ] Adicionar getter deprecated para retrocompatibilidade (com warning)
- [ ] Atualizar tipos `GameState` e `GameConfig`

**Arquivos:**
- `src/stores/gameStore.ts`
- `src/types/game.ts`

---

### TASK-MPR-007: Atualizar state_sync para nao incluir mode/roomId
- [ ] Remover `mode` do payload de `state_sync`
- [ ] Remover `roomId` do payload de `state_sync`
- [ ] Guest nao precisa mais receber esses campos

**Arquivos:**
- `src/stores/multiplayerStore.ts`
- `src/types/events.ts` (interface StateSyncEvent)

---

### TASK-MPR-008: Verificacao Fase 1
- [ ] Testar single player - deve funcionar identico
- [ ] Testar multiplayer - criar sala, jogar partida completa
- [ ] Testar reconexao - guest deve sincronizar corretamente
- [ ] Verificar que nenhum console.warn de deprecated aparece em producao
- [ ] Verificar lint/type errors

---

## Fase 2: Implementar State Broadcast

**Objetivo:** Host envia snapshot de estado apos cada acao.
**Risco:** Medio
**Estimativa:** 3-4 horas
**Dependencia:** Fase 1 completa

### TASK-MPR-009: Criar evento state_update
- [ ] Adicionar `state_update` ao `GameEventType`
- [ ] Criar interface `StateUpdateEvent` com payload completo
- [ ] Adicionar ao union `GameEvent`

**Arquivos:**
- `src/types/events.ts`

---

### TASK-MPR-010: Criar funcao broadcastGameState
- [ ] Implementar `broadcastGameState()` no gameStore
- [ ] Verificar `isMultiplayerMode()` e `localRole === 'host'`
- [ ] Enviar snapshot de todos os campos mutaveis

**Arquivos:**
- `src/stores/gameStore.ts`

---

### TASK-MPR-011: Adicionar handler state_update no multiplayerStore
- [ ] Criar case `state_update` no handleEvent
- [ ] Guest aplica estado via `useGameStore.setState(payload)`
- [ ] Adicionar logs para debug

**Arquivos:**
- `src/stores/multiplayerStore.ts`

---

### TASK-MPR-012: Modificar consumePill para broadcast
- [ ] Chamar `broadcastGameState()` no final da action
- [ ] Manter `emitMultiplayerEvent` temporariamente (para feedback)
- [ ] Testar sincronizacao

**Arquivos:**
- `src/stores/gameStore.ts`

---

### TASK-MPR-013: Modificar executeItem para broadcast
- [ ] Chamar `broadcastGameState()` no final da action
- [ ] Manter eventos de feedback

**Arquivos:**
- `src/stores/gameStore.ts`

---

### TASK-MPR-014: Modificar actions de selecao para broadcast
- [ ] `selectItem` - adicionar broadcast
- [ ] `deselectItem` - adicionar broadcast
- [ ] `confirmItemSelection` - adicionar broadcast

**Arquivos:**
- `src/stores/gameStore.ts`

---

### TASK-MPR-015: Modificar actions de loja para broadcast
- [ ] `toggleWantsStore` - adicionar broadcast
- [ ] `addToCart` - adicionar broadcast
- [ ] `removeFromCart` - adicionar broadcast
- [ ] `confirmStorePurchases` - adicionar broadcast

**Arquivos:**
- `src/stores/gameStore.ts`

---

### TASK-MPR-016: Modificar resetRound para broadcast
- [ ] `resetRound` - adicionar broadcast
- [ ] Verificar que Guest recebe estado da nova rodada

**Arquivos:**
- `src/stores/gameStore.ts`

---

### TASK-MPR-017: Unificar game_started/round_reset com state_update
- [ ] `game_started` envia state_update apos syncData
- [ ] `round_reset` envia state_update apos syncData
- [ ] Remover duplicacao de logica

**Arquivos:**
- `src/stores/multiplayerStore.ts`

---

### TASK-MPR-018: Verificacao Fase 2
- [ ] Testar partida completa - todas as acoes sincronizam
- [ ] Testar reconexao - state_update restaura estado
- [ ] Verificar que eventos legados ainda funcionam para feedback
- [ ] Comparar estado entre Host e Guest (devem ser identicos)

---

## Fase 3: Intents para Guest

**Objetivo:** Guest envia intencoes, Host executa.
**Risco:** Medio-Alto
**Estimativa:** 4-5 horas
**Dependencia:** Fase 2 completa

### TASK-MPR-019: Criar eventos de intent
- [ ] Adicionar `intent_consume_pill` ao types
- [ ] Adicionar `intent_use_item` ao types
- [ ] Adicionar `intent_select_item` ao types
- [ ] Adicionar `intent_deselect_item` ao types
- [ ] Adicionar `intent_confirm_selection` ao types
- [ ] Adicionar `intent_toggle_wants_store` ao types
- [ ] Adicionar `intent_cart_update` ao types
- [ ] Adicionar `intent_confirm_store` ao types

**Arquivos:**
- `src/types/events.ts`

---

### TASK-MPR-020: Handlers de intent no Host
- [ ] Implementar handler para cada intent
- [ ] Host executa acao correspondente
- [ ] Host chama broadcastGameState()

**Arquivos:**
- `src/stores/multiplayerStore.ts`

---

### TASK-MPR-021: Modificar hooks para enviar intents
- [ ] `usePillConsumption` - Guest envia intent ao inves de executar
- [ ] `useItemUsage` - Guest envia intent
- [ ] `useItemSelection` - Guest envia intent

**Arquivos:**
- `src/hooks/usePillConsumption.ts`
- `src/hooks/useItemUsage.ts`
- `src/hooks/useItemSelection.ts`

---

### TASK-MPR-022: Modificar componentes para check de role
- [ ] `PillPool` / `Pill` - Guest envia intent no click
- [ ] `InventorySlot` - Guest envia intent no click
- [ ] `StoreItemCard` - Guest envia intent

**Arquivos:**
- `src/components/game/Pill.tsx`
- `src/components/game/InventorySlot.tsx`
- `src/components/game/StoreItemCard.tsx`

---

### TASK-MPR-023: Verificacao Fase 3
- [ ] Testar como Guest - todas as acoes funcionam
- [ ] Testar como Host - comportamento identico ao anterior
- [ ] Verificar latencia de intent -> state_update
- [ ] Testar reconexao como Guest

---

## Fase 4: Remover Legado

**Objetivo:** Eliminar flag e simplificar eventos.
**Risco:** Baixo (se fases anteriores completas)
**Estimativa:** 2-3 horas
**Dependencia:** Fase 3 completa e estavel

### TASK-MPR-024: Remover isSyncingFromRemote
- [ ] Remover variavel `isSyncingFromRemote`
- [ ] Remover funcao `setSyncingFromRemote`
- [ ] Remover funcao `getIsSyncingFromRemote`
- [ ] Remover checks de isSyncingFromRemote

**Arquivos:**
- `src/stores/gameStore.ts`

---

### TASK-MPR-025: Simplificar emitMultiplayerEvent
- [ ] Remover funcao se nao mais necessaria
- [ ] OU simplificar para apenas feedback events
- [ ] Atualizar chamadas

**Arquivos:**
- `src/stores/gameStore.ts`

---

### TASK-MPR-026: Converter eventos legados para feedback-only
- [ ] `pill_consumed` - apenas toast/animacao, nao modifica estado
- [ ] `item_used` - apenas overlay/toast
- [ ] Outros eventos - revisar necessidade

**Arquivos:**
- `src/stores/multiplayerStore.ts`
- `src/stores/gameStore.ts`

---

### TASK-MPR-027: Simplificar applyRemoteEvent
- [ ] Remover cases que modificam estado
- [ ] Manter apenas cases de feedback visual
- [ ] OU remover funcao inteira se nao necessaria

**Arquivos:**
- `src/stores/gameStore.ts`

---

### TASK-MPR-028: Remover state_sync legado
- [ ] Substituir por state_update
- [ ] Remover handler de state_sync
- [ ] Remover interface StateSyncEvent

**Arquivos:**
- `src/stores/multiplayerStore.ts`
- `src/types/events.ts`

---

### TASK-MPR-029: Limpeza final
- [ ] Remover imports nao utilizados
- [ ] Remover funcoes deprecated
- [ ] Atualizar documentacao
- [ ] Verificar lint/types

**Arquivos:**
- Todos os arquivos modificados

---

### TASK-MPR-030: Verificacao Final
- [ ] Teste completo single player
- [ ] Teste completo multiplayer (criar, jogar, reconectar)
- [ ] Verificar que nenhum codigo legado permanece
- [ ] Performance check - nenhuma regressao
- [ ] Atualizar architecture.md com nova arquitetura

---

## Resumo de Fases

| Fase | Tasks | Estimativa | Risco | Dependencia |
|------|-------|------------|-------|-------------|
| 1 - Unificar Fonte | MPR-001 a MPR-008 | 2-3h | Baixo | Nenhuma |
| 2 - State Broadcast | MPR-009 a MPR-018 | 3-4h | Medio | Fase 1 |
| 3 - Intents Guest | MPR-019 a MPR-023 | 4-5h | Medio-Alto | Fase 2 |
| 4 - Remover Legado | MPR-024 a MPR-030 | 2-3h | Baixo | Fase 3 |

**Total estimado:** 11-15 horas de desenvolvimento

---

## Criterios de Rollback

### Fase 1
- Se single player quebrar: reverter todas as mudancas de helpers
- Se multiplayer instavel: manter mode/roomId no gameStore temporariamente

### Fase 2
- Se sincronizacao falhar: desabilitar broadcastGameState, manter eventos legados
- Feature flag: `USE_STATE_BROADCAST = false`

### Fase 3
- Se intents causarem latencia inaceitavel: Guest volta a executar localmente
- Feature flag: `USE_INTENTS = false`

### Fase 4
- Nao iniciar ate fases anteriores estarem estaveis por 1+ semana
- Se bugs aparecerem: reverter e manter sistema hibrido

---

## Notas de Implementacao

1. **Cada fase deve ser um PR separado** para facilitar review e rollback
2. **Testes manuais obrigatorios** antes de merge
3. **Logs detalhados** durante migracao para debug
4. **Feature flags** para permitir rollback sem redeploy

