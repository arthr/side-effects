# Refactor do gameStore.ts

**Objetivo:** Reduzir `gameStore.ts` de ~2359 linhas para ~350 linhas, delegando para stores modulares.

**Status:** Em Progresso

---

## Contexto

O `gameStore.ts` atual e um monolito que gerencia:
- Fluxo do jogo (fases, turnos, rodadas)
- Pool de pilulas
- Estado dos jogadores
- Sistema de itens
- Efeitos de jogador
- Pill Store

Os 6 stores modulares ja foram extraidos e testados (224 testes). Agora precisamos fazer o gameStore **delegar** para eles.

---

## Stores Modulares Disponiveis

| Store | Arquivo | Testes | Responsabilidade |
|-------|---------|--------|------------------|
| effectsStore | `effectsStore.ts` | 28 | Efeitos (shield, handcuffs) |
| shopStore | `shopStore.ts` | 39 | Carrinho, confirmacoes, boosts |
| pillPoolStore | `pillPoolStore.ts` | 35 | Pilulas, revelacao, modificadores |
| itemUsageStore | `itemUsageStore.ts` | 36 | Selecao de alvo, confirmacoes |
| playerStore | `playerStore.ts` | 49 | Jogadores, inventario, economia |
| gameFlowStore | `gameFlowStore.ts` | 37 | Fases, turnos, rodadas |

---

## Estrategia de Migracao

### Principio: Facade Pattern

O gameStore permanece como **fachada** (API publica), mas delega internamente:

```typescript
// ANTES (logica inline)
consumePill: (pillId) => {
  // 250 linhas de logica aqui
}

// DEPOIS (delegacao)
consumePill: (pillId) => {
  const pill = usePillPoolStore.getState().consumePill(pillId)
  const result = usePlayerStore.getState().applyDamageToPlayer(...)
  useGameFlowStore.getState().nextTurn()
  // ~20 linhas orquestrando stores
}
```

### Ordem de Migracao

1. **Funcoes isoladas primeiro** (baixo risco)
   - Revealed Pills -> pillPoolStore
   - Pill Modifiers -> pillPoolStore
   - Player Effects -> effectsStore

2. **Funcoes de fluxo** (medio risco)
   - nextTurn -> gameFlowStore
   - endGame -> gameFlowStore
   - resetGame -> todos os stores

3. **Funcoes complexas por ultimo** (alto risco)
   - consumePill (orquestra varios stores)
   - executeItem (logica de itens complexa)
   - Shopping flow (varios estados)

---

## Arquivos de Apoio

| Arquivo | Descricao |
|---------|-----------|
| `mapping.md` | Mapeamento: funcao -> store destino |
| `migration-checklist.md` | Checklist de migracao |
| `test-scenarios.md` | Cenarios de teste manual |

---

## Criterios de Sucesso

- [ ] gameStore.ts < 350 linhas
- [ ] Todos os 224 testes passando
- [ ] Testes manuais OK (single player + multiplayer)
- [ ] Zero regressoes em funcionalidades

---

## Como Executar (para Agentes IA)

1. Ler `mapping.md` para entender destino de cada funcao
2. Seguir `migration-checklist.md` na ordem
3. Apos cada migracao:
   - Rodar `pnpm tsc --noEmit`
   - Rodar `pnpm test src/stores/game/__tests__/`
4. Ao final, executar cenarios de `test-scenarios.md`

