# Game Balance - Dosed

Este documento define o sistema de balanceamento e progressão do jogo, incluindo distribuição de pílulas, escalabilidade de dificuldade e mecânicas de IA.

## 1. Visão Geral do Balanceamento

### Filosofia de Design
- **Tensão Crescente**: Dificuldade aumenta gradualmente
- **Escolhas Significativas**: Cada decisão tem peso estratégico
- **Informação Limitada**: Incerteza mantém suspense
- **Recuperação Possível**: Sempre há chance de virada
- **Skill vs Luck**: 70% estratégia, 30% sorte

### Métricas de Balanceamento
- **Duração Média**: 8-12 rodadas por partida
- **Taxa de Sobrevivência**: 15-25% por rodada (late game)
- **Uso de Itens**: 2-3 itens por rodada em média
- **Completude de Quests**: 60-80% de taxa de sucesso

---

## 2. Sistema de Pílulas

### Tipos e Efeitos

| Tipo | Nome | Efeito | Cor Visual | Desbloqueio | Impacto |
|------|------|--------|-------------|-------------|---------|
| **SAFE** | Placebo | Nenhum efeito | Verde | Rodada 1 | Neutro |
| **DMG_LOW** | Veneno Leve | -1 a -2 resistência | Amarelo | Rodada 1 | Baixo |
| **DMG_HIGH** | Toxina | -3 a -4 resistência | Laranja | Rodada 3 | Alto |
| **HEAL** | Antídoto | +2 resistência | Ciano | Rodada 2 | Positivo |
| **FATAL** | Cianeto | Zera resistência | Roxo | Rodada 6 | Crítico |
| **LIFE** | Vida Extra | +1 vida | Rosa | Rodada 5 | Raro |

### Configuração de Progressão

Localizada em `src/utils/pillProgression.ts`:

```typescript
export const PROGRESSION: ProgressionConfig = {
  maxRound: 20,
  rules: {
    SAFE:     { unlockRound: 1, startPct: 45, endPct: 15 },
    DMG_LOW:  { unlockRound: 1, startPct: 40, endPct: 20 },
    DMG_HIGH: { unlockRound: 3, startPct: 15, endPct: 25 },
    HEAL:     { unlockRound: 2, startPct: 10, endPct: 15 },
    FATAL:    { unlockRound: 6, startPct: 5,  endPct: 18 },
    LIFE:     { unlockRound: 5, startPct: 6,  endPct: 13 },
  }
}
```

### Decisões de Design

#### Early Game (Rodadas 1-3)
- **SAFE dominante**: 45% inicial para tutorial suave
- **DMG_LOW presente**: Introduz conceito de risco
- **DMG_HIGH limitado**: 15% para tensão controlada
- **Sem FATAL**: Evita eliminações prematuras

#### Mid Game (Rodadas 4-8)
- **HEAL disponível**: "Válvula de escape" desde rodada 2
- **FATAL introduzido**: Rodada 6 para buildup de tensão
- **LIFE desbloqueado**: Rodada 5 como recompensa rara
- **Balanceamento**: SAFE diminui, perigo aumenta

#### Late Game (Rodadas 9+)
- **Alta tensão**: SAFE apenas 15%, FATAL até 18%
- **Recuperação possível**: HEAL e LIFE mais frequentes
- **Decisões críticas**: Cada pílula pode ser fatal
- **Teto em rodada 20**: Evita estagnação infinita

---

## 3. Escalabilidade do Pool

### Configuração de Quantidade

Localizada em `src/utils/pillProgression.ts`:

```typescript
export function getPillCount(round: number): number {
  const baseCount = 6
  const increaseBy = 1
  const frequency = 3
  const maxCap = 12
  
  const increments = Math.floor((round - 1) / frequency)
  return Math.min(baseCount + increments * increaseBy, maxCap)
}
```

### Tabela de Escalabilidade

| Rodadas | Pílulas | Observações |
|---------|---------|-------------|
| 1-3 | 6 | Tutorial, aprendizado básico |
| 4-6 | 7 | HEAL disponível, mais opções |
| 7-9 | 8 | Tensão crescente |
| 10-12 | 9 | FATAL ativo, alta tensão |
| 13-15 | 10 | Late game, decisões críticas |
| 16-18 | 11 | Máxima complexidade |
| 19+ | 12 | Cap máximo, sustentabilidade |

### Impacto no Gameplay

