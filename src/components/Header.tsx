import { JhGlyph } from './JhGlyph'

/** Just the glyph, set 64px down from the top and 64px above the intro, as in the design. */
export function Header({ name }: { name: string }) {
  return (
    <header className="py-16">
      <a href="#top" aria-label={name} className="inline-flex h-11 items-center">
        <JhGlyph className="size-9" />
      </a>
    </header>
  )
}
