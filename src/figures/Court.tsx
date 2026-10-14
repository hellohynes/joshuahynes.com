import { FigureFrame } from './FigureFrame'

type P = [number, number]
type Cubic = [P, P, P, P]

const lerp = (a: P, b: P, t: number): P => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]
const f = (n: number) => n.toFixed(1)
const pt = (p: P) => `${f(p[0])} ${f(p[1])}`

/** Split a cubic Bezier at t: the first part, and the point on the curve. */
function split(c: Cubic, t: number): { head: Cubic; point: P } {
  const a = lerp(c[0], c[1], t)
  const b = lerp(c[1], c[2], t)
  const d = lerp(c[2], c[3], t)
  const e = lerp(a, b, t)
  const g = lerp(b, d, t)
  const point = lerp(e, g, t)
  return { head: [c[0], a, e, point], point }
}

const cubicPath = (c: Cubic) => `M${pt(c[0])}C${pt(c[1])} ${pt(c[2])} ${pt(c[3])}`

// Half court, 6 px per foot: baseline y=20, basket at (200, 51.5).
const BASKET: P = [200, 51.5]

// A high pick and roll. Time runs 0..1 along the pointer's x.
const HANDLER: Cubic = [[200, 205], [252, 196], [268, 112], [208, 64]]
const SCREENER: Cubic = [[238, 158], [244, 176], [180, 132], [186, 74]]
const SPACERS: [P, P][] = [
  [[86, 116], [112, 150]],
  [[316, 118], [292, 160]],
  [[98, 222], [138, 206]],
]

const REST_T = 0.6

function phase(t: number) {
  if (t < 0.2) return 'initiate'
  if (t < 0.45) return 'screen set'
  if (t < 0.8) return 'drive and roll'
  return 'finish at the rim'
}

export function Court() {
  return (
    <FigureFrame
      label="A half basketball court showing a pick and roll as thin movement lines. Move the pointer left and right to play the possession forward and back."
      team="celtics"
      box={[40, 10, 320, 302]}
      rest={{ x: REST_T, y: 0.5 }}
      caption={({ x }) => `pick and roll · ${phase(x)} · ${24 - Math.round(x * 14)}s on the clock`}
    >
      {({ x: t }) => {
        const handler = split(HANDLER, t)
        const screener = split(SCREENER, t)
        const behind = (c: Cubic, lag: number) => split(c, Math.max(0, t - lag)).point
        const guard = behind(HANDLER, 0.1)
        const big = behind(SCREENER, 0.18)
        const spacers = SPACERS.map(([a, b]) => lerp(a, b, t))
        // Help defenders sag toward the rim as the drive develops.
        const helpers = spacers.map((s) => lerp([s[0] - 11, s[1] + 11], BASKET, 0.14 * t))
        const ball: P = [handler.point[0] + 6, handler.point[1] - 6]

        return (
          <>
            {/* court lines */}
            <path className="ln m" pathLength={1} d="M50 20H350V302H50Z" />
            <path className="ln m d1" pathLength={1} d="M152 20V134H248V20" />
            <path className="ln m d1" pathLength={1} d="M164 134a36 36 0 0 0 72 0M164 134a36 36 0 0 1 72 0" />
            <path className="ln m d2" pathLength={1} d="M68 20V105.2A142.5 142.5 0 0 0 332 105.2V20" />
            <path className="ln m d2" pathLength={1} d="M164 302a36 36 0 0 1 72 0" />
            <path className="ln m d2" pathLength={1} d="M182 44H218M204.5 51.5a4.5 4.5 0 1 0-9 0a4.5 4.5 0 1 0 9 0" />
            {/* the plan: full paths, then the part already played */}
            <path className="ln m d3" pathLength={1} d={cubicPath(HANDLER)} />
            <path className="ln m d3" pathLength={1} d={cubicPath(SCREENER)} />
            {t > 0.01 && <path className="a bold" d={cubicPath(handler.head)} />}
            {t > 0.01 && <path className="bold" d={cubicPath(screener.head)} />}
            {/* offense */}
            <circle className="fi" cx={f(handler.point[0])} cy={f(handler.point[1])} r={4} />
            <circle className="fi" cx={f(screener.point[0])} cy={f(screener.point[1])} r={4} />
            {spacers.map((s, i) => (
              <circle key={i} className="fi" cx={f(s[0])} cy={f(s[1])} r={4} />
            ))}
            {/* defense */}
            <circle className="fb m" cx={f(guard[0] - 9)} cy={f(guard[1] + 10)} r={4} />
            <circle className="fb m" cx={f(big[0] + 10)} cy={f(big[1] + 10)} r={4} />
            {helpers.map((h, i) => (
              <circle key={i} className="fb m" cx={f(h[0])} cy={f(h[1])} r={4} />
            ))}
            <circle className="fs" cx={f(ball[0])} cy={f(ball[1])} r={2.6} />
            <text className={ball[0] > 230 ? 'script end' : 'script'} x={f(ball[0] + (ball[0] > 230 ? -12 : 12))} y={f(ball[1] - 10)} aria-hidden="true">
              {phase(t).replace(/^\w/, (c) => c.toUpperCase())}
            </text>
          </>
        )
      }}
    </FigureFrame>
  )
}
