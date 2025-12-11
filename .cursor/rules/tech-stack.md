# Stack Tecnologica

## ⚠️ Restricoes de Dependencias (Refatoracao)

- **Zero Novas Libs:** Nao adicione pacotes npm (ex: lodash, moment, axios) sem aprovacao explicita. Use o que ja esta instalado ou implemente utilitarios nativos.
- **Tailwind-First:** Nao crie arquivos CSS ou SCSS. Nao use styled-components. Tudo deve ser utility classes.
- **Zustand Exclusivo:** Nao introduza Context API ou Redux. Se precisar de estado global, use/estenda os stores existentes.
- **Multiplayer State:** Use **apenas** Supabase Realtime/Channels. Não introduza Yjs, Liveblocks ou Redux-Saga.

## Core
- **Framework:** React 18+ (hooks funcionais)
- **Build Tool:** Vite
- **Linguagem:** TypeScript (strict mode)
- **Package Manager:** pnpm

## UI e Estilizacao
- **CSS Framework:** Tailwind CSS v4
- **Componentes Base:** shadcn/ui
- **Componentes Retro:** 8bit/ui (visual pixelado)
- **Animacoes:** Framer Motion

## Backend & Multiplayer
- **BaaS:** Supabase (Auth, Database, Realtime)
- **Autenticacao:** Supabase Auth (Google, Discord, Twitch) - Guest-First
  - `Player.userId: string | null` - Link para usuario autenticado
  - `null` = Guest/Bot (sem persistencia)
  - `string` = Autenticado (ranking, conquistas, stats)
- **Multiplayer:** Supabase Realtime (Channels) para sincronizacao de estado
- **Padrao de Sincronizacao:**
  - O "Dono da Sala" (Host) ou o Servidor (Edge Function) detem a verdade do GameState
  - Clientes apenas enviam "Intencoes" (Actions) e recebem "Estado Atualizado" (Patch)

## Estado e Logica
- **State Management:** Zustand (stores modulares)
- **Game Logic:** Funcoes puras em `src/utils/`
- **Custom Hooks:** Encapsulam acoes e selectors do Zustand

## Arquitetura de Estado
```
stores/
├── gameStore        -> Orquestracao (delega para stores modulares)
├── toastStore       -> Fila de notificacoes (non-blocking)
├── overlayStore     -> Stack de overlays (blocking)
├── multiplayerStore -> Estado de conexao multiplayer
└── game/            -> Stores modulares (refactor em andamento)
    ├── effectsStore   -> Efeitos de jogador (shield, handcuffs)
    ├── shopStore      -> Pill Store, carrinho, boosts
    ├── pillPoolStore  -> Pool de pilulas (TODO)
    ├── playerStore    -> Vidas, resistencia (TODO)
    ├── inventoryStore -> Itens, selecao (TODO)
    └── gameFlowStore  -> Fases, turnos, rodadas (TODO)
```

## Fluxo de Dados
1. Usuario interage com componente
2. Hook dispara action do store
3. Store atualiza estado
4. Componentes re-renderizam via selectors
5. Animacoes Framer Motion respondem a mudancas

## Convencoes
- Preferir composicao sobre heranca
- Separar logica de UI (hooks vs componentes)
- Manter stores pequenos e focados
- Usar TypeScript para todas as interfaces
