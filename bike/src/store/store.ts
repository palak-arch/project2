import { useSyncExternalStore } from 'react'
import {
  DEMO_PASSWORDS,
  seedBikes,
  seedBookings,
  seedConversations,
  seedOwners,
  seedUsers,
} from './seed'
import type {
  Bike,
  Booking,
  Conversation,
  HandoverData,
  ListingDraft,
  Message,
  Owner,
  PersonaId,
  StoreState,
  User,
  UserRole,
} from './types'
import { calcBreakdown } from '@/lib/format'

const KEY = 'ride-goa-store-v1'

function makeInitialState(): StoreState {
  return {
    persona: 'renter',
    bikes: seedBikes,
    owners: seedOwners,
    users: seedUsers,
    currentUserId: null,
    authOpen: false,
    bookings: seedBookings,
    conversations: seedConversations,
    savedByUser: { 'u-aarav': ['b-baga-classic'] },
    activeBikeId: null,
    activeConversationId: 'con-2',
    handoverBookingId: null,
  }
}

let state: StoreState = makeInitialState()
let hydrated = false
const listeners = new Set<() => void>()

const emit = () => listeners.forEach((l) => l())
const persist = () => {
  if (typeof window === 'undefined') return
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    /* ignore quota errors */
  }
}

function setState(patch: Partial<StoreState>) {
  state = { ...state, ...patch }
  persist()
  emit()
}

function hydrate() {
  if (hydrated || typeof window === 'undefined') return
  hydrated = true
  try {
    const raw = window.sessionStorage.getItem(KEY)
    if (!raw) return
    const saved = JSON.parse(raw) as Partial<StoreState>
    if (!saved || !saved.bikes) return
    // Guarantee the seeded accounts exist even if the session predates auth.
    const users = [...(saved.users ?? [])]
    for (const su of seedUsers) {
      if (!users.some((u) => u.id === su.id)) users.push(su)
    }
    state = {
      ...state,
      ...saved,
      owners: saved.owners ?? state.owners,
      bikes: saved.bikes,
      bookings: saved.bookings ?? state.bookings,
      conversations: saved.conversations ?? state.conversations,
      users,
      currentUserId: saved.currentUserId ?? null,
      savedByUser: saved.savedByUser ?? state.savedByUser,
      authOpen: false,
    }
    emit()
  } catch {
    /* ignore corrupt session data */
  }
}

export function subscribe(cb: () => void) {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

export function getState(): StoreState {
  return state
}

export function useStore<T>(selector: (s: StoreState) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => selector(state),
    () => selector(state),
  )
}

const uid = (p: string) => `${p}-${Math.random().toString(36).slice(2, 9)}`

/* ------------------------------------------------------------------ */
/* auth primitives                                                     */
/* ------------------------------------------------------------------ */

const initialsOf = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

/** SHA-256 with a static salt; falls back to a deterministic FNV-1a hash (demo only). */
async function hashPassword(pw: string): Promise<string> {
  try {
    if (typeof crypto !== 'undefined' && crypto.subtle) {
      const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`ridegoa::${pw}`))
      return 'sha256-' + Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('')
    }
  } catch {
    /* fall through to fallback hash */
  }
  let h = 0x811c9dc5
  const s = `ridegoa::${pw}`
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return 'fnv1a-' + (h >>> 0).toString(16)
}

let seedHashPromise: Promise<void> | null = null

/**
 * Seeded demo accounts ship with an empty hash; compute it once on the client
 * so `signIn` can compare against real hashes. Idempotent and awaited by signIn.
 */
export function ensureSeedHashes(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve()
  if (!seedHashPromise) {
    seedHashPromise = (async () => {
      const missing = state.users.filter((u) => !u.passwordHash && DEMO_PASSWORDS[u.id])
      if (missing.length === 0) return
      const fixed = await Promise.all(
        missing.map(async (u) => ({ ...u, passwordHash: await hashPassword(DEMO_PASSWORDS[u.id]) })),
      )
      setState({ users: state.users.map((u) => fixed.find((f) => f.id === u.id) ?? u) })
    })().catch(() => {
      seedHashPromise = null // allow retry on transient failure
    })
  }
  return seedHashPromise
}

