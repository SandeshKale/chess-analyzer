import { describe, it, expect, vi } from 'vitest'
import { getOpeningByFen, getOpeningByMoves } from '@/services/openingBook'

describe('getOpeningByFen', () => {
  it('returns opening info for valid FEN', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        opening: { eco: 'C00', name: 'French Defense' },
        fen: 'rnbqkbnr/pppp1ppp/4p3/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2',
        moves: [],
        white: 100,
        draws: 50,
        black: 50,
      }),
    }))

    const opening = await getOpeningByFen('rnbqkbnr/pppp1ppp/4p3/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2')
    expect(opening).not.toBeNull()
    expect(opening!.eco).toBe('C00')
    expect(opening!.name).toBe('French Defense')
  })

  it('returns null when no opening found', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ fen: '...', moves: [] }),
    }))

    const opening = await getOpeningByFen('some-fen')
    expect(opening).toBeNull()
  })

  it('returns null on fetch error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')))
    const opening = await getOpeningByFen('fen')
    expect(opening).toBeNull()
  })
})

describe('getOpeningByMoves', () => {
  it('returns opening for move sequence', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        opening: { eco: 'B20', name: 'Sicilian Defense' },
        fen: '...',
        moves: [],
        white: 100,
        draws: 50,
        black: 50,
      }),
    }))

    const opening = await getOpeningByMoves('e2e4,c7c5')
    expect(opening).not.toBeNull()
    expect(opening!.name).toBe('Sicilian Defense')
  })
})
