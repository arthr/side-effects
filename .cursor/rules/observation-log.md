# Registro de Observacoes

## 🧠 Licoes de Refatoracao (Preencha durante o processo)

Use esta secao para registrar armadilhas encontradas.
Exemplo:
- [Data] **Risco de Render:** Ao refatorar `GameBoard`, descobrimos que o timer dispara re-renders no componente pai. Solucao: O timer foi isolado em um componente filho `TurnTimer`.
- [Data] **Zustand:** Nao desestruture stores dentro de loops ou callbacks. Use seletores granulares (`useStore(s => s.item)`) para evitar renders desnecessarios.

- [2024-12-11] **Barrel Exports:** Ao adicionar novos tipos, SEMPRE atualizar `src/types/index.ts`. Imports do tipo `import('@/types')` falham se o tipo nao estiver exportado no barrel, mesmo que exista no arquivo de origem.

- [2024-12-11] **Timeout Cleanup:** Em stores com `setTimeout`, SEMPRE limpar o timeout em:
  1. Action de reset especifica
  2. Action `reset()` global
  3. Antes de criar novo timeout (evitar vazamento)
  Exemplo: `multiplayerStore._rematchTimeoutId` limpo em `resetRematchState()` e `reset()`

- [2024-12-11] **Race Conditions em Multiplayer:** Quando dois jogadores acionam mesma action simultaneamente, validar se estado atual ja reflete a intencao antes de criar novo estado. Exemplo: ambos em `rematchState.status === 'waiting'` significa "ambos aceitaram".

- [2024-12-11] **Verificacao de Estado Local vs Remoto:** Ao implementar sistemas de coordenacao multiplayer, SEMPRE verificar se o estado pertence ao jogador local ou remoto. Nao assumir que `requestedBy !== null` identifica o oponente - pode ser o proprio jogador! Padrao correto:
  ```typescript
  // ❌ ERRADO
  const isOpponentState = state.someField !== null
  
  // ✅ CORRETO
  const isMyState = state.someField === myId
  const isOpponentState = state.someField !== null && state.someField !== myId
  ```
  Exemplo: Bug de auto-aceitar rematch corrigido verificando `requestedBy === localPlayerId` vs `requestedBy !== localPlayerId`.

- [2024-12-11] **Callback Chains em React Dialogs:** Ao implementar acoes em Dialogs, EVITAR chamar `onClose()` apos acoes que mudam estado (ex: `onAcceptRematch()`). O Dialog deve fechar automaticamente via mudanca de estado (fase/modo). Problema:
  ```typescript
  // ❌ ERRADO - Cria callback chain duplo
  <Button onClick={() => {
    onAcceptRematch()  // 1. Muda estado
    onClose()          // 2. Dispara onOpenChange
                       // 3. onOpenChange pode chamar outra action conflitante
  }}>
  
  // ✅ CORRETO - Fecha automaticamente
  <Button onClick={() => {
    onAcceptRematch()  // 1. Muda estado
                       // 2. Dialog fecha quando componente pai re-renderiza
  }}>
  ```
  Exemplo: Bug de dupla chamada `acceptRematch()` + `declineRematch()` corrigido removendo `onClose()` manual.

- [2025-12-12] **DevTool para validar UI N-jogadores:** Para testar layout 3-4 players sem multiplayer completo, adicionamos controles no `FloatingDevTool > Actions` para `+ Bot` / `- Bot` (cria/remove `player3/player4` como IA). Importante: ao adicionar/remover players, atualizar tambem mapas do `gameStore` indexados por `PlayerId` (ex: `shapeQuests`, `itemSelectionConfirmed`, `revealAtStart` e `storeState.{confirmed,cart,pendingBoosts}` quando existir) para evitar `undefined` e inconsistencias visuais.

- [2024-12-11] **Refatoracao de Stores (N-Jogadores):** Decomposicao bem-sucedida do gameStore:
  - **6 Stores Modulares** criados: gameFlowStore, pillPoolStore, playerStore, itemUsageStore, effectsStore, shopStore
  - **224 testes unitarios** adicionados (antes: ~10% cobertura)
  - **DUAL-WRITE Strategy:** Manteve retrocompatibilidade durante migracao - gameStore delega para stores modulares
  - **Barrel Exports:** `src/stores/game/index.ts` exporta tudo - permite imports limpos (`@/stores/game`)
  - **Funcoes Puras:** turnManager/playerManager extraidos para `utils/` - facilitam testes e logica N-jogadores
  - **Reducao de 223 linhas** no gameStore (-9%) removendo comentarios DUAL-WRITE e logs
  - **Zero regressoes:** Single player e multiplayer continuam funcionais
  - **Proximos passos:** UI para N-jogadores (spec separada), remover refs hardcoded restantes

### Decisoes Arquiteturais