function ensureOwnerInOwners(owners: Owner[], u: User): Owner[] {
  if (owners.some((o) => o.id === u.id)) return owners
  const owner: Owner = {
    id: u.id,
    name: u.name,
    initials: u.initials,
    verified: u.verified,
    responseTime: '~1 hr',
    rating: 5,
    reviews: 0,
    memberSince: u.memberSince,
    phone: u.phone ?? '',
    tagline: u.tagline ?? 'New host on ridegoa.',
    hue: u.hue,
  }
  return [...owners, owner]
}

/* ------------------------------------------------------------------ */
/* helpers                                                             */
/* ------------------------------------------------------------------ */

export const bikeById = (s: StoreState, id: string | null | undefined): Bike | undefined =>
  id ? s.bikes.find((b) => b.id === id) : undefined
export const ownerById = (s: StoreState, id: string | null | undefined) =>
  id ? s.owners.find((o) => o.id === id) ?? s.users.find((u) => u.id === id) : undefined
export const userById = (s: StoreState, id: string | null | undefined): User | undefined =>
  id ? s.users.find((u) => u.id === id) : undefined
export const currentUser = (s: StoreState): User | undefined =>
  s.currentUserId ? s.users.find((u) => u.id === s.currentUserId) : undefined
export const bookingById = (s: StoreState, id: string | null | undefined) =>
  id ? s.bookings.find((b) => b.id === id) : undefined
export const conversationById = (s: StoreState, id: string | null | undefined) =>
  id ? s.conversations.find((c) => c.id === id) : undefined

export const unreadTotalFor = (s: StoreState): number => {
  const me = currentUser(s)
  if (!me) return 0
  let total = 0
  for (const role of me.roles) {
    total += s.conversations.reduce((acc, c) => acc + (c.unread[role] ?? 0), 0)
  }
  total += s.bookings.filter((b) => b.status === 'Pending' && b.ownerId === me.id).length
  return total
}

/* ------------------------------------------------------------------ */
/* actions                                                             */
/* ------------------------------------------------------------------ */

