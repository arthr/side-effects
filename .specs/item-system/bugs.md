# Bugs Identificados: Sistema de Itens

## Bug #1: IA trava apos usar Handcuffs

**Status:** CORRIGIDO
**Severidade:** Alta
**Arquivo:** `src/hooks/useAIPlayer.ts`

### Descricao
Quando a IA usa Handcuffs no jogador humano, ela pode travar e nao jogar mais.

### Causa Raiz
O reset das flags `hasScheduledRef` e `hasUsedItemRef` so ocorre quando o turno muda para humano (`!currentPlayer.isAI`). Quando o Handcuffs faz o turno "pular" de volta para a IA, as flags nao sao resetadas.

### Solucao Aplicada
Adicionados dois novos useEffects para resetar flags:
1. Reset quando `pillPool.length` muda (indica pilula consumida = novo turno)
2. Reset quando `phase` volta para 'idle' e ainda e turno da IA

```typescript
// Reset flags quando uma pilula e consumida (novo turno)
useEffect(() => {
  if (pillPool.length !== lastPillCountRef.current) {
    lastPillCountRef.current = pillPool.length
    hasScheduledRef.current = false
    hasUsedItemRef.current = false
  }
}, [pillPool.length])

// Reset quando phase volta para idle
useEffect(() => {
  if (phase === 'idle' && currentPlayer.isAI) {
    hasScheduledRef.current = false
  }
}, [phase, currentPlayer.isAI])
```

---

## Bug #2: Stale closure no Force Feed (e outros itens) -> Verificar se bug é válido, replicar comportamento antes.

**Status:** Pendente
**Severidade:** Media
**Arquivo:** `src/hooks/useAIPlayer.ts`

### Descricao
Quando a IA usa um item que modifica o pillPool (ex: Force Feed, Discard), o setTimeout para consumir pilula usava o `pillPool` antigo (stale closure).

### Causa Raiz
O `pillPool` capturado no closure do setTimeout era o valor antes do item ser executado. Se o item removia uma pilula, o `selectRandomPill` poderia tentar selecionar uma pilula inexistente.

### Solucao Sugerida
Alterado para pegar `pillPool` diretamente do store dentro do setTimeout:

```typescript
setTimeout(() => {
  const currentPillPool = useGameStore.getState().pillPool
  const selectedPillId = selectRandomPill(currentPillPool)
  // ...
}, delay)
```

---

## Bug #3: Force Feed sem feedback visual

**Status:** Pendente
**Severidade:** Baixa (UX)
**Arquivo:** `src/stores/gameStore.ts`

### Descricao
Quando Force Feed e usado, o `consumePill` e chamado diretamente no store, sem abrir o overlay PillReveal. O oponente consome a pilula "silenciosamente".

### Comportamento Atual
1. IA usa Force Feed
2. `executeItem` chama `consumePill` diretamente
3. Pilula e aplicada no oponente sem animacao de revelacao
4. Apenas toast aparece

### Comportamento Esperado
Deveria mostrar PillReveal para o oponente, mesmo quando forcado.

### Solucao Proposta
Refatorar Force Feed para usar `startConsumption` do hook em vez de `consumePill` direto, ou adicionar chamada de overlay no store.

---

## Bug #4: (A investigar) Outros comportamentos inesperados da IA

**Status:** Pendente investigacao
**Severidade:** Media

### Descricao
Usuario reportou que "alguns itens estao causando comportamentos inesperados na IA". Bugs #1 e #2 foram identificados, mas pode haver outros.

### Itens a Verificar
- [x] Handcuffs - CORRIGIDO (Bug #1)
- [ ] Force Feed - Stale closure CORRIGIDO (Bug #2), feedback visual pendente (Bug #3)
- [ ] Scanner/Inverter/Double - Verificar selecao de alvo
- [ ] Shield - Verificar auto-aplicacao
- [ ] Shuffle/Discard - Verificar comportamento apos uso

### Acao
Realizar testes manuais focados em cada item usado pela IA.

---

## Checklist de Correcoes

- [x] Fix #1: Refatorar reset de flags em useAIPlayer
- [x] Fix #2: Corrigir stale closure no setTimeout
- [ ] Fix #3: Adicionar feedback visual para Force Feed
- [ ] Investigar outros itens que podem causar travamento
- [ ] Testar cenarios de edge case (handcuffs + shield, etc)
