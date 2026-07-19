import { describe, it, expect } from 'vitest'
import { classifyMove, formatEvaluation, evaluationToPercentage, CLASSIFICATION_COLORS } from '@/utils/evaluation'

describe('classifyMove', () => {
  it('classifies brilliant moves (gaining advantage)', () => {
    expect(classifyMove(0, 50)).toBe('brilliant')
    expect(classifyMove(-100, 200)).toBe('brilliant')
  })

  it('classifies best moves (minimal loss)', () => {
    expect(classifyMove(100, 80)).toBe('best')
    expect(classifyMove(0, -10)).toBe('best')
  })

  it('classifies blunders (massive loss)', () => {
    expect(classifyMove(100, -900)).toBe('blunder')
    expect(classifyMove(0, -1000)).toBe('blunder')
  })

  it('classifies mistakes', () => {
    expect(classifyMove(100, -400)).toBe('mistake')
  })

  it('classifies inaccuracies', () => {
    expect(classifyMove(100, -200)).toBe('inaccuracy')
  })
})

describe('formatEvaluation', () => {
  it('formats centipawns as decimal', () => {
    expect(formatEvaluation(45)).toBe('+0.45')
    expect(formatEvaluation(-120)).toBe('-1.20')
  })

  it('formats mate scores', () => {
    expect(formatEvaluation(99500)).toContain('M')
    expect(formatEvaluation(-99500)).toContain('M')
  })
})

describe('evaluationToPercentage', () => {
  it('returns 50 for equal position', () => {
    expect(evaluationToPercentage(0)).toBe(50)
  })

  it('returns higher for white advantage', () => {
    expect(evaluationToPercentage(400)).toBeGreaterThan(50)
  })

  it('returns lower for black advantage', () => {
    expect(evaluationToPercentage(-400)).toBeLessThan(50)
  })

  it('clamps to 0-100 range', () => {
    expect(evaluationToPercentage(100000)).toBe(100)
    expect(evaluationToPercentage(-100000)).toBe(0)
  })
})

describe('CLASSIFICATION_COLORS', () => {
  it('has colors for all classifications', () => {
    const classifications = ['brilliant', 'great', 'best', 'excellent', 'good', 'inaccuracy', 'mistake', 'blunder']
    for (const c of classifications) {
      expect(CLASSIFICATION_COLORS[c]).toBeDefined()
      expect(CLASSIFICATION_COLORS[c]).toMatch(/^#/)
    }
  })
})
