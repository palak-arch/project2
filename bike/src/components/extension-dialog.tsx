import * as React from 'react'
import { toast } from 'sonner'
import { CalendarPlus } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { actions, bookingById, bikeById, useStore } from '@/store/store'
import { fmtDate, inr } from '@/lib/format'

export function ExtensionDialog({ bookingId, onClose }: { bookingId: string | null; onClose: () => void }) {
  const booking = bookingById(useStore((s) => s), bookingId)
  const bike = bikeById(useStore((s) => s), booking?.bikeId)
  const [days, setDays] = React.useState('2')
  const [note, setNote] = React.useState('')
  const [sending, setSending] = React.useState(false)

  React.useEffect(() => {
    if (bookingId) {
      setDays('2')
      setNote('')
    }
  }, [bookingId])

  if (!booking || !bike) return null
  const n = Math.max(1, parseInt(days || '1', 10))
  const extra = bike.ratePerDay * n
  const fee = Math.round(extra * 0.08)

  const submit = () => {
    setSending(true)
    setTimeout(() => {
      actions.requestExtension(booking.id, n, note || `Keep the ${bike.name} a little longer`)
      setSending(false)
      onClose()
      toast.success('Extension requested', { description: `${n} day${n > 1 ? 's' : ''} · awaiting host approval.` })
    }, 600)
  }

  return (
    <Dialog open={!!bookingId} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarPlus className="size-5 text-amber-300" /> Extend your trip
          </DialogTitle>
          <DialogDescription>
            Current drop-off {fmtDate(booking.end)} · {bike.name}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Additional days</label>
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="icon" onClick={() => setDays(String(Math.max(1, n - 1)))} aria-label="Fewer days">−</Button>
              <Input
                type="number"
                min={1}
                value={days}
                onChange={(e) => setDays(e.target.value)}
                className="text-center font-heading text-lg font-bold"
              />
              <Button variant="secondary" size="icon" onClick={() => setDays(String(n + 1))} aria-label="More days">+</Button>
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Reason (optional)</label>
            <Textarea
              placeholder="e.g. The ghats deserve one more day…"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
            />
          </div>
          <div className="rounded-xl border border-white/10 bg-white/4 p-3.5 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>{inr(bike.ratePerDay)} × {n} day{n > 1 ? 's' : ''}</span>
              <span>{inr(extra)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Service fee (8%)</span>
              <span>{inr(fee)}</span>
            </div>
            <div className="mt-2 flex items-center justify-between border-t border-white/10 pt-2">
              <span className="font-semibold">Added to total</span>
              <span className="text-gradient font-heading text-xl font-extrabold">{inr(extra + fee)}</span>
            </div>
          </div>
          <Button className="w-full" onClick={submit} disabled={sending}>
            {sending ? 'Sending…' : 'Request extension'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
