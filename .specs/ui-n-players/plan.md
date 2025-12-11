# Plano - UI para N Jogadores (2-4)

**Data de Criacao:** 2024-12-11  
**Ultima Atualizacao:** 2024-12-11  
**Status:** Planejado

---

## Objetivo

Adaptar a UI do jogo para suportar **2 a 4 jogadores** simultaneamente, mantendo a experiência visual e usabilidade.

> **Dependência:** Refatoração do Core Loop N-Jogadores (CONCLUÍDO)

---

## Contexto

A arquitetura backend já suporta N jogadores (via refatoração concluída), mas a UI ainda está hardcoded para 2 jogadores com layout fixo.

### Componentes Afetados

**Layout Atual (2 jogadores):**
```
┌────────────────────────────────────┐
│         Player 1 Stats (Top)       │
├────────────────────────────────────┤
│                                    │
│         Pill Pool (Center)         │
│                                    │
├────────────────────────────────────┤
│       Player 2 Stats (Bottom)      │
└────────────────────────────────────┘
```

**Layout Proposto (2-4 jogadores):**
```
2 Jogadores (atual):
┌────────────────────────────────────┐
│         Player 1 (Top)             │
│         Pill Pool                  │
│         Player 2 (Bottom)          │
└────────────────────────────────────┘

3 Jogadores:
┌────────────────────────────────────┐
│  P1 (Top-Left)    P2 (Top-Right)   │
│         Pill Pool (Center)         │
│         P3 (Bottom-Center)         │
└────────────────────────────────────┘

4 Jogadores:
┌────────────────────────────────────┐
│  P1 (Top-Left)    P2 (Top-Right)   │
│         Pill Pool (Center)         │
│  P3 (Bot-Left)    P4 (Bot-Right)   │
└────────────────────────────────────┘
```

---

## Componentes a Refatorar

### Criticos (Bloqueadores)

| Componente | Arquivo | Linhas | Problema |
|------------|---------|--------|----------|
| `GameBoard` | `components/game/GameBoard.tsx` | ~400 | Layout fixo 2 players |
| `PlayerStats` | `components/game/PlayerStats.tsx` | ~200 | Posicionamento hardcoded |
| `GameLayout` | `components/layout/GameLayout.tsx` | ~150 | Grid fixo |
| `ItemSelectionGrid` | `components/game/ItemSelectionGrid.tsx` | ~180 | Assume 2 players |

### Importantes (Adaptação)

| Componente | Arquivo | Linhas | Problema |
|------------|---------|--------|----------|
| `PlayerToasts` | `components/toasts/PlayerToasts.tsx` | ~80 | Posições fixas |
| `ShapeQuest` | `components/game/ShapeQuest.tsx` | ~120 | Layout 2 players |
| `PillStoreDialog` | `components/game/PillStoreDialog.tsx` | ~300 | Grid 2 colunas |
| `GameOverDialog` | `components/overlays/GameOverDialog.tsx` | ~150 | Winner binário |

### Baixa Prioridade (Cosmético)

| Componente | Arquivo | Problema |
|------------|---------|----------|
| `TurnIndicator` | `components/game/TurnIndicator.tsx` | Seta entre 2 players |
| `EffectBadge` | `components/game/EffectBadge.tsx` | Visual OK |
| `ItemCard` | `components/game/ItemCard.tsx` | Visual OK |

---

## Arquivos Afetados

### Criação

| Arquivo | Descrição | Linhas Est. |
|---------|-----------|-------------|
| `components/game/PlayerGrid.tsx` | Grid responsivo para N players | ~150 |
| `utils/layoutCalculator.ts` | Calcula posições dinamicamente | ~80 |
| `hooks/usePlayerLayout.ts` | Hook para layout N players | ~60 |

### Modificação

| Arquivo | Mudança |
|---------|---------|
| `components/game/GameBoard.tsx` | Usar PlayerGrid dinâmico |
| `components/game/PlayerStats.tsx` | Props para posição dinâmica |
| `components/layout/GameLayout.tsx` | Grid CSS adaptativo |
| `components/game/ItemSelectionGrid.tsx` | Loop N players |
| `components/toasts/PlayerToasts.tsx` | Posições dinâmicas |
| `components/game/ShapeQuest.tsx` | Layout flexível |
| `components/game/PillStoreDialog.tsx` | N colunas |
| `components/overlays/GameOverDialog.tsx` | N players ranking |

---

## Passo a Passo (Checklist)

### Fase 1: Análise e Preparação

- [ ] **1.1** Auditar todos os componentes com referências hardcoded
- [ ] **1.2** Mapear props que precisam mudar (playerId, position, etc)
- [ ] **1.3** Definir breakpoints responsivos (mobile, tablet, desktop)
- [ ] **1.4** Criar protótipos visuais para 2, 3 e 4 players

### Fase 2: Utilitários e Hooks

