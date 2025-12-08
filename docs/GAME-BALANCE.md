# Game Balance: Sistema de Progressão de Pílulas

Este documento define a curva de dificuldade e a distribuição de probabilidade das pílulas ao longo das rodadas, visando um equilíbrio entre sorte e estratégia.

> **Roadmap Feature: Pílulas de Vida (L)**
> Note que as pílulas do tipo **Vida (L)** listadas abaixo estão planejadas como uma **feature futura**.
>
>   * **No Código:** A estrutura já suporta esse tipo para facilitar a implementação posterior.
>   * **No Balanceamento Atual:** Elas aparecem apenas a partir da Rodada 8 ("Late Game"), mas podem ser facilmente desativadas ajustando o `endPct` para 0 na configuração inicial.

-----

## 1\. Tabela de Referência (Probabilidade Estática)

Visão geral da distribuição desejada caso fosse hardcoded. O objetivo é transicionar de "Seguro" para "Caos Controlado".

**Legenda:**

  * **P** = Placebo (Neutro)
  * **V** = Veneno (Dano Baixo)
  * **T** = Toxina (Dano Médio)
  * **C** = Cianeto (Fatal/Alto Risco)
  * **A** = Antídoto (Cura/Proteção)
  * **L** = Vida (Feature Futura)

| Rodada | P (Safe) | V (Low) | T (Mid) | C (Fatal) | A (Heal) | L (Life)\* | Fase do Jogo |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **1** | 70% | 30% | 0% | 0% | 0% | 0% | Tutorial / Aquecimento |
| **2** | 50% | 50% | 0% | 0% | 0% | 0% | Introdução ao risco |
| **3** | 40% | 30% | 20% | 0% | 10% | 0% | Toxinas desbloqueadas |
| **4** | 30% | 30% | 25% | 0% | 15% | 0% | Aumento de complexidade |
| **5** | 25% | 20% | 25% | 5% | 25% | 0% | **Cianeto desbloqueado** (Raro) |
| **6** | 20% | 20% | 25% | 10% | 25% | 0% | Mid-game equilibrado |
| **7** | 20% | 20% | 25% | 15% | 20% | 0% | Zona de perigo |
| **8** | 15% | 15% | 20% | 15% | 25% | **10%** | Late game + **Vida** |
| **9** | 10% | 15% | 25% | 20% | 20% | **10%** | Alta letalidade |
| **10** | 10% | 15% | 25% | 25% | 10% | **15%** | Caos total |

-----

## 2\. Design Dinâmico (Implementação)

Para evitar tabelas gigantes e permitir ajustes finos ("tunning") sem refatoração, utilizaremos um sistema de **Interpolação Linear (Lerp)** baseado em regras de configuração.

### Definição de Tipos e Regras

```typescript
export type PillType = 'placebo' | 'veneno' | 'toxina' | 'cianeto' | 'antidoto' | 'vida';

interface PillRule {
  /** Round mínimo para a pílula começar a aparecer no pool */
  unlockRound: number;
  /** Probabilidade (%) exata no momento em que é desbloqueada */
  startPct: number;
  /** Probabilidade (%) alvo na última rodada (maxRound) */
  endPct: number;
}

interface ProgressionConfig {
  maxRound: number; // Define o teto para a interpolação (ex: Round 10)
  rules: Record<PillType, PillRule>;
}
```

### Configuração de Balanceamento

Este objeto é a "Single Source of Truth" do balanceamento do jogo.

```typescript
export const PROGRESSION: ProgressionConfig = {
  maxRound: 10,
  rules: {
    placebo: { unlockRound: 1, startPct: 70, endPct: 10 }, // Decai drasticamente
    veneno:  { unlockRound: 1, startPct: 30, endPct: 15 }, // Estabiliza
    toxina:  { unlockRound: 3, startPct: 20, endPct: 25 }, // Sobe no mid-game
    antidoto:{ unlockRound: 3, startPct: 10, endPct: 10 }, // Constante após unlock
    cianeto: { unlockRound: 5, startPct: 5,  endPct: 25 }, // Sobe perigosamente no fim
    
    // FEATURE FUTURA: Ajuste endPct para 0 caso queira desativar temporariamente
    vida:    { unlockRound: 8, startPct: 10, endPct: 15 }, 
  }
};
```

### Lógica de Cálculo (Helpers)

O algoritmo normaliza as porcentagens para garantir que a soma seja sempre 100%, prevenindo erros matemáticos na geração do pool.

```typescript
/** Função auxiliar de Interpolação Linear */
function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

/** * Calcula a distribuição de probabilidades para um determinado round.
 * Retorna um objeto normalizado onde a soma de valores é 100.
 */
export function getPillChances(round: number, config = PROGRESSION): Record<PillType, number> {
  const { maxRound, rules } = config;
  // Garante que não passamos do round máximo configurado para o cálculo
  const clampedRound = Math.max(1, Math.min(round, maxRound));

  const rawWeights: Record<PillType, number> = {
    placebo: 0, veneno: 0, toxina: 0, cianeto: 0, antidoto: 0, vida: 0,
  };

  let totalWeight = 0;

  // 1. Calcula os pesos brutos baseados na interpolação
  for (const [key, rule] of Object.entries(rules)) {
    const pill = key as PillType;

    if (clampedRound < rule.unlockRound) {
      rawWeights[pill] = 0;
      continue;
    }

    const roundSpan = maxRound - rule.unlockRound;
    // Se o span for 0 (unlock no último round), t = 1
    const t = roundSpan <= 0 ? 1 : (clampedRound - rule.unlockRound) / roundSpan; 
    
    const value = lerp(rule.startPct, rule.endPct, t);
    rawWeights[pill] = value;
    totalWeight += value;
  }

  // 2. Normalização para 100%
  const normalizedChances = { ...rawWeights };
  if (totalWeight > 0) {
    (Object.keys(normalizedChances) as PillType[]).forEach(pill => {
      normalizedChances[pill] = Number(((normalizedChances[pill] * 100) / totalWeight).toFixed(2));
    });
  }

  return normalizedChances;
}

/** Sorteia um tipo de pílula baseado nas chances do round atual */
export function rollPillType(round: number): PillType {
  const chances = getPillChances(round);
  const randomValue = Math.random() * 100;
  
  let accumulatedChance = 0;
  for (const [pill, chance] of Object.entries(chances)) {
    accumulatedChance += chance;
    if (randomValue <= accumulatedChance) return pill as PillType;
  }

  return 'placebo'; // Fallback de segurança
}
```

-----

## 3\. Benefícios desta Arquitetura

1.  **Escalabilidade Infinita:** Se decidirmos criar um "Modo Infinito" que vai até a rodada 50, basta alterar `maxRound: 50` e o sistema recalcula a curva suavemente, sem necessidade de criar 40 novas linhas na tabela.
2.  **Toggle de Features (Feature Flag):** Como mencionado na seção de **Vida (L)**, podemos ativar ou desativar tipos inteiros de pílulas apenas alterando seus valores na `PROGRESSION`, sem mexer na lógica de sorteio (`rollPillType`).
3.  **Hot-Tunning:** É possível ajustar o "feeling" do jogo (ex: deixar o jogo mais agressivo mais cedo) alterando apenas o `unlockRound` do Cianeto, por exemplo.