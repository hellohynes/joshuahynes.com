// All page copy lives here. Every placeholder starts with "TODO:";
// scripts/check-content.mjs fails the production build while any remain.

export type GlyphName = 'baseball' | 'basketball' | 'football'

/** The small drawing that sits at the end of an intro statement. */
export type InlineItem = 'dialpad' | 'terminal' | 'robot' | 'commits'

export interface Stat {
  value: string
  label: string
}

export interface Statement {
  text: string
  item: InlineItem
}

export interface Role {
  company: string
  title: string
  dates: string
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
  /** width / height of the card, so the masonry columns have a varied rhythm */
  ratio: string
  /** how the picture fills its frame: "cover" crops to fill, "contain" shows all of it. Defaults to cover */
  fit?: 'cover' | 'contain'
  /** leave out until the file exists: the card shows a grey placeholder */
  media?: Media
}

export interface Content {
  name: string
  current: Role & { statements: Statement[]; scope: Stat[] }
  earlier: Role[]
  work: WorkItem[]
  reading: string[]
  listening: string[]
  contact: { label: string; href: string }
}

export const content: Content = {
  name: 'Joshua Hynes',
  current: {
    company: 'Dialpad',
    title: 'Sr Director of Product Design',
    dates: '2018 – Present',
    statements: [
      { text: 'Leading the product design as we create the future of AI‑powered business communications', item: 'dialpad' },
      {
        text: 'Rethinking the product design craft alongside Product and Engineering while keeping humans in the loop',
        item: 'terminal',
      },
      { text: 'Creating systems that empower designers to build at the speed of thought', item: 'robot' },
      { text: 'Supporting designers to help them ship work that accurately reflects their intent', item: 'commits' },
    ],
    scope: [
      { value: '30', label: 'people led, at peak' },
      { value: '4', label: 'managers' },
      { value: '4', label: 'disciplines' },
    ],
  },
  earlier: [
    { company: 'Stack Overflow', title: 'Senior Product Designer', dates: '2013 – 2018' },
    { company: 'andCulture', title: 'Senior Experience Designer & Strategist', dates: '2006 – 2013' },
  ],
  // Twelve slots. Fill in each piece's text here, and add `media` once its file is in public/work/.
  work: [
    {
      id: 'work-01',
      title: 'TODO: Project title',
      role: 'TODO: Your role',
      period: 'TODO: Time range',
      problem: 'TODO: The problem, in a sentence or two.',
      outcome: 'TODO: The outcome, with one specific result.',
      ratio: '4 / 3',
    },
    {
      id: 'work-02',
      title: 'TODO: Project title',
      role: 'TODO: Your role',
      period: 'TODO: Time range',
      problem: 'TODO: The problem, in a sentence or two.',
      outcome: 'TODO: The outcome, with one specific result.',
      ratio: '3 / 4',
    },
    {
      id: 'work-03',
      title: 'TODO: Project title',
      role: 'TODO: Your role',
      period: 'TODO: Time range',
      problem: 'TODO: The problem, in a sentence or two.',
      outcome: 'TODO: The outcome, with one specific result.',
      ratio: '1 / 1',
    },
    {
      id: 'work-04',
      title: 'TODO: Project title',
      role: 'TODO: Your role',
      period: 'TODO: Time range',
      problem: 'TODO: The problem, in a sentence or two.',
      outcome: 'TODO: The outcome, with one specific result.',
      ratio: '16 / 10',
    },
    {
      id: 'work-05',
      title: 'TODO: Project title',
      role: 'TODO: Your role',
      period: 'TODO: Time range',
      problem: 'TODO: The problem, in a sentence or two.',
      outcome: 'TODO: The outcome, with one specific result.',
      ratio: '4 / 5',
    },
    {
      id: 'work-06',
      title: 'TODO: Project title',
      role: 'TODO: Your role',
      period: 'TODO: Time range',
      problem: 'TODO: The problem, in a sentence or two.',
      outcome: 'TODO: The outcome, with one specific result.',
      ratio: '3 / 2',
    },
    {
      id: 'work-07',
      title: 'TODO: Project title',
      role: 'TODO: Your role',
      period: 'TODO: Time range',
      problem: 'TODO: The problem, in a sentence or two.',
      outcome: 'TODO: The outcome, with one specific result.',
      ratio: '1 / 1',
    },
    {
      id: 'work-08',
      title: 'TODO: Project title',
      role: 'TODO: Your role',
      period: 'TODO: Time range',
      problem: 'TODO: The problem, in a sentence or two.',
      outcome: 'TODO: The outcome, with one specific result.',
      ratio: '4 / 3',
    },
    {
      id: 'work-09',
      title: 'TODO: Project title',
      role: 'TODO: Your role',
      period: 'TODO: Time range',
      problem: 'TODO: The problem, in a sentence or two.',
      outcome: 'TODO: The outcome, with one specific result.',
      ratio: '3 / 4',
    },
    {
      id: 'work-10',
      title: 'TODO: Project title',
      role: 'TODO: Your role',
      period: 'TODO: Time range',
      problem: 'TODO: The problem, in a sentence or two.',
      outcome: 'TODO: The outcome, with one specific result.',
      ratio: '16 / 10',
    },
    {
      id: 'work-11',
      title: 'TODO: Project title',
      role: 'TODO: Your role',
      period: 'TODO: Time range',
      problem: 'TODO: The problem, in a sentence or two.',
      outcome: 'TODO: The outcome, with one specific result.',
      ratio: '5 / 4',
    },
    {
      id: 'work-12',
      title: 'TODO: Project title',
      role: 'TODO: Your role',
      period: 'TODO: Time range',
      problem: 'TODO: The problem, in a sentence or two.',
      outcome: 'TODO: The outcome, with one specific result.',
      ratio: '1 / 1',
    },
  ],
  reading: ['TODO: Book or article, Author', 'TODO: Book or article, Author', 'TODO: Book or article, Author'],
  listening: ['TODO: Album, Artist', 'TODO: Album, Artist', 'TODO: Album, Artist'],
  contact: { label: 'TODO: you@example.com', href: 'TODO: mailto:you@example.com' },
}