- [ ] **2.1** Criar `utils/layoutCalculator.ts`:
  ```typescript
  export function calculatePlayerPositions(
    playerCount: number
  ): PlayerPosition[]
  
  export function getGridLayout(
    playerCount: number
  ): GridConfig
  ```

- [ ] **2.2** Criar `hooks/usePlayerLayout.ts`:
  ```typescript
  export function usePlayerLayout() {
    const playerIds = usePlayerIds()
    const positions = calculatePlayerPositions(playerIds.length)
    return { playerIds, positions, gridConfig }
  }
  ```

- [ ] **2.3** Criar testes unitários para layoutCalculator
- [ ] **2.4** Criar testes de integração para usePlayerLayout

### Fase 3: Componente PlayerGrid

- [ ] **3.1** Criar `components/game/PlayerGrid.tsx`:
  ```typescript
  interface PlayerGridProps {
    children: React.ReactNode
    playerCount: number
  }
  
  export function PlayerGrid({ children, playerCount }: PlayerGridProps)
  ```

- [ ] **3.2** Implementar layouts CSS para 2, 3, 4 players
- [ ] **3.3** Adicionar animações de transição entre layouts
- [ ] **3.4** Testar responsividade (mobile, tablet, desktop)

### Fase 4: Refatorar Componentes Principais

- [ ] **4.1** Refatorar `GameBoard.tsx`:
  - Substituir layout fixo por `<PlayerGrid>`
  - Usar `usePlayerLayout()` para posições
  - Loop dinâmico sobre `playerIds`

- [ ] **4.2** Refatorar `PlayerStats.tsx`:
  - Adicionar prop `position: PlayerPosition`
  - Adaptar tamanho baseado em playerCount
  - Manter legibilidade em telas pequenas

- [ ] **4.3** Refatorar `ItemSelectionGrid.tsx`:
  - Loop sobre N players
  - Grid adaptativo baseado em playerCount
  - Manter UX de seleção clara

- [ ] **4.4** Refatorar `GameLayout.tsx`:
  - CSS Grid flexível
  - Breakpoints para mobile/tablet/desktop
  - Testar com 2, 3, 4 players

### Fase 5: Componentes Secundários

- [ ] **5.1** Adaptar `PlayerToasts.tsx`:
  - Posições dinâmicas baseadas em layout
  - Evitar sobreposição de toasts
  - Testar visibilidade com 4 players

- [ ] **5.2** Adaptar `ShapeQuest.tsx`:
  - Layout flexível para N quests
  - Scroll horizontal se necessário
  - Indicador visual de progresso

- [ ] **5.3** Adaptar `PillStoreDialog.tsx`:
  - Grid de N colunas
  - Cada player vê seu carrinho
  - Timer compartilhado visível para todos

- [ ] **5.4** Adaptar `GameOverDialog.tsx`:
  - Ranking de N players
  - Destacar vencedor
  - Mostrar stats de todos

### Fase 6: Polimento e Acessibilidade

- [ ] **6.1** Adicionar indicadores visuais claros de turno
- [ ] **6.2** Garantir contraste mínimo (WCAG AA)
- [ ] **6.3** Testar navegação por teclado
- [ ] **6.4** Adicionar labels ARIA para leitores de tela
- [ ] **6.5** Testar performance com 4 players + animações

### Fase 7: Testes e Validação

- [ ] **7.1** Teste manual: 2 players (regressão)
- [ ] **7.2** Teste manual: 3 players (novo)
- [ ] **7.3** Teste manual: 4 players (novo)
- [ ] **7.4** Teste responsivo: mobile, tablet, desktop
- [ ] **7.5** Teste multiplayer: 4 players simultâneos
- [ ] **7.6** Validar performance (FPS, memory)

---

## Wireframes

### Layout 2 Jogadores (Atual)

```
┌─────────────────────────────────────────────┐
│  [P1 Avatar] [Lives] [Resistance] [Coins]   │ ← Top Player
├─────────────────────────────────────────────┤
│                                             │
│         [Pill Pool - Grid 4x3]              │ ← Center
│                                             │
├─────────────────────────────────────────────┤
│  [P2 Avatar] [Lives] [Resistance] [Coins]   │ ← Bottom Player
└─────────────────────────────────────────────┘
```

### Layout 3 Jogadores (Proposto)

```
┌─────────────────────────────────────────────┐
│ [P1 Stats]              [P2 Stats]          │ ← Top Row
├─────────────────────────────────────────────┤
│                                             │
│         [Pill Pool - Grid 4x3]              │ ← Center
│                                             │
├─────────────────────────────────────────────┤
│           [P3 Stats - Centered]             │ ← Bottom Row
└─────────────────────────────────────────────┘
```

### Layout 4 Jogadores (Proposto)

