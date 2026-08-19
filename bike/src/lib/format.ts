import type { Bike } from '@/store/types'

export const SERVICE_FEE_RATE = 0.08
export const HELMET_COST_PER_DAY = 150

export const inr = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN')

export const dayKey = (iso: string) => iso.slice(0, 10)

export function addDays(iso: string, days: number): string {
  const d = new Date(iso)
  d.setDate(d.getDate() + days)
  return d.toISOString()
}

/** ISO date at a given hour:minute (local) — safe for seeds & pickers. */
export function atDay(offset: number, hour = 12, minute = 0): string {
  const d = new Date()
  d.setDate(d.getDate() + offset)
  d.setHours(hour, minute, 0, 0)
  return d.toISOString()
}

export function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

export function fmtDateYear(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })
}

export function fmtDateTime(iso: string): string {
  return `${fmtDate(iso)} · ${fmtTime(iso)}`
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'now'
  if (mins < 60) return `${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d`
  return fmtDate(iso)
}

/** Whole-day count between two ISO dates, min 1. */
export function dayDiff(a: string, b: string): number {
  const ms = new Date(b).getTime() - new Date(a).getTime()
  return Math.max(1, Math.round(ms / 86_400_000))
}

export function isBeforeToday(iso: string): boolean {
  return dayKey(iso) < dayKey(new Date().toISOString())
}

export interface PriceBreakdown {
  days: number
  subtotal: number
  deposit: number
  fee: number
  helmetCost: number
  total: number
}

export function calcBreakdown(bike: Pick<Bike, 'ratePerDay' | 'securityDeposit'>, start: string, end: string, helmet: boolean): PriceBreakdown {
  const days = dayDiff(start, end)
  const subtotal = bike.ratePerDay * days
  const fee = Math.round(subtotal * SERVICE_FEE_RATE)
  const helmetCost = helmet ? HELMET_COST_PER_DAY * days : 0
  const total = subtotal + bike.securityDeposit + fee + helmetCost
  return { days, subtotal, deposit: bike.securityDeposit, fee, helmetCost, total }
}

export const TIME_SLOTS = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00']
