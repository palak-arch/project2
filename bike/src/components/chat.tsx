import * as React from 'react'
import { toast } from 'sonner'
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  Check,
  CheckCheck,
  ImagePlus,
  MapPin,
  MessageSquare,
  Phone,
  Send,
  ShieldCheck,
  Timer,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { BikePhoto } from './bike-photo'
import { StatusBadge } from './status-badge'
import { ExtensionDialog } from './extension-dialog'
import {
  actions,
  bikeById,
  conversationById,
  currentUser,
  useStore,
  userById,
} from '@/store/store'
import { fmtDate, inr, timeAgo } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { Conversation, Message } from '@/store/types'

/* ---------------------------- message bubble ---------------------------- */

function Bubble({ msg, mine, showReceipt }: { msg: Message; mine: boolean; showReceipt: boolean }) {
  if (msg.kind === 'system') {
    return (
      <div className="flex justify-center py-1">
        <span className="max-w-[85%] rounded-full border border-amber-400/20 bg-amber-400/8 px-3.5 py-1.5 text-center text-[11px] leading-snug text-amber-200/90">
          {msg.text}
        </span>
      </div>
    )
  }

  const isPhoto = msg.kind === 'photo'
  const isLocation = msg.kind === 'location'

  return (
    <div className={cn('flex flex-col', mine ? 'items-end' : 'items-start')}>
      <div
        className={cn(
          'max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
          mine
            ? 'rounded-br-md bg-gradient-to-b from-amber-400 to-orange-500 text-[#1c1102] shadow-[0_6px_20px_-8px_rgba(245,165,36,0.5)]'
            : 'rounded-bl-md border border-white/10 bg-white/6 text-foreground',
        )}
      >
        {isLocation && (
          <div className="mb-1.5 overflow-hidden rounded-lg border border-white/10">
            <div className="relative h-20 bg-gradient-to-br from-teal-500/30 via-[#0d1220] to-orange-500/25">
              <MapPin className="absolute left-1/2 top-1/2 size-5 -translate-x-1/2 -translate-y-1/2 text-teal-300 drop-shadow" />
              <div className="absolute left-3 top-3 rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-semibold backdrop-blur">
                {msg.location?.label}
              </div>
            </div>
          </div>
        )}
        {isPhoto && (
          <div className="mb-1.5 flex items-center gap-2 rounded-lg border border-white/10 bg-black/30 px-2.5 py-2">
            <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-teal-400/40 to-cyan-600/40">
              <ImagePlus className="size-4 text-white" />
            </span>
            <div className="text-xs">
              <div className="font-semibold">{msg.attachment?.name}</div>
              <div className="text-[10px] opacity-70">{msg.attachment?.size}</div>
            </div>
          </div>
        )}
        {msg.text}
      </div>
      <div className={cn('mt-1 flex items-center gap-1 px-1 text-[10px] text-muted-foreground', mine && 'flex-row-reverse')}>
        <span>{timeAgo(msg.timestamp)}</span>
        {mine && showReceipt && (
          msg.readByOther ? (
            <CheckCheck className="size-3.5 text-teal-300" />
          ) : msg.kind === 'text' ? (
            <CheckCheck className="size-3.5 opacity-40" />
          ) : null
        )}
      </div>
    </div>
  )
}

/* --------------------------- booking action card --------------------------- */

