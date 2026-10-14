import { useEffect, useId, useState } from 'react'
import { useReducedMotion } from '../../figures/useFigureInput'
import { ballPaths } from './geometry'
import type { BallKind } from './geometry'
import type { Look } from './looks'
import { FOOTBALL, mix, PALETTE, SPHERE } from './palette'
import { RenderedBall } from './RenderedBall'

const SPIN_RATE = 3.2 // radians per second
const REST_ANGLE = 0.7
const RENDER_TILT = 0.62 // about 35 degrees above the ball

interface SpinBallProps {
  kind: BallKind
  look: Look
  spinning: boolean
}

export function SpinBall({ kind, look, spinning }: SpinBallProps) {
  const uid = useId().replace(/:/g, '')
  const reduced = useReducedMotion()
  const [angle, setAngle] = useState(REST_ANGLE)

  useEffect(() => {
    if (!spinning || reduced) return
    let frame = 0
    let last = performance.now()
    const tick = (now: number) => {
      setAngle((a) => (a + ((now - last) / 1000) * SPIN_RATE) % (Math.PI * 2))
      last = now
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [spinning, reduced])

  const p = PALETTE[kind]
  const body = kind === 'football' ? FOOTBALL : SPHERE
  // The rendered look views the ball from higher up (an isometric camera); the others from a shallow angle.
  const { seams, detail } = ballPaths(kind, angle, look === 'realistic' ? RENDER_TILT : 0.3)
  const id = (name: string) => `${uid}-${name}`
  const ref = (name: string) => `url(#${id(name)})`
  const painted = look === 'painted'
  const cartoon = look === 'cartoon'
  const realistic = look === 'realistic'
  const shaded = look === '3d'
  const baseball = kind === 'baseball'
  const football = kind === 'football'

  const seamWidth = cartoon ? 0.075 : painted ? 0.07 : 0.04
  const detailWidth = cartoon ? 0.07 : painted ? 0.07 : 0.04
  // Where the light lands and where the ground shadow sits depend on the ball's silhouette.
  const glint = football ? { x: -0.2, y: -0.22, r: 0.26 } : { x: -0.36, y: -0.42, r: 0.36 }
  const groundY = football ? 0.82 : 1.28
  const detailColor = painted && baseball ? mix(p.detail, '#7a2a20', 0.25) : p.detail
  if (realistic) return <RenderedBall kind={kind} seams={seams} detail={detail} />

  return (
    <svg viewBox="-1.4 -1.4 2.8 2.8" width="100%" height="100%" aria-hidden="true" style={{ overflow: 'visible' }}>
      <defs>
        <clipPath id={id('clip')}>
          <path d={body} />
        </clipPath>
        <radialGradient id={id('shade')} cx="0.34" cy="0.3" r="0.9">
          <stop offset="0" stopColor={p.light} />
          <stop offset="0.5" stopColor={p.base} />
          <stop offset="1" stopColor={p.dark} />
        </radialGradient>
        <radialGradient id={id('vignette')} cx="0.5" cy="0.5" r="0.55">
          <stop offset="0.6" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.4" />
        </radialGradient>
        <radialGradient id={id('spec')} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fff" stopOpacity="0.9" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <filter id={id('blur')} x="-30%" y="-300%" width="160%" height="700%">
          <feGaussianBlur stdDeviation="0.06" />
        </filter>
        {/* Hand-painted edges: the whole drawing is nudged by a slow noise. */}
        <filter id={id('rough')} x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="1.7" numOctaves="2" seed="4" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="0.055" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <filter id={id('paper')} x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="14" numOctaves="1" seed="9" />
          <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1.2 -0.45" />
        </filter>
      </defs>

      {shaded && <ellipse cx="0" cy={groundY} rx={football ? 0.6 : 0.72} ry="0.1" fill="#000" opacity="0.28" filter={ref('blur')} />}

      <g filter={painted ? ref('rough') : undefined}>
        {/* painted: an offset outline behind the body, like a print slightly out of register */}
        {painted && <path d={body} transform="translate(0.04 0.045)" fill="none" stroke="var(--ink)" strokeWidth="0.06" />}

        <path
          d={body}
          fill={cartoon ? p.base : painted ? mix(p.base, '#d8c79c', 0.16) : ref('shade')}
          stroke={cartoon ? 'var(--ink)' : undefined}
          strokeWidth={cartoon ? 0.09 : undefined}
          strokeLinejoin="round"
        />

        {/* Overlays are clipped one by one (a clipped group would isolate them from the body they blend with). */}
        {painted && <path d={`${body}M-0.78 -0.78a1 1 0 1 0 2 0a1 1 0 1 0 -2 0`} fillRule="evenodd" fill={p.dark} opacity="0.34" clipPath={ref('clip')} />}
        {painted && <rect x="-1.2" y="-1.2" width="2.4" height="2.4" filter={ref('paper')} style={{ mixBlendMode: 'multiply' }} opacity="0.22" clipPath={ref('clip')} />}

        {/* seams: kept on the surface by the geometry, so they travel as the ball spins */}
        <path
          d={seams}
          fill="none"
          stroke={cartoon ? 'var(--ink)' : p.seam}
          strokeOpacity={shaded && baseball ? 0.7 : 1}
          strokeWidth={baseball && !painted && !cartoon ? 0.02 : seamWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {detail && (
          <>
            <path d={detail} fill="none" stroke={detailColor} strokeWidth={detailWidth} strokeLinecap="round" strokeLinejoin="round" />
          </>
        )}

        {/* light: a glint on the shaded looks, a flat highlight on the cartoon, brush strokes on the painting */}
        {shaded && <circle cx={glint.x} cy={glint.y} r={glint.r} fill={ref('spec')} clipPath={ref('clip')} />}
        {cartoon && (
          <ellipse cx={glint.x} cy={glint.y} rx={glint.r * 0.66} ry={glint.r * 0.33} transform={`rotate(-35 ${glint.x} ${glint.y})`} fill="#fff" opacity="0.85" clipPath={ref('clip')} />
        )}
        {painted && (
          <path
            d={football ? 'M-0.5 -0.05Q-0.3 -0.35 0.05 -0.38' : 'M-0.6 -0.32Q-0.42 -0.64 -0.08 -0.74'}
            fill="none"
            stroke="#fff"
            strokeOpacity="0.55"
            strokeWidth="0.1"
            strokeLinecap="round"
            clipPath={ref('clip')}
          />
        )}
      </g>
    </svg>
  )
}
