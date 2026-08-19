import * as React from 'react'
import { cn } from '@/lib/utils'
import type { BikeCategory } from '@/store/types'

interface Palette {
  sky: [string, string]
  sun: string
  sea: string
  land: string
  road: string
  bike: string
  bikeDark: string
  accent: string
}

const PALETTES: Record<BikeCategory, Palette> = {
  scooter: {
    sky: ['#fbbf24', '#fb7185'],
    sun: '#fef3c7',
    sea: '#0e7490',
    land: '#1a2e33',
    road: '#141921',
    bike: '#f59e0b',
    bikeDark: '#92400e',
    accent: '#fde68a',
  },
  cruiser: {
    sky: ['#2dd4bf', '#0ea5e9'],
    sun: '#ccfbf1',
    sea: '#155e75',
    land: '#123036',
    road: '#131820',
    bike: '#2dd4bf',
    bikeDark: '#115e59',
    accent: '#99f6e4',
  },
  sports: {
    sky: ['#fb7185', '#f43f5e'],
    sun: '#ffe4e6',
    sea: '#9f1239',
    land: '#331226',
    road: '#141017',
    bike: '#f43f5e',
    bikeDark: '#9f1239',
    accent: '#fecdd3',
  },
  adventure: {
    sky: ['#84cc16', '#0d9488'],
    sun: '#ecfccb',
    sea: '#134e4a',
    land: '#24321a',
    road: '#141a17',
    bike: '#a3e635',
    bikeDark: '#3f6212',
    accent: '#d9f99d',
  },
  vintage: {
    sky: ['#fbbf24', '#b45309'],
    sun: '#fef3c7',
    sea: '#78350f',
    land: '#2a2117',
    road: '#16130f',
    bike: '#eab308',
    bikeDark: '#854d0e',
    accent: '#fde68a',
  },
  electric: {
    sky: ['#a78bfa', '#6366f1'],
    sun: '#e0e7ff',
    sea: '#312e81',
    land: '#1e1b3a',
    road: '#12111c',
    bike: '#a5b4fc',
    bikeDark: '#4338ca',
    accent: '#c7d2fe',
  },
}

