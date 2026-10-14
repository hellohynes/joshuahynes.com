import { useId } from 'react'
import type { BallKind } from './geometry'
import { FOOTBALL, mix, PALETTE, SPHERE } from './palette'

// Fine leather bump per ball (grain per unit, how strongly it shows). Kept subtle: it should read as
// material, not as noise.
const BUMP: Record<BallKind, { grain: number; strength: number }> = {
  baseball: { grain: 22, strength: 0.22 },
  basketball: { grain: 34, strength: 0.42 },
  football: { grain: 38, strength: 0.38 },
}

interface RenderedBallProps {
  kind: BallKind
  seams: string
  detail: string
  /** baseball: dense double stitching and the two edges of the seam ribbon */
  stitches: string
  rails: string
  /** football: the white bands and the lace plate outline */
  bands: string
  plate: string
}

/**
 * The "rendered" look: an isometric 3D render. The camera looks down at about 35 degrees, a soft key light
 * sits top left, a warm bounce comes back off the floor, seams are grooves with a lit lip and a shadowed
 * wall, stitches and laces are raised thread, and the ball rests on a contact shadow.
 */
export function RenderedBall({ kind, seams, detail, stitches, rails, bands, plate }: RenderedBallProps) {
  const uid = useId().replace(/:/g, '')
  const id = (name: string) => `${uid}-${name}`
  const ref = (name: string) => `url(#${id(name)})`
  const p = PALETTE[kind]
  const football = kind === 'football'
  const baseball = kind === 'baseball'
  const body = football ? FOOTBALL : SPHERE

  const floorY = football ? 0.74 : 1
  const glint = football ? { x: -0.2, y: -0.22, s: 0.7 } : { x: -0.38, y: -0.44, s: 1 }
  // A baseball is stitched with fine deep-red thread; laces are thicker.
  const threadWidth = baseball ? 0.026 : 0.04
  const thread = baseball ? '#9e2227' : p.detail
  const stitching = baseball ? stitches : detail
  const grooves = baseball ? rails : seams
  const bounce = mix(p.base, '#ffd9a8', 0.55)

  return (
    <svg viewBox="-1.4 -1.4 2.8 2.8" width="100%" height="100%" aria-hidden="true" style={{ overflow: 'visible' }}>
      <defs>
        <clipPath id={id('clip')}>
          <path d={body} />
        </clipPath>
        <radialGradient id={id('body')} cx="0.3" cy="0.24" r="1.02">
          <stop offset="0" stopColor={baseball ? p.light : mix(p.light, '#ffffff', 0.3)} />
          <stop offset="0.3" stopColor={baseball ? mix(p.light, p.base, 0.45) : p.light} />
          <stop offset="0.62" stopColor={p.base} />
          <stop offset="0.88" stopColor={mix(p.base, p.dark, 0.6)} />
          <stop offset="1" stopColor={p.dark} />
        </radialGradient>
        <linearGradient id={id('occlusion')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0.3" stopColor="#000" stopOpacity="0" />
          <stop offset="0.72" stopColor="#000" stopOpacity="0.14" />
          <stop offset="1" stopColor="#000" stopOpacity="0.4" />
        </linearGradient>
        <radialGradient id={id('bounce')} cx="0.78" cy="0.95" r="0.5">
          <stop offset="0" stopColor={bounce} stopOpacity="0.7" />
          <stop offset="1" stopColor={bounce} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={id('sheen')} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fff" stopOpacity={baseball ? 0.3 : 0.5} />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <filter id={id('soft')} filterUnits="userSpaceOnUse" x="-1.6" y="-1.6" width="3.2" height="3.2">
          <feGaussianBlur stdDeviation="0.02" />
        </filter>
        <filter id={id('softer')} filterUnits="userSpaceOnUse" x="-1.6" y="-1.6" width="3.2" height="3.2">
          <feGaussianBlur stdDeviation="0.045" />
        </filter>
        <filter id={id('floor')} filterUnits="userSpaceOnUse" x="-2" y="-1" width="4" height="3">
          <feGaussianBlur stdDeviation="0.1" />
        </filter>
        <filter id={id('contact')} filterUnits="userSpaceOnUse" x="-2" y="-1" width="4" height="3">
          <feGaussianBlur stdDeviation="0.05" />
        </filter>
        <filter id={id('bump')} x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency={BUMP[kind].grain} numOctaves="2" seed="5" result="n" />
          <feDiffuseLighting in="n" lightingColor="#fff" surfaceScale="1.2" diffuseConstant="1.05">
            <feDistantLight azimuth="225" elevation="60" />
          </feDiffuseLighting>
        </filter>
      </defs>

      {/* floor: a wide soft shadow thrown to the lower right, and a tight dark one where the ball touches */}
      <ellipse cx="0.2" cy={floorY + 0.06} rx={football ? 0.82 : 1} ry="0.3" fill="#000" opacity="0.22" filter={ref('floor')} />
      <ellipse cx="0.04" cy={floorY} rx={football ? 0.42 : 0.55} ry="0.13" fill="#000" opacity="0.6" filter={ref('contact')} />

      <path d={body} fill={ref('body')} />
      {football && <path d={bands} fill="none" stroke="#f1ebdd" strokeWidth="0.17" clipPath={ref('clip')} />}
      <rect x="-1.2" y="-1.2" width="2.4" height="2.4" filter={ref('bump')} style={{ mixBlendMode: 'soft-light' }} opacity={BUMP[kind].strength} clipPath={ref('clip')} />
      <path d={body} fill={ref('occlusion')} />
      <path d={body} fill={ref('bounce')} />

      {/* seams as grooves: a shadowed wall, the dark channel, and a lit lip on the lower-right edge */}
      <g clipPath={ref('clip')} fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d={grooves} stroke="#000" strokeOpacity={baseball ? 0.2 : 0.4} strokeWidth={baseball ? 0.03 : football ? 0.06 : 0.1} filter={ref('soft')} />
        <path d={grooves} stroke={p.seam} strokeOpacity={baseball ? 0.35 : 1} strokeWidth={baseball ? 0.012 : football ? 0.026 : 0.048} />
        <path d={grooves} transform="translate(0.012 0.015)" stroke="#fff" strokeOpacity={baseball ? 0.4 : 0.26} strokeWidth={baseball ? 0.014 : 0.02} />
      </g>

      {football && (
        <g fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d={plate} stroke="#000" strokeOpacity="0.3" strokeWidth="0.03" filter={ref('soft')} />
          <path d={plate} stroke={p.seam} strokeWidth="0.014" />
        </g>
      )}

      {/* raised thread: stitches on the baseball, laces on the football */}
      {stitching && (
        <g fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d={stitching} transform="translate(0.012 0.016)" stroke="#000" strokeOpacity="0.42" strokeWidth={threadWidth + 0.008} filter={ref('soft')} />
          <path d={stitching} stroke={thread} strokeWidth={threadWidth} />
          <path d={stitching} transform="translate(-0.005 -0.007)" stroke="#fff" strokeOpacity={baseball ? 0.3 : 0.4} strokeWidth={baseball ? 0.009 : 0.012} />
        </g>
      )}

      {/* the key light: a broad sheen, a soft-box reflection, and a hot spot */}
      <circle cx={glint.x} cy={glint.y} r={0.5 * glint.s} fill={ref('sheen')} clipPath={ref('clip')} />
      <ellipse
        cx={glint.x}
        cy={glint.y}
        rx={0.3 * glint.s}
        ry={0.12 * glint.s}
        transform={`rotate(-38 ${glint.x} ${glint.y})`}
        fill="#fff"
        opacity="0.62"
        filter={ref('softer')}
        clipPath={ref('clip')}
      />
      <circle cx={glint.x - 0.07 * glint.s} cy={glint.y - 0.05 * glint.s} r={0.045 * glint.s} fill="#fff" opacity="0.95" clipPath={ref('clip')} />
      {!football && (
        <path d="M-0.9 -0.4A0.98 0.98 0 0 1 -0.25 -0.95" fill="none" stroke="#fff" strokeOpacity="0.28" strokeWidth="0.025" strokeLinecap="round" filter={ref('soft')} clipPath={ref('clip')} />
      )}
    </svg>
  )
}
