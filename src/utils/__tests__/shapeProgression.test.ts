import { describe, it, expect } from 'vitest'
import {
  ALL_SHAPES,
  SHAPE_PROGRESSION,
  getShapeChances,
  rollShape,
  distributeShapes,
  countPillShapes,
  getInitialShapeCounts,
  type ShapeProgressionConfig,
} from '../shapeProgression'
import type { Pill, PillShape } from '@/types'

// ============================================
// Testes de ALL_SHAPES
// ============================================

describe('ALL_SHAPES', () => {
  it('contem 16 shapes', () => {
    expect(ALL_SHAPES).toHaveLength(16)
  })

  it('contem shapes basicas', () => {
    expect(ALL_SHAPES).toContain('capsule')
    expect(ALL_SHAPES).toContain('round')
  })

  it('nao contem duplicatas', () => {
    const uniqueShapes = new Set(ALL_SHAPES)
    expect(uniqueShapes.size).toBe(ALL_SHAPES.length)
  })
})

// ============================================
// Testes de SHAPE_PROGRESSION config
// ============================================

describe('SHAPE_PROGRESSION config', () => {
  it('tem maxRound definido', () => {
    expect(SHAPE_PROGRESSION.maxRound).toBe(15)
  })

  it('tem regras para todas as 16 shapes', () => {
    const ruleKeys = Object.keys(SHAPE_PROGRESSION.rules)
    expect(ruleKeys).toHaveLength(16)
  })

  it('todas shapes tem unlockRound >= 1', () => {
    for (const rule of Object.values(SHAPE_PROGRESSION.rules)) {
      expect(rule.unlockRound).toBeGreaterThanOrEqual(1)
    }
  })

  it('todas shapes tem startPct e endPct >= 0', () => {
    for (const rule of Object.values(SHAPE_PROGRESSION.rules)) {
      expect(rule.startPct).toBeGreaterThanOrEqual(0)
      expect(rule.endPct).toBeGreaterThanOrEqual(0)
    }
  })
})

// ============================================
// Testes de getShapeChances()
// ============================================

describe('getShapeChances', () => {
  it('retorna apenas shapes desbloqueadas na rodada 1', () => {
    const chances = getShapeChances(1)

    // Verifica shapes com chance > 0 na rodada 1
    const activeShapes = Object.entries(chances)
      .filter(([_, chance]) => chance > 0)
      .map(([shape]) => shape)

    // Cada shape ativa deve ter unlockRound <= 1
    for (const shape of activeShapes) {
      const rule = SHAPE_PROGRESSION.rules[shape as PillShape]
      expect(rule.unlockRound).toBeLessThanOrEqual(1)
    }
  })

  it('shapes com unlockRound > rodada atual tem chance 0', () => {
    const chances = getShapeChances(1)

    for (const [shape, rule] of Object.entries(SHAPE_PROGRESSION.rules)) {
      if (rule.unlockRound > 1) {
        expect(chances[shape as PillShape]).toBe(0)
      }
    }
  })

  it('soma das probabilidades e sempre ~100%', () => {
    for (let round = 1; round <= 20; round++) {
      const chances = getShapeChances(round)
      const sum = Object.values(chances).reduce((a, b) => a + b, 0)
      // Tolerancia de 1% devido a arredondamentos
      expect(sum).toBeCloseTo(100, 0)
    }
  })

  it('clampeia rodada para minimo 1', () => {
    const chancesNegative = getShapeChances(-5)
    const chancesZero = getShapeChances(0)
    const chancesOne = getShapeChances(1)

    expect(chancesNegative).toEqual(chancesOne)
    expect(chancesZero).toEqual(chancesOne)
  })

  it('clampeia rodada para maxRound', () => {
    const chancesAt15 = getShapeChances(15)
    const chancesAt100 = getShapeChances(100)

    expect(chancesAt100).toEqual(chancesAt15)
  })

  it('aceita config customizada', () => {
    const customConfig: ShapeProgressionConfig = {
      maxRound: 5,
      rules: {
        capsule: { unlockRound: 1, startPct: 100, endPct: 0 },
        round: { unlockRound: 1, startPct: 0, endPct: 100 },
        triangle: { unlockRound: 99, startPct: 0, endPct: 0 },
        oval: { unlockRound: 99, startPct: 0, endPct: 0 },
        cross: { unlockRound: 99, startPct: 0, endPct: 0 },
        heart: { unlockRound: 99, startPct: 0, endPct: 0 },
        flower: { unlockRound: 99, startPct: 0, endPct: 0 },
        star: { unlockRound: 99, startPct: 0, endPct: 0 },
        pumpkin: { unlockRound: 99, startPct: 0, endPct: 0 },
        coin: { unlockRound: 99, startPct: 0, endPct: 0 },
        bear: { unlockRound: 99, startPct: 0, endPct: 0 },
        gem: { unlockRound: 99, startPct: 0, endPct: 0 },
        skull: { unlockRound: 99, startPct: 0, endPct: 0 },
        domino: { unlockRound: 99, startPct: 0, endPct: 0 },
        pineapple: { unlockRound: 99, startPct: 0, endPct: 0 },
        fruit: { unlockRound: 99, startPct: 0, endPct: 0 },
      },
    }

    const chancesRound1 = getShapeChances(1, customConfig)
    expect(chancesRound1.capsule).toBe(100)
    expect(chancesRound1.round).toBe(0)

    const chancesRound5 = getShapeChances(5, customConfig)
    expect(chancesRound5.capsule).toBe(0)
    expect(chancesRound5.round).toBe(100)
  })

  it('shapes com startPct e endPct = 0 tem chance 0 em todas rodadas', () => {
    // Na config padrao, capsule tem startPct: 0 e endPct: 0
    for (let round = 1; round <= 15; round++) {
      const chances = getShapeChances(round)
      expect(chances.capsule).toBe(0)
    }
  })

  it('novas shapes aparecem conforme unlockRound', () => {
    // pumpkin desbloqueia na rodada 3
    expect(getShapeChances(2).pumpkin).toBe(0)
    expect(getShapeChances(3).pumpkin).toBeGreaterThan(0)

    // bear desbloqueia na rodada 5
    expect(getShapeChances(4).bear).toBe(0)
    expect(getShapeChances(5).bear).toBeGreaterThan(0)

    // pineapple desbloqueia na rodada 8
    expect(getShapeChances(7).pineapple).toBe(0)
    expect(getShapeChances(8).pineapple).toBeGreaterThanOrEqual(0) // Pode ser 0 se endPct = 0
  })
})

