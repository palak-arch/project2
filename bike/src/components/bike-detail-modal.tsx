import * as React from 'react'
import { useRouter } from '@tanstack/react-router'
import { toast } from 'sonner'
import {
  BadgeCheck,
  CalendarDays,
  Clock,
  Fuel,
  Gauge,
  Heart,
  MapPin,
  MessageCircle,
  Settings2,
  ShieldCheck,
  Star,
  Timer,
  Zap,
} from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Calendar } from '@/components/ui/calendar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BikeArt, BikeThumb } from './bike-art'
import { BikePhoto } from './bike-photo'
import {
  actions,
  bikeById,
  currentUser,
  ownerById,
  useStore,
} from '@/store/store'
import { calcBreakdown, dayKey, fmtDate, inr, isBeforeToday, TIME_SLOTS } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { Bike } from '@/store/types'

function SpecGrid({ bike }: { bike: Bike }) {
  const specs = [
    { Icon: Gauge, label: 'Engine', value: bike.cc > 0 ? `${bike.cc} cc` : 'Electric motor' },
    { Icon: Settings2, label: 'Transmission', value: bike.transmission },
    { Icon: Fuel, label: 'Mileage', value: bike.mileage },
    { Icon: Timer, label: 'Year', value: String(bike.year) },
    { Icon: Zap, label: 'Hourly', value: inr(bike.ratePerHour) },
    { Icon: MapPin, label: 'Pickup', value: bike.location },
  ]
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {specs.map(({ Icon, label, value }) => (
        <div key={label} className="rounded-xl border border-white/8 bg-white/4 p-3">
          <Icon className="size-4 text-amber-300" />
          <div className="mt-1.5 text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
          <div className="text-sm font-semibold">{value}</div>
        </div>
      ))}
    </div>
  )
}

