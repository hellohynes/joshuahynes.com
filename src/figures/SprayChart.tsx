import { useState } from 'react'
import type { CSSProperties } from 'react'
import { FigureFrame } from './FigureFrame'
import { describe, fromXY, HIT_R, HITS, HOME, nearestHit, titleCase, toXY, WALL } from './park'
import type { Hit, Result } from './park'
import type { Point } from './useFigureInput'

const BOX: [number, number, number, number] = [20, 30, 360, 280]

// Hovering within this many stage units of a circle's edge selects that circle.
const HOVER_REACH = HIT_R + 2

const KIND_RESULT: Record<Hit['kind'], Result> = { single: 'single', double: 'double', homer: 'home run' }

const toStage = (p: Point) => ({ x: BOX[0] + p.x * BOX[2], y: BOX[1] + p.y * BOX[3] })
const toUnit = (h: Hit): Point => ({ x: (h.x - BOX[0]) / BOX[2], y: (h.y - BOX[1]) / BOX[3] })

const angleOf = (h: Hit) => fromXY(h.x, h.y).deg

// The ball rests on a home run into the left-field seats, as one of the real circles.
const REST_HIT = HITS.filter((h) => h.kind === 'homer').sort((a, b) => Math.abs(angleOf(a) + 30) - Math.abs(angleOf(b) + 30))[0]
const REST = toUnit(REST_HIT)

// Keyboard order: left to right across the field, shallow to deep.
const ORDER = [...HITS].sort((a, b) => {
  const da = fromXY(a.x, a.y)
  const db = fromXY(b.x, b.y)
  return da.deg - db.deg || da.ft - db.ft
})

const f = (n: number) => n.toFixed(1)
const at = (deg: number, ft: number) => {
  const p = toXY(deg, ft)
  return `${f(p.x)} ${f(p.y)}`
}

const WALL_PATH = `M${WALL.map(([deg, ft]) => at(deg, ft)).join('L')}`
const LINES_PATH = `M${HOME.x} ${HOME.y}L${at(-45, 310)}M${HOME.x} ${HOME.y}L${at(45, 302)}`
const INFIELD_PATH = 'M200 290L235 255L200 220L165 255ZM150.7 240.7A52 52 0 0 1 249.3 240.7'

/**
 * A fly ball: the ground track from home plate is lofted into an arc. The arc bows
 * sideways, toward whichever side is up the screen (right when the shot is level),
 * so a steep shot still reads as a curve instead of collapsing into a straight line.
 */
function flyBall(to: { x: number; y: number }) {
  const dx = to.x - HOME.x
  const dy = to.y - HOME.y
  const reach = Math.hypot(dx, dy) || 1
  let nx = -dy / reach
  let ny = dx / reach
  if (ny > 0 || (ny === 0 && nx < 0)) {
    nx = -nx
    ny = -ny
  }
  const lift = 0.34 * reach
  const control = { x: (HOME.x + to.x) / 2 + nx * lift, y: (HOME.y + to.y) / 2 + ny * lift }
  return `M${HOME.x} ${HOME.y}Q${f(control.x)} ${f(control.y)} ${f(to.x)} ${f(to.y)}`
}

export function SprayChart() {
  // The circle the ball is going to. Only hovering (or stepping to) another circle changes it.
  const [active, setActive] = useState<Hit>(REST_HIT)

  function choose(hit: Hit): Point {
    setActive(hit)
    return toUnit(hit)
  }

  // Off the circles the ball goes back to the resting home run.
  const snap = (p: Point) => {
    const s = toStage(p)
    return choose(nearestHit(s.x, s.y, HOVER_REACH) ?? REST_HIT)
  }

  const keys = (key: string) => {
    if (key === 'Escape' || key === 'Home') return choose(REST_HIT)
    const step = key === 'ArrowRight' || key === 'ArrowDown' ? 1 : key === 'ArrowLeft' || key === 'ArrowUp' ? -1 : 0
    if (!step) return undefined
    const index = ORDER.indexOf(active)
    return choose(ORDER[(index + step + ORDER.length) % ORDER.length])
  }

  const { ft, deg } = fromXY(active.x, active.y)
  const result = KIND_RESULT[active.kind]
  // The line, ring and label take the colour of the circle they point at: red home runs,
  // ink doubles (white on dark), team-blue singles.
  const tone = active.kind === 'homer' ? 'a' : active.kind === 'double' ? 'i' : 's'

  return (
    <FigureFrame
      label="A baseball park seen from above with about a hundred hits sprayed across it. Hover a circle to send a ball from home plate to it; arrow keys step between circles."
      team="sox"
      box={BOX}
      rest={REST}
      snap={snap}
      keys={keys}
      caption={() => `${Math.round(ft)} ft · ${describe(deg, ft, result)} · illustrative`}
    >
      {() => {
        // The line is drawn to the chosen circle itself (not to the eased pointer position).
        const ball = { x: active.x, y: active.y }
        const flip = ball.x > 270 // keep the label inside the stage on the right side
        const shot = HITS.indexOf(active) // changing circle remounts these, so the line draws out again
        return (
          <>
            <path className="ln m" pathLength={1} d={WALL_PATH} />
            <path className="ln m d1" pathLength={1} d={LINES_PATH} />
            <path className="ln m d1" pathLength={1} d={INFIELD_PATH} />
            <path className="ln" pathLength={1} d="M196 288h8v3l-4 3-4-3zM197.5 257a2.5 2.5 0 1 0 5 0a2.5 2.5 0 1 0-5 0" />
            <text x={64} y={163}>
              310
            </text>
            <text x={200} y={50}>
              420
            </text>
            <text x={334} y={167}>
              302
            </text>

            {HITS.map((h, i) => {
              const delay = { '--i': i } as CSSProperties
              const style = h.kind === 'single' ? 'fs' : h.kind === 'double' ? 'i' : 'fa'
              return <circle key={i} className={`hit ${style}`} style={delay} cx={h.x} cy={h.y} r={HIT_R} />
            })}

            <g aria-hidden="true">
              <circle className="fs" cx={318} cy={44} r={HIT_R} />
              <text className="l" x={328} y={47}>
                single
              </text>
              <circle className="i" cx={318} cy={58} r={HIT_R} />
              <text className="l" x={328} y={61}>
                double
              </text>
              <circle className="fa" cx={318} cy={72} r={HIT_R} />
              <text className="l" x={328} y={75}>
                home run
              </text>
            </g>

            <path key={`line-${shot}`} className={`ln shot ${tone} bold`} pathLength={1} d={flyBall(ball)} />
            {/* A ring around the chosen circle, so it reads as selected without changing its size. */}
            <circle key={`ring-${shot}`} className={`tip ${tone}`} cx={f(ball.x)} cy={f(ball.y)} r={HIT_R + 3} />
            <text
              key={`label-${shot}`}
              className={`tip script ${tone === 's' ? 'alt' : tone === 'i' ? 'ink' : ''} ${flip ? 'end' : ''}`}
              x={f(ball.x + (flip ? -10 : 10))}
              y={f(Math.max(ball.y - 8, BOX[1] + 16))}
              aria-hidden="true"
            >
              {titleCase(result)}
            </text>
          </>
        )
      }}
    </FigureFrame>
  )
}
