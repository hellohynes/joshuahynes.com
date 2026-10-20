import type { Role } from '../content'

/** Longer than the logo and the gap beside it (20px + 16px), so the text clears the logo when it slides over. */
const SHIFT = 'group-hover:translate-x-9'
const EASE = 'motion-safe:transition-[translate,opacity] motion-safe:duration-300 motion-safe:ease-[cubic-bezier(0.2,0,0,1)]'

/**
 * The work history: a company and title with the dates under it, and a hairline between rows. Where a role has
 * a logo it eases in beside the company when the row is hovered, and the text slides over to make room.
 * Every row has one in the design; a logo with a `background` is clipped to a rounded square, as AndCulture's is.
 */
export function WorkHistory({ history }: { history: Role[] }) {
  return (
    <ul aria-label="Work history" className="m-0 list-none p-0 pb-16">
      {history.map((role) => (
        <li key={role.company} className="group border-t border-rule pt-4 first:border-t-0 first:pt-0 [&:not(:first-child)]:mt-4">
          <div className="relative">
            {role.logo && (
              <span
                aria-hidden="true"
                style={role.logo.background ? { background: role.logo.background } : undefined}
                className={`absolute left-0 top-[4.5px] block size-5 -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 ${
                  role.logo.background ? 'overflow-hidden rounded-[3px]' : ''
                } ${EASE}`}
              >
                <img
                  src={role.logo.src}
                  alt=""
                  style={role.logo.size ? { width: role.logo.size, height: role.logo.size } : undefined}
                  className={
                    role.logo.size
                      ? 'absolute left-[calc(50%-0.5px)] top-1/2 max-w-none -translate-x-1/2 -translate-y-1/2'
                      : 'size-full'
                  }
                />
              </span>
            )}
            <div className={role.logo ? `${SHIFT} ${EASE}` : ''}>
              <p className="m-0 text-2xl leading-[1.2] text-muted">
                <span className="text-ink">{role.company}</span>, {role.title}
              </p>
              <p className="m-0 text-xs leading-[1.6] text-muted [font-feature-settings:'lnum'_1,'tnum'_1]">{role.dates}</p>
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}
