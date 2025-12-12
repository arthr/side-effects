# Tutorial: Configurando Supabase Realtime para Multiplayer

Este guia explica como configurar o Supabase Realtime (Broadcast) para comunicacao em tempo real entre jogadores no modo multiplayer do Dosed.

---

## Indice

1. [Criar Projeto no Supabase](#1-criar-projeto-no-supabase)
2. [Obter Credenciais](#2-obter-credenciais)
3. [Configurar Variaveis de Ambiente](#3-configurar-variaveis-de-ambiente)
4. [Instalar Dependencias](#4-instalar-dependencias)
5. [Conceitos do Realtime Broadcast](#5-conceitos-do-realtime-broadcast)
6. [Implementacao Basica](#6-implementacao-basica)
7. [Testando a Conexao](#7-testando-a-conexao)
8. [Troubleshooting](#8-troubleshooting)

---

## 1. Criar Projeto no Supabase

### 1.1. Acessar Dashboard

1. Acesse [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Faca login com sua conta (GitHub, Google, ou email)

### 1.2. Criar Novo Projeto

1. Clique em **"New Project"**
2. Preencha os campos:
   - **Name:** `dosed-multiplayer` (ou nome de sua preferencia)
   - **Database Password:** Gere uma senha forte (guarde-a, mas nao usaremos diretamente)
   - **Region:** Escolha a regiao mais proxima dos jogadores (ex: `South America (Sao Paulo)`)
   - **Pricing Plan:** Free tier e suficiente para desenvolvimento e testes

3. Clique em **"Create new project"**
4. Aguarde ~2 minutos para o projeto ser provisionado

---

## 2. Obter Credenciais

### 2.1. Acessar Configuracoes da API

1. No dashboard do projeto, va para **Settings** (icone de engrenagem no menu lateral)
2. Clique em **API** na lista de configuracoes

### 2.2. Copiar Credenciais

Voce precisara de duas informacoes:

| Campo | Descricao | Onde Encontrar |
|-------|-----------|----------------|
| **Project URL** | URL base do projeto | Secao "Project URL" |
| **anon/public key** | Chave publica para client-side | Secao "Project API keys" |

**Exemplo:**
```
Project URL: https://xyzcompany.supabase.co
anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> **IMPORTANTE:** A `anon key` e segura para uso no frontend. Ela tem permissoes limitadas definidas pelas Row Level Security (RLS) policies.

---

## 3. Configurar Variaveis de Ambiente

### 3.1. Criar Arquivo .env.local

Na raiz do projeto, crie o arquivo `.env.local`:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key-aqui
```

### 3.2. Atualizar .env.example

Adicione ao `.env.example` (para documentacao):

```bash
# Supabase Configuration (Multiplayer)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3.3. Verificar .gitignore

Confirme que `.env.local` esta no `.gitignore`:

```gitignore
# Environment variables
.env
.env.local
.env.*.local
```

---

## 4. Verificar Dependências

### 4.1. Dependências Incluídas

O projeto já inclui todas as dependências necessárias:

```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.87.1",
    "uuid": "^13.0.0"
  }
}
```

### 4.2. Instalação Automática

As dependências são instaladas automaticamente com:

```bash
pnpm install
```

---

## 5. Arquitetura Multiplayer do Dosed

### 5.1. Visão Geral

O Dosed usa **Supabase Realtime Broadcast** para sincronização em tempo real:

- **Broadcast**: Mensagens efêmeras entre clientes (não persiste no banco)
- **Guest-first**: Não requer autenticação obrigatória
- **Room-based**: Jogadores se conectam via códigos de sala
- **Event-driven**: Todas as ações são sincronizadas via eventos

### 5.2. Fluxo de Comunicação

```
┌─────────────┐    Game Event     ┌─────────────┐    Broadcast    ┌─────────────┐
│    HOST     │ ────────────────► │  Supabase   │ ──────────────► │   GUEST     │
│  (Player 1) │                   │  Realtime   │                 │  (Player 2) │
└─────────────┘                   └─────────────┘                 └─────────────┘
       ▲                                 │                               │
       │                                 │                               │
       │              Sync Response      │        Event Handler          │
       └─────────────────────────────────┼───────────────────────────────┘
                                         │
                                    ┌─────────┐
                                    │ Channel │
                                    │ room_id │
                                    └─────────┘
```

### 5.3. Eventos Implementados

O sistema sincroniza os seguintes eventos:

| Evento | Descrição | Payload |
|--------|-----------|---------|
| `player_joined` | Jogador entra na sala | `{ playerId, name }` |
| `player_left` | Jogador sai da sala | `{ playerId }` |
| `item_selected` | Item selecionado pré-jogo | `{ playerId, itemType }` |
| `item_deselected` | Item removido pré-jogo | `{ playerId, itemId }` |
| `selection_confirmed` | Confirmação de itens | `{ playerId }` |
| `game_started` | Jogo iniciado | `{ playerOrder, config }` |
| `pill_consumed` | Pílula consumida | `{ playerId, pillId, result }` |
| `item_used` | Item usado | `{ playerId, itemType, target }` |
| `turn_ended` | Turno finalizado | `{ nextPlayer, sequence }` |
| `round_reset` | Nova rodada | `{ round, pillPool }` |
| `store_toggled` | Toggle Pill Store | `{ playerId, wants }` |
| `cart_updated` | Carrinho atualizado | `{ playerId, cart }` |
| `store_confirmed` | Compras confirmadas | `{ playerId, purchases }` |
| `game_ended` | Jogo finalizado | `{ winner, stats }` |
| `heartbeat` | Verificação de conexão | `{ playerId, timestamp }` |

### 5.3. Estrutura de um Canal

- **Canal (Channel):** Identificado por um nome unico (ex: `room:ABC123`)
- **Evento (Event):** Tipo da mensagem (ex: `pill_consumed`, `item_used`)
- **Payload:** Dados da mensagem (JSON)

---

## 6. Implementacao Basica

### 6.1. Criar Cliente Supabase

Crie `src/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10, // Rate limiting
    },
  },
})
```

### 6.2. Conectar a um Canal (Sala)

```typescript
import { supabase } from '@/lib/supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'

let channel: RealtimeChannel | null = null

/**
 * Conecta a uma sala de jogo
 */
export function joinRoom(roomId: string) {
  // Nome do canal baseado no ID da sala
  const channelName = `room:${roomId}`
  
  channel = supabase.channel(channelName, {
    config: {
      broadcast: {
        // Receber eventos que voce mesmo enviou (util para debug)
        self: false,
      },
    },
  })
  
  // Subscrever ao canal
  channel
    .on('broadcast', { event: '*' }, (payload) => {
      console.log('Evento recebido:', payload)
      handleGameEvent(payload)
    })
    .subscribe((status) => {
      console.log('Status da conexao:', status)
      if (status === 'SUBSCRIBED') {
        console.log('Conectado a sala:', roomId)
      }
    })
}

/**
 * Handler para eventos do jogo
 */
function handleGameEvent(payload: { event: string; payload: unknown }) {
  const { event, payload: data } = payload
  
  switch (event) {
    case 'pill_consumed':
      // Processar consumo de pilula
      break
    case 'item_used':
      // Processar uso de item
      break
    // ... outros eventos
  }
}
```

### 6.3. Enviar Evento

```typescript
/**
 * Envia evento para todos na sala
 */
export async function sendGameEvent(
  eventType: string, 
  payload: Record<string, unknown>
) {
  if (!channel) {
    console.error('Nao conectado a nenhuma sala')
    return
  }
  
  await channel.send({
    type: 'broadcast',
    event: eventType,
    payload: {
      ...payload,
      timestamp: Date.now(),
    },
  })
}

// Exemplo de uso:
sendGameEvent('pill_consumed', { 
  pillId: 'abc123',
  playerId: 'player1',
})
```

### 6.4. Desconectar

```typescript
/**
 * Sai da sala atual
 */
export async function leaveRoom() {
  if (channel) {
    await channel.unsubscribe()
    await supabase.removeChannel(channel)
    channel = null
  }
}
```

### 6.5. Exemplo Completo de Servico

Crie `src/services/realtimeService.ts`:

```typescript
import { supabase } from '@/lib/supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'

type EventHandler = (event: string, payload: unknown) => void
type ConnectionHandler = (status: string) => void

class RealtimeService {
  private channel: RealtimeChannel | null = null
  private eventHandlers: EventHandler[] = []
  private connectionHandlers: ConnectionHandler[] = []
  
  /**
   * Cria e conecta a uma nova sala
   */
  async createRoom(roomId: string): Promise<void> {
    await this.joinChannel(roomId)
  }
  
  /**
   * Entra em uma sala existente
   */
  async joinRoom(roomId: string): Promise<void> {
    await this.joinChannel(roomId)
  }
  
  /**
   * Conecta ao canal do Supabase
   */
  private async joinChannel(roomId: string): Promise<void> {
    // Desconecta de canal anterior se existir
    if (this.channel) {
      await this.leaveRoom()
    }
    
    const channelName = `game:${roomId}`
    
    this.channel = supabase.channel(channelName, {
      config: {
        broadcast: { self: false },
      },
    })
    
    // Escuta todos os eventos broadcast
    this.channel.on('broadcast', { event: '*' }, ({ event, payload }) => {
      this.eventHandlers.forEach(handler => handler(event, payload))
    })
    
    // Conecta ao canal
    return new Promise((resolve, reject) => {
      this.channel!.subscribe((status) => {
        this.connectionHandlers.forEach(handler => handler(status))
        
        if (status === 'SUBSCRIBED') {
          resolve()
        } else if (status === 'CHANNEL_ERROR') {
          reject(new Error('Falha ao conectar ao canal'))
        }
      })
    })
  }
  
  /**
   * Envia evento para a sala
   */
  async sendEvent(eventType: string, payload: Record<string, unknown>): Promise<void> {
    if (!this.channel) {
      throw new Error('Nao conectado a nenhuma sala')
    }
    
    await this.channel.send({
      type: 'broadcast',
      event: eventType,
      payload,
    })
  }
  
  /**
   * Sai da sala atual
   */
  async leaveRoom(): Promise<void> {
    if (this.channel) {
      await this.channel.unsubscribe()
      await supabase.removeChannel(this.channel)
      this.channel = null
    }
  }
  
  /**
   * Registra handler para eventos
   */
  onEvent(handler: EventHandler): () => void {
    this.eventHandlers.push(handler)
    return () => {
      this.eventHandlers = this.eventHandlers.filter(h => h !== handler)
    }
  }
  
  /**
   * Registra handler para mudancas de conexao
   */
  onConnectionChange(handler: ConnectionHandler): () => void {
    this.connectionHandlers.push(handler)
    return () => {
      this.connectionHandlers = this.connectionHandlers.filter(h => h !== handler)
    }
  }
}

// Singleton
export const realtimeService = new RealtimeService()
```

---

## 7. Testando a Conexao

### 7.1. Teste Rapido no Console

Abra duas abas do navegador e execute no console de cada uma:

**Aba 1 (Host):**
```javascript
// Importar (se usando modulos)
const { realtimeService } = await import('/src/services/realtimeService.ts')

// Criar sala
await realtimeService.createRoom('TEST123')

// Escutar eventos
realtimeService.onEvent((event, payload) => {
  console.log('Recebido:', event, payload)
})

// Enviar evento de teste
await realtimeService.sendEvent('test', { message: 'Ola do Host!' })
```

**Aba 2 (Guest):**
```javascript
const { realtimeService } = await import('/src/services/realtimeService.ts')

await realtimeService.joinRoom('TEST123')

realtimeService.onEvent((event, payload) => {
  console.log('Recebido:', event, payload)
})

await realtimeService.sendEvent('test', { message: 'Ola do Guest!' })
```

### 7.2. Verificar no Dashboard

1. No dashboard do Supabase, va para **Database** > **Realtime**
2. Voce vera os canais ativos e mensagens passando

---

## 8. Troubleshooting

### Erro: "Missing Supabase environment variables"

**Causa:** Variaveis de ambiente nao configuradas.

**Solucao:**
1. Verifique se `.env.local` existe e tem as variaveis corretas
2. Reinicie o servidor de desenvolvimento (`pnpm dev`)
3. Verifique se os nomes comecam com `VITE_` (obrigatorio para Vite)

---

### Erro: "CHANNEL_ERROR" ao conectar

**Causa:** Problema de autenticacao ou rate limiting.

**Solucao:**
1. Verifique se a `anon key` esta correta
2. Verifique se o projeto Supabase esta ativo
3. Aguarde alguns segundos e tente novamente (rate limiting)

---

### Eventos nao estao sendo recebidos

**Causa:** Configuracao de `self: false` ou canal diferente.

**Solucao:**
1. Verifique se ambos clientes estao no mesmo canal (mesmo `roomId`)
2. Para debug, mude `self: true` temporariamente
3. Verifique o console para erros

---

### Latencia alta

**Causa:** Servidor distante ou conexao lenta.

**Solucao:**
1. Use regiao mais proxima ao criar o projeto Supabase
2. Implemente feedback visual para o usuario durante espera
3. Use "optimistic updates" (atualiza local antes de confirmar)

---

## Proximos Passos

Apos configurar o Supabase Realtime, voce pode:

1. Implementar o `multiplayerStore.ts` que usa o `realtimeService`
2. Criar os componentes de UI para criar/entrar em salas
3. Integrar os eventos com o `gameStore`

Consulte as specs em `.specs/multiplayer-mode/` para detalhes da implementacao.

---

## Referencias

- [Supabase Realtime Docs](https://supabase.com/docs/guides/realtime)
- [Broadcast Guide](https://supabase.com/docs/guides/realtime/broadcast)
- [Supabase JS Client](https://supabase.com/docs/reference/javascript/introduction)
- Spec do Multiplayer: `.specs/multiplayer-mode/design.md`


---

## 6. Implementação Técnica

### 6.1. Estrutura de Serviços

```
src/services/
├── realtimeService.ts      # Serviço principal
├── realtime/
│   └── index.ts           # Configuração de canais
├── game/
│   └── index.ts           # Lógica de sincronização
└── sync/
    └── index.ts           # Utilitários de sync
```

### 6.2. Cliente Supabase

Configuração em `src/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10, // Limite de eventos por segundo
    },
  },
})
```

### 6.3. Gerenciamento de Canais

```typescript
// Criar canal para sala
const channel = supabase.channel(`room_${roomId}`, {
  config: {
    broadcast: { self: true }, // Receber próprios eventos
    presence: { key: playerId }, // Rastrear presença
  },
})

