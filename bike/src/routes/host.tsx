import { createFileRoute } from '@tanstack/react-router'
import * as React from 'react'
import { toast } from 'sonner'
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Building2,
  Check,
  Plus,
  Sparkles,
  TrendingUp,
  Wallet,
  X,
} from 'lucide-react'
import { actions, currentUser, useStore } from '@/store/store'
import { BikeArt } from '@/components/bike-art'
import { BikePhoto } from '@/components/bike-photo'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { inr } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { BikeCategory, ListingDraft, Transmission } from '@/store/types'

export const Route = createFileRoute('/host')({
  head: () => ({
    meta: [
      { title: 'Host Studio | ridegoa' },
      { name: 'description', content: 'Manage your fleet, earnings and incoming booking requests on ridegoa.' },
    ],
  }),
  component: Host,
})

/* ------------------------------ income chart ------------------------------ */

const MONTHS = ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul']
const INCOME = [22400, 31800, 27600, 41200, 38400, 47600]

function IncomeChart() {
  const max = Math.max(...INCOME)
  return (
    <div className="flex h-40 items-end gap-2.5">
      {INCOME.map((v, i) => (
        <div key={i} className="group flex flex-1 flex-col items-center gap-1.5">
          <span className="text-[10px] font-bold text-amber-300 opacity-0 transition-opacity group-hover:opacity-100">
            {inr(v)}
          </span>
          <div
            className={cn(
              'w-full rounded-t-lg transition-all',
              i === INCOME.length - 1
                ? 'bg-gradient-to-t from-amber-500 to-orange-400 shadow-[0_0_20px_-4px_rgba(245,165,36,0.6)]'
                : 'bg-gradient-to-t from-teal-500/60 to-teal-400/40 group-hover:from-teal-500 group-hover:to-teal-400',
            )}
            style={{ height: `${(v / max) * 100}%` }}
          />
          <span className="text-[10px] font-medium text-muted-foreground">{MONTHS[i]}</span>
        </div>
      ))}
    </div>
  )
}

/* --------------------------- multi-step listing --------------------------- */

const CATEGORIES: { id: BikeCategory; label: string }[] = [
  { id: 'scooter', label: 'Scooter' },
  { id: 'cruiser', label: 'Cruiser' },
  { id: 'sports', label: 'Sports' },
  { id: 'adventure', label: 'Adventure' },
  { id: 'vintage', label: 'Vintage' },
  { id: 'electric', label: 'Electric' },
]
const AREAS = ['Anjuna', 'Baga', 'Candolim', 'Vagator', 'Panjim', 'Palolem', 'Calangute', 'Arambol']

const STEPS = ['Details', 'Specs & rates', 'Location & rules', 'Photos']

