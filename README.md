# Dosed - Pill Roulette Game

**Dosed** é um jogo estratégico por turnos onde jogadores competem para ser o último sobrevivente em um cenário de roleta russa com pílulas. Combine gestão de risco, informação oculta e elementos táticos em uma experiência única.

## 🎮 Características Principais

- **Sistema de Saúde Duplo**: Resistência (escudo temporário) + Vidas (saúde permanente)
- **Informação Oculta**: Efeitos das pílulas revelados apenas ao consumir
- **Sistema de Itens**: 9+ power-ups em 4 categorias estratégicas
- **Shape Quests**: Complete sequências de formas para ganhar Pill Coins
- **Pill Store**: Loja com boosts e itens adicionais
- **IA Adaptativa**: 4 níveis de dificuldade com comportamentos distintos
- **Multiplayer Real-time**: Suporte para 2-4 jogadores via Supabase Realtime

## 🚀 Quick Start

### Pré-requisitos

- **Node.js** 18+ 
- **pnpm** (recomendado) ou npm/yarn

### Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/dosed.git
cd dosed

# Instale as dependências
pnpm install

# Inicie o servidor de desenvolvimento
pnpm dev
```

O jogo estará disponível em `http://localhost:5173`

### Multiplayer (Opcional)

Para habilitar multiplayer, configure as variáveis de ambiente:

```bash
# Copie o arquivo de exemplo
cp .env.example .env.local

# Configure suas credenciais do Supabase
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-aqui
```

Veja `docs/SUPABASE-REALTIME-SETUP.md` para instruções detalhadas.

## 📖 Documentação

- **[GAME-IDEA.md](docs/GAME-IDEA.md)** - Especificação completa das mecânicas
- **[FLUXO.md](docs/FLUXO.md)** - Arquitetura e fluxo da aplicação  
- **[GAME-BALANCE.md](docs/GAME-BALANCE.md)** - Sistema de balanceamento
- **[SUPABASE-REALTIME-SETUP.md](docs/SUPABASE-REALTIME-SETUP.md)** - Setup multiplayer

## 🛠️ Scripts Disponíveis

```bash
# Desenvolvimento
pnpm dev          # Inicia servidor de desenvolvimento
pnpm build        # Build para produção
pnpm preview      # Preview do build de produção

# Qualidade de Código
pnpm lint         # Executa ESLint
pnpm type:check   # Verifica tipos TypeScript

# Testes
pnpm test         # Executa testes em modo watch
pnpm test:run     # Executa testes uma vez (CI)
```

## 🏗️ Arquitetura

### Stack Tecnológico

- **Frontend**: React 19 + TypeScript + Vite
- **Estado**: Zustand (stores modulares)
- **UI**: shadcn/ui + Tailwind CSS + Framer Motion
- **Backend**: Supabase Realtime (apenas multiplayer)
- **Testes**: Vitest + property-based testing

### Estrutura do Projeto

```
src/
├── components/     # Componentes React (UI, game, multiplayer, overlays)
├── hooks/          # Custom hooks (30+ hooks especializados)
├── stores/         # Estado global (Zustand stores modulares)
├── utils/          # Lógica de negócio (funções puras)
├── types/          # Definições TypeScript
├── assets/         # Assets estáticos (shapes, items)
└── services/       # Serviços externos (Supabase)
```

### Stores Modulares

- **gameFlowStore** - Fases, turnos, rodadas
- **playerStore** - Jogadores, vidas, resistência, inventário  
- **pillPoolStore** - Pool de pílulas, consumo, revelação
- **effectsStore** - Efeitos ativos (shield, handcuffs)
- **itemUsageStore** - Seleção de alvo, uso de itens
- **shopStore** - Pill Store, carrinho, boosts

## 🎯 Como Jogar

### Single Player
1. Escolha a dificuldade da IA (Easy → Insane)
2. Selecione 5 itens do catálogo
3. Consuma pílulas por turnos, evitando dano
4. Use itens estrategicamente
5. Complete Shape Quests para ganhar Pill Coins
6. Visite a Pill Store para comprar boosts
7. Seja o último sobrevivente!

### Multiplayer  
1. Crie uma sala ou entre com código
2. Aguarde outros jogadores
3. Mesmo fluxo do single player, mas sincronizado em tempo real

## 🧪 Desenvolvimento

### DevTools

Pressione `CTRL+SHIFT+D` para abrir as ferramentas de desenvolvimento:

- **Game State**: Visualize estado atual do jogo
- **Stores Snapshot**: Capture estado dos stores
- **Distribution Simulator**: Teste balanceamento de pílulas
- **Realtime Debugger**: Monitor conexões multiplayer

### Testes

```bash
# Executar todos os testes
pnpm test:run

# Testes específicos
pnpm test pillGenerator
pnpm test playerManager
pnpm test questGenerator
```

### Estrutura de Testes

- **Unit Tests**: Funções puras em `src/utils/__tests__/`
- **Property-Based Tests**: Validação de invariantes
- **Integration Tests**: Fluxos completos de jogo

## 🎨 Customização

### Adicionando Novos Itens

1. Defina o item em `src/utils/itemCatalog.ts`
2. Implemente a lógica em `src/utils/itemLogic.ts`
3. Adicione o tipo em `src/types/item.ts`
4. Inclua o ícone em `src/assets/items/`

### Modificando Balanceamento

Ajuste as configurações em:
- `src/utils/pillProgression.ts` - Progressão de tipos
- `src/utils/shapeProgression.ts` - Progressão de formas  
- `src/utils/aiConfig.ts` - Comportamento da IA
- `src/utils/storeConfig.ts` - Preços da Pill Store

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Add: nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

### Guidelines

- Use TypeScript strict mode
- Siga os padrões de arquitetura existentes
- Adicione testes para novas funcionalidades
- Mantenha a separação de responsabilidades (Components → Hooks → Stores → Utils)

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para detalhes.

## 🙏 Agradecimentos

- **shadcn/ui** - Sistema de componentes
- **Supabase** - Backend e Realtime
- **Lucide** - Ícones
- **Framer Motion** - Animações
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
