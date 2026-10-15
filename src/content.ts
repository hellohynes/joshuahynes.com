// All page copy lives here. Every placeholder starts with "TODO:";
// scripts/check-content.mjs fails the production build while any remain.

export type GlyphName = 'baseball' | 'basketball' | 'football'
export type ThesisPart = string | { glyph: GlyphName } | { script: string }
export type FigureName = 'spray' | 'court' | 'field'

export interface Stat {
  value: string
  label: string
}

export interface CaseStudyContent {
  id: string
  date: string
  title: string
  leadershipType: string
  problem: string
  decision: string
  impact: string
  figure?: FigureName
}

export interface Content {
  name: string
  role: { title: string; dates: string }
  thesis: ThesisPart[]
  scope: Stat[]
  caseStudies: CaseStudyContent[]
  lab: { title: string; blurb: string; href: string }
  companies: string[]
  reading: string[]
  listening: string[]
  contact: { label: string; href: string }
}

export const content: Content = {
  name: 'Joshua Hynes',
  role: {
    title: 'Dialpad, Senior Director of Product Design',
    dates: '2018 – Present',
  },
  thesis: [
    'I design products, teams, ',
    { glyph: 'baseball' },
    '& practices',
    { script: 'with AI,' },
    { glyph: 'football' },
    'that solve billion dollar problems',
    { glyph: 'football' },
    'and improve everyday issues.',
  ],
  scope: [
    { value: '30', label: 'People led, at peak' },
    { value: '4', label: 'Managers' },
    { value: '4', label: 'Disciplines' },
    { value: '$400M+', label: 'Company ARR' },
  ],
  caseStudies: [
    {
      id: 'case-1',
      date: 'TODO: 20XX',
      title: 'TODO: Pods over silos: restructuring to build faster',
      leadershipType: 'TODO: Shaping direction',
      problem: 'TODO: The business problem, in one sentence a peer would recognise.',
      decision: 'TODO: The leadership decision you made, and what you gave up to make it.',
      impact: 'TODO: One specific number, e.g. team from 5 to 15, or time to ship down 40%.',
      figure: 'court',
    },
    {
      id: 'case-2',
      date: 'TODO: 20XX',
      title: 'TODO: A design hub and onboarding path for the whole org',
      leadershipType: 'TODO: Enabling success',
      problem: 'TODO: The business problem, in one sentence a peer would recognise.',
      decision: 'TODO: The leadership decision you made, and what you gave up to make it.',
      impact: 'TODO: One specific number that says it mattered.',
      figure: 'field',
    },
    {
      id: 'case-3',
      date: 'TODO: 20XX',
      title: 'TODO: A critique ritual that raised the bar without a gatekeeper',
      leadershipType: 'TODO: Elevating execution',
      problem: 'TODO: The business problem, in one sentence a peer would recognise.',
      decision: 'TODO: The leadership decision you made, and what you gave up to make it.',
      impact: 'TODO: One specific number that says it mattered.',
    },
  ],
  lab: {
    title: 'TODO: Something you built yourself',
    blurb: 'TODO: One or two sentences on a side project that shows you still make things.',
    href: 'TODO: https://example.com',
  },
  companies: [
    'TODO: Company A',
    'TODO: Company B',
    'TODO: Company C',
    'TODO: Company D',
    'TODO: Company E',
    'TODO: Company F',
  ],
  reading: ['TODO: Book or article, Author', 'TODO: Book or article, Author', 'TODO: Book or article, Author'],
  listening: ['TODO: Album, Artist', 'TODO: Album, Artist', 'TODO: Album, Artist'],
  contact: { label: 'TODO: you@example.com', href: 'TODO: mailto:you@example.com' },
}