/** Stylised side-view bike silhouettes in a 190x100 local space, facing left. */
function BikeShape({ category }: { category: BikeCategory }) {
  const c = PALETTES[category]
  switch (category) {
    case 'scooter':
      return (
        <g>
          <circle cx={52} cy={82} r={15} fill={c.bikeDark} />
          <circle cx={52} cy={82} r={7} fill={c.accent} opacity={0.5} />
          <circle cx={136} cy={82} r={15} fill={c.bikeDark} />
          <circle cx={136} cy={82} r={7} fill={c.accent} opacity={0.5} />
          <path d="M40 55 L30 30 Q28 24 34 24 L52 24 Q58 24 57 30 L55 48 L82 48 L82 30 Q82 24 88 24 L124 24 Q130 24 130 30 L130 55 Z" fill={c.bike} />
          <path d="M60 55 L60 82 L128 82 L128 55 Z" fill={c.bikeDark} opacity={0.85} />
          <rect x={84} y={32} width={30} height={12} rx={6} fill={c.accent} opacity={0.9} />
          <path d="M30 44 L26 60 L38 60 Z" fill={c.bikeDark} />
          <circle cx={94} cy={70} r={3.5} fill={c.accent} />
        </g>
      )
    case 'cruiser':
      return (
        <g>
          <circle cx={44} cy={84} r={18} fill={c.bikeDark} />
          <circle cx={44} cy={84} r={8} fill={c.accent} opacity={0.5} />
          <circle cx={150} cy={84} r={18} fill={c.bikeDark} />
          <circle cx={150} cy={84} r={8} fill={c.accent} opacity={0.5} />
          <path d="M40 62 L26 40 L34 36 L46 56 L66 52 Q72 51 76 54 L118 54 Q124 54 124 60 L124 66 L150 66 L150 70 L128 70 L128 62 Q128 58 122 58 L80 58 L54 62 L50 60 L46 62 Z" fill={c.bike} />
          <path d="M70 58 Q96 40 118 52 L112 60 L78 62 Z" fill={c.bikeDark} />
          <path d="M34 36 L24 22 Q22 18 26 18 L34 18 Q38 18 38 22 Z" fill={c.bikeDark} />
          <rect x={92} y={30} width={26} height={16} rx={8} fill={c.accent} opacity={0.85} />
          <path d="M116 54 L124 50 Q128 48 130 52 L126 58 Z" fill={c.bike} />
          <path d="M60 84 L46 84 Q44 84 44 82 L44 74 Q44 72 46 72 L64 72 L64 80 Z" fill={c.bikeDark} />
          <path d="M118 84 L132 84 L132 76 L120 76 Z" fill={c.bikeDark} />
        </g>
      )
    case 'sports':
      return (
        <g>
          <circle cx={42} cy={82} r={17} fill={c.bikeDark} />
          <circle cx={42} cy={82} r={7.5} fill={c.accent} opacity={0.5} />
          <circle cx={152} cy={82} r={17} fill={c.bikeDark} />
          <circle cx={152} cy={82} r={7.5} fill={c.accent} opacity={0.5} />
          <path d="M34 78 L18 52 Q15 46 21 46 L38 46 L48 56 L64 58 Q66 58 66 62 L66 66 L40 78 Z" fill={c.bike} />
          <path d="M38 46 L56 30 Q58 28 61 29 L68 32 L52 46 Z" fill={c.bikeDark} />
          <path d="M58 30 L86 24 L110 24 L118 32 L96 44 L70 46 L58 38 Z" fill={c.bike} />
          <path d="M118 32 L148 30 Q152 30 152 34 L152 40 Q152 44 146 44 L122 44 Z" fill={c.bikeDark} />
          <path d="M96 26 L92 44 L112 44 L116 30 Z" fill={c.accent} opacity={0.8} />
          <path d="M70 46 L60 82 L130 82 L118 46 Z" fill={c.bike} />
          <path d="M96 48 L96 72 Q96 76 92 76 L76 76 Q72 76 72 72 L72 60 Z" fill={c.bikeDark} />
          <path d="M128 82 L146 82 L146 76 L128 76 Z" fill={c.bikeDark} />
          <circle cx={96} cy={70} r={3} fill={c.accent} />
        </g>
      )
    case 'adventure':
      return (
        <g>
          <circle cx={48} cy={84} r={18} fill={c.bikeDark} />
          <circle cx={48} cy={84} r={8} fill={c.accent} opacity={0.5} />
          <circle cx={146} cy={84} r={18} fill={c.bikeDark} />
          <circle cx={146} cy={84} r={8} fill={c.accent} opacity={0.5} />
          <path d="M40 40 L34 24 Q32 20 36 20 L42 20 Q46 20 46 24 L48 36 L64 40 L64 84 L40 84 Z" fill={c.bikeDark} />
          <path d="M52 34 L120 34 Q126 34 126 40 L126 48 Q126 52 120 52 L60 52 L56 44 Z" fill={c.bike} />
          <path d="M120 34 L140 30 Q144 30 144 34 L144 84 L128 84 L128 52 Z" fill={c.bike} />
          <path d="M64 40 L64 58 L40 58 L40 46 Z" fill={c.bike} />
          <rect x={46} y={20} width={10} height={10} rx={2} fill={c.accent} opacity={0.7} />
          <path d="M36 26 L24 26 Q22 26 22 24 L22 18 Q22 16 24 16 L36 16 Q38 16 38 18 L38 24 Z" fill={c.bikeDark} />
          <rect x={118} y={42} width={16} height={14} rx={3} fill={c.accent} opacity={0.85} />
          <path d="M72 52 L72 66 Q72 70 68 70 L52 70 Q48 70 48 66 L48 58 Z" fill={c.bikeDark} />
        </g>
      )
    case 'vintage':
      return (
        <g>
          <circle cx={42} cy={84} r={18} fill={c.bikeDark} />
          <circle cx={42} cy={84} r={8} fill={c.accent} opacity={0.5} />
          <circle cx={150} cy={84} r={18} fill={c.bikeDark} />
          <circle cx={150} cy={84} r={8} fill={c.accent} opacity={0.5} />
          <path d="M38 60 L22 40 L30 36 L44 56 L64 56 Q70 56 74 60 L112 60 Q118 60 118 66 L118 72 L150 72 L150 76 L124 76 L124 68 Q124 64 118 64 L78 64 L68 72 L60 72 L66 64 L56 64 L48 62 Z" fill={c.bike} />
          <circle cx={86} cy={44} r={16} fill={c.bikeDark} />
          <circle cx={86} cy={44} r={11} fill={c.accent} opacity={0.7} />
          <path d="M30 36 L22 24 Q20 20 24 20 L32 20 Q36 20 36 24 Z" fill={c.bikeDark} />
          <path d="M52 62 L50 80 Q50 84 46 84 L44 84 Q40 84 40 80 L40 74 L46 74 L48 62 Z" fill={c.bikeDark} />
          <path d="M112 64 L122 70 Q126 72 124 76 L118 78 L108 72 Z" fill={c.bikeDark} />
        </g>
      )
    case 'electric':
      return (
        <g>
          <circle cx={48} cy={82} r={16} fill={c.bikeDark} />
          <circle cx={48} cy={82} r={7} fill={c.accent} opacity={0.5} />
          <circle cx={140} cy={82} r={16} fill={c.bikeDark} />
          <circle cx={140} cy={82} r={7} fill={c.accent} opacity={0.5} />
          <path d="M36 56 L28 34 Q26 28 32 28 L48 28 Q54 28 53 34 L52 48 L96 48 L96 56 Z" fill={c.bike} />
          <path d="M96 48 L96 82 L132 82 L132 56 Q132 50 124 48 Z" fill={c.bike} />
          <path d="M84 30 Q86 48 96 52 L106 52 Q112 44 108 30 Z" fill={c.bikeDark} />
          <path d="M84 34 L104 34 L100 46 L88 46 Z" fill={c.accent} opacity={0.9} />
          <path d="M36 40 L24 40 Q22 40 22 38 L22 32 Q22 30 24 30 L36 30 Q38 30 38 32 L38 38 Z" fill={c.bikeDark} />
          <path d="M52 50 L52 70 Q52 74 48 74 L44 74 Q40 74 40 70 L40 62 Z" fill={c.bikeDark} />
          <circle cx={108} cy={62} r={5} fill={c.accent} opacity={0.9} />
          <circle cx={108} cy={62} r={2.2} fill={c.bikeDark} />
        </g>
      )
  }
}