export function BikeDetailModal() {
  const router = useRouter()
  const bikeId = useStore((s) => s.activeBikeId)
  const bike = bikeById(useStore((s) => s), bikeId)
  const owner = ownerById(useStore((s) => s), bike?.ownerId)
  const me = useStore((s) => currentUser(s))
  const saved = useStore((s) => {
    if (!bike) return false
    const id = s.currentUserId
    return id ? (s.savedByUser[id] ?? []).includes(bike.id) : false
  })

  const [galleryIdx, setGalleryIdx] = React.useState(0)
  const [pickup, setPickup] = React.useState<string | null>(null)
  const [dropoff, setDropoff] = React.useState<string | null>(null)
  const [pickupTime, setPickupTime] = React.useState('10:00')
  const [dropoffTime, setDropoffTime] = React.useState('18:00')
  const [helmet, setHelmet] = React.useState(false)
  const [booking, setBooking] = React.useState(false)

  React.useEffect(() => {
    if (!bike) return
    const start = new Date()
    start.setDate(start.getDate() + 1)
    setPickup(start.toISOString())
    setDropoff(new Date(start.getTime() + 3 * 86_400_000).toISOString())
    setHelmet(!bike.helmetIncluded)
    setGalleryIdx(0)
  }, [bike?.id])

  if (!bike || !owner) return null

  const minDate = new Date()
  minDate.setDate(minDate.getDate() + 1)

  const handleDay = (iso: string) => {
    if (!pickup || dropoff) {
      // start a new selection
      setPickup(iso)
      setDropoff(null)
    } else if (dayKey(iso) > dayKey(pickup)) {
      setDropoff(iso)
    } else {
      setPickup(iso)
      setDropoff(null)
    }
  }

  const canBook = pickup && dropoff
  const br = canBook ? calcBreakdown(bike, pickup, dropoff, helmet) : null

  const onBook = () => {
    if (!me) {
      actions.openAuth(true)
      return
    }
    if (!pickup || !dropoff) return
    setBooking(true)
    setTimeout(() => {
      actions.requestBooking({
        bikeId: bike.id,
        start: pickup,
        end: dropoff,
        pickupTime,
        dropoffTime,
        helmet,
      })
      setBooking(false)
      actions.openBike(null)
      toast.success('Booking request sent!', {
        description: `${bike.name} · awaiting host approval. Chat thread opened.`,
      })
      router.navigate({ to: '/messages' })
    }, 700)
  }

  const onChat = () => {
    if (!me) {
      actions.openAuth(true)
      return
    }
    actions.openChatForBike(bike.id)
    actions.openBike(null)
    router.navigate({ to: '/messages' })
  }

  return (
    <Dialog open={!!bike} onOpenChange={(o) => !o && actions.openBike(null)}>
      <DialogContent className="max-w-5xl gap-0 overflow-hidden p-0">
        <div className="grid max-h-[86vh] grid-cols-1 overflow-y-auto md:grid-cols-[1.1fr_1fr] md:overflow-hidden">
          {/* gallery column */}
          <div className="relative flex flex-col md:overflow-y-auto">
            {galleryIdx === 0 ? (
              <BikePhoto bike={bike} className="aspect-[16/11]" rounded="rounded-none" eager />
            ) : (
              <BikeArt key={bike.id + galleryIdx} category={bike.category} tone={(bike.tone + galleryIdx) % 6} className="aspect-[16/11] rounded-none" />
            )}
            <div className="flex gap-2 p-4">
              {[0, 1, 2].map((i) => (
                <button
                  key={i}
                  onClick={() => setGalleryIdx(i)}
                  className={cn(
                    'overflow-hidden rounded-xl border-2 transition-all',
                    galleryIdx === i ? 'border-amber-400 shadow-[0_0_16px_-4px_rgba(245,165,36,0.6)]' : 'border-transparent opacity-60 hover:opacity-100',
                  )}
                >
                  {i === 0 ? (
                    <BikePhoto bike={bike} className="size-16 sm:size-20" rounded="rounded-lg" />
                  ) : (
                    <BikeThumb category={bike.category} tone={(bike.tone + i) % 6} className="size-16 sm:size-20" />
                  )}
                </button>
              ))}
            </div>
            <div className="px-4 pb-4">
              <h3 className="font-heading text-sm font-semibold uppercase tracking-wide text-amber-300">About this ride</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{bike.description}</p>

              <h3 className="mt-5 font-heading text-sm font-semibold uppercase tracking-wide text-amber-300">Rental rules</h3>
              <ul className="mt-2 space-y-1.5">
                {bike.rentalRules.map((r) => (
                  <li key={r} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-teal-300" />
                    {r}
                  </li>
                ))}
              </ul>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {bike.features.map((f) => (
                  <Badge key={f} variant="teal" className="bg-teal-400/8">
                    {f}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* info + booking column */}
          <div className="flex flex-col border-t border-white/8 md:overflow-y-auto md:border-l md:border-t-0">
            <div className="p-5">
              <DialogHeader className="flex-row items-start justify-between gap-3 space-y-0">
                <div>
                  <DialogTitle className="text-2xl">{bike.name}</DialogTitle>
                  <DialogDescription className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <MapPin className="size-3.5 text-teal-300" /> {bike.location} · {bike.distanceKm} km from you
                    </span>
                    <span className="flex items-center gap-1 font-bold text-amber-300">
                      <Star className="size-3.5 fill-amber-300 text-amber-300" /> {bike.rating}
                      <span className="font-normal text-muted-foreground">({bike.reviews})</span>
                    </span>
                  </DialogDescription>
                </div>
                <button
                  onClick={() => {
                    if (!me) actions.openAuth(true)
                    else actions.toggleSaveBike(bike.id)
                  }}
                  aria-label="Save bike"
                  className="shrink-0 rounded-full border border-white/10 bg-white/5 p-2.5 transition-colors hover:bg-white/10"
                >
                  <Heart className={cn('size-4', saved ? 'fill-rose-500 text-rose-500' : 'text-muted-foreground')} />
                </button>
              </DialogHeader>

              {/* owner card */}
              <div className="mt-4 flex items-center gap-3 rounded-xl border border-white/8 bg-white/4 p-3">
                <span
                  className="flex size-11 items-center justify-center rounded-xl text-sm font-bold text-white"
                  style={{ background: `linear-gradient(135deg, hsl(${owner.hue} 80% 55%), hsl(${owner.hue + 40} 75% 40%))` }}
                >
                  {owner.initials}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 font-semibold">
                    {owner.name}
                    {owner.verified && <BadgeCheck className="size-4 text-teal-300" />}
                  </div>
                  <p className="truncate text-xs text-muted-foreground">
                    {owner.tagline}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-xs font-bold text-teal-300">4.9 ★</div>
                  <div className="text-[11px] text-muted-foreground">responds {owner.responseTime}</div>
                </div>
              </div>

              <div className="mt-4">
                <SpecGrid bike={bike} />
              </div>

              {/* availability */}
              <div className="mt-5">
                <h3 className="flex items-center gap-1.5 font-heading text-sm font-semibold uppercase tracking-wide text-amber-300">
                  <CalendarDays className="size-4" /> Availability
                </h3>
                <div className="mt-2 rounded-xl border border-white/8 bg-white/4 p-3">
                  <Calendar
                    range={[pickup, dropoff]}
                    blockedDates={bike.blockedDates}
                    minDate={minDate.toISOString()}
                    onSelect={handleDay}
                  />
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div>
                    <label className="mb-1 flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                      <Clock className="size-3.5" /> Pickup {pickup && <span className="normal-case text-amber-300">· {fmtDate(pickup)}</span>}
                    </label>
                    <Select value={pickupTime} onValueChange={setPickupTime}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {TIME_SLOTS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="mb-1 flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                      <Clock className="size-3.5" /> Drop-off {dropoff && <span className="normal-case text-amber-300">· {fmtDate(dropoff)}</span>}
                    </label>
                    <Select value={dropoffTime} onValueChange={setDropoffTime}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {TIME_SLOTS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* price breakdown */}
              <div className="mt-5 rounded-xl border border-amber-400/20 bg-gradient-to-b from-amber-400/8 to-transparent p-4">
                <h3 className="flex items-center gap-1.5 font-heading text-sm font-semibold uppercase tracking-wide text-amber-300">
                  <ShieldCheck className="size-4" /> Price breakdown
                </h3>
                {br ? (
                  <div className="mt-3 space-y-1.5 text-sm">
                    <div className="flex justify-between text-muted-foreground">
                      <span>{inr(bike.ratePerDay)} × {br.days} day{br.days > 1 ? 's' : ''}</span>
                      <span>{inr(br.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Security deposit (refundable)</span>
                      <span>{inr(br.deposit)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Service fee (8%)</span>
                      <span>{inr(br.fee)}</span>
                    </div>
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span className="flex items-center gap-2">
                        Helmet add-on
                        <Switch checked={helmet} onCheckedChange={setHelmet} className="scale-90" />
                      </span>
                      <span>{inr(br.helmetCost)}</span>
                    </div>
                    <div className="mt-2 flex items-end justify-between border-t border-white/10 pt-2.5">
                      <span className="font-heading text-sm font-semibold">Total due</span>
                      <span className="text-gradient font-heading text-2xl font-extrabold">{inr(br.total)}</span>
                    </div>
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-muted-foreground">Pick pickup &amp; drop-off dates to see the total.</p>
                )}
              </div>

              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <Button size="lg" className="flex-1" onClick={onBook} disabled={!canBook || booking}>
                  {booking ? 'Sending request…' : 'Book Now'}
                </Button>
                <Button size="lg" variant="secondary" className="flex-1" onClick={onChat}>
                  <MessageCircle className="size-4" /> Chat with {owner.name.split(' ')[0]}
                </Button>
              </div>
              <p className="mt-2 text-center text-[11px] text-muted-foreground">
                Free cancellation before confirmation · {isBeforeToday(bike.listedAt) ? 'Instant confirmation usually' : 'Typically confirmed within a day'}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
