# Plano de Refatoracao - Decomposicao do GameStore

**Data de Criacao:** 2024-12-11  
**Ultima Atualizacao:** 2024-12-11  
**Status:** Em Andamento (Fase 2)

---

## Objetivo

Dividir o `gameStore.ts` (~2359 linhas) em stores menores e focados, seguindo o Single Responsibility Principle. O resultado sera:

1. **Stores de dominio** com ~200-350 linhas cada
2. **Testabilidade** - Stores pequenos sao faceis de testar isoladamente
3. **Manutencao** - Codigo mais obvio para um desenvolvedor solo

> **Nota de Escopo:** A Camada de Sincronizacao (services/sync) e a decomposicao do multiplayerStore serao feitas em uma **refatoracao futura**, apos a estabilizacao dos stores de jogo.

---

## Arquivos Afetados

### Criacao (~6 arquivos de stores)

| Arquivo | Status | Descricao |
|---------|--------|-----------|
| `stores/game/effectsStore.ts` | FEITO | Efeitos de jogador (shield, handcuffs) |
| `stores/game/shopStore.ts` | PENDENTE | Pill Store, carrinho, boosts |
| `stores/game/pillPoolStore.ts` | PENDENTE | Pool de pilulas, consumo, reveal |
| `stores/game/inventoryStore.ts` | PENDENTE | Itens, selecao, uso |
| `stores/game/playerStore.ts` | PENDENTE | Vidas, resistencia, maximos |
| `stores/game/gameFlowStore.ts` | PENDENTE | Fases, turnos, rodadas, winner |

### Refatoracao (~3 arquivos)

| Arquivo | Linhas Atuais | Meta | Status |
|---------|---------------|------|--------|
| `stores/gameStore.ts` | 2359 | < 350 (orquestracao) | PENDENTE |
| `hooks/useItemUsage.ts` | ~200 | Adaptar para novos stores | PENDENTE |
| `hooks/usePillConsumption.ts` | ~150 | Adaptar para novos stores | PENDENTE |

### Remocao Futura

- Nenhum arquivo removido nesta fase (retrocompatibilidade via re-exports)

---

## Passo a Passo (Checklist)

### Fase 1: Preparacao (Baixo Risco) - COMPLETA

- [x] **1.1** Criar pasta `stores/game/` com `index.ts`
- [x] **1.2** Criar pasta `stores/multiplayer/` com `index.ts`
- [x] **1.3** Criar pasta `services/sync/` e `services/realtime/` com placeholders
- [x] **1.4** Adicionar testes unitarios para `pillGenerator.ts` e `questGenerator.ts`
  - 4 arquivos de teste em `utils/__tests__/`

### Fase 2: Extracao de Stores de Dominio (Medio Risco) - EM ANDAMENTO

**Estrategia:** DUAL-WRITE - O gameStore continua sendo a fonte da verdade enquanto migramos. Cada store novo sincroniza com o gameStore para retrocompatibilidade.

- [x] **2.1** Extrair `effectsStore.ts` do gameStore
  - Arquivo: `stores/game/effectsStore.ts` (223 linhas)
  - 21 testes unitarios em `stores/game/__tests__/effectsStore.test.ts`
  - Hooks helpers: `usePlayerEffects`, `useHasShield`, `useIsHandcuffed`
  - Retrocompatibilidade: gameStore ainda gerencia `player.effects`

- [ ] **2.2** Extrair `shopStore.ts` do gameStore
  - Estado: `storeState`, `pillCoins`, `wantsStore`, `cartItems`
  - Actions: `openStore`, `closeStore`, `addToCart`, `checkout`, `applyBoosts`
  - Criar testes unitarios

- [ ] **2.3** Extrair `pillPoolStore.ts` do gameStore
  - Estado: `pillPool`, `revealedPills`, `typeCounts`, `shapeCounts`
  - Actions: `generatePool`, `consumePill`, `revealPill`, `shuffle`, `discard`
  - Criar testes unitarios

- [ ] **2.4** Extrair `inventoryStore.ts` do gameStore
  - Estado: `inventory` (por jogador), `selectedItems`, `targetSelection`
  - Actions: `selectItem`, `deselectItem`, `useItem`, `addItem`, `removeItem`
  - Criar testes unitarios

- [ ] **2.5** Extrair `playerStore.ts` do gameStore
  - Estado: `players` (vidas, resistencia, maxResistance)
  - Actions: `applyDamage`, `heal`, `loseLife`, `gainLife`, `resetResistance`
  - Criar testes unitarios

