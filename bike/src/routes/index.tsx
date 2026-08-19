import { createFileRoute } from '@tanstack/react-router'
import * as React from 'react'
import {
  Bike,
  Gauge,
  LayoutGrid,
  Map as MapIcon,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Star,
  Zap,
} from 'lucide-react'
import { actions, useStore } from '@/store/store'
import { BikeCard } from '@/components/bike-card'
import { GoaMap } from '@/components/map-view'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { inr } from '@/lib/format'
import type { BikeCategory, Transmission } from '@/store/types'

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [
      { title: 'ridegoa — Rent bikes across Goa' },
      {
        name: 'description',
        content: 'Two-wheeler rentals across Anjuna, Baga, Panjim, Vagator, Candolim and Palolem. Scooters, cruisers, sports, adventure, vintage and electric.',
      },
    ],
  }),
  component: Marketplace,
})

const CATEGORIES: { id: BikeCategory | 'all'; label: string; Icon: typeof Bike }[] = [
  { id: 'all', label: 'All', Icon: Sparkles },
  { id: 'scooter', label: 'Scooters', Icon: Bike },
  { id: 'cruiser', label: 'Cruisers', Icon: Bike },
  { id: 'sports', label: 'Sports', Icon: Gauge },
  { id: 'adventure', label: 'Adventure', Icon: Bike },
  { id: 'vintage', label: 'Vintage', Icon: Bike },
  { id: 'electric', label: 'Electric', Icon: Zap },
]

