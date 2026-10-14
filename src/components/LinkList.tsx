/** A labelled list: mono title over hairline-separated serif rows. */
export function LinkList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="font-mono text-xs uppercase tracking-[0.08em] text-muted">{title}</h3>
      <ul className="m-0 mt-4 list-none p-0">
        {items.map((item, i) => (
          <li key={i} className="border-t border-rule py-3 text-[clamp(1.25rem,1.3vw,2rem)] leading-snug">
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}
