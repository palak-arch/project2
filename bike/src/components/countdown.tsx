import * as React from 'react'

function useNow(intervalMs = 1000) {
  const [now, setNow] = React.useState(() => Date.now())
  React.useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), intervalMs)
    return () => clearInterval(t)
  }, [intervalMs])
  return now
}

export function Countdown({ target }: { target: string }) {
  const now = useNow()
  const diff = new Date(target).getTime() - now
  const negative = diff < 0
  const total = Math.max(0, diff)
  const d = Math.floor(total / 86_400_000)
  const h = Math.floor((total % 86_400_000) / 3_600_000)
  const m = Math.floor((total % 3_600_000) / 60_000)
  const s = Math.floor((total % 60_000) / 1000)

  const cells = [
    { v: d, l: 'days' },
    { v: h, l: 'hrs' },
    { v: m, l: 'min' },
    { v: s, l: 'sec' },
  ]

  return (
    <div className="flex items-center gap-2">
      {cells.map((c, i) => (
        <React.Fragment key={c.l}>
          <div className="flex w-14 flex-col items-center rounded-xl border border-white/10 bg-white/5 py-2">
            <span className="font-heading text-xl font-extrabold text-gradient tabular-nums">
              {String(c.v).padStart(2, '0')}
            </span>
            <span className="text-[9px] font-medium uppercase tracking-wide text-muted-foreground">{c.l}</span>
          </div>
          {i < cells.length - 1 && <span className="font-heading text-lg font-bold text-amber-300/60">:</span>}
        </React.Fragment>
      ))}
      {negative && <span className="text-xs text-muted-foreground">(past due)</span>}
    </div>
  )
}
