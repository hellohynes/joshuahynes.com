import type { Item } from './types.ts'

export const allItems: Item[] = [
  {
    kind: 'work',
    id: 'example-piece',
    date: '2026-10',
    draft: true,
    title: 'Example Piece',
    color: '#1f3cff',
    headline: 'A short line that says what this piece did.',
    impact: ['Cut review time in half', 'Used by every team'],
    role: 'Lead designer',
    period: 'Jan to Oct 2026',
    team: 'Design and engineering',
    summary: 'One or two sentences on what this was and why it mattered.',
    story: [
      'A paragraph on the problem and what was at stake.',
      'A paragraph on the approach and what changed as a result.',
    ],
    credits: [{ role: 'Engineering', name: 'Sam Rivera' }],
  },
  // To add a piece, copy this block above the example and fill it in. Optional fields are marked.
  // {
  //   kind: 'work',                  // always 'work'
  //   id: 'my-piece',                // URL slug: the page lives at /work/my-piece
  //   date: '2026-10',               // 'YYYY' or 'YYYY-MM'; newest first, a bare year sorts after its months
  //   draft: true,                   // optional; drafts show in development only. Delete the line to publish
  //   title: 'My Piece',             // name shown on the grid and the page
  //   color: '#1f3cff',              // flat #rrggbb background for the piece
  //   headline: '...',               // one sentence on what the piece did
  //   impact: ['...'],               // short results, one per entry
  //   role: '...',                   // your role on the piece
  //   period: '...',                 // free-text timeframe, e.g. 'Jan to Oct 2026'
  //   team: '...',                   // optional; who you worked with
  //   summary: '...',                // one or two sentences for the page intro
  //   story: ['...'],                // optional; paragraphs for the case study
  //   credits: [{ role: '...', name: '...' }], // optional; collaborators
  //   media: { kind: 'image', src: '/...', alt: '...' }, // optional; cover. kind is 'image' or 'video'; video may add poster
  //   gallery: [{ kind: 'image', src: '/...', alt: '...' }], // optional; more media, same shape as media
  // },
]
