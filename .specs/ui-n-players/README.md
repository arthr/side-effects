# UI para N Jogadores - Visão Geral

**Status:** 📝 Planejado  
**Dependência:** ✅ Refatoração Core Loop (CONCLUÍDO)

---

## O Que É?

Adaptação da interface do usuário para suportar **2 a 4 jogadores** simultaneamente, com layouts responsivos e acessíveis.

---

## Por Que?

Atualmente, a UI está hardcoded para exatamente 2 jogadores com posições fixas (top/bottom). Embora o backend já suporte N jogadores, a UI precisa ser adaptada para:

- ✅ Suportar 2, 3 ou 4 jogadores
- ✅ Layout responsivo (mobile, tablet, desktop)
- ✅ Manter usabilidade com mais players
- ✅ Preparar para multiplayer 3-4 players

---

## Quando Executar?

**Após:** Validação manual da refatoração do Core Loop  
**Antes:** Implementação de multiplayer 3-4 players

---

## Arquivos Principais

```
.specs/ui-n-players/
├── README.md (este arquivo)
├── plan.md (plano detalhado)
└── wireframes/ (criado durante implementação)
```

---

## Escopo

### Incluído ✅

- Layout dinâmico para 2-4 players
- Componente PlayerGrid responsivo
- Refatoração de 8 componentes principais
- Testes de responsividade
- Acessibilidade básica (WCAG AA)

### Não Incluído ❌

- Multiplayer 3-4 players (spec separada)
- Matchmaking/Lobbies
- Spectator mode
- Replay system
- Novos recursos de gameplay

---

## Estimativa

- **Duração:** ~26 horas
- **Complexidade:** Alta
- **Risco:** Médio (UX pode ser desafiadora com 4 players)

---

## Como Usar Esta Spec

1. Ler `plan.md` completamente
2. Seguir o checklist em ordem
3. Validar cada fase antes de avançar
4. Documentar decisões de design
5. Testar em devices reais

---

## Contato

Para dúvidas ou sugestões sobre esta spec, consulte o plano detalhado em `plan.md`.

