import type { ComponentType } from 'react'
import type { CaseStudyContent, FigureName } from '../content'
import { Court } from '../figures/Court'
import { Field } from '../figures/Field'
import { SprayChart } from '../figures/SprayChart'

const FIGURES: Record<FigureName, ComponentType> = {
  spray: SprayChart,
  court: Court,
  field: Field,
}

const ANSWERS = [
  ['Problem', 'problem'],
  ['Decision', 'decision'],
  ['Impact', 'impact'],
] as const

export function CaseStudy({ study }: { study: CaseStudyContent }) {
  const Figure = study.figure ? FIGURES[study.figure] : null
  return (
    <article aria-labelledby={study.id} className="border-t border-rule py-12">
      <p className="flex flex-wrap justify-between gap-x-8 gap-y-1 font-mono text-xs uppercase tracking-[0.08em] text-muted">
        <span>{study.date}</span>
        <span>{study.leadershipType}</span>
      </p>
      <h3 id={study.id} className="mt-4 max-w-[24ch] font-serif text-[clamp(1.75rem,3.6vw,3rem)] font-[380] leading-[1.1] tracking-[-0.02em]">
        {study.title}
      </h3>
      <div className="mt-10 grid gap-10 lg:grid-cols-2 lg:gap-16">
        <dl className="grid content-start gap-6">
          {ANSWERS.map(([label, key]) => (
            <div key={key} className="grid gap-1 sm:grid-cols-[6rem_1fr] sm:gap-6">
              <dt className="font-mono text-xs uppercase tracking-[0.08em] text-muted">{label}</dt>
              <dd className="m-0 text-lg leading-snug">{study[key]}</dd>
            </div>
          ))}
        </dl>
        {Figure && <Figure />}
      </div>
    </article>
  )
}
