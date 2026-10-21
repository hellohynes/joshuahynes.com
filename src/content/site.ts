import type { Site } from './types.ts'

// Every placeholder starts with "TODO:"; `pnpm check` fails the production deploy while any remain.
export const site: Site = {
  name: 'Joshua Hynes',
  role: 'Design Director',
  headline: {
    first: 'Design leader.',
    verbs: [
      'Building', 'Spelunking', 'Deep diving', 'Tinkering', 'Prototyping', 'Sketching', 'Wrangling',
      'Untangling', 'Shipping', 'Exploring', 'Tuning', 'Weaving', 'Mapping', 'Orchestrating', 'Distilling',
      'Remixing', 'Debugging', 'Composing', 'Iterating', 'Pairing', 'Refactoring', 'Whittling', 'Scaffolding',
      'Probing', 'Questioning', 'Rehearsing', 'Conducting', 'Brewing', 'Forging', 'Carving', 'Folding',
      'Stitching', 'Decoding', 'Curating', 'Hacking', 'Noodling', 'Charting', 'Surveying', 'Sharpening',
      'Polishing', 'Steering', 'Tending', 'Pruning', 'Conjuring', 'Doodling', 'Foraging', 'Kneading',
      'Hatching', 'Sanding', 'Riffing',
    ],
    rest: 'with AI.',
  },
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
  contact: { email: 'work@joshuahynes.com' },
}