function BookingActionCard({ conv }: { conv: Conversation }) {
  const booking = useStore((s) => s.bookings.find((b) => b.conversationId === conv.id))
  const persona = useStore((s) => s.persona)
  const me = useStore((s) => currentUser(s))
  const bike = bikeById(useStore((s) => s), conv.bikeId)
  const [extendOpen, setExtendOpen] = React.useState(false)
  if (!booking || !bike) return null

  const mine = booking.renterId === me?.id && persona === 'renter'
  const isOwner = persona === 'owner' && booking.ownerId === me?.id

  const ownerActions = booking.status === 'Pending' && isOwner

  const renterHandover = mine && booking.status === 'Confirmed' && !booking.handover

  const extPending = booking.extension?.status === 'Pending'
  const extVisible = (persona === 'owner' && booking.ownerId === me?.id && extPending) || (mine && extPending)
  const renterCanExtend = mine && (booking.status === 'Active' || booking.status === 'Confirmed') && !extPending

  if (!ownerActions && !renterHandover && !extVisible && !renterCanExtend) return null

  return (
    <div className="my-2 flex justify-center">
      <div className="w-full max-w-sm rounded-2xl border border-amber-400/25 bg-gradient-to-b from-amber-400/10 to-transparent p-3.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <CalendarDays className="size-3.5 text-amber-300" />
            {fmtDate(booking.start)} → {fmtDate(booking.end)}
          </div>
          <StatusBadge status={booking.status} />
        </div>
        <div className="mt-2 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Total</span>
          <span className="font-heading text-lg font-extrabold text-gradient">{inr(booking.total)}</span>
        </div>

        {ownerActions && (
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Button
              variant="success"
              onClick={() => {
                actions.approveBooking(booking.id)
                toast.success('Booking approved', { description: `${bike.name} is now Confirmed.` })
              }}
            >
              <Check className="size-4" /> Approve
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                actions.declineBooking(booking.id)
                toast('Booking declined', { description: 'Renter has been notified.' })
              }}
            >
              Decline
            </Button>
          </div>
        )}

        <div className="mt-3 grid gap-2">
          {renterHandover && (
            <Button
              className="w-full"
              variant="teal"
              onClick={() => {
                actions.openHandover(booking.id)
                toast.info('Handover checklist opened', {
                  description: 'Complete the inspection, fuel, photos and signature to start the rental.',
                })
              }}
            >
              <ShieldCheck className="size-4" /> Confirm handover
            </Button>
          )}
          {renterCanExtend && (
            <Button className="w-full" variant="outline" onClick={() => setExtendOpen(true)}>
              <Timer className="size-4" /> Request extension
            </Button>
          )}
        </div>

        {extVisible && (
          <div className="mt-3 rounded-xl border border-white/10 bg-white/4 p-3 text-xs">
            <div className="flex items-center gap-1.5 font-semibold text-amber-300">
              <Timer className="size-3.5" /> Extension requested
            </div>
            <p className="mt-1 text-muted-foreground">
              {booking.extension?.note} (+{booking.extension?.days} day{booking.extension?.days! > 1 ? 's' : ''})
            </p>
            {persona === 'owner' && booking.ownerId === me?.id ? (
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Button
                  size="sm"
                  variant="success"
                  onClick={() => {
                    actions.respondExtension(booking.id, true)
                    toast.success('Extension accepted')
                  }}
                >
                  Accept
                </Button>
                <Button size="sm" variant="secondary" onClick={() => actions.respondExtension(booking.id, false)}>
                  Decline
                </Button>
              </div>
            ) : (
              <div className="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground">
                <Badge variant="teal">Awaiting host</Badge>
              </div>
            )}
          </div>
        )}
      </div>
      <ExtensionDialog bookingId={extendOpen ? booking.id : null} onClose={() => setExtendOpen(false)} />
    </div>
  )
}

/* ---------------------------- thread view ---------------------------- */

const QUICK_CHIPS = ['Are helmets included?', "Where's the pickup point?", 'Can I extend my trip?']