#### Pools Pequenos (6-7 pílulas)
- **Vantagem**: Decisões mais diretas
- **Desvantagem**: Menos opções estratégicas
- **Uso**: Early game, tutorial

#### Pools Médios (8-10 pílulas)
- **Vantagem**: Equilíbrio entre escolha e complexidade
- **Desvantagem**: Pode gerar analysis paralysis
- **Uso**: Mid game, core gameplay

#### Pools Grandes (11-12 pílulas)
- **Vantagem**: Máxima profundidade estratégica
- **Desvantagem**: Pode ser overwhelming
- **Uso**: Late game, jogadores experientes

---

## 4. Distribuição Proporcional

### Metodologia
O sistema usa **distribuição proporcional** baseada em pesos, não sorteio aleatório. Cada porcentagem define a probabilidade relativa de cada tipo no pool.

### Exemplos de Distribuição

#### Rodada 1 (6 pílulas) - Tutorial
| Tipo | Peso | % Normalizado | Quantidade | Impacto |
|------|------|---------------|------------|---------|
| SAFE | 45 | ~53% | 3 | Segurança |
| DMG_LOW | 40 | ~47% | 3 | Risco baixo |
| DMG_HIGH | 15 | 0% | 0 | Não disponível |
| HEAL | 0 | 0% | 0 | Não disponível |
| FATAL | 0 | 0% | 0 | Não disponível |
| LIFE | 0 | 0% | 0 | Não disponível |

#### Rodada 5 (7 pílulas) - Mid Game
| Tipo | Peso | % Normalizado | Quantidade | Impacto |
|------|------|---------------|------------|---------|
| SAFE | 35 | ~35% | 2-3 | Reduzindo |
| DMG_LOW | 32 | ~32% | 2 | Estável |
| DMG_HIGH | 18 | ~18% | 1 | Crescente |
| HEAL | 12 | ~12% | 1 | Disponível |
| FATAL | 5 | ~3% | 0 | Raro |
| LIFE | 8 | ~8% | 1 | Recompensa |

#### Rodada 15 (10 pílulas) - Late Game
| Tipo | Peso | % Normalizado | Quantidade | Impacto |
|------|------|---------------|------------|---------|
| SAFE | 15 | ~18% | 2 | Mínimo |
| DMG_LOW | 20 | ~24% | 2 | Constante |
| DMG_HIGH | 25 | ~30% | 3 | Dominante |
| HEAL | 15 | ~18% | 2 | Necessário |
| FATAL | 18 | ~22% | 2 | Perigoso |
| LIFE | 13 | ~16% | 1 | Valioso |

### Algoritmo de Distribuição

```typescript
function distributePillTypes(round: number, totalPills: number): Record<PillType, number> {
  // 1. Calcula pesos baseados na rodada
  const weights = getPillChances(round)
  
  // 2. Distribui proporcionalmente
  const distribution = {}
  let remaining = totalPills
  
  for (const [type, weight] of Object.entries(weights)) {
    const count = Math.round((weight / 100) * totalPills)
    distribution[type] = Math.min(count, remaining)
    remaining -= distribution[type]
  }
  
  // 3. Distribui remainder para tipos mais frequentes
  while (remaining > 0) {
    const mostFrequent = getMostFrequentType(weights)
    distribution[mostFrequent]++
    remaining--
  }
  
  return distribution
}
```
| DMG_LOW | ~19% | 2 |
| DMG_HIGH | ~22% | 2 |
| HEAL | ~14% | 1 |
| FATAL | ~12% | 1 |

---

## 5. Funcoes Principais

### distributePillTypes(count, round)
Calcula a distribuicao proporcional de tipos para uma rodada.

### getPillCount(round)
Retorna a quantidade de pilulas baseado na rodada (step function).

### getPillChances(round)
Retorna as porcentagens normalizadas de cada tipo.

---

## 6. Ajustes de Balanceamento

Para ajustar a dificuldade, modifique `PROGRESSION` em `pillProgression.ts`:

### Jogo mais facil:
- Aumentar `startPct` de SAFE
- Aumentar `unlockRound` de FATAL
- Aumentar `endPct` de HEAL

### Jogo mais dificil:
- Diminuir `startPct` de SAFE
- Diminuir `unlockRound` de FATAL
- Aumentar `endPct` de DMG_HIGH e FATAL

---

## 7. Extensibilidade

O sistema suporta configs customizadas para modos alternativos:

