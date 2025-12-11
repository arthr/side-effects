# ADR-001: Decomposicao do GameStore e Arquitetura Multiplayer-First

**Status:** Em Progresso  
**Data:** 2024-12-11  
**Atualizado:** 2024-12-11  
**Deciders:** Time de Desenvolvimento  
**Technical Story:** Refatoracao da arquitetura do jogo Dosed

---

## Contexto

O jogo Dosed e um jogo de estrategia por turnos com suporte a single-player (vs IA) e multiplayer (PvP via WebSocket). A arquitetura atual foi desenvolvida organicamente, resultando em:

1. **`gameStore.ts`** com ~2300 linhas gerenciando:
   - Fases do jogo (setup, itemSelection, playing, shopping, ended)
   - Pool de pilulas e consumo
   - Estado dos jogadores (vidas, resistencia, efeitos)
   - Sistema de inventario e itens
   - Pill Store (loja de recompensas)
   - Sincronizacao multiplayer

2. **`multiplayerStore.ts`** com ~850 linhas gerenciando:
   - Conexao WebSocket
   - Estado da sala
   - Sistema de heartbeat
   - Handler de eventos remotos

3. **Acoplamento circular** entre os dois stores via import dinamico

4. **Logica de sincronizacao espalhada** com `emitMultiplayerEvent()` chamado em 15+ lugares

---

## Decisao

Adotaremos uma arquitetura **Multiplayer-First** com os seguintes principios:

### 1. Decomposicao do GameStore em Dominios

Dividir `gameStore.ts` em 6 stores focados:

| Store | Responsabilidade | Linhas Estimadas |
|-------|-----------------|------------------|
| `gameFlowStore.ts` | Fases, turnos, rodadas, winner | ~200 |
| `pillPoolStore.ts` | Pool de pilulas, consumo, reveal | ~300 |
| `playerStore.ts` | Vidas, resistencia, maximos | ~150 |
| `inventoryStore.ts` | Itens, selecao, uso | ~300 |
| `effectsStore.ts` | Efeitos de jogador (shield, handcuffs) | ~100 |
| `shopStore.ts` | Pill Store, carrinho, boosts | ~250 |

### 2. Camada de Sincronizacao Dedicada

Criar `services/sync/` com:

```typescript
// syncService.ts - Orquestra sincronizacao
interface SyncService {
  // Executa acao localmente e emite evento se multiplayer
  execute<T>(action: () => T, event: GameEvent): T
  
  // Aplica evento remoto nos stores apropriados
  applyRemote(event: GameEvent): void
}

// eventEmitter.ts - Emissao tipada
interface EventEmitter {
  emit<T extends GameEventType>(type: T, payload: PayloadFor<T>): void
}

// eventHandler.ts - Recepcao centralizada
interface EventHandler {
  handle(event: GameEvent): void
}
```

### 3. Decomposicao do MultiplayerStore

Dividir em stores focados:

| Store | Responsabilidade |
|-------|-----------------|
| `connectionStore.ts` | Status WebSocket, reconnect |
| `roomStore.ts` | Estado da sala, jogadores |
| `syncStore.ts` | Fila de eventos, reconciliacao |

### 4. Pattern de Mediator para Evitar Acoplamento

```
                    ┌─────────────┐
                    │ SyncService │
                    │  (mediator) │
                    └──────┬──────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
         ▼                 ▼                 ▼
   ┌───────────┐    ┌───────────┐    ┌───────────┐
   │ GameFlow  │    │ PillPool  │    │  Player   │
   │   Store   │    │   Store   │    │   Store   │
   └───────────┘    └───────────┘    └───────────┘
```

---

## Consequencias

### Positivas

1. **Testabilidade Melhorada**
   - Stores pequenos (~200-300 linhas) sao faceis de testar isoladamente
   - Mock de dependencias simplificado

2. **Single Responsibility Principle**
   - Cada store tem uma unica razao para mudar
   - Bugs isolados em dominios especificos

3. **Multiplayer Transparente**
   - Actions nao precisam saber se estao em multiplayer
   - SyncService decide quando/como emitir eventos

4. **Manutencao Facilitada**
   - Novos desenvolvedores entendem o sistema mais rapido
   - Menos conflitos de merge em arquivos grandes

5. **Robustez em Producao**
   - Queue de eventos para cenarios offline
   - Reconciliacao automatica apos reconexao

### Negativas

1. **Mais Arquivos para Gerenciar**
   - De 2 stores para ~9 stores + 3 services
   - Mais imports necessarios

2. **Curva de Aprendizado**
   - Time precisa entender nova estrutura
   - Documentacao deve ser atualizada

3. **Risco de Regressao Durante Migracao**
   - Sincronizacao multiplayer e sensivel
   - Testes manuais extensivos necessarios

4. **Overhead de Comunicacao entre Stores**
   - Zustand permite acesso cross-store, mas adiciona complexidade
   - Alternativa: store combinado para queries complexas

---

## Alternativas Consideradas

### A. Manter Estrutura Atual
- **Pro:** Zero risco de regressao
- **Contra:** Divida tecnica continua crescendo
- **Decisao:** Rejeitado - problemas de manutencao sao criticos

### B. Redux Toolkit com Slices
- **Pro:** Pattern estabelecido para decomposicao
- **Contra:** Migracao de Zustand seria extensiva, boilerplate maior
- **Decisao:** Rejeitado - Zustand atende bem, apenas mal estruturado

### C. Event Sourcing Completo
- **Pro:** Estado 100% derivado de eventos, replay perfeito
- **Contra:** Complexidade muito alta para escopo do projeto
- **Decisao:** Rejeitado - over-engineering para um jogo web

### D. Micro-frontends por Dominio
- **Pro:** Isolamento maximo
- **Contra:** Infraestrutura de build muito complexa
- **Decisao:** Rejeitado - projeto e monorepo simples

---

## Metricas de Sucesso

| Metrica | Atual | Meta |
|---------|-------|------|
| Linhas no maior store | ~2300 | < 350 |
| Stores com >500 linhas | 2 | 0 |
| Cobertura de testes (stores) | ~0% | > 70% |
| Tempo para entender fluxo multiplayer | ~2h | < 30min |
| Bugs de sincronizacao por sprint | Varios | 0 |

---

## Implementacao

### Fase 1: Preparacao (1-2 dias)
- Criar estrutura de pastas
- Extrair interfaces/types
- Adicionar testes base

### Fase 2: Decomposicao (3-5 dias)
- Extrair stores um a um
- Manter retrocompatibilidade via re-exports
- Testar apos cada extracao

### Fase 3: Sincronizacao (2-3 dias)
- Criar SyncService
- Migrar emissao de eventos
- Centralizar handlers

### Fase 4: Robustez (1-2 dias)
- Implementar retry
- Adicionar event queue
- Testar cenarios de reconexao

---

## Referencias

- [Zustand Best Practices](https://docs.pmnd.rs/zustand/guides/practice-with-no-store-actions)
- [SOLID Principles in React](https://www.solidjs.com/guides/comparison)
- [ADR Template](https://github.com/joelparkerhenderson/architecture-decision-record)

---

## Changelog

| Data | Autor | Alteracao |
|------|-------|-----------|
| 2024-12-11 | Senior Review | Criacao inicial |
| 2024-12-11 | Refactor | Fase 3 completa: 6 stores extraidos (224 testes) |
| 2024-12-11 | Refactor | Fase 4.2-4.5: Hooks atualizados para N-player |
| 2024-12-11 | Refactor | Documentacao de apoio criada para 4.1 |


