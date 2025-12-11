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
├── stores/                       # Zustand stores
│   ├── gameStore.ts              # Store principal (orquestracao)
│   ├── toastStore.ts             # Fila de notificacoes
│   ├── overlayStore.ts           # Stack de overlays
│   ├── multiplayerStore.ts       # Estado de conexao multiplayer
│   ├── game/                     # Stores modulares do jogo (refactor em andamento)
│   │   ├── effectsStore.ts       # Efeitos de jogador (shield, handcuffs)
│   │   ├── shopStore.ts          # Pill Store, carrinho, boosts
│   │   ├── pillPoolStore.ts      # Pool de pilulas (TODO)
│   │   ├── inventoryStore.ts     # Itens e selecao (TODO)
│   │   ├── playerStore.ts        # Vidas, resistencia (TODO)
│   │   ├── gameFlowStore.ts      # Fases, turnos, rodadas (TODO)
│   │   └── index.ts              # Barrel export
│   └── multiplayer/              # Stores de multiplayer
│       └── index.ts              # Barrel export
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
├── utils/                        # Funcoes utilitarias (PURAS, sem side effects)
│   ├── constants.ts              # Constantes do jogo, cores, labels, shapes
│   ├── turnManager.ts            # Rotacao de turnos N-jogadores (NOVO)
│   ├── playerManager.ts          # Helpers para N jogadores (NOVO)
│   ├── pillGenerator.ts          # Geracao de pool de pilulas
│   ├── pillProgression.ts        # Progressao de tipos e quantidade por rodada
│   ├── shapeProgression.ts       # Progressao de shapes ATIVAS/SAZONAIS
│   ├── gameLogic.ts              # Logica de efeitos e colapso
│   ├── aiLogic.ts                # Logica de decisao da IA
│   ├── aiConfig.ts               # Configuracoes de IA por dificuldade
│   ├── itemCatalog.ts            # Catalogo de itens/power-ups
│   ├── itemLogic.ts              # Logica de efeitos de itens
│   ├── questGenerator.ts         # Geracao e validacao de Shape Quests
│   ├── storeConfig.ts            # Configuracao da Pill Store
│   └── __tests__/                # Testes unitarios
│       ├── turnManager.test.ts   # 20 testes
│       ├── playerManager.test.ts # 26 testes
│       ├── pillGenerator.test.ts
│       ├── pillProgression.test.ts
│       ├── questGenerator.test.ts
│       └── shapeProgression.test.ts

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