```
┌─────────────────────────────────────────────┐
│ [P1 Stats]              [P2 Stats]          │ ← Top Row
├─────────────────────────────────────────────┤
│                                             │
│         [Pill Pool - Grid 4x3]              │ ← Center
│                                             │
├─────────────────────────────────────────────┤
│ [P3 Stats]              [P4 Stats]          │ ← Bottom Row
└─────────────────────────────────────────────┘
```

---

## Considerações de Design

### Responsividade

| Viewport | Layout | Observações |
|----------|--------|-------------|
| Mobile (<640px) | Vertical stack | Pills menores, stats compactos |
| Tablet (640-1024px) | Grid 2x2 ou 3-up | Tamanho médio |
| Desktop (>1024px) | Grid otimizado | Tamanho completo |

### Performance

- **Animações:** Usar `will-change` com moderação
- **Re-renders:** Memoizar componentes de player
- **Images:** Lazy load avatares/itens
- **Grid:** CSS Grid > Flexbox (performance)

### Acessibilidade

- **Cores:** Manter contraste mínimo 4.5:1
- **Focus:** Indicadores claros de foco
- **Screen readers:** Labels descritivos
- **Keyboard:** Navegação completa por teclado

---

## Riscos e Mitigações

| Risco | Prob. | Impacto | Mitigação |
|-------|-------|---------|-----------|
| Poluição visual (4 players) | Alta | Alto | Testar early, ajustar tamanhos |
| Performance em mobile | Média | Médio | Otimizar animações, lazy load |
| UX confusa com 4 players | Alta | Alto | User testing, iteração rápida |
| Breakpoint inadequado | Média | Baixo | Testes em devices reais |

---

## Métricas de Sucesso

| Métrica | Atual | Meta |
|---------|-------|------|
| Suporta N players UI | 2 fixo | 2-4 dinâmico |
| Componentes hardcoded | ~8 | 0 |
| Responsividade | Parcial | Mobile + Tablet + Desktop |
| Performance (FPS) | 60 | 60 (4 players) |
| Acessibilidade | Básica | WCAG AA |

---

## Dependências

### Técnicas

- ✅ Refatoração Core Loop N-Jogadores (CONCLUÍDO)
- ✅ Stores modulares implementados
- ✅ Hooks usePlayerIds(), useAlivePlayers() disponíveis

### Design

- [ ] Protótipos visuais para 3-4 players
- [ ] Definição de breakpoints responsivos
- [ ] Testes de usabilidade

---

## Entregáveis

### Código

- [ ] `components/game/PlayerGrid.tsx`
- [ ] `utils/layoutCalculator.ts`
- [ ] `hooks/usePlayerLayout.ts`
- [ ] Componentes refatorados (8 arquivos)
- [ ] Testes unitários e de integração

### Documentação

- [ ] Guia de uso do PlayerGrid
- [ ] Design tokens para layouts
- [ ] Screenshots de cada layout
- [ ] Relatório de acessibilidade

### Validação

- [ ] Testes manuais (2, 3, 4 players)
- [ ] Testes responsivos (3 viewports)
- [ ] Testes de performance
- [ ] User testing (opcional)

---

## Cronograma Estimado

| Fase | Duração | Complexidade |
|------|---------|--------------|
| 1. Análise | 2h | Baixa |
| 2. Utilitários | 3h | Média |
| 3. PlayerGrid | 4h | Alta |
| 4. Refactor Main | 6h | Alta |
| 5. Secundários | 4h | Média |
| 6. Polimento | 3h | Média |
| 7. Testes | 4h | Média |
| **Total** | **26h** | - |

---

## Notas de Implementação

### CSS Grid Layout

```css
/* 2 Players */
.player-grid-2 {
  display: grid;
  grid-template-rows: auto 1fr auto;
  gap: 1rem;
}

/* 3 Players */
.player-grid-3 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto 1fr auto;
  grid-template-areas:
    "p1 p2"
    "pills pills"
    "p3 p3";
}

/* 4 Players */
.player-grid-4 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto 1fr auto;
  grid-template-areas:
    "p1 p2"
    "pills pills"
    "p3 p4";
}
```

### Typescript Types

```typescript
export type PlayerPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'bottom-center'

export interface GridConfig {
  columns: number
  rows: number
  areas: string[]
}

export interface PlayerLayoutInfo {
  playerId: PlayerId
  position: PlayerPosition
  gridArea: string
}
```

---

## Referências

- [Refatoração Core Loop](.specs/refactor-game-store/CONCLUIDO.md) - Pré-requisito
- [Design System](../../docs/DESIGN-SYSTEM.md) - Tokens e componentes
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/) - Acessibilidade

---

## Próximos Passos (Após UI)

1. **Multiplayer 3-4 Players** - Sincronização estendida
2. **Matchmaking** - Sistema de salas públicas
3. **Spectator Mode** - Assistir partidas
4. **Replay System** - Gravar e revisar partidas

---

> **NOTA:** Esta spec foca apenas na camada visual. A lógica de jogo já suporta N jogadores (via refatoração anterior).

