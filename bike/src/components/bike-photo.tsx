import * as React from 'react'
import { cn } from '@/lib/utils'
import { BikeArt } from './bike-art'
import type { Bike } from '@/store/types'

/**
 * Renders a bike's photo with a graceful three-tier fallback:
 * 1. `bike.photoUrl` — a real photo (e.g. Unsplash CDN); if it fails to load,
 * 2. `bike.photo` — the local SVG scene (public/bikes/*.svg); if that fails too,
 * 3. procedural `BikeArt` — always available, offline-safe.
 */
export function BikePhoto({
  bike,
  className,
  rounded = 'rounded-2xl',
  imgClassName,
  eager = false,
}: {
  bike: Pick<Bike, 'photoUrl' | 'photo' | 'name' | 'category' | 'tone'>
  className?: string
  rounded?: string
  imgClassName?: string
  eager?: boolean
}) {
  const [failedRemote, setFailedRemote] = React.useState(false)
  const [failedLocal, setFailedLocal] = React.useState(false)

  React.useEffect(() => {
    setFailedRemote(false)
    setFailedLocal(false)
  }, [bike.photoUrl, bike.photo])

  const remote = !failedRemote ? bike.photoUrl : undefined
  const local = !remote && !failedLocal ? bike.photo : undefined
  const src = remote ?? local

  if (src) {
    return (
      <div className={cn('relative w-full overflow-hidden bg-[#0d1120]', rounded, className)}>
        <img
          src={src}
          alt={bike.name}
          loading={eager ? 'eager' : 'lazy'}
          onError={remote ? () => setFailedRemote(true) : () => setFailedLocal(true)}
          className={cn('h-full w-full object-cover', imgClassName)}
        />
      </div>
    )
  }
  return <BikeArt category={bike.category} tone={bike.tone} className={className} rounded={rounded} />
}
