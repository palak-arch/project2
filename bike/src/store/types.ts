export type PersonaId = 'renter' | 'owner'
export type UserRole = PersonaId
export type BikeCategory = 'scooter' | 'cruiser' | 'sports' | 'adventure' | 'vintage' | 'electric'
export type BookingStatus = 'Pending' | 'Confirmed' | 'Active' | 'Completed' | 'Declined'
export type Transmission = 'Automatic' | 'Manual'
export type MessageKind = 'text' | 'photo' | 'location' | 'system'

export interface User {
  id: string
  email: string
  name: string
  initials: string
  hue: number
  verified: boolean
  roles: UserRole[]
  passwordHash: string
  memberSince: string
  city?: string
  responseTime?: string
  rating?: number
  reviews?: number
  phone?: string
  tagline?: string
}

export interface Owner {
  id: string
  name: string
  initials: string
  verified: boolean
  responseTime: string
  rating: number
  reviews: number
  memberSince: string
  phone: string
  tagline: string
  hue: number
}

export interface Bike {
  id: string
  name: string
  category: BikeCategory
  brand: string
  model: string
  year: number
  cc: number
  transmission: Transmission
  mileage: string
  ratePerDay: number
  ratePerHour: number
  securityDeposit: number
  helmetIncluded: boolean
  gearIncluded: boolean
  location: string
  mapPos: { x: number; y: number }
  distanceKm: number
  rating: number
  reviews: number
  ownerId: string
  description: string
  rentalRules: string[]
  features: string[]
  blockedDates: string[]
  available: boolean
  tripsCompleted: number
  listedAt: string
  tone: number
  photo?: string
  photoUrl?: string
}

export interface Message {
  id: string
  fromRole: PersonaId | 'system'
  fromId: string
  kind: MessageKind
  text: string
  timestamp: string
  read: boolean
  readByOther: boolean
  attachment?: { name: string; size: string }
  location?: { label: string; x: number; y: number }
}

export interface Conversation {
  id: string
  bikeId: string
  bookingId?: string
  renterId: string
  ownerId: string
  messages: Message[]
  unread: Record<PersonaId, number>
}

export interface ExtensionRequest {
  id: string
  days: number
  note: string
  status: 'Pending' | 'Accepted' | 'Declined'
  at: string
}

export interface HandoverData {
  bodyItems: { label: string; checked: boolean }[]
  fuelLevel: number
  odometer: number
  photo?: string
  signature?: string
  at: string
}

export interface BookingReview {
  rating: number
  comment: string
  at: string
  by?: string
}

export interface Booking {
  id: string
  bikeId: string
  renterId: string
  ownerId: string
  status: BookingStatus
  start: string
  end: string
  pickupTime: string
  dropoffTime: string
  days: number
  dailyRate: number
  securityDeposit: number
  serviceFee: number
  helmetAddon: boolean
  helmetCost: number
  total: number
  conversationId: string
  createdAt: string
  handover?: HandoverData
  extension?: ExtensionRequest
  review?: BookingReview
}

export interface ListingDraft {
  name: string
  brand: string
  model: string
  category: BikeCategory
  year: number
  cc: number
  transmission: Transmission
  ratePerDay: number
  ratePerHour: number
  securityDeposit: number
  helmetIncluded: boolean
  gearIncluded: boolean
  location: string
  distanceKm: number
  description: string
  rentalRules: string[]
  tone: number
}

export interface StoreState {
  persona: PersonaId
  bikes: Bike[]
  owners: Owner[]
  users: User[]
  currentUserId: string | null
  authOpen: boolean
  bookings: Booking[]
  conversations: Conversation[]
  savedByUser: Record<string, string[]>
  activeBikeId: string | null
  activeConversationId: string | null
  handoverBookingId: string | null
}
