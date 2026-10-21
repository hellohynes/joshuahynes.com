import type { Site } from './types.ts'

// Every placeholder starts with "TODO:"; `pnpm check` fails the production deploy while any remain.
export const site: Site = {
  name: 'Joshua Hynes',
  role: 'Design Director',
  headline: ['Design leader.', 'Builds with AI.'],
  intro: [
    'I’m ',
    { strong: 'Joshua Hynes' },
    ', a ',
    { strong: 'Design Leader' },
    ' and ',
    { strong: 'Principal Designer' },
    '. Currently I’m leading design building the new era of AI-powered communications with ',
    { strong: 'Dialpad' },
    '.',
  ],
  history: [
    { company: 'Dialpad', title: 'Senior Director, Product Design', dates: '2018–Present', logo: 'dialpad' },
    { company: 'Stack Overflow', title: 'Senior Product Designer', dates: '2013–2018', logo: 'stack-overflow' },
    { company: 'AndCulture', title: 'Senior Experience Designer', dates: '2006–2013', logo: 'andculture' },
  ],
  contact: { email: 'TODO: your email address' },
}
