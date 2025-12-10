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

## 4. Instalar Dependencias

### 4.1. Instalar SDK do Supabase

```bash
pnpm add @supabase/supabase-js
```

### 4.2. Verificar Instalacao

O `package.json` deve incluir:

```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.x.x"
  }
}
```

---

## 5. Conceitos do Realtime Broadcast

### 5.1. O que e Broadcast?

O Supabase Realtime oferece tres funcionalidades:
- **Broadcast:** Mensagens efemeras entre clientes (nao persiste no banco)
- **Presence:** Rastrear usuarios online em um canal
- **Database Changes:** Escutar mudancas em tabelas

**Para o Dosed, usaremos Broadcast** - ideal para eventos de jogo que nao precisam ser persistidos.

### 5.2. Como Funciona

```
┌─────────────┐     Broadcast Event     ┌─────────────┐
│  Cliente A  │ ──────────────────────► │  Supabase   │
│   (Host)    │                         │  Realtime   │
└─────────────┘                         └──────┬──────┘
                                               │
                                               │ Broadcast to Channel
                                               │
                                               ▼
                                        ┌─────────────┐
                                        │  Cliente B  │
                                        │   (Guest)   │
                                        └─────────────┘
```

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