// Inscrever em eventos
channel
  .on('broadcast', { event: 'game_event' }, (payload) => {
    handleGameEvent(payload)
  })
  .subscribe((status) => {
    if (status === 'SUBSCRIBED') {
      console.log('Conectado ao canal')
    }
  })

// Enviar evento
channel.send({
  type: 'broadcast',
  event: 'game_event',
  payload: { type: 'pill_consumed', data: { pillId, playerId } }
})
```

### 6.4. Sistema de Heartbeat

Para detectar desconexões:

```typescript
// Enviar heartbeat a cada 5 segundos
const heartbeatInterval = setInterval(() => {
  channel.send({
    type: 'broadcast',
    event: 'heartbeat',
    payload: { playerId, timestamp: Date.now() }
  })
}, 5000)

// Verificar timeout (15 segundos sem heartbeat)
const checkTimeout = setInterval(() => {
  const now = Date.now()
  const lastHeartbeat = getLastOpponentHeartbeat()
  
  if (now - lastHeartbeat > 15000) {
    handleOpponentDisconnected()
  }
}, 5000)
```

---

## 7. Testando a Implementação

### 7.1. Teste Local

1. **Inicie o servidor de desenvolvimento**:
   ```bash
   pnpm dev
   ```

2. **Abra duas abas do navegador**:
   - Aba 1: `http://localhost:5173` (Host)
   - Aba 2: `http://localhost:5173` (Guest)

