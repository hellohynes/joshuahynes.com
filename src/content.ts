// All page copy lives here. Every placeholder starts with "TODO:";
// scripts/check-content.mjs fails the production build while any remain.

import dialpadIcon from './assets/dialpad-icon.svg'

export type GlyphName = 'baseball' | 'basketball' | 'football'

/** A piece of the intro sentence: plain (muted) text, or a name that is picked out in the darker ink. */
export type IntroPart = string | { strong: string }

export interface Role {
  company: string
  title: string
  dates: string
  /** a small logo that appears beside the company on hover; leave it out until you have the file */
  logo?: string
}

export interface Media {
  kind: 'image' | 'video'
  /** path under public/, e.g. /work/beacon.mp4 */
  src: string
  /** a still shown before a video plays, and under reduced motion */
  poster?: string
  alt: string
}

export interface WorkItem {
  id: string
  title: string
  /** your part in it, in a line: e.g. "Led a team of 12 designers" */
  role: string
  /** the time range, e.g. "2021 – 2023" */
  period: string
  problem: string
  outcome: string
  /**
   * How much of the grid this piece takes up. The grid is 8 columns wide and its rows are a fixed height, so
   * `cols: 5, rows: 3` is a wide tile and `cols: 3, rows: 6` is a tall one. Pieces are placed in order.
   */
  cols: number
  rows: number
  /** how the picture fills its frame: "cover" crops to fill, "contain" shows all of it. Defaults to cover */
  fit?: 'cover' | 'contain'
  /** leave out until the file exists: the tile shows a grey placeholder with the title */
  media?: Media
}

export interface Content {
  name: string
  intro: IntroPart[]
  history: Role[]
  work: WorkItem[]
  social: { x: string; github: string }
}

const todo = {
  role: 'TODO: Your role',
  period: 'TODO: Time range',
  problem: 'TODO: The problem, in a sentence or two.',
  outcome: 'TODO: The outcome, with one specific result.',
}

export const content: Content = {
  name: 'Joshua Hynes',
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
    { company: 'Dialpad', title: 'Senior Director, Product Design', dates: '2018–Present', logo: dialpadIcon },
    { company: 'Stack Overflow', title: 'Senior Product Designer', dates: '2013–2018' },
    { company: 'AndCulture', title: 'Senior Experience Designer', dates: '2006–2013' },
  ],
  // The pieces in the design, with the sizes from it. Fill in each piece's text here, add `media` once its file
  // is in public/work/, and change `cols` and `rows` to resize it. Add a new piece by adding an entry.
  work: [
    { id: 'dialpad', title: 'Dialpad', ...todo, cols: 5, rows: 3 },
    { id: 'calling', title: 'Calling', ...todo, cols: 3, rows: 6 },
    { id: 'agent-studio', title: 'Agent Studio', ...todo, cols: 2, rows: 3 },
    { id: 'text-input', title: 'Text Input', ...todo, cols: 3, rows: 2 },
    { id: 'ryte', title: 'Ryte', ...todo, cols: 3, rows: 3 },
    { id: 'ai-composer', title: 'AI Composer', ...todo, cols: 2, rows: 2 },
    { id: 'agent-skills', title: 'Agent Skills', ...todo, cols: 3, rows: 2 },
    { id: 'meetings', title: 'Meetings', ...todo, cols: 4, rows: 4 },
    { id: 'beacon', title: 'Beacon', ...todo, cols: 4, rows: 4 },
  ],
  social: { x: 'TODO: https://x.com/', github: 'TODO: https://github.com/' },
}
