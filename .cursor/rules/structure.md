# Estrutura do Projeto e Convencoes

## Localizacao Obrigatoria de Arquivos (Refatoracao)

Se voce criar ou mover arquivos durante a refatoracao, siga estritamente este mapa. Nao crie pastas fora deste padrao.

- Logica pura de jogo/regras? -> `src/utils/`
- Logica de React/Ciclo de vida? -> `src/hooks/`
- Estado global? -> `src/stores/`
- Interfaces/Tipos compartilhados? -> `src/types/`
- Componentes Visuais? -> `src/components/ui/` (se generico) ou `src/components/game/` (se especifico do jogo)
- **Dispatcher de Ações/Engine?** -> `src/engine/` (ou `services/game/`). Esta camada decide se a ação é Local (Single) ou Remota (Multi).

**Regra de Colocacao:** Se um arquivo for usado por APENAS um componente, mantenha-o na mesma pasta do componente. Se for usado por dois ou mais, mova para `src/utils` ou `src/hooks`.

## Estrutura de Pastas
```
src/
├── components/
│   ├── game/                     # Componentes do jogo (Pill, PillPool, GameBoard, Item*, Inventory*)
│   ├── layout/                   # Layout da aplicação (GameLayout, Header, Footer)
│   ├── overlays/                 # Modais e overlays (PillReveal, GameOverDialog, NewRoundOverlay, ItemEffectOverlay)
│   ├── toasts/                   # Sistema de notificações (Toast, ToastManager, PlayerToasts)
│   ├── ui/                       # Componentes base shadcn/ui
│   ├── 8bit/                     # Componentes 8bit/ui (visual retro)
│   └── engine/                   # (NOVO) Camada de decisão Local vs Multiplayer (Action Dispatcher)
│
├── hooks/                        # Custom hooks (useGameActions, usePillConsumption, useAIPlayer, useItem*, useAIStore, useStoreTimer)
│
├── stores/                       # Zustand stores (gameStore, toastStore, overlayStore)
│
├── types/                        # TypeScript types
│   ├── game.ts                   # GameState, GamePhase, GameConfig, DifficultyLevel
│   ├── pill.ts                   # Pill, PillType, PillShape, PillStats
│   ├── player.ts                 # Player, PlayerId, PlayerEffectResult
│   ├── item.ts                   # ItemType, ItemDefinition, InventoryItem
│   ├── ai.ts                     # AIConfig, AIDecisionContext, PoolRiskAnalysis
│   ├── quest.ts                  # ShapeQuest, QuestConfig
│   ├── store.ts                  # StoreState, StoreItem, CartItem, BoostType
│   └── index.ts                  # Barrel export
│
├── utils/                        # Funções utilitárias
│   ├── constants.ts              # Constantes do jogo, cores, labels, shapes
│   ├── pillGenerator.ts          # Geração de pool de pílulas
│   ├── pillProgression.ts        # Progressão de tipos e quantidade por rodada
│   ├── shapeProgression.ts       # Progressão de shapes ATIVAS/SAZONAIS
│   ├── gameLogic.ts              # Lógica de efeitos e colapso
│   ├── aiLogic.ts                # Lógica de decisão da IA (refatorado)
│   ├── aiConfig.ts               # Configurações de IA por dificuldade
│   ├── itemCatalog.ts            # Catálogo de itens/power-ups
│   ├── itemLogic.ts              # Lógica de efeitos de itens
│   ├── questGenerator.ts         # Geração e validação de Shape Quests
│   └── storeConfig.ts            # Configuração da Pill Store

```

## Convencoes de Nomenclatura
- **Componentes React:** `PascalCase.tsx` (ex: `GameBoard.tsx`)
- **Hooks:** `camelCase.ts` com prefixo `use` (ex: `useGameActions.ts`)
- **Stores:** `camelCase.ts` com sufixo `Store` (ex: `gameStore.ts`)
- **Types:** `camelCase.ts` (ex: `game.ts`, `pill.ts`)
- **Utils:** `camelCase.ts` (ex: `pillGenerator.ts`)
- **Variaveis:** `camelCase` sempre
- **Constantes:** `UPPER_SNAKE_CASE` (ex: `MAX_LIVES`, `PILL_TYPES`)

## Padroes de Codigo
- Componentes funcionais com hooks
- Props tipadas com interfaces (nao types inline)
- Exports nomeados (evitar default exports)
- Barrel exports em `index.ts` para cada pasta