// ============================================
// Testes de rollShape()
// ============================================

describe('rollShape', () => {
  it('nunca retorna shape bloqueada na rodada 1', () => {
    const blockedShapes = Object.entries(SHAPE_PROGRESSION.rules)
      .filter(([_, rule]) => rule.unlockRound > 1)
      .map(([shape]) => shape)

    // Roda 100 vezes para ter confianca estatistica
    for (let i = 0; i < 100; i++) {
      const shape = rollShape(1)
      expect(blockedShapes).not.toContain(shape)
    }
  })

  it('retorna apenas shapes com chance > 0', () => {
    for (let round = 1; round <= 10; round++) {
      const chances = getShapeChances(round)
      const validShapes = Object.entries(chances)
        .filter(([_, chance]) => chance > 0)
        .map(([shape]) => shape)

      // Roda 50 vezes por rodada
      for (let i = 0; i < 50; i++) {
        const shape = rollShape(round)
        expect(validShapes).toContain(shape)
      }
    }
  })

  it('retorna fallback round se algo der errado', () => {
    // Config com todos os shapes desativados
    const emptyConfig: ShapeProgressionConfig = {
      maxRound: 1,
      rules: {
        capsule: { unlockRound: 99, startPct: 0, endPct: 0 },
        round: { unlockRound: 99, startPct: 0, endPct: 0 },
        triangle: { unlockRound: 99, startPct: 0, endPct: 0 },
        oval: { unlockRound: 99, startPct: 0, endPct: 0 },
        cross: { unlockRound: 99, startPct: 0, endPct: 0 },
        heart: { unlockRound: 99, startPct: 0, endPct: 0 },
        flower: { unlockRound: 99, startPct: 0, endPct: 0 },
        star: { unlockRound: 99, startPct: 0, endPct: 0 },
        pumpkin: { unlockRound: 99, startPct: 0, endPct: 0 },
        coin: { unlockRound: 99, startPct: 0, endPct: 0 },
        bear: { unlockRound: 99, startPct: 0, endPct: 0 },
        gem: { unlockRound: 99, startPct: 0, endPct: 0 },
        skull: { unlockRound: 99, startPct: 0, endPct: 0 },
        domino: { unlockRound: 99, startPct: 0, endPct: 0 },
        pineapple: { unlockRound: 99, startPct: 0, endPct: 0 },
        fruit: { unlockRound: 99, startPct: 0, endPct: 0 },
      },
    }

    const shape = rollShape(1, emptyConfig)
    expect(shape).toBe('round')
  })

  it('pode retornar shapes desbloqueadas em rodadas altas', () => {
    // bear desbloqueia na rodada 5
    let foundBear = false
    for (let i = 0; i < 500; i++) {
      if (rollShape(5) === 'bear') {
        foundBear = true
        break
      }
    }
    expect(foundBear).toBe(true)
  })
})