function ListingForm({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [step, setStep] = React.useState(0)
  const [draft, setDraft] = React.useState<ListingDraft>({
    name: '',
    brand: '',
    model: '',
    category: 'cruiser',
    year: 2024,
    cc: 350,
    transmission: 'Manual',
    ratePerDay: 699,
    ratePerHour: 115,
    securityDeposit: 3000,
    helmetIncluded: true,
    gearIncluded: false,
    location: 'Baga',
    distanceKm: 2,
    description: '',
    rentalRules: [],
    tone: 0,
  })
  const [rules, setRules] = React.useState('')
  const [publishing, setPublishing] = React.useState(false)

  React.useEffect(() => {
    if (open) {
      setStep(0)
      setDraft({
        name: '',
        brand: '',
        model: '',
        category: 'cruiser',
        year: 2024,
        cc: 350,
        transmission: 'Manual',
        ratePerDay: 699,
        ratePerHour: 115,
        securityDeposit: 3000,
        helmetIncluded: true,
        gearIncluded: false,
        location: 'Baga',
        distanceKm: 2,
        description: '',
        rentalRules: [],
        tone: 0,
      })
      setRules('')
    }
  }, [open])

  const set = <K extends keyof ListingDraft>(key: K, value: ListingDraft[K]) =>
    setDraft((d) => ({ ...d, [key]: value }))

  const canNext =
    step === 0
      ? draft.name && draft.brand && draft.model
      : step === 1
        ? draft.ratePerDay > 0 && draft.securityDeposit >= 0
        : step === 2
          ? draft.description.length > 20
          : true

  const publish = () => {
    setPublishing(true)
    setTimeout(() => {
      const id = actions.publishListing({ ...draft, rentalRules: rules.split('\n').filter(Boolean) })
      setPublishing(false)
      onClose()
      toast.success('Listing is live! 🎉', {
        description: 'Your bike is now visible in the marketplace.',
      })
      actions.openBike(id)
    }, 800)
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="size-5 text-amber-300" /> List a bike
          </DialogTitle>
          <DialogDescription>Publish straight to the marketplace — {STEPS.length} quick steps.</DialogDescription>
        </DialogHeader>

        {/* stepper */}
        <div className="flex items-center gap-1.5">
          {STEPS.map((s, i) => (
            <React.Fragment key={s}>
              <span
                className={cn(
                  'rounded-full border px-3 py-1 text-xs font-semibold',
                  i === step
                    ? 'border-amber-300 bg-gradient-to-b from-amber-400 to-orange-500 text-[#1c1102]'
                    : i < step
                      ? 'border-teal-400/40 bg-teal-400/10 text-teal-300'
                      : 'border-white/10 bg-white/5 text-muted-foreground',
                )}
              >
                {i + 1}. {s}
              </span>
              {i < STEPS.length - 1 && <div className="h-px flex-1 bg-white/10" />}
            </React.Fragment>
          ))}
        </div>

        <div className="min-h-64">
          {step === 0 && (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label>Bike name</Label>
                <Input className="mt-1.5" placeholder="e.g. Chapora Dusk 200" value={draft.name} onChange={(e) => set('name', e.target.value)} />
              </div>
              <div>
                <Label>Brand</Label>
                <Input className="mt-1.5" placeholder="e.g. Bajaj" value={draft.brand} onChange={(e) => set('brand', e.target.value)} />
              </div>
              <div>
                <Label>Model</Label>
                <Input className="mt-1.5" placeholder="e.g. Pulsar NS 200" value={draft.model} onChange={(e) => set('model', e.target.value)} />
              </div>
              <div>
                <Label>Category</Label>
                <Select value={draft.category} onValueChange={(v) => set('category', v as BikeCategory)}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Year</Label>
                  <Input type="number" className="mt-1.5" value={draft.year} onChange={(e) => set('year', Number(e.target.value))} />
                </div>
                <div>
                  <Label>CC (0 = EV)</Label>
                  <Input type="number" className="mt-1.5" value={draft.cc} onChange={(e) => set('cc', Number(e.target.value))} />
                </div>
              </div>
              <div>
                <Label>Transmission</Label>
                <Select value={draft.transmission} onValueChange={(v) => set('transmission', v as Transmission)}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Manual">Manual</SelectItem>
                    <SelectItem value="Automatic">Automatic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label>Rate per day (₹)</Label>
                <Input type="number" className="mt-1.5" value={draft.ratePerDay} onChange={(e) => set('ratePerDay', Number(e.target.value))} />
              </div>
              <div>
                <Label>Rate per hour (₹)</Label>
                <Input type="number" className="mt-1.5" value={draft.ratePerHour} onChange={(e) => set('ratePerHour', Number(e.target.value))} />
              </div>
              <div>
                <Label>Security deposit (₹)</Label>
                <Input type="number" className="mt-1.5" value={draft.securityDeposit} onChange={(e) => set('securityDeposit', Number(e.target.value))} />
              </div>
              <div>
                <Label>Pickup area</Label>
                <Select value={draft.location} onValueChange={(v) => set('location', v)}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {AREAS.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/4 px-4 py-3">
                <Label>Helmets included</Label>
                <Switch checked={draft.helmetIncluded} onCheckedChange={(v) => set('helmetIncluded', v)} />
              </div>
              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/4 px-4 py-3">
                <Label>Riding gear included</Label>
                <Switch checked={draft.gearIncluded} onCheckedChange={(v) => set('gearIncluded', v)} />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="grid gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Area</Label>
                  <Select value={draft.location} onValueChange={(v) => set('location', v)}>
                    <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {AREAS.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Km from Anjuna circle</Label>
                  <Input type="number" className="mt-1.5" value={draft.distanceKm} onChange={(e) => set('distanceKm', Number(e.target.value))} />
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  className="mt-1.5"
                  rows={3}
                  placeholder="What makes this ride special? Beaches, ghats, sunset spots…"
                  value={draft.description}
                  onChange={(e) => set('description', e.target.value)}
                />
              </div>
              <div>
                <Label>Rental rules (one per line)</Label>
                <Textarea
                  className="mt-1.5"
                  rows={3}
                  placeholder={'Valid licence required\nFuel policy: full-to-full'}
                  value={rules}
                  onChange={(e) => setRules(e.target.value)}
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col items-center gap-4 py-2">
              <div className="grid grid-cols-3 gap-2">
                {CATEGORIES.map((c, i) => (
                  <button
                    key={c.id}
                    onClick={() => set('tone', i)}
                    className={cn(
                      'relative overflow-hidden rounded-xl border-2 transition-all',
                      draft.tone === i ? 'border-amber-400 shadow-[0_0_18px_-4px_rgba(245,165,36,0.7)]' : 'border-transparent opacity-70 hover:opacity-100',
                    )}
                  >
                    <BikeArt category={c.id} tone={i} className="w-28" rounded="rounded-lg" />
                    {draft.tone === i && (
                      <span className="absolute right-1.5 top-1.5 flex size-5 items-center justify-center rounded-full bg-amber-400 text-[#1c1102]">
                        <Check className="size-3.5" />
                      </span>
                    )}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Pick the photo style — <span className="text-amber-300">photos are auto-generated</span> for the mock.
              </p>
              <div className="w-full rounded-xl border border-white/10 bg-white/4 p-3.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Preview price</span>
                  <span className="text-gradient font-heading text-xl font-extrabold">{inr(draft.ratePerDay)}/day</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-2">
          {step > 0 ? (
            <Button variant="ghost" onClick={() => setStep(step - 1)}>
              <ArrowLeft className="size-4" /> Back
            </Button>
          ) : (
            <Button variant="ghost" onClick={onClose}>
              <X className="size-4" /> Cancel
            </Button>
          )}
          {step < STEPS.length - 1 ? (
            <Button onClick={() => setStep(step + 1)} disabled={!canNext}>
              Continue <ArrowRight className="size-4" />
            </Button>
          ) : (
            <Button onClick={publish} disabled={!canNext || publishing}>
              {publishing ? 'Publishing…' : 'Publish to marketplace'} <Sparkles className="size-4" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

/* ------------------------------ main page ------------------------------ */

function Host() {
  const me = useStore((s) => currentUser(s))
  const allBikes = useStore((s) => s.bikes)
  const allBookings = useStore((s) => s.bookings)
  const allUsers = useStore((s) => s.users)
  const bikes = allBikes.filter((b) => b.ownerId === me?.id)
  const bookings = allBookings.filter((b) => b.ownerId === me?.id)
  const [listingOpen, setListingOpen] = React.useState(false)

  if (!me) {
    return (
      <div className="mx-auto max-w-6xl px-4 pb-24 pt-6 sm:px-6 md:pb-12">
        <div className="glass flex flex-col items-center gap-3 rounded-3xl p-12 text-center">
          <Building2 className="size-9 text-amber-300" />
          <h1 className="font-heading text-2xl font-extrabold">
            Host <span className="text-gradient">Studio</span>
          </h1>
          <p className="max-w-sm text-sm text-muted-foreground">
            Sign in as a host to manage your fleet, earnings and incoming requests.
          </p>
          <Button className="mt-2" onClick={() => actions.openAuth(true)}>
            Sign in as a host
          </Button>
        </div>
      </div>
    )
  }

  const earnings = bookings.reduce((acc, b) => (b.status === 'Active' || b.status === 'Completed' ? acc + b.total : acc), 0)
  const pending = bookings.filter((b) => b.status === 'Pending')
  const activeCount = bookings.filter((b) => b.status === 'Active').length
  const completion = bookings.length ? Math.round((bookings.filter((b) => b.status === 'Completed').length / bookings.length) * 100) : 0

  const stats = [
    { Icon: Wallet, label: 'Total earnings', value: inr(earnings), accent: 'text-amber-300' },
    { Icon: TrendingUp, label: 'Active rentals', value: String(activeCount), accent: 'text-teal-300' },
    { Icon: Sparkles, label: 'Fleet size', value: String(bikes.length), accent: 'text-violet-300' },
    { Icon: BadgeCheck, label: 'Completion rate', value: `${completion}%`, accent: 'text-emerald-300' },
  ]

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-6 sm:px-6 md:pb-12">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span
              className="flex size-10 items-center justify-center rounded-xl text-sm font-bold text-white"
              style={{ background: `linear-gradient(135deg, hsl(${me?.hue ?? 38} 80% 55%), hsl(${(me?.hue ?? 38) + 40} 75% 40%))` }}
            >
              {me?.initials}
            </span>
            <div>
              <h1 className="font-heading text-2xl font-extrabold">Host Studio</h1>
              <p className="text-xs text-muted-foreground">{me?.name} · verified host since {me?.memberSince}</p>
            </div>
          </div>
        </div>
        <Button onClick={() => setListingOpen(true)}>
          <Plus className="size-4" /> List a bike
        </Button>
      </div>

      {/* stats */}
      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map(({ Icon, label, value, accent }) => (
          <div key={label} className="glass card-lift rounded-2xl p-4">
            <Icon className={`size-5 ${accent}`} />
            <div className="mt-2 font-heading text-2xl font-extrabold">{value}</div>
            <div className="text-xs text-muted-foreground">{label}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-[1fr_1.1fr]">
        {/* income */}
        <section className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-lg font-bold">Income</h2>
            <Badge variant="teal">last 6 months</Badge>
          </div>
          <div className="mt-5">
            <IncomeChart />
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-white/8 pt-3 text-sm">
            <span className="text-muted-foreground">July total</span>
            <span className="font-heading text-xl font-extrabold text-gradient">{inr(47600)}</span>
          </div>
        </section>

        {/* requests */}
        <section className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-lg font-bold">Incoming requests</h2>
            {pending.length > 0 && <Badge>{pending.length} new</Badge>}
          </div>
          {pending.length === 0 ? (
            <p className="mt-6 text-center text-sm text-muted-foreground">
              All caught up ✨ New booking requests will appear here.
            </p>
          ) : (
            <div className="mt-3 space-y-3">
              {pending.map((b) => {
                const bk = allBikes.find((x) => x.id === b.bikeId)
                if (!bk) return null
                return (
                  <div key={b.id} className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/4 p-3">
                    <BikePhoto bike={bk} className="w-20 shrink-0" rounded="rounded-lg" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold">{bk.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {allUsers.find((u) => u.id === b.renterId)?.name ?? 'Renter'} · {new Date(b.start).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} →{' '}
                        {new Date(b.end).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} · {inr(b.total)}
                      </div>
                      <div className="mt-2 flex gap-2">
                        <Button
                          size="sm"
                          variant="success"
                          onClick={() => {
                            actions.approveBooking(b.id)
                            toast.success('Approved!', { description: `${bk.name} is now Confirmed.` })
                          }}
                        >
                          <Check className="size-3.5" /> Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            actions.declineBooking(b.id)
                            toast('Declined', { description: 'Renter has been notified.' })
                          }}
                        >
                          <X className="size-3.5" /> Decline
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* extension requests */}
          {bookings.some((b) => b.extension?.status === 'Pending') && (
            <div className="mt-4 space-y-2 border-t border-white/8 pt-3">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Extension requests</h3>
              {bookings
                .filter((b) => b.extension?.status === 'Pending')
                .map((b) => (
                  <div key={b.id} className="flex items-center justify-between rounded-xl border border-amber-400/20 bg-amber-400/6 px-3 py-2.5 text-sm">
                    <span className="text-xs text-muted-foreground">
                      {b.extension?.note} <span className="text-amber-300">(+{b.extension?.days}d)</span>
                    </span>
                    <div className="flex gap-1.5">
                      <Button size="sm" variant="success" onClick={() => actions.respondExtension(b.id, true)}>Accept</Button>
                      <Button size="sm" variant="secondary" onClick={() => actions.respondExtension(b.id, false)}>Decline</Button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </section>
      </div>

      {/* fleet */}
      <section className="glass mt-6 rounded-2xl p-5">
        <h2 className="font-heading text-lg font-bold">Your fleet</h2>
        <div className="mt-3 divide-y divide-white/6">
          {bikes.map((b) => {
            const bBookings = bookings.filter((x) => x.bikeId === b.id)
            return (
              <div key={b.id} className="flex flex-wrap items-center gap-4 py-3">
                <BikePhoto bike={b} className="w-24 shrink-0" rounded="rounded-xl" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold">{b.name}</span>
                    <Badge variant={b.available ? 'teal' : 'muted'}>
                      {b.available ? (bBookings.some((x) => x.status === 'Active') ? 'In use' : 'Available') : 'Paused'}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {b.category} · {inr(b.ratePerDay)}/day · {b.tripsCompleted} trips · {bBookings.length} bookings
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn('text-xs font-semibold', b.available ? 'text-teal-300' : 'text-red-300')}>
                    {b.available ? 'Available' : 'Paused'}
                  </span>
                  <Switch checked={b.available} onCheckedChange={() => actions.toggleBikeAvailability(b.id)} />
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <ListingForm open={listingOpen} onClose={() => setListingOpen(false)} />
    </div>
  )
}