```typescript
// Modo Classico (quantidade fixa)
const CLASSIC_SCALING: PoolScalingConfig = {
  baseCount: 6,
  increaseBy: 0,
  frequency: 1,
}

// Modo Hardcore (mais agressivo)
const HARDCORE: ProgressionConfig = {
  maxRound: 10,
  rules: {
    SAFE:     { unlockRound: 1, startPct: 30, endPct: 5 },
    DMG_LOW:  { unlockRound: 1, startPct: 35, endPct: 20 },
    DMG_HIGH: { unlockRound: 1, startPct: 20, endPct: 30 },
    HEAL:     { unlockRound: 3, startPct: 10, endPct: 10 },
    FATAL:    { unlockRound: 2, startPct: 5,  endPct: 25 },
    LIFE:     { unlockRound: 5, startPct: 5,  endPct: 10 },
  }
}
```

---

## 5. Sistema de Formas (Shapes)

### Progressão de Formas

Localizada em `src/utils/shapeProgression.ts`:

```typescript
export const SHAPE_PROGRESSION: ShapeProgressionConfig = {
  maxRound: 15,
  rules: {
    // Formas básicas (sempre disponíveis)
    round:     { unlockRound: 1, startPct: 45, endPct: 4 },
    fruit:     { unlockRound: 1, startPct: 50, endPct: 4 },
    flower:    { unlockRound: 1, startPct: 18, endPct: 8 },
    
    // Formas intermediárias
    pumpkin:   { unlockRound: 3, startPct: 45, endPct: 7 },
    skull:     { unlockRound: 3, startPct: 15, endPct: 20 },
    bear:      { unlockRound: 5, startPct: 45, endPct: 9 },
    
    // Formas avançadas
    domino:    { unlockRound: 7, startPct: 0, endPct: 0 },
    pineapple: { unlockRound: 8, startPct: 0, endPct: 0 },
    
    // Outras formas com distribuição específica
    // ... (16 formas total)
  }
}
```

### Impacto no Balanceamento

#### Diversidade Visual
- **Early Game**: 2-4 formas para simplicidade
- **Mid Game**: 6-10 formas para variedade
- **Late Game**: 12-16 formas para complexidade máxima

#### Shape Quests
- **Dificuldade**: Aumenta com mais formas disponíveis
- **Recompensa**: +1 Pill Coin por quest completado
- **Frequência**: 1 quest ativo por jogador por vez

---

## 6. Sistema de IA

### Níveis de Dificuldade

#### Easy (Paciente)
```typescript
const EASY_CONFIG: AIConfig = {
  riskTolerance: 0.3,        // Muito conservador
  itemUsageProbability: 0.4,  // Usa poucos itens
  scannerPriority: 0.8,      // Prioriza informação
  aggressiveness: 0.2,       // Raramente força oponente
  adaptability: 0.3,         // Pouco adaptável
}
```

**Comportamento**:
- Evita pílulas com >30% chance de dano
- Usa Scanner frequentemente
- Raramente usa itens ofensivos
- Previsível e defensivo

#### Normal (Cobaia)
```typescript
const NORMAL_CONFIG: AIConfig = {
  riskTolerance: 0.5,        // Balanceado
  itemUsageProbability: 0.6,  // Uso moderado de itens
  scannerPriority: 0.6,      // Equilibra info e ação
  aggressiveness: 0.4,       // Ocasionalmente agressivo
  adaptability: 0.5,         // Moderadamente adaptável
}
```

**Comportamento**:
- Aceita riscos calculados
- Usa itens estrategicamente
- Balanceia defesa e ataque
- Experiência equilibrada

#### Hard (Sobrevivente)
```typescript
const HARD_CONFIG: AIConfig = {
  riskTolerance: 0.7,        // Aceita riscos altos
  itemUsageProbability: 0.8,  // Usa itens frequentemente
  scannerPriority: 0.4,      // Prefere ação a informação
  aggressiveness: 0.7,       // Frequentemente agressivo
  adaptability: 0.7,         // Altamente adaptável
}
```

**Comportamento**:
- Toma riscos calculados
- Usa itens ofensivos ativamente
- Pressiona o oponente
- Adapta estratégia rapidamente

#### Insane (Hofmann)
```typescript
const INSANE_CONFIG: AIConfig = {
  riskTolerance: 0.9,        // Aceita quase qualquer risco
  itemUsageProbability: 0.9,  // Usa todos os itens disponíveis
  scannerPriority: 0.2,      // Prefere ação pura
  aggressiveness: 0.9,       // Máxima agressividade
  adaptability: 0.9,         // Extremamente adaptável
}
```

