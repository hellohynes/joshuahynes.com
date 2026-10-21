import { FigureFrame } from './FigureFrame'

type P = [number, number]

// Top-down, offense at the bottom. 6 px per yard; line of scrimmage at y=260.
const LOS = 260
const YARD = 6
const SIDE_L = 40
const SIDE_R = 360
const QB: P = [200, 284]

interface Route {
  name: string
  /** depth of the break, in yards past the line of scrimmage */
  depth: number
  points: P[]
}

// Ordered left to right by where each receiver lines up, so pointer x picks one.
const ROUTES: Route[] = [
  { name: 'post', depth: 18, points: [[60, 260], [60, 152], [122, 92]] },
  { name: 'seam', depth: 20, points: [[152, 262], [152, 140]] },
  { name: 'slant', depth: 4, points: [[270, 260], [270, 236], [228, 196]] },
  { name: 'corner', depth: 14, points: [[330, 260], [330, 176], [352, 116]] },
]

const REST = { x: 0.1, y: 0.5 } // the first route is picked at rest

const f = (n: number) => n.toFixed(1)
const polyline = (pts: P[]) => `M${pts.map((p) => `${p[0]} ${p[1]}`).join('L')}`
const dot = ([x, y]: P, r: number) => `M${x - r} ${y}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`

// Yard lines every 5 yards, hash marks every yard.
const yardLines = Array.from({ length: 8 }, (_, i) => LOS - 5 * YARD * i)
const hashY = Array.from({ length: 40 }, (_, i) => LOS - YARD * i)
const hashes = [129, 271].flatMap((x) => hashY.map((y) => `M${x} ${y}h4`)).join('')

export function Field() {
  return (
    <FigureFrame
      label="A football field seen from above with four pass routes drawn as thin lines. Move the pointer left and right to choose the target."
      team="pats"
      box={[30, 10, 340, 292]}
      rest={REST}
      caption={({ x }) => {
        const route = ROUTES[Math.min(ROUTES.length - 1, Math.floor(x * ROUTES.length))]
        return `${route.name} · ${route.depth} yd`
      }}
    >
      {({ x }) => {
        const picked = Math.min(ROUTES.length - 1, Math.floor(x * ROUTES.length))
        const end = ROUTES[picked].points.at(-1) as P
        const throwArc = `M${QB[0]} ${QB[1]}Q${f((QB[0] + end[0]) / 2)} ${f(Math.min(end[1], QB[1]) - 40)} ${end[0]} ${end[1]}`
        return (
          <>
            <path className="ln m" pathLength={1} d={`M${SIDE_L} 292V20M${SIDE_R} 292V20`} />
            {yardLines.map((y, i) => (
              <path key={y} className={`ln m ${i === 0 ? 'd1' : 'd2'}`} pathLength={1} d={`M${SIDE_L} ${y}H${SIDE_R}`} />
            ))}
            <path className="m" d={hashes} />
            {[10, 20, 30].map((yd) => (
              <text key={yd} x={52} y={LOS - yd * YARD - 4}>
                {yd}
              </text>
            ))}
            {/* offensive line, quarterback, receivers */}
            <path className="ln d1" pathLength={1} d={[0, 1, 2, 3, 4].map((i) => `M${170 + i * 12} 258h8v8h-8z`).join('')} />
            <path className="ln d1" pathLength={1} d={dot(QB, 4)} />
            {ROUTES.map((r, i) => (
              <path key={r.name} className={`ln d3 ${i === picked ? 's bold' : 'm'}`} pathLength={1} d={polyline(r.points)} />
            ))}
            {ROUTES.map((r) => (
              <path key={r.name} className="fb" d={dot(r.points[0], 3.5)} />
            ))}
            <path className="ln a d3" pathLength={1} d={throwArc} />
            <circle className="fa" cx={end[0]} cy={end[1]} r={3} />
            <text className={end[0] > 250 ? 'script end' : 'script'} x={end[0] + (end[0] > 250 ? -9 : 9)} y={end[1] - 6} aria-hidden="true">
              {ROUTES[picked].name.replace(/^\w/, (c) => c.toUpperCase())}
            </text>
          </>
        )
      }}
    </FigureFrame>
  )
}
