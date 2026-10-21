import { describe, expect, it } from 'vitest'
import type { Site, WorkItem } from '../content/types.ts'
import { validateItems, validateSite } from './validate.ts'

const validItem = (over: Partial<WorkItem> = {}): WorkItem => ({
  kind: 'work',
  id: 'dialpad',
  date: '2025-06',
  title: 'Dialpad',
  color: '#1f3cff',
  headline: 'Rebuilt calling.',
  impact: ['Cut review time in half'],
  role: 'Lead designer',
  period: 'Jan to Jun 2025',
  summary: 'What it was and why it mattered.',
  ...over,
})

const validSite = (over: Partial<Site> = {}): Site => ({
  name: 'Joshua Hynes',
  role: 'Design Director',
  headline: { first: 'Design leader.', verbs: ['Building', 'Spelunking'], rest: 'with AI.' },
  intro: ['I am ', { strong: 'Joshua' }, '.'],
  history: [{ company: 'Dialpad', title: 'Director', dates: '2018–Present', logo: 'dialpad' }],
  contact: { email: 'me@example.com' },
  ...over,
})

describe('validateItems', () => {
  it('accepts a valid published item', () => {
    expect(validateItems([validItem()])).toEqual([])
  })

  it('flags an empty headline, naming the item and field', () => {
    const problems = validateItems([validItem({ headline: '' })])
    expect(problems).toHaveLength(1)
    expect(problems[0]).toContain('dialpad: headline')
  })

  it.each([[0], [4]])('rejects %i impact entries (1 to 3 allowed)', (count) => {
    const problems = validateItems([validItem({ impact: Array.from({ length: count }, (_, i) => `result ${i}`) })])
    expect(problems).toHaveLength(1)
    expect(problems[0]).toContain('dialpad: impact')
  })

  it('flags TODO placeholders in a published item but not in a draft', () => {
    expect(validateItems([validItem({ summary: 'TODO: write' })])).toEqual([
      expect.stringContaining('dialpad: summary'),
    ])
    expect(validateItems([validItem({ summary: 'TODO: write', draft: true })])).toEqual([])
  })

  it('flags a TODO placeholder nested in lists', () => {
    const problems = validateItems([validItem({ story: ['fine', 'TODO: more'], impact: ['TODO: number'] })])
    expect(problems).toHaveLength(2)
  })

  it('flags a duplicate id once', () => {
    const problems = validateItems([validItem(), validItem(), validItem()])
    expect(problems.filter((p) => p.includes('duplicate'))).toHaveLength(1)
  })

  it('flags an id that is not kebab-case', () => {
    const problems = validateItems([validItem({ id: 'Not Kebab' })])
    expect(problems).toHaveLength(1)
    expect(problems[0]).toContain('Not Kebab: id')
  })

  it.each(['2025', '2025-06'])('accepts date %s', (date) => {
    expect(validateItems([validItem({ date })])).toEqual([])
  })

  it.each(['2025-13', '25', 'soon'])('rejects date %s', (date) => {
    const problems = validateItems([validItem({ date })])
    expect(problems).toHaveLength(1)
    expect(problems[0]).toContain('dialpad: date')
  })

  it('accepts a #rrggbb colour', () => {
    expect(validateItems([validItem({ color: '#1f3cff' })])).toEqual([])
  })

  it.each(['blue', '#fff'])('rejects colour %s', (color) => {
    const problems = validateItems([validItem({ color })])
    expect(problems).toHaveLength(1)
    expect(problems[0]).toContain('dialpad: color')
  })

  it('still checks a draft for structural problems', () => {
    expect(validateItems([validItem({ draft: true, color: 'blue' })])).toHaveLength(1)
  })
})

describe('validateSite', () => {
  it('accepts a valid site', () => {
    expect(validateSite(validSite())).toEqual([])
  })

  it('flags a TODO contact email', () => {
    const problems = validateSite(validSite({ contact: { email: 'TODO: your email address' } }))
    expect(problems).toHaveLength(1)
    expect(problems[0]).toContain('contact.email')
  })

  describe('headline', () => {
    const headline = (over: Partial<Site['headline']>): Site => validSite({
      headline: { first: 'Design leader.', verbs: ['Building', 'Spelunking'], rest: 'with AI.', ...over },
    })

    it.each([['first'], ['rest']] as const)('flags an empty %s', (field) => {
      const problems = validateSite(headline({ [field]: '  ' }))
      expect(problems).toHaveLength(1)
      expect(problems[0]).toContain(`headline.${field}`)
    })

    it('flags a headline with no verbs', () => {
      const problems = validateSite(headline({ verbs: [] }))
      expect(problems).toHaveLength(1)
      expect(problems[0]).toContain('headline.verbs')
    })

    it('flags a blank verb', () => {
      const problems = validateSite(headline({ verbs: ['Building', ' '] }))
      expect(problems).toHaveLength(1)
      expect(problems[0]).toContain('headline.verbs[1]')
    })

    it('flags a verb longer than 16 characters but accepts exactly 16', () => {
      expect(validateSite(headline({ verbs: ['Building', 'x'.repeat(16)] }))).toEqual([])
      const problems = validateSite(headline({ verbs: ['Building', 'x'.repeat(17)] }))
      expect(problems).toHaveLength(1)
      expect(problems[0]).toContain('headline.verbs[1]')
    })

    it('flags a duplicate verb once per duplicate, ignoring case', () => {
      const problems = validateSite(headline({ verbs: ['Building', 'Tuning', 'building', 'TUNING', 'Mapping'] }))
      expect(problems).toHaveLength(2)
      expect(problems.every((p) => p.includes('duplicate'))).toBe(true)
    })
  })
})