function ThreadView({ conv, onBack, showOnMobile }: { conv: Conversation; onBack: () => void; showOnMobile: boolean }) {
  const persona = useStore((s) => s.persona)
  const me = useStore((s) => currentUser(s))
  const bike = bikeById(useStore((s) => s), conv.bikeId)
  const booking = useStore((s) => s.bookings.find((b) => b.conversationId === conv.id))
  const mine = conv.renterId === me?.id && persona === 'renter'

  const [draft, setDraft] = React.useState('')
  const endRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [conv.messages.length])

  const send = (text: string) => {
    const t = text.trim()
    if (!t) return
    actions.sendMessage(conv.id, { kind: 'text', text: t })
    setDraft('')
  }  const other = useStore((s) => userById(s, mine ? conv.ownerId : conv.renterId))

  return (
    <div className={cn('flex h-full flex-col', showOnMobile ? 'flex' : 'hidden md:flex')}>
      {/* pinned context bar */}
      <div className="border-b border-white/8 p-3">
        <div className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/4 p-2.5">
          {bike && <BikePhoto bike={bike} className="size-14 shrink-0" rounded="rounded-lg" />}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 text-sm font-semibold">
              {bike?.name ?? 'Bike'}
              {other?.verified && <BadgeCheck className="size-4 text-teal-300" />}
            </div>
            <p className="truncate text-xs text-muted-foreground">
              {other?.name} · {other?.responseTime ?? 'responds fast'}
            </p>
            {booking && (
              <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                {fmtDate(booking.start)} → {fmtDate(booking.end)} · {inr(booking.total)}
              </p>
            )}
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1.5">
            {booking ? (
              <StatusBadge status={booking.status} />
            ) : (
              <Badge variant="muted">Inquiry</Badge>
            )}
            <button
              onClick={onBack}
              className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-amber-300 hover:bg-white/8 md:hidden"
            >
              <ArrowLeft className="size-3.5" /> Back
            </button>
          </div>
        </div>
      </div>

      {/* messages */}
      <ScrollArea className="flex-1">
        <div className="space-y-2.5 px-3 py-4">
          <div className="flex justify-center">
            <span className="rounded-full bg-white/5 px-3 py-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              {bike?.location} · {bike?.distanceKm} km away
            </span>
          </div>
          {conv.messages.map((m) => (
            <Bubble key={m.id} msg={m} mine={m.fromRole === persona} showReceipt />
          ))}
          <BookingActionCard conv={conv} />
          <div ref={endRef} />
        </div>
      </ScrollArea>

      {/* composer */}
      {!me ? (
        <div className="border-t border-white/8 p-3">
          <div className="flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/4 px-3.5 py-3">
            <p className="text-xs text-muted-foreground">Sign in to join this conversation.</p>
            <Button size="sm" onClick={() => actions.openAuth(true)}>
              Sign in
            </Button>
          </div>
        </div>
      ) : (
        <div className="border-t border-white/8 p-3">
        <div className="mb-2 flex gap-1.5 overflow-x-auto no-scrollbar">
          {QUICK_CHIPS.map((chip) => (
            <button
              key={chip}
              onClick={() => send(chip)}
              className="shrink-0 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-amber-300/40 hover:text-amber-300"
            >
              {chip}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              actions.sendMessage(conv.id, {
                kind: 'photo',
                text: 'Sent a photo',
                attachment: { name: `IMG_${String(Date.now()).slice(-8)}.jpg`, size: '2.4 MB' },
              })
            }}
            className="shrink-0 rounded-xl border border-white/10 bg-white/5 p-2.5 text-muted-foreground transition-colors hover:border-teal-300/40 hover:text-teal-300"
            aria-label="Attach photo"
          >
            <ImagePlus className="size-4.5" />
          </button>
          <button
            onClick={() => {
              actions.sendMessage(conv.id, {
                kind: 'location',
                text: 'Shared a pin for the drop-off point',
                location: { label: `${bike?.location ?? 'Baga'} Beach parking lot`, x: 46, y: 58 },
              })
            }}
            className="shrink-0 rounded-xl border border-white/10 bg-white/5 p-2.5 text-muted-foreground transition-colors hover:border-teal-300/40 hover:text-teal-300"
            aria-label="Share location"
          >
            <MapPin className="size-4.5" />
          </button>
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send(draft)}
            placeholder={mine ? 'Message the host…' : 'Reply to Aarav…'}
            className="flex-1"
          />
          <Button size="icon" onClick={() => send(draft)} aria-label="Send message" disabled={!draft.trim()}>
            <Send className="size-4" />
          </Button>
        </div>
        </div>
      )}
    </div>
  )
}

/* ---------------------------- conversation list ---------------------------- */

