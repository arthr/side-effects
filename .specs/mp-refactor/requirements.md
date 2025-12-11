# Requisitos: MP-Refactor (Multiplayer State Architecture Refactor)

## Visao Geral

Refatoracao da arquitetura de estado do multiplayer para implementar o modelo "Host Authoritative" de forma consistente, eliminando duplicacao de estado, simplificando sincronizacao e tornando o sistema mais robusto contra dessincronizacao.

**Prioridade:** Media-Alta (Debt tecnico que causa bugs recorrentes)

---

## Problemas Atuais (Motivacao)

### P-01: Duplicacao de Estado
O `gameStore` e `multiplayerStore` ambos gerenciam `mode` e informacoes de sala, causando inconsistencias durante reconexao.

### P-02: Sincronizacao Fragil por Eventos
Cada acao do jogo emite evento individual, criando multiplos pontos de falha e necessidade de `state_sync` como band-aid.

### P-03: Flag Global `isSyncingFromRemote`
Usar flag global para evitar loops e um code smell que dificulta debug e testes.

### P-04: Guest Executa Logica de Jogo
O Guest executa a mesma logica que o Host via `applyRemoteEvent`, violando o principio "Host Authoritative".

### P-05: Multiplos Caminhos de Sincronizacao
Existem 4+ caminhos diferentes para sincronizar estado, cada um com logica propria.

---

## Requisitos Funcionais

### RF-01: Fonte Unica de Verdade para Modo Multiplayer

**EARS:** WHEN o sistema precisa verificar se esta em modo multiplayer, THE sistema SHALL consultar APENAS o `multiplayerStore.mode`.

**Criterios de Aceitacao:**
- [ ] `gameStore` NAO possui campos `mode` ou `roomId`
- [ ] Helpers `isMultiplayerMode()` e `getRoomId()` consultam `multiplayerStore`
- [ ] Todos os componentes/hooks usam helpers ao inves de `gameStore.mode`
- [ ] Retrocompatibilidade: `gameStore.mode` retorna valor derivado (deprecated)

---

### RF-02: Host como Unica Fonte de Verdade do Estado de Jogo

**EARS:** WHEN uma acao de jogo ocorre em multiplayer, THE Host SHALL ser o unico a executar logica de jogo E broadcast estado resultante.

**Criterios de Aceitacao:**
- [ ] Host executa acoes e emite `state_update` com snapshot
- [ ] Guest NAO executa logica de jogo, apenas aplica estado recebido
- [ ] Acoes do Guest sao enviadas como `intent_*` para o Host processar
- [ ] Reconexao usa mesmo mecanismo de `state_update`

---

### RF-03: Eliminacao da Flag `isSyncingFromRemote`

**EARS:** WHEN o sistema sincroniza estado entre clientes, THE sistema SHALL usar arquitetura que nao requer flags globais para evitar loops.

**Criterios de Aceitacao:**
- [ ] Flag `isSyncingFromRemote` removida do `gameStore`
- [ ] Funcoes `setSyncingFromRemote` e `getIsSyncingFromRemote` removidas
- [ ] Nenhum risco de loop de eventos devido ao design (nao por flag)

---

### RF-04: Caminho Unico de Sincronizacao

**EARS:** WHEN estado precisa ser sincronizado entre clientes, THE sistema SHALL usar exclusivamente o evento `state_update`.

**Criterios de Aceitacao:**
- [ ] `state_update` e o unico evento que atualiza `gameStore` no Guest
- [ ] `game_started`, `round_reset`, `state_sync` usam mesmo formato
- [ ] Eventos legados (`pill_consumed`, etc) mantidos apenas para feedback visual

---

## Requisitos Nao-Funcionais

### RNF-01: Retrocompatibilidade
- Migracao deve ser incremental (fases)
- Cada fase deve ser testavel independentemente
- Sistema deve funcionar durante migracao

### RNF-02: Minimo Impacto em Single Player
- Modo single player NAO deve ser afetado
- Performance de single player NAO deve degradar

### RNF-03: Manutenibilidade
- Reducao de complexidade ciclomatica nos stores
- Menos pontos de entrada para sincronizacao
- Codigo mais facil de testar

---

## Fora de Escopo

- Validacao server-side de acoes (fase futura)
- Persistencia de sessao em localStorage (ja coberto por mp-polish)
- Mudancas no realtimeService/Supabase

---

## Dependencias

### De Codigo Existente
- `gameStore.ts` - Refatoracao significativa
- `multiplayerStore.ts` - Modificacoes moderadas
- Todos os hooks/componentes que usam `gameStore.mode`

### De Features
- HOTFIX-MP-012 deve estar completo e estavel antes de iniciar

---

## Metricas de Sucesso

1. Zero bugs de dessincronizacao em testes de reconexao
2. Reducao de 50%+ no codigo de sincronizacao
3. Eliminacao da flag `isSyncingFromRemote`
4. Todos os testes de multiplayer passando

---

## Referencias

- Analise de problemas: conversa atual
- Arquitetura atual: `.cursor/rules/architecture.md`
- Design multiplayer: `.specs/multiplayer-mode/design.md`