/** Full stylised Goa scene: sky, sun, sea, palms, road, bike. */
export function BikeArt({
  category,
  tone = 0,
  className,
  rounded = 'rounded-2xl',
}: {
  category: BikeCategory
  tone?: number
  className?: string
  rounded?: string
}) {
  const p = PALETTES[category]
  const id = React.useId()
  return (
    <div className={cn('relative w-full overflow-hidden', rounded, className)}>
      <svg viewBox="0 0 400 260" className="h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden>
        <defs>
          <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={p.sky[0]} stopOpacity={0.55} />
            <stop offset="100%" stopColor={p.sky[1]} stopOpacity={0.35} />
          </linearGradient>
          <linearGradient id={`${id}-road`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={p.road} stopOpacity={0} />
            <stop offset="50%" stopColor={p.road} stopOpacity={0.9} />
            <stop offset="100%" stopColor={p.road} stopOpacity={0} />
          </linearGradient>
          <radialGradient id={`${id}-sun`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fff" stopOpacity={0.95} />
            <stop offset="45%" stopColor={p.sun} stopOpacity={0.9} />
            <stop offset="100%" stopColor={p.sun} stopOpacity={0} />
          </radialGradient>
          <filter id={`${id}-blur`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" />
          </filter>
        </defs>

        <rect width="400" height="260" fill={p.sky[0]} opacity={0.14} />
        <rect width="400" height="260" fill={`url(#${id}-sky)`} />

        {/* sun with glow */}
        <circle cx={tone % 2 === 0 ? 318 : 82} cy={58} r={34} fill={`url(#${id}-sun)`} filter={`url(#${id}-blur)`} />
        <circle cx={tone % 2 === 0 ? 318 : 82} cy={58} r={18} fill={p.sun} opacity={0.95} />

        {/* sea band */}
        <path d={`M0 ${158 + (tone % 3) * 6} C 90 ${144 + (tone % 3) * 6}, 200 ${170}, 400 ${150 + (tone % 3) * 4} L400 200 L0 200 Z`} fill={p.sea} opacity={0.5} />
        <path d="M0 208 L400 200 L400 216 L0 224 Z" fill={p.land} opacity={0.9} />

        {/* land + palms */}
        <path d="M0 190 Q 80 176 160 186 Q 260 198 400 182 L400 260 L0 260 Z" fill={p.land} opacity={0.95} />
        <g stroke={p.land} strokeWidth={1} fill={p.land} opacity={0.9}>
          <path d="M36 258 Q40 238 52 226" strokeWidth={3} fill="none" />
          <path d="M30 226 Q 40 214 52 226" strokeWidth={2.5} fill="none" />
          <path d="M30 226 Q 22 214 14 222" strokeWidth={2.5} fill="none" />
          <path d="M300 260 Q302 244 314 234" strokeWidth={3} fill="none" />
          <path d="M298 234 Q 308 222 318 234" strokeWidth={2.5} fill="none" />
          <path d="M298 234 Q 288 224 280 230" strokeWidth={2.5} fill="none" />
        </g>
        <circle cx={20} cy={252} r={4} fill={p.accent} opacity={0.25} />

        {/* road */}
        <path d="M0 232 Q 200 216 400 228 L400 240 Q 200 232 0 244 Z" fill={`url(#${id}-road)`} />
        <path d="M0 238 Q 200 224 400 234" stroke={p.accent} strokeWidth={1.4} strokeDasharray="10 9" opacity={0.4} fill="none" />

        {/* bike */}
        <g transform="translate(96 96) scale(1.02)">
          <ellipse cx={98} cy={92} rx={82} ry={8} fill="#000" opacity={0.28} filter={`url(#${id}-blur)`} />
          <BikeShape category={category} />
        </g>

        {/* dust/energy */}
        {category === 'electric' && (
          <g opacity={0.85}>
            <circle cx={248} cy={196} r={2} fill={p.accent} />
            <circle cx={258} cy={190} r={1.4} fill={p.accent} />
            <circle cx={264} cy={198} r={1} fill={p.accent} />
          </g>
        )}
      </svg>
      {/* soft vignette + sheen */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-white/5" />
      <div className="pointer-events-none absolute inset-0 opacity-30" style={{ background: `linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.16) 46%, transparent 60%)` }} />
    </div>
  )
}

/** Small square art used in lists / threads / context bars. */
export function BikeThumb({ category, tone = 0, className }: { category: BikeCategory; tone?: number; className?: string }) {
  return <BikeArt category={category} tone={tone} className={cn('aspect-square', className)} rounded="rounded-lg" />
}
