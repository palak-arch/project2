import { createFileRoute } from '@tanstack/react-router'
import * as React from 'react'
import { Link } from '@tanstack/react-router'
import {
  CalendarDays,
  ChevronRight,
  ClipboardCheck,
  Heart,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  Star,
  Timer,
  UserRound,
} from 'lucide-react'
import { actions, currentUser, useStore } from '@/store/store'
import { BikePhoto } from '@/components/bike-photo'
import { BikeCard } from '@/components/bike-card'
import { StatusBadge } from '@/components/status-badge'
import { Countdown } from '@/components/countdown'
import { ReviewDialog } from '@/components/review-dialog'
import { ExtensionDialog } from '@/components/extension-dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { fmtDate, inr } from '@/lib/format'
import type { Booking } from '@/store/types'

export const Route = createFileRoute('/trips')({
  head: () => ({
    meta: [
      { title: 'My Trips | ridegoa' },
      { name: 'description', content: 'Your active and past bike rentals across Goa, with handover checklists and reviews.' },
    ],
  }),
  component: Trips,
})

function ReviewStars({ n }: { n: number }) {
  return (
    <span className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={`size-3.5 ${i <= n ? 'fill-amber-300 text-amber-300' : 'text-white/15'}`} />
      ))}
    </span>
  )
}