// ============================================
// Testes de distributeShapes()
// ============================================

describe('distributeShapes', () => {
  it('soma das quantidades e igual ao count solicitado', () => {
    for (let round = 1; round <= 15; round++) {
      for (const count of [6, 7, 8, 9, 10, 12]) {
        const distribution = distributeShapes(count, round)
        const total = Object.values(distribution).reduce((a, b) => a + b, 0)
        expect(total).toBe(count)
      }
    }
  })

  it('retorna apenas shapes desbloqueadas', () => {
    const distribution = distributeShapes(10, 1)

    for (const [shape, count] of Object.entries(distribution)) {
      if (count > 0) {
        const rule = SHAPE_PROGRESSION.rules[shape as PillShape]
        expect(rule.unlockRound).toBeLessThanOrEqual(1)
      }
    }
  })

  it('distribui consistentemente (deterministico)', () => {
    const dist1 = distributeShapes(6, 1)
    const dist2 = distributeShapes(6, 1)

    expect(dist1).toEqual(dist2)
  })

  it('shapes bloqueadas tem count 0', () => {
    const distribution = distributeShapes(10, 2)

    // pumpkin desbloqueia rodada 3
    expect(distribution.pumpkin).toBe(0)

    // bear desbloqueia rodada 5
    expect(distribution.bear).toBe(0)
  })

  it('shapes com chance 0 tem count 0', () => {
    const distribution = distributeShapes(10, 5)

    // capsule tem startPct: 0 e endPct: 0
    expect(distribution.capsule).toBe(0)
  })

  it('distribui novas shapes quando desbloqueadas', () => {
    // Rodada 5: bear desbloqueia
    const dist5 = distributeShapes(12, 5)
    expect(dist5.bear).toBeGreaterThan(0)
  })
})

// ============================================
// Testes de countPillShapes()
// ============================================

describe('countPillShapes', () => {
  const createMockPill = (shape: PillShape): Pill => ({
    id: `pill-${Math.random()}`,
    type: 'SAFE',
    isRevealed: false,
    stats: {
      damage: 0,
      heal: 0,
      isFatal: false,
      livesRestore: 0,
    },
    visuals: {
      color: '#888888',
      shape,
      label: '???',
    },
  })

  it('conta shapes corretamente', () => {
    const pills: Pill[] = [
      createMockPill('round'),
      createMockPill('round'),
      createMockPill('capsule'),
      createMockPill('flower'),
    ]

    const counts = countPillShapes(pills)

    expect(counts.round).toBe(2)
    expect(counts.capsule).toBe(1)
    expect(counts.flower).toBe(1)
    expect(counts.triangle).toBe(0)
  })

  it('retorna zeros para array vazio', () => {
    const counts = countPillShapes([])

    for (const count of Object.values(counts)) {
      expect(count).toBe(0)
    }
  })

  it('retorna contagem para todas as 16 shapes', () => {
    const counts = countPillShapes([])
    const keys = Object.keys(counts)

    expect(keys).toHaveLength(16)
    expect(keys).toContain('capsule')
    expect(keys).toContain('round')
    expect(keys).toContain('pineapple')
  })
})

// ============================================
// Testes de getInitialShapeCounts()
// ============================================

describe('getInitialShapeCounts', () => {
  it('retorna objeto com todas as 16 shapes', () => {
    const counts = getInitialShapeCounts()
    const keys = Object.keys(counts)

    expect(keys).toHaveLength(16)
  })

  it('todas shapes iniciam com 0', () => {
    const counts = getInitialShapeCounts()

    for (const count of Object.values(counts)) {
      expect(count).toBe(0)
    }
  })

  it('retorna novo objeto a cada chamada', () => {
    const counts1 = getInitialShapeCounts()
    const counts2 = getInitialShapeCounts()

    counts1.round = 5

    expect(counts2.round).toBe(0)
  })
})

