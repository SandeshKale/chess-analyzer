import { describe, it, expect } from 'vitest'
import { parsePgn, getFenAtMove, getMoveAtIndex } from '@/utils/chessHelpers'

describe('parsePgn', () => {
  it('parses a standard PGN with headers', () => {
    const pgn = `[Event "Test Game"]
[White "Alice"]
[Black "Bob"]
[Result "1-0"]

1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 1-0`

    const game = parsePgn(pgn)
    expect(game.headers.white).toBe('Alice')
    expect(game.headers.black).toBe('Bob')
    expect(game.headers.result).toBe('1-0')
    expect(game.moves).toHaveLength(6)
    expect(game.moves[0]).toBe('e4')
    expect(game.moves[5]).toBe('a6')
  })

  it('handles PGN without headers', () => {
    const pgn = '1. e4 e5 2. Nf3 Nc6'
    const game = parsePgn(pgn)
    expect(game.moves).toHaveLength(4)
    expect(game.headers.white).toBeUndefined()
  })

  it('ignores comments and NAGs', () => {
    const pgn = `1. e4 {great move!} e5 2. Nf3 $1 Nc6 $2 1-0`
    const game = parsePgn(pgn)
    expect(game.moves).toHaveLength(4)
    expect(game.moves[0]).toBe('e4')
  })

  it('handles invalid moves gracefully', () => {
    const pgn = `1. e4 e5 2. Nf3 invalidmove 3. Nc3`
    const game = parsePgn(pgn)
    expect(game.moves.length).toBeGreaterThanOrEqual(2)
  })
})

describe('getFenAtMove', () => {
  it('returns starting position for index -1', () => {
    const fen = getFenAtMove(['e4', 'e5'], -1)
    expect(fen).toContain('rnbqkbnr')
  })

  it('returns correct FEN after moves', () => {
    const fen = getFenAtMove(['e4', 'e5'], 1)
    expect(fen).toContain('rnbqkbnr')
    expect(fen).not.toContain('e2')
  })
})

describe('getMoveAtIndex', () => {
  it('returns correct move info', () => {
    const move = getMoveAtIndex(['e4', 'e5', 'Nf3'], 2)
    expect(move).not.toBeNull()
    expect(move!.san).toBe('Nf3')
    expect(move!.isWhite).toBe(false)
    expect(move!.moveNumber).toBe(2)
  })

  it('returns null for out of bounds', () => {
    expect(getMoveAtIndex(['e4'], 5)).toBeNull()
    expect(getMoveAtIndex(['e4'], -1)).toBeNull()
  })
})