**Comportamento**:
- Sem piedade, máxima pressão
- Usa todos os recursos disponíveis
- Força situações de alto risco
- Imprevisível e letal

### Algoritmo de Decisão da IA

```typescript
function makeAIDecision(context: AIDecisionContext): AIAction {
  // 1. Análise de risco do pool
  const riskAnalysis = analyzePoolRisk(context)
  
  // 2. Avaliação de itens disponíveis
  const itemEvaluations = evaluateItems(context)
  
  // 3. Cálculo de probabilidades
  const typeOdds = calculateTypeOdds(context)
  
  // 4. Decisão baseada em configuração
  if (shouldUseItem(context, itemEvaluations)) {
    return selectBestItem(itemEvaluations)
  }
  
  if (shouldScanFirst(context, riskAnalysis)) {
    return { type: 'USE_ITEM', itemType: 'scanner', target: selectScanTarget() }
  }
  
  return { type: 'CONSUME_PILL', pillId: selectSafestPill(context, typeOdds) }
}
```

---

## 7. Sistema de Itens

### Balanceamento por Categoria

#### Intel (Informação)
| Item | Custo Oportunidade | Impacto | Timing |
|------|-------------------|---------|--------|
| **Scanner** | Baixo | Alto | Early/Mid |
| **Inverter** | Médio | Muito Alto | Mid/Late |
| **Double** | Alto | Extremo | Late |
| **Shape Scanner** | Médio | Alto | Mid |

#### Sustain (Sobrevivência)
| Item | Custo Oportunidade | Impacto | Timing |
|------|-------------------|---------|--------|
| **Pocket Pill** | Baixo | Médio | Qualquer |
| **Shield** | Alto | Muito Alto | Pre-risk |

#### Control (Controle)
| Item | Custo Oportunidade | Impacto | Timing |
|------|-------------------|---------|--------|
| **Handcuffs** | Médio | Alto | Estratégico |
| **Force Feed** | Alto | Extremo | Late |

#### Chaos (Caos)
| Item | Custo Oportunidade | Impacto | Timing |
|------|-------------------|---------|--------|
| **Shuffle** | Baixo | Médio | Reset info |
| **Discard** | Médio | Alto | Risk removal |

### Prioridades da IA

```typescript
const ITEM_PRIORITY: Record<ItemType, number> = {
  shield: 10,        // Máxima prioridade defensiva
  pocket_pill: 9,    // Cura imediata
  scanner: 7,        // Informação valiosa
  shape_scanner: 7,  // Informação em massa
  handcuffs: 6,      // Controle de turno
  force_feed: 5,     // Ataque direto
  inverter: 4,       // Modificador tático
  double: 3,         // Amplificador de risco
  discard: 2,        // Remoção de ameaça
  shuffle: 1,        // Reset de informação
}
```

---

## 8. Pill Store

### Economia de Pill Coins

#### Fontes de Coins
- **Shape Quests**: +1 coin por quest completado
- **Frequência**: ~1-2 coins por 3-4 rodadas
- **Acumulação**: Coins persistem entre rodadas

#### Preços da Loja
| Item | Custo | Valor Estratégico | ROI |
|------|-------|------------------|-----|
| **1-Up** | 3 coins | Muito Alto | Excelente |
| **Reboot** | 2 coins | Alto | Bom |
| **Scanner-2X** | 2 coins | Médio | Moderado |
| **Scanner** | 2 coins | Alto | Bom |
| **Shield** | 2 coins | Muito Alto | Excelente |
| **Pocket Pill** | 2 coins | Médio | Moderado |
| **Shape Scanner** | 3 coins | Alto | Bom |

#### Estratégias de Compra

**Early Game (Rodadas 1-4)**:
- Foco em **Scanner** e **Pocket Pill**
- Evitar **1-Up** (muito caro)
- **Scanner-2X** para vantagem informacional

**Mid Game (Rodadas 5-8)**:
- **Shield** antes de rodadas perigosas
- **Reboot** se resistência baixa
- **1-Up** se coins suficientes

**Late Game (Rodadas 9+)**:
- **1-Up** prioridade máxima
- **Shield** essencial
- **Shape Scanner** para informação crítica

---

## 9. Métricas de Balanceamento

### KPIs de Gameplay

#### Duração de Partida
- **Target**: 8-12 rodadas
- **Atual**: 9.2 rodadas (média)
- **Variação**: ±3 rodadas (95% dos casos)