function Trips() {
  const me = useStore((s) => currentUser(s))
  const allBookings = useStore((s) => s.bookings)
  const allBikes = useStore((s) => s.bikes)
  const allUsers = useStore((s) => s.users)
  const savedIds = useStore((s) => (me ? s.savedByUser[me.id] ?? [] : []))
  const bookings = me ? allBookings.filter((b) => b.renterId === me.id) : []
  const savedBikes = allBikes.filter((b) => savedIds.includes(b.id))

  const [reviewFor, setReviewFor] = React.useState<string | null>(null)
  const [extendFor, setExtendFor] = React.useState<string | null>(null)

  const active = bookings
    .filter((b) => b.status === 'Active' || b.status === 'Confirmed' || b.status === 'Pending')
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  const past = bookings.filter((b) => b.status === 'Completed' || b.status === 'Declined')

  const activeBooking: Booking | undefined = active[0]
  const activeBike = activeBooking ? allBikes.find((b) => b.id === activeBooking.bikeId) : undefined
  const activeOwner = activeBooking ? allUsers.find((u) => u.id === activeBooking.ownerId) : undefined

  if (!me) {
    return (
      <div className="mx-auto max-w-5xl px-4 pb-24 pt-6 sm:px-6 md:pb-12">
        <div className="glass flex flex-col items-center gap-3 rounded-3xl p-12 text-center">
          <UserRound className="size-9 text-amber-300" />
          <h1 className="font-heading text-2xl font-extrabold">
            Your trips, <span className="text-gradient">in one place</span>
          </h1>
          <p className="max-w-sm text-sm text-muted-foreground">
            Sign in to see active rentals, past rides, reviews and saved bikes.
          </p>
          <Button className="mt-2" onClick={() => actions.openAuth(true)}>
            Sign in
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-4 pb-24 pt-6 sm:px-6 md:pb-12">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-heading text-3xl font-extrabold">
            My <span className="text-gradient">Trips</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Active rentals, past rides and saved bikes.</p>
        </div>
        <Badge variant="teal" className="hidden sm:flex">{active.length} upcoming</Badge>
      </div>

      {/* active trip */}
      {activeBooking && activeBike ? (
        <section className="glass card-lift mt-6 overflow-hidden rounded-3xl">
          <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr]">
            <div className="relative">
              <BikePhoto bike={activeBike} className="h-full min-h-52" rounded="rounded-none" />
              <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                <StatusBadge status={activeBooking.status} />
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-heading text-2xl font-bold">{activeBike.name}</h2>
                  <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="size-4 text-teal-300" /> {activeBike.location} · {inr(activeBike.ratePerDay)}/day
                  </p>
                </div>
                {activeBooking.status === 'Active' && (
                  <div className="text-right">
                    <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">drop-off in</div>
                    <div className="mt-0.5 text-sm font-bold text-amber-300">{fmtDate(activeBooking.end)}</div>
                  </div>
                )}
              </div>

              {activeBooking.status === 'Active' ? (
                <div className="mt-4">
                  <Countdown target={activeBooking.end} />
                </div>
              ) : (
                <div className="mt-4 rounded-xl border border-white/10 bg-white/4 p-3.5 text-sm">
                  <div className="flex items-center gap-1.5 font-semibold text-amber-300">
                    <CalendarDays className="size-4" /> {fmtDate(activeBooking.start)} → {fmtDate(activeBooking.end)}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {activeBooking.status === 'Pending'
                      ? `Awaiting host approval · pickup ${activeBooking.pickupTime}`
                      : `Pickup ${activeBooking.pickupTime} · complete the handover to start riding`}
                  </p>
                </div>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
                <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-muted-foreground">
                  Total {inr(activeBooking.total)}
                </span>
                {activeOwner && (
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span
                      className="flex size-5 items-center justify-center rounded-full text-[9px] font-bold text-white"
                      style={{ background: `linear-gradient(135deg, hsl(${activeOwner.hue} 80% 55%), hsl(${activeOwner.hue + 40} 75% 40%))` }}
                    >
                      {activeOwner.initials}
                    </span>
                    {activeOwner.name}
                  </span>
                )}
              </div>

              <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                {activeBooking.status === 'Confirmed' && !activeBooking.handover && (
                  <Button onClick={() => actions.openHandover(activeBooking.id)}>
                    <ClipboardCheck className="size-4" /> Start handover checklist
                  </Button>
                )}
                {activeBooking.status === 'Active' && (
                  <Button
                    variant="outline"
                    onClick={() => setExtendFor(activeBooking.id)}
                    disabled={activeBooking.extension?.status === 'Pending'}
                  >
                    <Timer className="size-4" />
                    {activeBooking.extension?.status === 'Pending' ? 'Extension requested' : 'Request extension'}
                  </Button>
                )}
                {activeBooking.status === 'Active' && (
                  <Button variant="secondary" asChild>
                    <a href={`tel:${activeOwner?.phone ?? '+91108'}`}>
                      <Phone className="size-4" /> Emergency · {activeOwner?.phone ?? '+91 108'}
                    </a>
                  </Button>
                )}
              </div>

              {activeBooking.handover && (
                <div className="mt-4 rounded-xl border border-teal-400/20 bg-teal-400/6 p-3.5 text-xs text-teal-200/90">
                  <p className="flex items-center gap-1.5 font-semibold text-teal-300">
                    <ShieldCheck className="size-4" /> Handover completed
                  </p>
                  <p className="mt-1 text-muted-foreground">
                    Fuel {activeBooking.handover.fuelLevel}% · Odometer {activeBooking.handover.odometer.toLocaleString('en-IN')} km ·
                    Signature captured · {fmtDate(activeBooking.handover.at)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      ) : (
        <section className="glass mt-6 flex flex-col items-center gap-3 rounded-3xl p-10 text-center">
          <Sparkles className="size-8 text-amber-300" />
          <p className="font-heading text-lg font-bold">No active trips right now</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Browse the marketplace and your next Goa ride is a tap away.
          </p>
          <Link to="/">
            <Button className="mt-2">Explore bikes</Button>
          </Link>
        </section>
      )}

      {/* more upcoming */}
      {active.length > 1 && (
        <section className="mt-8">
          <h2 className="font-heading text-lg font-bold">Upcoming</h2>
          <div className="mt-3 space-y-2.5">
            {active.slice(1).map((b) => {
              const bk = allBikes.find((x) => x.id === b.bikeId)
              if (!bk) return null
              return (
                <div key={b.id} className="glass flex items-center gap-4 rounded-2xl p-3.5">
                  <BikePhoto bike={bk} className="w-24 shrink-0" rounded="rounded-xl" />
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold">{bk.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {fmtDate(b.start)} → {fmtDate(b.end)} · {inr(b.total)}
                    </div>
                  </div>
                  <StatusBadge status={b.status} />
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* past trips */}
      <section className="mt-10">
        <h2 className="font-heading text-lg font-bold">Past trips</h2>
        {past.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">Nothing here yet — complete a ride to see it.</p>
        ) : (
          <div className="mt-3 space-y-2.5">
            {past.map((b) => {
              const bk = allBikes.find((x) => x.id === b.bikeId)
              if (!bk) return null
              return (
                <div key={b.id} className="glass flex flex-col gap-3 rounded-2xl p-4 sm:flex-row sm:items-center">
                  <BikePhoto bike={bk} className="w-full shrink-0 sm:w-28" rounded="rounded-xl" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold">{bk.name}</span>
                      <StatusBadge status={b.status} />
                    </div>
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      {fmtDate(b.start)} → {fmtDate(b.end)} · {inr(b.total)}
                    </div>
                    {b.review ? (
                      <div className="mt-2 rounded-xl border border-white/8 bg-white/4 p-3">
                        <div className="flex items-center gap-2">
                          <ReviewStars n={b.review.rating} />
                          <span className="text-[11px] text-muted-foreground">{fmtDate(b.review.at)}</span>
                        </div>
                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{b.review.comment}</p>
                      </div>
                    ) : b.status === 'Completed' ? (
                      <Button size="sm" variant="outline" className="mt-2" onClick={() => setReviewFor(b.id)}>
                        <Star className="size-3.5" /> Leave a review
                      </Button>
                    ) : null}
                  </div>
                  <ChevronRight className="hidden size-5 text-muted-foreground/40 sm:block" />
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* saved bikes */}
      {savedBikes.length > 0 && (
        <section className="mt-10">
          <h2 className="flex items-center gap-2 font-heading text-lg font-bold">
            <Heart className="size-4.5 fill-rose-500 text-rose-500" /> Saved bikes
          </h2>
          <div className="mt-3 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {savedBikes.map((b) => (
              <BikeCard key={b.id} bike={b} onOpen={(id) => actions.openBike(id)} />
            ))}
          </div>
        </section>
      )}

      <ReviewDialog bookingId={reviewFor} onClose={() => setReviewFor(null)} />
      <ExtensionDialog bookingId={extendFor} onClose={() => setExtendFor(null)} />
    </div>
  )
}