export const actions = {
  openAuth(open: boolean) {
    setState({ authOpen: open })
  },

  switchPersona(p: PersonaId) {
    hydrate()
    const me = currentUser(state)
    if (me && !me.roles.includes(p)) return
    setState({ persona: p })
  },

  async signUp(opts: { name: string; email: string; password: string; roles: UserRole[] }): Promise<{ ok: boolean; error?: string }> {
    hydrate()
    const email = opts.email.trim().toLowerCase()
    if (state.users.some((u) => u.email === email)) {
      return { ok: false, error: 'An account with this email already exists.' }
    }
    const id = uid('u')
    const user: User = {
      id,
      email,
      name: opts.name.trim(),
      initials: initialsOf(opts.name),
      hue: Math.floor(Math.random() * 360),
      verified: true,
      roles: opts.roles,
      passwordHash: await hashPassword(opts.password),
      memberSince: String(new Date().getFullYear()),
    }
    const owners = opts.roles.includes('owner') ? ensureOwnerInOwners(state.owners, user) : state.owners
    setState({
      users: [...state.users, user],
      owners,
      currentUserId: id,
      persona: opts.roles[0],
      activeConversationId: null,
    })
    return { ok: true }
  },

  async signIn(opts: { email: string; password: string }): Promise<{ ok: boolean; error?: string }> {
    hydrate()
    await ensureSeedHashes()
    const email = opts.email.trim().toLowerCase()
    const user = state.users.find((u) => u.email === email)
    if (!user) return { ok: false, error: 'No account found with that email.' }
    if (user.passwordHash !== (await hashPassword(opts.password))) {
      return { ok: false, error: 'Incorrect password. Please try again.' }
    }
    setState({ currentUserId: user.id, persona: user.roles[0], activeConversationId: null })
    return { ok: true }
  },

  signOut() {
    setState({ currentUserId: null, persona: 'renter', activeConversationId: null, activeBikeId: null })
  },

  openBike(id: string | null) {
    setState({ activeBikeId: id })
  },

  openConversation(id: string | null) {
    if (id) {
      // mark read for acting persona before opening
      const c = conversationById(state, id)
      if (c) {
        const mine = state.persona
        const messages = c.messages.map((m) => ({
          ...m,
          read: m.fromRole !== mine ? true : m.read,
          readByOther: m.fromRole === mine ? true : m.readByOther,
        }))
        setState({
          activeConversationId: id,
          conversations: state.conversations.map((x) =>
            x.id === id ? { ...x, messages, unread: { ...x.unread, [mine]: 0 } } : x,
          ),
        })
        return
      }
    }
    setState({ activeConversationId: id })
  },

  openHandover(bookingId: string | null) {
    setState({ handoverBookingId: bookingId })
  },

  toggleSaveBike(bikeId: string) {
    const me = currentUser(state)
    if (!me) return
    const mine = state.savedByUser[me.id] ?? []
    const has = mine.includes(bikeId)
    setState({
      savedByUser: {
        ...state.savedByUser,
        [me.id]: has ? mine.filter((id) => id !== bikeId) : [...mine, bikeId],
      },
    })
  },

  requestBooking(opts: { bikeId: string; start: string; end: string; pickupTime: string; dropoffTime: string; helmet: boolean }) {
    const me = currentUser(state)
    if (!me) return null
    const bike = bikeById(state, opts.bikeId)
    if (!bike) return null
    const br = calcBreakdown(bike, opts.start, opts.end, opts.helmet)
    const bookingId = uid('bk')
    const conversationId = uid('con')
    const booking: Booking = {
      id: bookingId,
      bikeId: bike.id,
      renterId: me.id,
      ownerId: bike.ownerId,
      status: 'Pending',
      start: opts.start,
      end: opts.end,
      pickupTime: opts.pickupTime,
      dropoffTime: opts.dropoffTime,
      days: br.days,
      dailyRate: bike.ratePerDay,
      securityDeposit: br.deposit,
      serviceFee: br.fee,
      helmetAddon: opts.helmet,
      helmetCost: br.helmetCost,
      total: br.total,
      conversationId,
      createdAt: new Date().toISOString(),
    }
    const thread: Conversation = {
      id: conversationId,
      bikeId: bike.id,
      bookingId,
      renterId: me.id,
      ownerId: bike.ownerId,
      unread: { renter: 0, owner: 1 },
      messages: [
        {
          id: uid('m'),
          fromRole: 'renter',
          fromId: me.id,
          kind: 'text',
          text: `Hi! I've sent a booking request for the ${bike.name} — ${br.days} day${br.days > 1 ? 's' : ''} starting ${new Date(opts.start).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}. Please confirm whenever you can.`,
          timestamp: new Date().toISOString(),
          read: false,
          readByOther: false,
        },
      ],
    }
    setState({
      bookings: [booking, ...state.bookings],
      conversations: [thread, ...state.conversations],
      activeConversationId: conversationId,
    })
    return { bookingId, conversationId }
  },

  approveBooking(bookingId: string) {
    const b = bookingById(state, bookingId)
    if (!b) return
    const sys: Message = {
      id: uid('m'),
      fromRole: 'system',
      fromId: 'system',
      kind: 'system',
      text: `Booking ${bookingId} was approved by the host. Rental starts at ${b.pickupTime}.`,
      timestamp: new Date().toISOString(),
      read: false,
      readByOther: false,
    }
    setState({
      bookings: state.bookings.map((x) => (x.id === bookingId ? { ...x, status: 'Confirmed' } : x)),
      conversations: state.conversations.map((x) =>
        x.id === b.conversationId
          ? {
              ...x,
              messages: [...x.messages, sys],
              unread: { ...x.unread, renter: (x.unread.renter ?? 0) + 1 },
            }
          : x,
      ),
    })
  },

  declineBooking(bookingId: string) {
    const b = bookingById(state, bookingId)
    if (!b) return
    const sys: Message = {
      id: uid('m'),
      fromRole: 'system',
      fromId: 'system',
      kind: 'system',
      text: `Booking ${bookingId} was declined by the host. No charges apply.`,
      timestamp: new Date().toISOString(),
      read: false,
      readByOther: false,
    }
    setState({
      bookings: state.bookings.map((x) => (x.id === bookingId ? { ...x, status: 'Declined' } : x)),
      conversations: state.conversations.map((x) =>
        x.id === b.conversationId
          ? {
              ...x,
              messages: [...x.messages, sys],
              unread: { ...x.unread, renter: (x.unread.renter ?? 0) + 1 },
            }
          : x,
      ),
    })
  },

  confirmHandover(bookingId: string, handover: Omit<HandoverData, 'at'>) {
    const b = bookingById(state, bookingId)
    if (!b) return
    const data: HandoverData = { ...handover, at: new Date().toISOString() }
    const sys: Message = {
      id: uid('m'),
      fromRole: 'system',
      fromId: 'system',
      kind: 'system',
      text: `Handover complete — rental is now active. Fuel ${data.fuelLevel}% · Odometer ${data.odometer.toLocaleString('en-IN')} km · Signature captured. Ride safe!`,
      timestamp: data.at,
      read: false,
      readByOther: false,
    }
    setState({
      bookings: state.bookings.map((x) => (x.id === bookingId ? { ...x, status: 'Active', handover: data } : x)),
      conversations: state.conversations.map((x) =>
        x.id === b.conversationId
          ? {
              ...x,
              messages: [...x.messages, sys],
              unread: { ...x.unread, owner: (x.unread.owner ?? 0) + 1 },
            }
          : x,
      ),
    })
  },

  requestExtension(bookingId: string, days: number, note: string) {
    const b = bookingById(state, bookingId)
    if (!b) return
    const me = currentUser(state)
    const ext = {
      id: uid('ext'),
      days,
      note,
      status: 'Pending' as const,
      at: new Date().toISOString(),
    }
    const sys: Message = {
      id: uid('m'),
      fromRole: 'renter',
      fromId: me?.id ?? 'system',
      kind: 'text',
      text: `Requesting an extension of ${days} day${days > 1 ? 's' : ''}: ${note}`,
      timestamp: ext.at,
      read: false,
      readByOther: false,
    }
    setState({
      bookings: state.bookings.map((x) => (x.id === bookingId ? { ...x, extension: ext } : x)),
      conversations: state.conversations.map((x) =>
        x.id === b.conversationId
          ? {
              ...x,
              messages: [...x.messages, sys],
              unread: { ...x.unread, owner: (x.unread.owner ?? 0) + 1 },
            }
          : x,
      ),
    })
  },

  respondExtension(bookingId: string, accept: boolean) {
    const b = bookingById(state, bookingId)
    if (!b?.extension || b.extension.status !== 'Pending') return
    const ext = { ...b.extension, status: accept ? ('Accepted' as const) : ('Declined' as const) }
    const sys: Message = {
      id: uid('m'),
      fromRole: 'system',
      fromId: 'system',
      kind: 'system',
      text: accept
        ? `Extension of ${b.extension.days} day${b.extension.days > 1 ? 's' : ''} accepted. New drop-off ${new Date(
            new Date(b.end).getTime() + b.extension.days * 86_400_000,
          ).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}.`
        : `Extension request declined by the host. Original drop-off stands.`,
      timestamp: new Date().toISOString(),
      read: false,
      readByOther: false,
    }
    let booking: Booking = { ...b, extension: ext }
    if (accept) {
      const extra = b.dailyRate * b.extension.days
      const extraFee = Math.round(extra * 0.08)
      booking = {
        ...booking,
        end: new Date(new Date(b.end).getTime() + b.extension.days * 86_400_000).toISOString(),
        days: b.days + b.extension.days,
        total: b.total + extra + extraFee,
        serviceFee: b.serviceFee + extraFee,
      }
    }
    setState({
      bookings: state.bookings.map((x) => (x.id === bookingId ? booking : x)),
      conversations: state.conversations.map((x) =>
        x.id === b.conversationId
          ? {
              ...x,
              messages: [...x.messages, sys],
              unread: { ...x.unread, renter: (x.unread.renter ?? 0) + 1 },
            }
          : x,
      ),
    })
  },

  sendMessage(conversationId: string, msg: { kind: Message['kind']; text: string; attachment?: { name: string; size: string }; location?: { label: string; x: number; y: number } }) {
    const c = conversationById(state, conversationId)
    if (!c) return
    const me = currentUser(state)
    if (!me) return
    const mine = state.persona
    // Only participants may write to a thread.
    if (mine === 'renter' && c.renterId !== me.id) return
    if (mine === 'owner' && c.ownerId !== me.id) return
    const message: Message = {
      id: uid('m'),
      fromRole: mine,
      fromId: me.id,
      kind: msg.kind,
      text: msg.text,
      timestamp: new Date().toISOString(),
      read: false,
      readByOther: false,
      attachment: msg.attachment,
      location: msg.location,
    }
    const other: PersonaId = mine === 'renter' ? 'owner' : 'renter'
    setState({
      conversations: state.conversations.map((x) =>
        x.id === conversationId
          ? {
              ...x,
              messages: [...x.messages, message],
              unread: { ...x.unread, [other]: (x.unread[other] ?? 0) + 1 },
            }
          : x,
      ),
    })
  },

  openChatForBike(bikeId: string): string | null {
    const me = currentUser(state)
    if (!me) return null
    const existing = state.conversations.find((c) => c.bikeId === bikeId && c.renterId === me.id)
    if (existing) {
      actions.openConversation(existing.id)
      return existing.id
    }
    const bike = bikeById(state, bikeId)
    if (!bike) return null
    const conversationId = uid('con')
    const thread: Conversation = {
      id: conversationId,
      bikeId,
      renterId: me.id,
      ownerId: bike.ownerId,
      unread: { renter: 0, owner: 0 },
      messages: [],
    }
    setState({ conversations: [thread, ...state.conversations] })
    actions.openConversation(conversationId)
    return conversationId
  },

  toggleBikeAvailability(bikeId: string) {
    setState({
      bikes: state.bikes.map((b) => (b.id === bikeId ? { ...b, available: !b.available } : b)),
    })
  },

  publishListing(draft: ListingDraft): string {
    const me = currentUser(state)
    if (!me) return ''
    const id = uid('b')
    const bike: Bike = {
      id,
      name: draft.name,
      category: draft.category,
      brand: draft.brand,
      model: draft.model,
      year: draft.year,
      cc: draft.cc,
      transmission: draft.transmission,
      mileage: draft.cc === 0 ? '—' : `${Math.round(60 - draft.cc / 40)} km/l`,
      ratePerDay: draft.ratePerDay,
      ratePerHour: draft.ratePerHour,
      securityDeposit: draft.securityDeposit,
      helmetIncluded: draft.helmetIncluded,
      gearIncluded: draft.gearIncluded,
      location: draft.location,
      mapPos: { x: 30 + ((id.length % 5) * 8), y: 20 + ((id.length % 7) * 9) },
      distanceKm: draft.distanceKm,
      rating: 5,
      reviews: 0,
      ownerId: me.id,
      description: draft.description,
      rentalRules: draft.rentalRules,
      features: ['Freshly serviced', 'Helmets included', '24×7 road support'],
      blockedDates: [],
      available: true,
      tripsCompleted: 0,
      listedAt: new Date().toISOString(),
      tone: draft.tone,
    }
    setState({ bikes: [bike, ...state.bikes], owners: ensureOwnerInOwners(state.owners, me) })
    return id
  },

  addReview(bookingId: string, rating: number, comment: string) {
    const me = currentUser(state)
    setState({
      bookings: state.bookings.map((x) =>
        x.id === bookingId ? { ...x, review: { rating, comment, at: new Date().toISOString(), by: me?.id } } : x,
      ),
    })
  },
}

export function hydrateOnMount() {
  hydrate()
  void ensureSeedHashes()
}