- [ ] **2.6** Refatorar `gameStore.ts` para orquestracao apenas
  - Manter: `phase`, `round`, `currentTurn`, `winner`, `difficulty`
  - Actions: `startGame`, `endGame`, `nextTurn`, `nextRound`, `resetGame`
  - Delegar para stores especificos via imports
  - Meta: < 350 linhas

### Fase 3: Adaptacao de Hooks (Baixo Risco)

- [ ] **3.1** Atualizar `useItemUsage.ts` para usar stores especificos
- [ ] **3.2** Atualizar `usePillConsumption.ts` para usar stores especificos
- [ ] **3.3** Atualizar `useGameActions.ts` para usar gameFlowStore
- [ ] **3.4** Verificar que todos os componentes funcionam via hooks (nao acessam stores diretamente)

### Fase 4: Limpeza (Baixo Risco)

- [ ] **4.1** Remover codigo duplicado entre gameStore e stores especificos
- [ ] **4.2** Remover re-exports desnecessarios apos migracao completa
- [ ] **4.3** Atualizar documentacao de arquitetura (`architecture.md`)
- [ ] **4.4** Atualizar ADR-001 com status "Implementado"

---

## Verificacao de Risco (Safety Check)

### Pre-Implementacao

- [x] Adiciona alguma biblioteca npm? **NAO** - Usa apenas Zustand existente
- [x] Cria pastas fora do padrao `structure.md`? **NAO** - `stores/game/` e `stores/multiplayer/` sao subdivisoes validas
- [x] Mistura UI com Logica? **NAO** - Stores sao logica pura, UI acessa via hooks

### Testes Manuais Necessarios (por fase)

| Fase | Cenario de Teste | Criticidade |
|------|------------------|-------------|
| 2.1 | Shield bloqueia dano, Handcuffs pula turno | Alta |
| 2.2 | Abrir loja, adicionar itens, checkout, boosts aplicados | Alta |
| 2.3 | Consumir pilula, revelar com Scanner, Shuffle funciona | Critica |
| 2.4 | Selecionar/usar itens, Force Feed funciona, inventario atualiza | Critica |
| 2.5 | Perder vida, ganhar vida, resistencia zera = perde vida | Critica |
| 2.6 | Transicoes de fase, turnos alternando, fim de jogo | Critica |

### Multiplayer (Validar apos Fase 3)

- [ ] Sincronizacao de efeitos (Shield, Handcuffs)
- [ ] Sincronizacao de consumo de pilula
- [ ] Sincronizacao de uso de itens
- [ ] Reconexao mantem estado consistente

---

## Riscos e Mitigacoes

| Risco | Probabilidade | Impacto | Mitigacao |
|-------|--------------|---------|-----------|
| Quebrar sincronizacao multiplayer | Alta | Critico | DUAL-WRITE: gameStore continua emitindo eventos |
| Regressao em single player | Media | Alto | Testes manuais apos cada extracao |
| Performance (muitos stores) | Baixa | Baixo | Zustand e eficiente, stores pequenos sao mais rapidos |
| Dependencias circulares | Media | Medio | Usar getState() em vez de hooks internos |

---

## Metricas de Sucesso

| Metrica | Atual | Meta | Status |
|---------|-------|------|--------|
| Linhas no `gameStore.ts` | 2359 | < 350 | PENDENTE |
| Stores com > 500 linhas | 1 | 0 | PENDENTE |
| Cobertura de testes (stores/game) | ~10% | > 70% | EM ANDAMENTO |
| Testes no effectsStore | 21 | 21 | FEITO |

---

## Proximos Passos

1. **IMEDIATO:** Implementar `shopStore.ts` (Fase 2.2)
2. **DEPOIS:** Continuar extracoes em ordem (2.3 -> 2.4 -> 2.5 -> 2.6)
3. **FUTURO:** Camada de Sincronizacao sera feita em spec separada (`mp-sync-refactor`)

---

## Referencias

- [ADR-001: Store Decomposition](.specs/refactor-game-architecture/ADR-001-store-decomposition.md)
- [Architecture Rules](.cursor/rules/architecture.md)
- [Zustand Best Practices](https://docs.pmnd.rs/zustand/guides/practice-with-no-store-actions)

---

> **NOTA:** Esta refatoracao e incremental. O jogo permanece funcional durante todo o processo gracas ao padrao DUAL-WRITE.
