import type { IntroPart } from '../content/types.ts'

/** The introduction: set big and tight, in the muted grey, with the names picked out in the darker ink. */
export function Intro({ name, parts }: { name: string; parts: IntroPart[] }) {
  return (
    <section aria-labelledby="intro-name" className="pb-24">
      <h1 id="intro-name" className="sr-only">
        {name}
      </h1>
      <p className="m-0 max-w-[20em] text-[clamp(2.25rem,6vw,6.5rem)] font-medium leading-[1] tracking-[-0.045em] text-muted">
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
