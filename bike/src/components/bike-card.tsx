import { Heart, MapPin, Star, Zap } from 'lucide-react'
import type { Bike } from '@/store/types'
import { BikePhoto } from './bike-photo'
import { Badge } from '@/components/ui/badge'
import { actions, currentUser, getState, ownerById, useStore } from '@/store/store'
import { inr } from '@/lib/format'
import { cn } from '@/lib/utils'

export function BikeCard({ bike, onOpen }: { bike: Bike; onOpen: (id: string) => void }) {
  const saved = useStore((s) => {
    const id = s.currentUserId
    return id ? (s.savedByUser[id] ?? []).includes(bike.id) : false
  })
  const owner = ownerById(useStore((s) => s), bike.ownerId)

  return (
    <article
      className="group card-lift relative cursor-pointer overflow-hidden rounded-2xl border border-white/10"
      onClick={() => onOpen(bike.id)}
    >
      <div className="relative flex min-h-[320px] flex-col justify-end sm:min-h-[340px]">
        {/* full-bleed photo background */}
        <BikePhoto
          bike={bike}
          rounded="rounded-none"
          className="absolute inset-0 h-full w-full transition-transform duration-500 group-hover:scale-105"
        />

        {/* readability scrim */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-black/5" />

        {/* top badges */}
        <div className="absolute left-3 top-3 z-10 flex flex-col gap-1.5">
          <Badge variant="outline" className="bg-black/30 backdrop-blur-md">
            {bike.category}
          </Badge>
          {!bike.available && <Badge variant="muted" className="bg-black/40 backdrop-blur-md">Booked out</Badge>}
        </div>

        {/* save */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            if (!currentUser(getState())) actions.openAuth(true)
            else actions.toggleSaveBike(bike.id)
          }}
          aria-label={saved ? 'Remove from saved' : 'Save bike'}
          className="absolute right-3 top-3 z-10 rounded-full bg-black/35 p-2 backdrop-blur-md transition-all hover:scale-110 active:scale-95"
        >
          <Heart className={cn('size-4 transition-colors', saved ? 'fill-rose-500 text-rose-500' : 'text-white')} />
        </button>

        {/* bottom content over the image */}
        <div className="relative z-10 p-4">
          <div className="flex items-end justify-between gap-3">
            <h3 className="font-heading text-lg font-bold leading-tight drop-shadow-md">{bike.name}</h3>
            <span className="shrink-0 rounded-full bg-black/45 px-2.5 py-1 text-[13px] font-bold text-white backdrop-blur-md">
              <span className="text-gradient">{inr(bike.ratePerDay)}</span>
              <span className="text-white/60">/day</span>
            </span>
          </div>
          <p className="mt-1 text-xs text-white/70">
            {bike.brand} {bike.model} · {bike.year} · {bike.cc > 0 ? `${bike.cc} cc` : 'Electric'}
          </p>

          <div className="mt-2.5 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs text-white/80">
            <span className="flex items-center gap-1">
              <Star className="size-3.5 fill-amber-300 text-amber-300" />
              {bike.rating}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="size-3.5 text-teal-300" />
              {bike.location} · {bike.distanceKm} km
            </span>
            <span className="flex items-center gap-1">
              <Zap className="size-3.5 text-amber-300" />
              {inr(bike.ratePerHour)}/hr
            </span>
          </div>

          {owner && (
            <div className="mt-3 flex items-center gap-2 border-t border-white/15 pt-3">
              <span
                className="flex size-6 items-center justify-center rounded-full text-[10px] font-bold text-white"
                style={{ background: `linear-gradient(135deg, hsl(${owner.hue} 80% 55%), hsl(${owner.hue + 40} 75% 40%))` }}
              >
                {owner.initials}
              </span>
              <span className="text-xs text-white/70">
                {owner.name} · responds {owner.responseTime}
              </span>
              <span className="ml-auto flex items-center gap-1 text-[11px] font-semibold text-teal-300">
                {bike.tripsCompleted} trips
              </span>
            </div>
          )}
        </div>
      </div>
    </article>
  )
}