3. **Fluxo de teste**:
   - Host: Multiplayer → Criar Sala
   - Guest: Multiplayer → Entrar em Sala (usar código gerado)
   - Ambos: Selecionar itens e confirmar
   - Jogar normalmente, verificando sincronização

### 7.2. Debug com DevTools

Pressione `CTRL+SHIFT+D` para abrir o DevTool e acesse:

- **Realtime Debugger**: Monitor de eventos em tempo real
- **Connection Status**: Status da conexão WebSocket
- **Event Log**: Histórico de eventos enviados/recebidos
- **Latency Stats**: Métricas de latência

### 7.3. Logs de Debug

Adicione logs para debug:

```typescript
// Em desenvolvimento, habilite logs detalhados
if (import.meta.env.DEV) {
  supabase.realtime.setAuth(null) // Sem auth em dev
  
  // Log todos os eventos
  channel.on('broadcast', { event: '*' }, (payload) => {
    console.log('📡 Evento recebido:', payload)
  })
}
```

---

## 8. Troubleshooting

### 8.1. Problemas Comuns

#### Erro: "Invalid API key"
- **Causa**: Chave anon incorreta ou expirada
- **Solução**: Verificar `.env.local` e regenerar chave no dashboard

#### Erro: "Failed to connect to Realtime"
- **Causa**: URL incorreta ou projeto pausado
- **Solução**: Verificar URL do projeto e status no dashboard