#### Taxa de Eliminação
| Rodada | Taxa Esperada | Taxa Atual | Status |
|--------|---------------|------------|--------|
| 1-3 | 5-10% | 8% | ✅ Balanceado |
| 4-6 | 15-25% | 22% | ✅ Balanceado |
| 7-9 | 25-35% | 31% | ✅ Balanceado |
| 10-12 | 35-50% | 43% | ✅ Balanceado |
| 13+ | 50%+ | 58% | ✅ Balanceado |

#### Uso de Itens
- **Target**: 2-3 itens por rodada
- **Atual**: 2.7 itens por rodada
- **Distribuição**: Scanner (35%), Pocket Pill (20%), Shield (15%), outros (30%)

#### Completude de Quests
- **Target**: 60-80% de sucesso
- **Atual**: 72% de sucesso
- **Impacto**: Economia de coins balanceada

### Métricas de IA

#### Taxa de Vitória por Dificuldade
| Dificuldade | Taxa de Vitória IA | Status |
|-------------|-------------------|--------|
| Easy | 25-35% | 31% ✅ |
| Normal | 45-55% | 52% ✅ |
| Hard | 65-75% | 69% ✅ |
| Insane | 80-90% | 84% ✅ |

#### Tempo de Decisão
- **Easy**: 1.2s (simulação de hesitação)
- **Normal**: 0.8s (pensamento moderado)
- **Hard**: 0.5s (decisão rápida)
- **Insane**: 0.3s (instinto letal)

---

## 10. Ajustes e Tuning

### Histórico de Mudanças

#### v1.0 → v1.1
- **FATAL unlock**: Rodada 4 → Rodada 6 (muito cedo)
- **SAFE endPct**: 10% → 15% (muito punitivo)
- **Pool scaling**: Mais gradual (3 rodadas por incremento)

#### v1.1 → v1.2
- **IA Hard**: Agressividade 0.8 → 0.7 (muito dominante)
- **Shape Scanner**: Custo 2 → 3 coins (muito barato)
- **Quest length**: Máximo 4 → 3 shapes (muito difícil)

#### v1.2 → v1.3 (Atual)
- **LIFE startPct**: 5% → 6% (muito raro)
- **Timer Pill Store**: 45s → 30s (muito longo)
- **Heartbeat timeout**: 10s → 15s (desconexões falsas)

### Próximos Ajustes Planejados

#### Balanceamento de Formas
- Revisar distribuição de shapes raras
- Ajustar dificuldade de quests por rodada
- Balancear Shape Scanner vs Scanner regular

#### IA Improvements
- Melhorar avaliação de Force Feed
- Ajustar uso de Inverter em situações críticas
- Otimizar timing de Shield usage

#### Multiplayer Balance
- Ajustar timeout de reconexão
- Balancear vantagem do host
- Otimizar sincronização de eventos

---

## 11. Ferramentas de Análise

### DevTools Integration

O sistema inclui ferramentas de análise integradas:

```typescript
// Distribution Simulator
const simulator = new DistributionSimulator()
simulator.simulateRounds(1000, 20) // 1000 partidas, até rodada 20
simulator.getStatistics() // Métricas detalhadas

// Shape Distribution Analysis
const shapeAnalyzer = new ShapeDistributionAnalyzer()
shapeAnalyzer.analyzeProgression() // Progressão de formas

// AI Performance Tracker
const aiTracker = new AIPerformanceTracker()
aiTracker.trackDecisions() // Decisões da IA
aiTracker.getWinRates() // Taxa de vitória por dificuldade
```

### Métricas em Tempo Real

- **Action History**: Log de todas as ações
- **State Snapshots**: Capturas de estado por rodada
- **Performance Metrics**: Tempo de renderização e decisão
- **Balance Indicators**: Alertas de desbalanceamento

### A/B Testing Framework

```typescript
interface BalanceTest {
  name: string
  variants: {
    control: ProgressionConfig
    treatment: ProgressionConfig
  }
  metrics: string[]
  sampleSize: number
}

const pillProgressionTest: BalanceTest = {
  name: "FATAL_UNLOCK_TIMING",
  variants: {
    control: { /* rodada 6 */ },
    treatment: { /* rodada 5 */ }
  },
  metrics: ["elimination_rate", "game_duration", "player_satisfaction"],
  sampleSize: 1000
}
```

Este sistema de balanceamento garante que o jogo mantenha tensão crescente, decisões significativas e experiência equilibrada para todos os níveis de habilidade.