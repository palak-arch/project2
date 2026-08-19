import * as React from 'react'
import { toast } from 'sonner'
import { Star } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { actions } from '@/store/store'
import { cn } from '@/lib/utils'

export function ReviewDialog({ bookingId, onClose }: { bookingId: string | null; onClose: () => void }) {
  const [rating, setRating] = React.useState(0)
  const [hover, setHover] = React.useState(0)
  const [comment, setComment] = React.useState('')
  const [sending, setSending] = React.useState(false)

  React.useEffect(() => {
    if (bookingId) {
      setRating(0)
      setComment('')
    }
  }, [bookingId])

  const submit = () => {
    if (!bookingId || rating === 0) return
    setSending(true)
    setTimeout(() => {
      actions.addReview(bookingId, rating, comment)
      setSending(false)
      onClose()
      toast.success('Thanks for the review! ⭐')
    }, 600)
  }

  return (
    <Dialog open={!!bookingId} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Rate your ride</DialogTitle>
          <DialogDescription>How was the bike and the host experience?</DialogDescription>
        </DialogHeader>
        <div className="flex justify-center gap-1.5 py-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} onClick={() => setRating(n)} onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)} aria-label={`${n} stars`}>
              <Star
                className={cn(
                  'size-9 transition-all',
                  (hover || rating) >= n
                    ? 'fill-amber-300 text-amber-300 scale-110 drop-shadow-[0_0_10px_rgba(245,165,36,0.5)]'
                    : 'text-white/20',
                )}
              />
            </button>
          ))}
        </div>
        <Textarea
          placeholder="Tell the host what you loved…"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
        />
        <Button onClick={submit} disabled={rating === 0 || sending} className="w-full">
          {sending ? 'Posting…' : 'Submit review'}
        </Button>
      </DialogContent>
    </Dialog>
  )
}
