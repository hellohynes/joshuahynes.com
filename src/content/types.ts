export type Media = {
  kind: 'image' | 'video'
  src: string
  poster?: string
  alt: string
}

export type Credit = { role: string; name: string }

export type WorkItem = {
  kind: 'work'
  id: string
  date: string
  draft?: boolean
  title: string
  color: string
  headline: string
  impact: string[]
  role: string
  period: string
  team?: string
  summary: string
  story?: string[]
  credits?: Credit[]
  media?: Media
  gallery?: Media[]
}

export type Item = WorkItem

export type IntroPart = string | { strong: string }

export type Role = {
  company: string
  title: string
  dates: string
  logo?: 'dialpad' | 'stack-overflow' | 'andculture'
}

export type Site = {
  name: string
  role: string
  headline: { first: string; verbs: string[]; rest: string }
  intro: IntroPart[]
  history: Role[]
  contact: { email: string }
}
