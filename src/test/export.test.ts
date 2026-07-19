import { describe, it, expect } from 'vitest'
import { generateAnnotatedPgn } from '@/utils/export'
import type { ParsedGame, MoveAnalysis } from '@/types'

describe('generateAnnotatedPgn', () => {
  const mockGame: ParsedGame = {
    headers: {
      event: 'Test Event',
      white: 'Alice',
      black: 'Bob',
      result: '1-0',
      date: '2024.01.01',
    },
    moves: ['e4', 'e5', 'Nf3'],
    rawPgn: '',
  }

  const mockAnalysis: MoveAnalysis[] = [
    {
      san: 'e4',
      uci: 'e2e4',
      fen: '',
      moveNumber: 1,
      isWhite: true,
      evaluation: 30,
      classification: 'excellent',
      bestLine: { depth: 20, score: 30, pv: ['e2e4'], multipvIndex: 1 },
      alternatives: [],
    },
    {
      san: 'e5',
      uci: 'e7e5',
      fen: '',
      moveNumber: 1,
      isWhite: false,
      evaluation: 20,
      classification: 'good',
      bestLine: { depth: 20, score: 20, pv: ['e7e5'], multipvIndex: 1 },
      alternatives: [],
    },
    {
      san: 'Nf3',
      uci: 'g1f3',
      fen: '',
      moveNumber: 2,
      isWhite: true,
      evaluation: 45,
      classification: 'best',
      bestLine: { depth: 20, score: 45, pv: ['g1f3'], multipvIndex: 1 },
      alternatives: [],
    },
  ]

  it('includes all headers', () => {
    const pgn = generateAnnotatedPgn(mockGame, mockAnalysis)
    expect(pgn).toContain('[Event "Test Event"]')
    expect(pgn).toContain('[White "Alice"]')
    expect(pgn).toContain('[Black "Bob"]')
    expect(pgn).toContain('[Result "1-0"]')
  })

  it('includes evaluation annotations', () => {
    const pgn = generateAnnotatedPgn(mockGame, mockAnalysis)
    expect(pgn).toContain('[%eval')
  })

  it('includes classification comments', () => {
    const pgn = generateAnnotatedPgn(mockGame, mockAnalysis)
    expect(pgn).toContain('Excellent')
  })

  it('ends with result', () => {
    const pgn = generateAnnotatedPgn(mockGame, mockAnalysis)
    expect(pgn.trim().endsWith('1-0')).toBe(true)
  })

  it('handles empty analysis gracefully', () => {
    const pgn = generateAnnotatedPgn(mockGame, [])
    expect(pgn).toContain('1. e4 e5 2. Nf3 1-0')
  })
})
