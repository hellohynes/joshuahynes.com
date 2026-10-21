import { describe, expect, it } from 'vitest'
import { fitScale } from './fit.ts'

describe('fitScale', () => {
  it('leaves a line that fits at full size', () => {
    expect(fitScale(800, 600)).toBe(1)
    expect(fitScale(800, 800)).toBe(1)
  })

  it('shrinks a line twice as wide to half size', () => {
    expect(fitScale(400, 800)).toBe(0.5)
  })

  it('never goes below the minimum', () => {
    expect(fitScale(100, 1000)).toBe(0.4)
  })

  it('honours a custom minimum', () => {
    expect(fitScale(100, 1000, 0.25)).toBe(0.25)
    expect(fitScale(100, 1000, 0.1)).toBe(0.1)
  })

  it('ignores a line with no measurable width', () => {
    expect(fitScale(400, 0)).toBe(1)
    expect(fitScale(400, -5)).toBe(1)
  })

  it('ignores a container with no measurable width', () => {
    expect(fitScale(0, 800)).toBe(1)
    expect(fitScale(-10, 800)).toBe(1)
  })
})
