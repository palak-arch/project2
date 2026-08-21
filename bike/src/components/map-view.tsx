import { MapPin, Navigation } from 'lucide-react'
import type { Bike } from '@/store/types'
import { inr } from '@/lib/format'
import { cn } from '@/lib/utils'

const TOWNS: { name: string; x: number; y: number }[] = [
  { name: 'Vagator', x: 38, y: 6 },
  { name: 'Anjuna', x: 32, y: 12 },
  { name: 'Baga', x: 30, y: 20 },
  { name: 'Candolim', x: 34, y: 28 },
  { name: 'Panjim', x: 58, y: 42 },
  { name: 'Palolem', x: 40, y: 86 },
]

export function GoaMap({ bikes, activeId, onPinClick }: { bikes: Bike[]; activeId: string | null; onPinClick: (id: string) => void }) {
  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-[#0d1b22] via-[#10272b] to-[#0a1820]">
      {/* map */}
      <svg viewBox="0 0 400 480" className="h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden>
        <defs>
          <linearGradient id="goa-sea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0e7490" stopOpacity={0.55} />
            <stop offset="100%" stopColor="#155e75" stopOpacity={0.35} />
          </linearGradient>
          <linearGradient id="goa-land" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#17382e" stopOpacity={0.9} />
            <stop offset="100%" stopColor="#122b22" stopOpacity={0.95} />
          </linearGradient>
        </defs>

        {/* sea */}
        <path d="M0 0 H400 V480 H0 Z" fill="url(#goa-sea)" />
        {/* landmass — Goa's slim coastal strip */}
        <path
          d="M86 0 C 60 40, 74 70, 66 96 C 58 122, 72 150, 62 178 C 52 206, 64 232, 56 260 C 48 288, 60 316, 54 344 C 48 372, 60 400, 54 428 C 50 452, 60 470, 66 480 L 400 480 L 400 0 Z"
          fill="url(#goa-land)"
        />
        {/* interior ridge shading */}
        <path d="M140 0 C 130 120, 150 240, 138 360 C 134 404, 140 444, 148 480 L 400 480 L 400 0 Z" fill="#0d241d" opacity={0.55} />

        {/* rivers */}
        <path d="M84 240 C 130 236, 200 244, 260 238" stroke="#2dd4bf" strokeWidth={3} strokeOpacity={0.35} fill="none" />
        <path d="M88 352 C 140 348, 210 356, 276 348" stroke="#2dd4bf" strokeWidth={2.5} strokeOpacity={0.3} fill="none" />

        {/* roads */}
        <path d="M92 20 C 160 60, 210 140, 232 260 C 246 336, 262 400, 300 468" stroke="#fbbf24" strokeWidth={2.4} strokeOpacity={0.28} fill="none" strokeDasharray="1 0" />
        <path d="M96 90 C 150 96, 200 104, 258 100" stroke="#94a3b8" strokeWidth={1.8} strokeOpacity={0.22} fill="none" />
        <path d="M92 300 C 150 300, 220 296, 288 302" stroke="#94a3b8" strokeWidth={1.8} strokeOpacity={0.2} fill="none" />

        {/* town dots */}
        {TOWNS.map((t) => (
          <g key={t.name}>
            <circle cx={(t.x / 100) * 400} cy={(t.y / 100) * 480} r={3} fill="#fbbf24" opacity={0.85} />
            <text
              x={(t.x / 100) * 400 + 8}
              y={(t.y / 100) * 480 + 3}
              fill="#e2e8f0"
              fontSize="11"
              fontWeight={600}
              opacity={0.75}
            >
              {t.name}
            </text>
          </g>
        ))}

        {/* you are here */}
        <g>
          <circle cx={208} cy={238} r={14} fill="#2dd4bf" opacity={0.18} />
          <circle cx={208} cy={238} r={6} fill="#2dd4bf" />
          <circle cx={208} cy={238} r={2} fill="#04211c" />
        </g>
      </svg>

      {/* pins */}
      {bikes.map((b) => {
        const active = activeId === b.id
        return (
          <button
            key={b.id}
            onClick={() => onPinClick(b.id)}
            style={{ left: `${b.mapPos.x}%`, top: `${b.mapPos.y}%` }}
            className={cn(
              'absolute z-10 -translate-x-1/2 -translate-y-full transition-all',
              active ? 'scale-110' : 'hover:scale-105',
            )}
            aria-label={`${b.name}, ${inr(b.ratePerDay)} per day`}
          >
            <span className="flex flex-col items-center">
              <span
                className={cn(
                  'flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold shadow-lg backdrop-blur-md transition-colors',
                  active
                    ? 'border-amber-300 bg-gradient-to-b from-amber-400 to-orange-500 text-[#1c1102] shadow-[0_6px_20px_-4px_rgba(245,165,36,0.8)]'
                    : 'border-white/20 bg-[#0d1220]/85 text-amber-300 hover:border-amber-300/60',
                )}
              >
                {inr(b.ratePerDay)}
              </span>
              <MapPin className={cn('mt-0.5 size-4 drop-shadow', active ? 'text-orange-400' : 'text-teal-300')} />
            </span>
          </button>
        )
      })}

      {/* legend */}
      <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-3 py-1.5 text-[11px] font-medium text-muted-foreground backdrop-blur-md">
        <Navigation className="size-3.5 text-teal-300" />
        Pins show daily rate · tap to preview
      </div>
    </div>
  )
}
