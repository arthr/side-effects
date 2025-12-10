# Requisitos: Multiplayer Online

## Visao Geral

Implementar modo de jogo multiplayer online para Dosed, permitindo que dois jogadores humanos se enfrentem em tempo real atraves de WebSocket.

**Prioridade:** Fase 1 - Sistema de Salas (amigos convidam amigos)

---

## Requisitos Funcionais

### RF-01: Modos de Jogo

**EARS:** WHEN o usuario inicia uma nova partida, THE sistema SHALL exibir opcoes de modo de jogo (Single Player vs Multiplayer).

**Criterios de Aceitacao:**
- [x] Tela de setup exibe selector de modo
- [x] Single Player mantem comportamento atual (vs IA)
- [x] Multiplayer redireciona para fluxo de criacao/entrada em sala

---

### RF-02: Criacao de Sala

**EARS:** WHEN o usuario seleciona "Criar Sala" no modo Multiplayer, THE sistema SHALL gerar uma sala unica com codigo de convite.

**Criterios de Aceitacao:**
- [x] Codigo de sala e alfanumerico (6 caracteres) e unico
- [x] Host visualiza codigo/link para compartilhar
- [x] Sala fica no estado "waiting" ate oponente entrar
- [x] Host pode cancelar e voltar ao menu principal

---

### RF-03: Entrada em Sala

**EARS:** WHEN o usuario insere codigo de sala valido, THE sistema SHALL conectar ao host e sincronizar estado inicial.

**Criterios de Aceitacao:**
- [x] Campo de input para codigo de sala
- [x] Validacao de codigo (existe, esta aguardando, nao esta cheio)
- [x] Feedback de erro para codigos invalidos
- [x] Transicao suave para fase de selecao de itens

---

### RF-04: Sincronizacao de Estado

**EARS:** WHILE dois jogadores estao em partida multiplayer, THE sistema SHALL sincronizar todas as acoes em tempo real.

**Criterios de Aceitacao:**
- [x] Consumo de pilula sincroniza imediatamente
- [x] Uso de item sincroniza com efeitos visuais
- [x] Troca de turno sincroniza
- [x] Estado da loja sincroniza (wantsStore, carrinho, confirmacao)
- [x] Latencia perceptivel < 500ms para conexoes estaveis

---

### RF-05: Desativacao da IA

**EARS:** WHEN ambos jogadores em uma sala sao humanos, THE sistema SHALL desativar completamente a IA.

**Criterios de Aceitacao:**
- [x] `useAIPlayer` nao executa quando modo = multiplayer
- [x] `useAIItemSelection` nao executa quando modo = multiplayer
- [x] `useAIStore` nao executa quando modo = multiplayer
- [x] Player 2 aguarda input do jogador remoto

---

### RF-06: Identificacao do Jogador Local

**EARS:** WHEN o jogador local esta em partida multiplayer, THE sistema SHALL identificar qual PlayerId corresponde ao usuario local.

**Criterios de Aceitacao:**
- [x] Host e sempre `player1` (mantendo arquitetura atual)
- [x] Guest e sempre `player2`
- [x] UI do jogador local fica destacada/posicionada conforme PlayerId
- [x] Interacoes permitidas apenas no turno do jogador local

---

### RF-07: Tratamento de Desconexao

**EARS:** WHEN um jogador desconecta durante partida, THE sistema SHALL notificar o outro jogador e pausar o jogo.

**Criterios de Aceitacao:**
- [x] Overlay de "Aguardando reconexao..." exibido
- [x] Timeout de 30 segundos para reconexao
- [x] Apos timeout, oponente desconectado perde por W.O.
- [x] Jogador pode sair manualmente durante espera

---

## Requisitos Nao-Funcionais

### RNF-01: Latencia

- Acoes devem sincronizar em < 500ms para conexoes com < 100ms de latencia
- Sistema deve funcionar com latencias de ate 2 segundos (com feedback visual)

### RNF-02: Seguranca

- Estado do jogo deve ser validado no servidor (prevenir trapaças)
- Codigos de sala nao devem ser previsíveis

### RNF-03: Escalabilidade

- Arquitetura deve suportar multiplas salas simultaneas
- Considerar uso de serviço gerenciado (ex: Supabase Realtime, Ably, Pusher, Websocket Server próprio)

### RNF-04: UX

- Transicoes entre telas devem ser suaves
- Feedback visual claro para estado de conexao
- Jogador nunca deve ficar "travado" sem saber o que esta acontecendo

---

## Fora de Escopo (Fase 1)

- Matchmaking automatico (fila para encontrar oponentes)
- Sistema de ranking/leaderboard
- `Reaction's` entre jogadores
- IA assumindo jogador desconectado
- Reconexao automatica sem perda de estado
- Espectadores

---

## Dependencias

### Tecnicas
- Servico de WebSocket (Supabase Realtime, Socket.io, ou similar)
- Backend minimo para validacao de salas (pode ser serverless)

### De Codigo Existente
- `gameStore.ts` - Adaptacao para sincronizacao
- `useAIPlayer.ts`, `useAIStore.ts`, `useAIItemSelection.ts` - Condicionamento
- `types/game.ts` - Novos tipos para modo de jogo

---

## Referencias

- Spec inicial: `.specs/future/multiplayer-ai.md`
- Arquitetura: `.cursor/rules/architecture.md`
- Fluxo atual: `docs/FLUXO.md`

