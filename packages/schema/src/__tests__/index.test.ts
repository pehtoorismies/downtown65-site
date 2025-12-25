import { describe, expect, it } from 'vitest'
import { isoDateToDate } from '../'

describe('Schema codecs isoDateToDate', () => {
  it.each([
    '2025-01-15',
    '1976-01-15',
    '2000-02-29',
  ])('should decode successfully %s', (date) => {
    expect(isoDateToDate.decode(date)).toBeInstanceOf(Date)
  })
  it.each([
    [new Date(2025, 0, 14), '2025-01-14'],
    [new Date(1976, 0, 15), '1976-01-15'],
    [new Date(2000, 1, 13), '2000-02-13'],
  ])('should encode successfully %d to %s', (date, expected) => {
    expect(isoDateToDate.encode(date)).toBe(expected)
  })

  it.each([
    '202-01-15',
    '2025-13-15',
    '2025-00-15',
    '2025-01-32',
    'invalid-date',
  ])('should fail to decode %s', (date) => {
    expect(() => isoDateToDate.decode(date)).toThrowError()
  })
})
