import { describe, it, expect, vi } from 'vitest'
import { getPlayerArchives, getMonthlyGames, parseArchiveUrl } from '@/services/chesscomApi'

describe('parseArchiveUrl', () => {
  it('parses valid archive URLs', () => {
    const result = parseArchiveUrl('https://api.chess.com/pub/player/magnuscarlsen/games/2024/01')
    expect(result.username).toBe('magnuscarlsen')
    expect(result.year).toBe('2024')
    expect(result.month).toBe('01')
  })

  it('throws for invalid URLs', () => {
    expect(() => parseArchiveUrl('invalid-url')).toThrow('Invalid archive URL')
  })
})

describe('getPlayerArchives', () => {
  it('returns archives in reverse order', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        archives: [
          'https://api.chess.com/pub/player/test/games/2024/01',
          'https://api.chess.com/pub/player/test/games/2023/12',
        ]
      }),
    }))

    const archives = await getPlayerArchives('test')
    expect(archives).toHaveLength(2)
    expect(archives[0]).toContain('2024/01')
  })

  it('throws on 404', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 404, statusText: 'Not Found' }))
    await expect(getPlayerArchives('nonexistent')).rejects.toThrow('Player not found')
  })

  it('throws on 429', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 429, statusText: 'Too Many' }))
    await expect(getPlayerArchives('test')).rejects.toThrow('Rate limited')
  })
})

describe('getMonthlyGames', () => {
  it('returns games from monthly archive', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        games: [
          { url: '...', pgn: '1. e4 e5', white: { username: 'a', rating: 1500 }, black: { username: 'b', rating: 1500 } }
        ]
      }),
    }))

    const games = await getMonthlyGames('https://api.chess.com/pub/player/test/games/2024/01')
    expect(games).toHaveLength(1)
  })
})