#### Desconexões Frequentes
- **Causa**: Rede instável ou timeout muito baixo
- **Solução**: Ajustar timeout de heartbeat ou implementar reconexão

#### Eventos Duplicados
- **Causa**: Múltiplas inscrições no mesmo canal
- **Solução**: Garantir unsubscribe antes de nova inscrição

### 8.2. Monitoramento

#### Dashboard do Supabase
- **Realtime**: Monitor de conexões ativas
- **Logs**: Histórico de eventos e erros
- **Usage**: Consumo de bandwidth e requests

#### Métricas do Cliente
```typescript
// Métricas de performance
const metrics = {
  eventsPerSecond: 0,
  averageLatency: 0,
  connectionUptime: 0,
  reconnectionCount: 0,
}

// Tracking automático
trackRealtimeMetrics(channel, metrics)
```

### 8.3. Otimizações

#### Reduzir Bandwidth
- **Event Batching**: Agrupar eventos relacionados
- **Payload Compression**: Minimizar dados enviados
- **Selective Sync**: Sincronizar apenas mudanças necessárias

#### Melhorar Latência
- **Regional Deployment**: Usar região mais próxima
- **Connection Pooling**: Reutilizar conexões WebSocket
- **Predictive Sync**: Antecipar eventos baseado em padrões

