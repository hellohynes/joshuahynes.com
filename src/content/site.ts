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
  // Hidden from the navigation for now; set to true when the first piece is ready. /work still resolves either way.
  showWork: false,
  contact: { email: 'work@joshuahynes.com' },
  // Hand-maintained, rounded on purpose so they do not go stale quickly; update them when it makes sense. Sources:
  // contributions and pull requests from the GitHub contributions graph, commits, additions and deletions from the
  // contributor insights of the repos worked in, AI artifacts from the notes folder, skills from the design repo
  // plus personal ones.
  stats: {
    lead: 'Since 2025:',
    items: [
      '3,800+ contributions',
      '750+ pull requests',
      '1,200+ commits',
      '18M+ additions',
      '7M+ deletions',
      '3,000+ AI artifacts created',
      '85+ skills created',
    ],
  },
}
