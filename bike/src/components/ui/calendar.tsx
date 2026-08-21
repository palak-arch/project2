import * as React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { dayKey } from '@/lib/format'

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

interface CalendarProps {
  /** ISO date strings currently in range (start..end) */
  range: [string | null, string | null]
  blockedDates?: string[]
  minDate?: string
  onSelect: (iso: string) => void
  className?: string
}

function buildCells(year: number, month: number): (string | null)[] {
  const first = new Date(year, month, 1)
  const startOffset = first.getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (string | null)[] = []
  for (let i = 0; i < startOffset; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(new Date(year, month, d, 12).toISOString())
  }
  return cells
}

export function Calendar({ range, blockedDates = [], minDate, onSelect, className }: CalendarProps) {
  const today = new Date()
  const [view, setView] = React.useState({ year: today.getFullYear(), month: today.getMonth() })
  const [start, end] = range

  const cells = buildCells(view.year, view.month)
  const canPrev = view.year > today.getFullYear() - 1
  const canNext = view.year < today.getFullYear() + 2 || (view.year === today.getFullYear() + 2 && view.month < today.getMonth())

  const shift = (dir: 1 | -1) => {
    setView((v) => {
      const d = new Date(v.year, v.month + dir, 1)
      return { year: d.getFullYear(), month: d.getMonth() }
    })
  }

  return (
    <div className={cn('select-none', className)}>
      <div className="mb-2 flex items-center justify-between">
        <button
          type="button"
          onClick={() => shift(-1)}
          disabled={!canPrev}
          className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-white/8 hover:text-foreground disabled:opacity-30"
          aria-label="Previous month"
        >
          <ChevronLeft className="size-4" />
        </button>
        <div className="text-sm font-semibold font-heading">
          {MONTHS[view.month]} {view.year}
        </div>
        <button
          type="button"
          onClick={() => shift(1)}
          disabled={!canNext}
          className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-white/8 hover:text-foreground disabled:opacity-30"
          aria-label="Next month"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEKDAYS.map((w) => (
          <div key={w} className="py-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            {w}
          </div>
        ))}
        {cells.map((iso, i) => {
          if (!iso) return <div key={`e-${i}`} />
          const key = dayKey(iso)
          const blocked = blockedDates.includes(key)
          const past = minDate ? key < dayKey(minDate) : key < dayKey(new Date().toISOString())
          const isStart = start === iso
          const isEnd = end === iso
          const inRange = start && end && key > dayKey(start) && key < dayKey(end)
          const disabled = blocked || past
          return (
            <button
              key={key}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(iso)}
              className={cn(
                'relative mx-auto flex size-8 items-center justify-center rounded-lg text-xs font-medium transition-all',
                disabled && 'cursor-not-allowed text-muted-foreground/35 line-through',
                !disabled && 'text-foreground hover:bg-amber-400/15 hover:text-amber-200',
                inRange && 'rounded-none bg-amber-400/10 text-amber-200',
                isStart && 'rounded-l-lg rounded-r-none bg-gradient-to-b from-amber-400 to-orange-500 font-bold text-[#1c1102] shadow-[0_2px_12px_-2px_rgba(245,165,36,0.7)]',
                isEnd && 'rounded-r-lg rounded-l-none bg-gradient-to-b from-orange-500 to-rose-500 font-bold text-white shadow-[0_2px_12px_-2px_rgba(251,113,133,0.7)]',
                isStart && isEnd && 'rounded-lg rounded-none',
                blocked && 'text-red-300/40',
              )}
            >
              {new Date(iso).getDate()}
            </button>
          )
        })}
      </div>
    </div>
  )
}