---

## 9. Configurações Avançadas

### 9.1. Rate Limiting

```typescript
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,    // Máximo 10 eventos/segundo
      heartbeatIntervalMs: 30000, // Heartbeat a cada 30s
      reconnectAfterMs: 1000,     // Reconectar após 1s
    },
  },
})
```

### 9.2. Autenticação (Opcional)

Para persistir estatísticas de jogadores:

```typescript
// Login como guest
const { data, error } = await supabase.auth.signInAnonymously()

// Ou login com provider
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'github'
})
```

### 9.3. Políticas RLS (Row Level Security)

Se usar tabelas do banco, configure políticas:

```sql
-- Permitir leitura/escrita para usuários autenticados
CREATE POLICY "Allow authenticated users" ON game_rooms
FOR ALL USING (auth.role() = 'authenticated');

-- Permitir acesso anônimo para guests
CREATE POLICY "Allow anonymous access" ON game_rooms
FOR SELECT USING (true);
```

---

## 10. Deploy e Produção

### 10.1. Variáveis de Ambiente

Para produção, configure:

```bash
# .env.production
VITE_SUPABASE_URL=https://seu-projeto-prod.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-producao
```

### 10.2. Monitoramento

- **Supabase Dashboard**: Monitor de uso e performance
- **Error Tracking**: Integração com Sentry ou similar
- **Analytics**: Tracking de eventos de jogo
- **Uptime Monitoring**: Verificação de disponibilidade

### 10.3. Escalabilidade

O Supabase Realtime suporta:
- **Conexões simultâneas**: Até 500 no plano gratuito
- **Mensagens por segundo**: Até 100 no plano gratuito
- **Bandwidth**: 2GB incluído no plano gratuito

Para mais capacidade, considere upgrade para planos pagos.

---

## 11. Recursos Adicionais

### 11.1. Documentação Oficial

- [Supabase Realtime Docs](https://supabase.com/docs/guides/realtime)
- [Broadcast API Reference](https://supabase.com/docs/reference/javascript/subscribe)
- [JavaScript Client Docs](https://supabase.com/docs/reference/javascript)

### 11.2. Exemplos de Código

- [Realtime Chat Example](https://github.com/supabase/supabase/tree/master/examples/realtime/nextjs-chat)
- [Multiplayer Game Example](https://github.com/supabase/supabase/tree/master/examples/realtime/multiplayer-game)

### 11.3. Comunidade

- [Discord da Supabase](https://discord.supabase.com/)
- [GitHub Discussions](https://github.com/supabase/supabase/discussions)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/supabase)

---

**Pronto!** 🎉 Seu setup de multiplayer está configurado. O Dosed agora suporta partidas em tempo real para 2-4 jogadores com sincronização completa de estado via Supabase Realtime.