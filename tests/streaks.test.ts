import { describe, it, expect } from 'vitest'
import {
  addDays, activeDays, currentStreak, heatLevel, heatmapCells, longestStreak, minutesByDay,
} from '@/lib/streaks'
import type { Progress, Sessions } from '@/lib/types'

describe('addDays', () => {
  it('crosses month and year boundaries', () => {
    expect(addDays('2026-01-31', 1)).toBe('2026-02-01')
    expect(addDays('2026-01-01', -1)).toBe('2025-12-31')
    expect(addDays('2024-02-28', 1)).toBe('2024-02-29')
  })
})

describe('activeDays', () => {
  it('unions checkbox days and session days', () => {
    const progress: Progress = { items: { a: { done: true, at: '2026-07-15T10:00:00' } }, weeks: { 'week-00': { dodDone: true, at: '2026-07-14T22:00:00' } } }
    const sessions: Sessions = { sessions: [{ date: '2026-07-13', minutes: 30 }] }
    expect(activeDays(progress, sessions)).toEqual(new Set(['2026-07-15', '2026-07-14', '2026-07-13']))
  })
})

describe('currentStreak', () => {
  const days = new Set(['2026-07-14', '2026-07-15', '2026-07-16'])
  it('counts consecutive days ending today', () => {
    expect(currentStreak(days, '2026-07-16')).toBe(3)
  })
  it("doesn't break if today is not yet active", () => {
    expect(currentStreak(days, '2026-07-17')).toBe(3)
  })
  it('is 0 after a gap of more than one day', () => {
    expect(currentStreak(days, '2026-07-19')).toBe(0)
  })
})

describe('longestStreak', () => {
  it('finds the longest run', () => {
    expect(longestStreak(new Set(['2026-07-01', '2026-07-02', '2026-07-04', '2026-07-05', '2026-07-06']))).toBe(3)
    expect(longestStreak(new Set())).toBe(0)
  })
})

describe('heatLevel', () => {
  it('gives checkbox-only days minimum intensity', () => {
    expect(heatLevel(true, 0)).toBe(1)
    expect(heatLevel(false, 0)).toBe(0)
  })
  it('buckets by minutes', () => {
    expect(heatLevel(true, 30)).toBe(1)
    expect(heatLevel(true, 45)).toBe(2)
    expect(heatLevel(true, 90)).toBe(3)
    expect(heatLevel(true, 180)).toBe(4)
  })
})

describe('heatmapCells + minutesByDay', () => {
  it('produces one cell per day in range with summed minutes', () => {
    const sessions: Sessions = { sessions: [{ date: '2026-07-15', minutes: 20 }, { date: '2026-07-15', minutes: 25 }] }
    const minutes = minutesByDay(sessions)
    expect(minutes['2026-07-15']).toBe(45)
    const cells = heatmapCells(new Set(['2026-07-15']), minutes, '2026-07-14', '2026-07-16')
    expect(cells).toEqual([
      { date: '2026-07-14', level: 0 },
      { date: '2026-07-15', level: 2 },
      { date: '2026-07-16', level: 0 },
    ])
  })
})
