import { describe, it, expect } from 'vitest'
import { ratingForGameType } from './ratings.js'

describe('ratingForGameType', () => {
  it('returns rating for matching game type', () => {
    const ratings = [
      { gameType: 'RAPID', rating: 1400 },
      { gameType: 'BLITZ', rating: 1300 },
    ]
    expect(ratingForGameType(ratings, 'RAPID')).toBe(1400)
    expect(ratingForGameType(ratings, 'BLITZ')).toBe(1300)
  })

  it('returns 1200 when game type not found', () => {
    const ratings = [{ gameType: 'RAPID', rating: 1400 }]
    expect(ratingForGameType(ratings, 'BLITZ')).toBe(1200)
  })

  it('returns 1200 when ratings is not an array', () => {
    expect(ratingForGameType(null, 'RAPID')).toBe(1200)
    expect(ratingForGameType(undefined, 'RAPID')).toBe(1200)
  })
})
