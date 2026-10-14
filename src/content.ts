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
    title: 'TODO: Company, Director of Design',
    dates: 'TODO: 20XX – Present',
  },
  thesis: [
    'TODO: I lead design across product areas so',
    { glyph: 'baseball' },
    'product and engineering ship as',
    { script: 'one team,' },
    { glyph: 'basketball' },
    'with a quality bar the whole org holds',
    { glyph: 'football' },
    'without me in the room.',
  ],
  scope: [
    { value: '00', label: 'TODO: people' },
    { value: '0', label: 'TODO: managers' },
    { value: '0', label: 'TODO: disciplines' },
    { value: '$0M', label: 'TODO: business area' },
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