function HeroBackground() {
  const [failed, setFailed] = React.useState(false)
  return (
    <>
      {/* full-bleed background photo (drop your image at public/home-bg.png) */}
      {!failed && (
        <img
          src="/home-bg.png"
          alt=""
          aria-hidden
          loading="eager"
          onError={() => setFailed(true)}
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        />
      )}
      {/* readability overlays — keep the headline crisp over any photo */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0a0e1a]/95 via-[#0a0e1a]/55 to-[#0a0e1a]/30" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(600px_300px_at_80%_0%,rgba(245,165,36,0.14),transparent_60%),radial-gradient(500px_260px_at_10%_100%,rgba(45,212,191,0.10),transparent_60%)]" />
    </>
  )
}

function Marketplace() {
  const bikes = useStore((s) => s.bikes)
  const [view, setView] = React.useState<'grid' | 'map'>('grid')
  const [query, setQuery] = React.useState('')
  const [category, setCategory] = React.useState<BikeCategory | 'all'>('all')
  const [maxPrice, setMaxPrice] = React.useState(900)
  const [transmission, setTransmission] = React.useState<Transmission | 'all'>('all')
  const [minCc, setMinCc] = React.useState(0)
  const [helmetOnly, setHelmetOnly] = React.useState(false)
  const [gearOnly, setGearOnly] = React.useState(false)
  const [sort, setSort] = React.useState('recommended')

  const filtered = React.useMemo(() => {
    let list = bikes.filter((b) => b.available)
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter(
        (b) =>
          b.name.toLowerCase().includes(q) ||
          b.brand.toLowerCase().includes(q) ||
          b.model.toLowerCase().includes(q) ||
          b.location.toLowerCase().includes(q) ||
          b.category.includes(q),
      )
    }
    if (category !== 'all') list = list.filter((b) => b.category === category)
    list = list.filter((b) => b.ratePerDay <= maxPrice)
    if (transmission !== 'all') list = list.filter((b) => b.transmission === transmission)
    if (minCc > 0) list = list.filter((b) => b.cc >= minCc)
    if (helmetOnly) list = list.filter((b) => b.helmetIncluded)
    if (gearOnly) list = list.filter((b) => b.gearIncluded)

    switch (sort) {
      case 'price-asc':
        list = [...list].sort((a, b) => a.ratePerDay - b.ratePerDay)
        break
      case 'price-desc':
        list = [...list].sort((a, b) => b.ratePerDay - a.ratePerDay)
        break
      case 'rating':
        list = [...list].sort((a, b) => b.rating - a.rating)
        break
      default:
        list = [...list].sort((a, b) => b.reviews - a.reviews)
    }
    return list
  }, [bikes, query, category, maxPrice, transmission, minCc, helmetOnly, gearOnly, sort])

  const hasFilters =
    query || category !== 'all' || maxPrice < 900 || transmission !== 'all' || minCc > 0 || helmetOnly || gearOnly

  const clearFilters = () => {
    setQuery('')
    setCategory('all')
    setMaxPrice(900)
    setTransmission('all')
    setMinCc(0)
    setHelmetOnly(false)
    setGearOnly(false)
    setSort('recommended')
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-6 sm:px-6 md:pb-12">
      {/* hero */}
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0a0e1a] p-8 sm:p-12">
        <HeroBackground />
        <div className="relative max-w-2xl">
          <Badge variant="teal" className="mb-4">
            <ShieldCheck className="size-3.5" /> 4.8★ · 1,000+ rides in Goa
          </Badge>
          <h1 className="font-heading text-4xl font-extrabold leading-tight sm:text-5xl">
            Ride the <span className="text-gradient">Goa</span> way.
            <br />
            <span className="text-muted-foreground">Two wheels, one coast.</span>
          </h1>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base">
            From Anjuna sunsets to Palolem palm-shaded roads — rent scooters, cruisers and ADV tourers directly from
            verified local hosts. No paperwork, instant booking.
          </p>
          <div className="mt-5 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Star className="size-3.5 fill-amber-300 text-amber-300" /> 4.8 host rating</span>
            <span className="size-1 rounded-full bg-white/20" />
            <span className="flex items-center gap-1"><ShieldCheck className="size-3.5 text-teal-300" /> Free cancellation</span>
            <span className="size-1 rounded-full bg-white/20" />
            <span className="flex items-center gap-1"><Sparkles className="size-3.5 text-amber-300" /> 24×7 road support</span>
          </div>
        </div>
      </section>

      {/* search + toolbar */}
      <div className="sticky top-16 z-30 -mx-1 mt-5 rounded-2xl p-1 backdrop-blur-xl">
        <div className="flex flex-col gap-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 size-4.5 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search Anjuna, Royal Enfield, Himalayan…"
              className="glass h-12 w-full rounded-2xl pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-amber-400/50 focus:outline-none focus:ring-[3px] focus:ring-amber-400/15"
            />
          </div>

          {/* category pills */}
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {CATEGORIES.map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => setCategory(id)}
                className={cn(
                  'flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-semibold transition-all',
                  category === id
                    ? 'border-amber-300 bg-gradient-to-b from-amber-400 to-orange-500 text-[#1c1102] shadow-[0_6px_18px_-6px_rgba(245,165,36,0.7)]'
                    : 'border-white/10 bg-white/5 text-muted-foreground hover:border-white/25 hover:text-foreground',
                )}
              >
                <Icon className="size-3.5" />
                {label}
              </button>
            ))}
          </div>

          {/* filters row */}
          <div className="glass flex flex-wrap items-center gap-x-5 gap-y-3 rounded-2xl px-4 py-3">
            <div className="flex min-w-44 flex-1 flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1 font-medium text-muted-foreground">
                  <SlidersHorizontal className="size-3.5" /> Max daily rate
                </span>
                <span className="font-bold text-amber-300">{inr(maxPrice)}</span>
              </div>
              <Slider value={[maxPrice]} onValueChange={(v) => setMaxPrice(v[0])} min={300} max={900} step={25} />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Transmission</span>
              <Select value={transmission} onValueChange={(v) => setTransmission(v as Transmission | 'all')}>
                <SelectTrigger className="h-8 w-32 text-xs">
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any</SelectItem>
                  <SelectItem value="Automatic">Automatic</SelectItem>
                  <SelectItem value="Manual">Manual</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Engine</span>
              <Select value={String(minCc)} onValueChange={(v) => setMinCc(Number(v))}>
                <SelectTrigger className="h-8 w-32 text-xs">
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Any CC</SelectItem>
                  <SelectItem value="125">125 cc +</SelectItem>
                  <SelectItem value="250">250 cc +</SelectItem>
                  <SelectItem value="350">350 cc +</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <label className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
              <Switch checked={helmetOnly} onCheckedChange={setHelmetOnly} className="scale-90" /> Helmets included
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
              <Switch checked={gearOnly} onCheckedChange={setGearOnly} className="scale-90" /> Gear included
            </label>

            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="h-8 w-40 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recommended">Recommended</SelectItem>
                <SelectItem value="price-asc">Price: low → high</SelectItem>
                <SelectItem value="price-desc">Price: high → low</SelectItem>
                <SelectItem value="rating">Top rated</SelectItem>
              </SelectContent>
            </Select>

            <div className="ml-auto flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {filtered.length} bike{filtered.length !== 1 ? 's' : ''}
              </span>
              <div className="flex rounded-xl border border-white/10 bg-white/5 p-1">
                <button
                  onClick={() => setView('grid')}
                  className={cn('rounded-lg p-1.5 transition-colors', view === 'grid' ? 'bg-amber-400/20 text-amber-300' : 'text-muted-foreground')}
                  aria-label="Grid view"
                >
                  <LayoutGrid className="size-4" />
                </button>
                <button
                  onClick={() => setView('map')}
                  className={cn('rounded-lg p-1.5 transition-colors', view === 'map' ? 'bg-amber-400/20 text-amber-300' : 'text-muted-foreground')}
                  aria-label="Map view"
                >
                  <MapIcon className="size-4" />
                </button>
              </div>
            </div>
          </div>

          {hasFilters && (
            <div className="flex justify-end">
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear all filters
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* content */}
      {view === 'grid' ? (
        filtered.length > 0 ? (
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((b) => (
              <BikeCard key={b.id} bike={b} onOpen={(id) => actions.openBike(id)} />
            ))}
          </div>
        ) : (
          <div className="mt-10 flex flex-col items-center gap-3 py-16 text-center">
            <Search className="size-10 text-muted-foreground/40" />
            <p className="font-heading text-lg font-bold">No bikes match those filters</p>
            <p className="max-w-sm text-sm text-muted-foreground">Try widening the price range or clearing filters.</p>
            <Button variant="outline" onClick={clearFilters} className="mt-2">Reset filters</Button>
          </div>
        )
      ) : (
        <div className="mt-6">
          <GoaMap bikes={filtered} activeId={null} onPinClick={(id) => actions.openBike(id)} />
        </div>
      )}
    </div>
  )
}
