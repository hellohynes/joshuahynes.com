import { describe, expect, it } from 'vitest'
import { clampTip, hoverProgress } from './readout.ts'

const box = { width: 400, height: 300, tipWidth: 120, tipHeight: 50, margin: 8 }

describe('clampTip', () => {
  it('sits to the right of the point and above it when there is room', () => {
    expect(clampTip({ ...box, px: 100, py: 200 })).toEqual({ left: 114, top: 140 })
  })

  it('flips to the left of the point when the right side would overflow', () => {
    expect(clampTip({ ...box, px: 350, py: 200 }).left).toBe(350 - 14 - 120)
  })

  it('stays inside the margin on the left when neither side fits', () => {
    const { left } = clampTip({ ...box, width: 150, px: 60, py: 200 })
    expect(left).toBe(8)
  })

  it('keeps the right edge inside the host whenever the tip fits at all', () => {
    for (const px of [0, 30, 150, 200, 260, 390, 400]) {
      const { left } = clampTip({ ...box, px, py: 100 })
      expect(left).toBeGreaterThanOrEqual(box.margin)
      expect(left + box.tipWidth).toBeLessThanOrEqual(box.width - box.margin)
    }
  })

  it('keeps the top inside the margin at the top and the bottom', () => {
    expect(clampTip({ ...box, px: 100, py: 5 }).top).toBe(8)
    expect(clampTip({ ...box, px: 100, py: 290, tipHeight: 400 }).top).toBe(8)
    expect(clampTip({ ...box, px: 100, py: 1000 }).top).toBe(300 - 50 - 8)
  })

  it('pins a tip wider than the host to the left margin', () => {
    expect(clampTip({ ...box, width: 100, tipWidth: 321, px: 50, py: 100 }).left).toBe(8)
  })
})

describe('hoverProgress', () => {
  it('runs from 0 to 1 and clamps outside the duration', () => {
    expect(hoverProgress(-50, 700)).toBe(0)
    expect(hoverProgress(0, 700)).toBe(0)
    expect(hoverProgress(700, 700)).toBe(1)
    expect(hoverProgress(5000, 700)).toBe(1)
  })

  it('eases out: fast at first, slow at the end', () => {
    expect(hoverProgress(350, 700)).toBeCloseTo(0.875, 5)
    expect(hoverProgress(70, 700)).toBeGreaterThan(0.2)
    expect(hoverProgress(630, 700) - hoverProgress(560, 700)).toBeLessThan(hoverProgress(70, 700))
  })

  it('treats a zero duration as already finished', () => {
    expect(hoverProgress(0, 0)).toBe(1)
  })
})