- [2025-12-12] **PlayerId como UUID (Refatoracao Completa):** Migrado `PlayerId` de `playerN` para UUID v4:
  - **Antes:** `PlayerId` = `"player1"`, `"player2"` (semantica de ordem embutida)
  - **Depois:** `PlayerId` = UUID v4 (ex: `"a1b2c3d4-e5f6-7890-abcd-ef1234567890"`)
  - **Ordem explícita:** `playerOrder: PlayerId[]` no `gameFlowStore` (fonte única de verdade)
  - **UI/DevTool:** `getSeatLabel(playerId, playerOrder)` retorna "P1/P2/P3" para legibilidade
  - **Regra de Ouro:** NUNCA ordenar jogadores por `PlayerId`. Sempre usar `playerOrder`.
  - **Impacto:** 
    - `gameStore.initGame()` gera UUIDs para humano/bot
    - `playerStore.initializePlayers()` aceita `playerId` opcional (fallback para UUID)
    - DevTools mantém `generatePlayerId(index)` temporariamente (comentado como TODO)
    - Todos os testes atualizados para fornecer `playerId` explícito
  - **Resultado:** 408 testes passando, 0 erros de linter, zero regressões
  - **Status:** ✅ Fase B.1 (Single Player) e B.2 (Multiplayer) CONCLUÍDAS

- [2025-12-12] **Bugs Críticos da Fase B.1 - Correção Pós-Commit 3cc731b:**
  - **Contexto:** O commit 3cc731b corrigiu `initGame()` mas esqueceu `resetRound()` e `initialState`
  - **Bug 1 - Mapas Hardcoded no `initialState`:**
    - `shapeQuests`, `itemSelectionConfirmed` e `revealAtStart` inicializados como `{ player1: ..., player2: ... }`
    - Quando jogo usa UUIDs, mapas retornam `undefined` → crash ao acessar `state.shapeQuests[uuid]`
    - **Correção:** Inicializar como `{}` e popular dinamicamente no `initGame()`
  - **Bug 2 - `resetRound()` com hardcoded:**
    - Linhas 725-726: `newShapeQuests = { player1: ..., player2: ... }`
    - Linhas 731, 785: `revealAtStart.player1 + revealAtStart.player2`
    - Linhas 786-789: `players: { player1: ..., player2: ... }`
    - **Correção:** Usar `playerOrder` para iterar dinamicamente e construir mapas
  - **Bug 3 - `useAIItemSelection` assume posição fixa:**
    - Assumia `playerOrder[1]` é sempre bot, mas em multiplayer é o guest (humano)
    - **Correção:** Buscar primeiro player com `isAI === true` via `playerOrder.find()`
  - **Impacto:** Jogo quebrava ao resetar rodada (segunda rodada em diante)
  - **Resultado:** ✅ Todos bugs corrigidos, 408 testes passando, jogo funcional

- [2024-12-11] **PlayerId vs UserId:** Decidimos separar dois conceitos:
  - `PlayerId` = UUID de sessão (não persistente)
  - `UserId` = UUID do Supabase Auth, identidade do usuario, persistente
  - Motivo: Permite "Guest-First" (jogar sem cadastro) e simplifica logica de turnos
  - Campo `Player.userId: string | null` ja existe no modelo

- [2024-12-11] **Sistema de Rematch (Multiplayer):** Implementado fluxo de coordenacao pos-jogo:
  - Estado `rematchState` no `multiplayerStore` (nao no gameStore)
  - 3 eventos novos: `rematch_requested`, `rematch_accepted`, `rematch_declined`
  - Timeout de 30s para decisao (limpo automaticamente)
  - Race condition tratada: ambos solicitam = aceitacao automatica
  - UI condicional em `GameOverDialog` (3 variantes)
  - Importante: `handleRestart` nao chama `resetGame()` em multiplayer (delegado aos callbacks)
  - Resultado: Fluxo completo funcional em ~2h (8 arquivos modificados, 0 erros)

## Diretrizes para o Agente

### Antes de Qualquer Alteracao
1. Leia `architecture.md` para entender a estrutura atual
2. Leia `tech-stack.md` para garantir consistencia tecnologica
3. Verifique `product.md` para alinhar com o objetivo do jogo

### Ao Implementar Features
- Siga os padroes de `structure.md`
- Mantenha separacao entre UI (componentes) e logica (stores/hooks)
- Use TypeScript para todas as interfaces
- Prefira composicao e reutilizacao de componentes existentes

### Decisoes de Design Importantes
- **State Management:** Zustand com stores modulares (gameStore, overlayStore, toastStore)
- **Animacoes:** Framer Motion com AnimatePresence para transicoes
- **UI Retro:** Componentes 8bit/ui para visual pixelado consistente
- **Overlays:** Sistema de stack com apenas 1 overlay ativo por vez
- **Toasts:** Sistema de fila nao-bloqueante para feedback

### Anti-Patterns a Evitar
- Nao criar novos stores sem necessidade clara
- Nao duplicar estado entre stores
- Nao colocar logica de negocio em componentes
- Nao usar inline styles (preferir Tailwind)
- Nao criar componentes muito grandes (max ~200 linhas)
