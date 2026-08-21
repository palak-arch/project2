import { Clock3, CheckCircle2, Zap, CircleCheckBig, XCircle, Hourglass } from 'lucide-react'
import type { BookingStatus } from '@/store/types'
import { cn } from '@/lib/utils'

const STYLES: Record<BookingStatus, { label: string; cls: string; Icon: typeof Clock3 }> = {
  Pending: { label: 'Pending Approval', cls: 'border-amber-400/40 bg-amber-400/12 text-amber-300', Icon: Hourglass },
  Confirmed: { label: 'Confirmed', cls: 'border-teal-400/40 bg-teal-400/12 text-teal-300', Icon: CheckCircle2 },
  Active: { label: 'Active Rental', cls: 'border-emerald-400/40 bg-emerald-400/12 text-emerald-300', Icon: Zap },
  Completed: { label: 'Completed', cls: 'border-violet-400/40 bg-violet-400/12 text-violet-300', Icon: CircleCheckBig },
  Declined: { label: 'Declined', cls: 'border-red-400/40 bg-red-400/12 text-red-300', Icon: XCircle },
}

export function StatusBadge({ status, className }: { status: BookingStatus; className?: string }) {
  const { label, cls, Icon } = STYLES[status]
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-wide', cls, className)}>
      <Icon className="size-3.5" />
      {label}
    </span>
  )
}