function ConvRow({ conv, active }: { conv: Conversation; active: boolean }) {
  const persona = useStore((s) => s.persona)
  const bike = bikeById(useStore((s) => s), conv.bikeId)
  const booking = useStore((s) => s.bookings.find((b) => b.conversationId === conv.id))
  const unread = conv.unread[persona] ?? 0
  const last = conv.messages[conv.messages.length - 1]
  const isMine = last?.fromRole === persona

  const renterName = useStore((s) => userById(s, conv.renterId)?.name)
  const title =
    persona === 'renter'
      ? bike?.name ?? 'Bike'
      : last?.fromRole === 'renter'
        ? renterName ?? 'Renter'
        : bike?.name ?? 'Bike'

  const preview =
    last?.kind === 'system'
      ? 'System update'
      : last?.kind === 'photo'
        ? '📷 Photo'
        : last?.kind === 'location'
          ? '📍 Location pin'
          : last?.text

  return (
    <button
      onClick={() => actions.openConversation(conv.id)}
      className={cn(
        'flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition-all',
        active
          ? 'border-amber-400/40 bg-amber-400/8'
          : 'border-transparent hover:border-white/10 hover:bg-white/5',
      )}
    >
      {bike && <BikePhoto bike={bike} className="size-12 shrink-0" rounded="rounded-lg" />}
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-sm font-semibold">{title}</span>
          <span className="shrink-0 text-[10px] text-muted-foreground">{last ? timeAgo(last.timestamp) : ''}</span>
        </div>
        <div className="mt-0.5 flex items-center justify-between gap-2">
          <span className="truncate text-xs text-muted-foreground">
            {isMine && last?.fromRole !== 'system' ? 'You: ' : ''}
            {preview}
          </span>
          {unread > 0 ? (
            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-amber-400 to-orange-500 text-[10px] font-bold text-[#1c1102]">
              {unread}
            </span>
          ) : booking ? (
            <StatusBadge status={booking.status} className="shrink-0 !px-2 !py-0.5 !text-[9px]" />
          ) : null}
        </div>
      </div>
    </button>
  )
}

/* ---------------------------- module ---------------------------- */

export function ChatModule() {
  const conversations = useStore((s) => s.conversations)
  const persona = useStore((s) => s.persona)
  const me = useStore((s) => currentUser(s))
  const activeId = useStore((s) => s.activeConversationId)

  const visible = conversations
    .filter((c) => {
      if (!me) return false
      if (persona === 'renter') return c.renterId === me.id
      return c.ownerId === me.id
    })
    .sort((a, b) => {
      const at = a.messages[a.messages.length - 1]?.timestamp ?? ''
      const bt = b.messages[b.messages.length - 1]?.timestamp ?? ''
      return bt.localeCompare(at)
    })

  const activeConv = conversationById(useStore((s) => s), activeId)
  const showActive = !!activeConv && visible.some((c) => c.id === activeConv.id)

  return (
    <div className="glass grid h-[calc(100vh-11rem)] grid-cols-1 overflow-hidden rounded-2xl md:grid-cols-[340px_1fr] md:h-[calc(100vh-9.5rem)]">
      {/* list */}
      <div className={cn('flex flex-col border-r border-white/8', showActive && 'hidden md:flex')}>
        <div className="border-b border-white/8 p-4">
          <h2 className="font-heading text-xl font-bold">
            Messages <span className="text-gradient">{visible.length}</span>
          </h2>
          <p className="text-xs text-muted-foreground">
            {persona === 'renter' ? 'Bookings & inquiries' : 'Host inbox'}
          </p>
        </div>
        <ScrollArea className="flex-1">
          <div className="space-y-1 p-3">
            {visible.length === 0 && (
              <div className="flex flex-col items-center gap-2 py-16 text-center">
                <MessageSquare className="size-8 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">
                  {me ? 'No conversations yet' : 'Sign in to see your conversations'}
                </p>
                {!me && (
                  <Button size="sm" variant="outline" onClick={() => actions.openAuth(true)}>
                    Sign in
                  </Button>
                )}
              </div>
            )}
            {visible.map((c) => (
              <ConvRow key={c.id} conv={c} active={showActive && c.id === activeId} />
            ))}
          </div>
        </ScrollArea>
        <div className="border-t border-white/8 p-3">
          <div className="flex items-center gap-2 rounded-xl bg-white/4 px-3 py-2 text-xs text-muted-foreground">
            <Phone className="size-3.5 text-teal-300" />
            Ride emergency? Call <span className="font-semibold text-teal-300">+91 108</span>
          </div>
        </div>
      </div>

      {/* thread */}
      {showActive && activeConv ? (
        <ThreadView conv={activeConv} showOnMobile onBack={() => actions.openConversation(null)} />
      ) : (
        <div className="hidden flex-col items-center justify-center gap-3 text-center md:flex">
          <span className="flex size-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
            <MessageSquare className="size-8 text-muted-foreground/60" />
          </span>
          <p className="text-sm text-muted-foreground">Select a conversation to start chatting</p>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <ArrowRight className="size-3.5" /> Threads stay in sync with booking status
          </div>
        </div>
      )}
    </div>
  )
}
