import type { IntroPart } from '../content'

/** The introduction: one sentence in the muted grey, with the names picked out in the darker ink. */
export function Intro({ name, parts }: { name: string; parts: IntroPart[] }) {
  return (
    <section aria-labelledby="intro-name" className="pb-32 pt-16">
      <h1 id="intro-name" className="sr-only">
        {name}
      </h1>
      <p className="max-w-[19em] text-[clamp(1.5rem,2.2vw,1.875rem)] leading-[1.2] text-muted">
        {parts.map((part, i) =>
          typeof part === 'string' ? (
            part
          ) : (
            <span key={i} className="text-ink">
              {part.strong}
            </span>
          ),
        )}
      </p>
    </section>
  )
}
