import * as React from 'react'
import { toast } from 'sonner'
import { Building2, KeyRound, LogOut, Mail, Sparkles, UserRound, UserRoundPlus } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { actions, currentUser, getState, useStore } from '@/store/store'
import { DEMO_HOST_EMAIL, DEMO_RENTER_EMAIL } from '@/store/seed'
import { cn } from '@/lib/utils'
import type { UserRole } from '@/store/types'

const DEMO_PASSWORD = 'demo1234'

/* ------------------------------ AuthDialog ------------------------------ */

const ROLE_OPTS: { key: string; roles: UserRole[]; label: string; desc: string; Icon: typeof UserRound }[] = [
  { key: 'renter', roles: ['renter'], label: 'Renter', desc: 'Rent bikes', Icon: UserRound },
  { key: 'owner', roles: ['owner'], label: 'Host', desc: 'List bikes', Icon: Building2 },
  { key: 'both', roles: ['renter', 'owner'], label: 'Both', desc: 'Do both', Icon: Sparkles },
]

export function AuthDialog() {
  const open = useStore((s) => s.authOpen)
  const [mode, setMode] = React.useState<'signin' | 'signup'>('signin')
  const [name, setName] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [roles, setRoles] = React.useState<UserRole[]>(['renter'])
  const [error, setError] = React.useState<string | null>(null)
  const [busy, setBusy] = React.useState(false)

  React.useEffect(() => {
    if (open) {
      setMode('signin')
      setError(null)
      setBusy(false)
    }
  }, [open])

  const fillDemo = (demoEmail: string) => {
    setMode('signin')
    setEmail(demoEmail)
    setPassword(DEMO_PASSWORD)
    setError(null)
  }

  const submit = async () => {
    setError(null)
    const e = email.trim().toLowerCase()
    if (!/^\S+@\S+\.\S+$/.test(e)) {
      setError('Enter a valid email address.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (mode === 'signup' && name.trim().length < 2) {
      setError('Enter your full name.')
      return
    }
    setBusy(true)
    const res =
      mode === 'signup'
        ? await actions.signUp({ name: name.trim(), email: e, password, roles })
        : await actions.signIn({ email: e, password })
    setBusy(false)
    if (!res.ok) {
      setError(res.error ?? 'Something went wrong. Please try again.')
      return
    }
    const who = currentUser(getState())
    actions.openAuth(false)
    if (mode === 'signup') {
      toast.success(`Account created — welcome, ${who?.name.split(' ')[0] ?? 'rider'}! 🏍️`)
    } else {
      toast.success(`Signed in as ${who?.name ?? email.split('@')[0]}`)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && actions.openAuth(false)}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-b from-amber-400 to-orange-500">
              <KeyRound className="size-4 text-[#1c1102]" />
            </span>
            {mode === 'signin' ? 'Welcome back' : 'Create your account'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'signin'
              ? 'Sign in to keep your bookings, chats and reviews across devices.'
              : 'One account for renting and hosting — pick your roles below.'}
          </DialogDescription>
        </DialogHeader>

        {/* tabs */}
        <div className="grid grid-cols-2 gap-1 rounded-xl border border-white/10 bg-white/5 p-1">
          {(['signin', 'signup'] as const).map((m) => (
            <button
              key={m}
              onClick={() => {
                setMode(m)
                setError(null)
              }}
              className={cn(
                'rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors',
                mode === m
                  ? 'bg-gradient-to-b from-amber-400 to-orange-500 text-[#1c1102]'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {m === 'signin' ? 'Sign in' : 'Create account'}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {mode === 'signup' && (
            <div>
              <Label>Full name</Label>
              <Input
                className="mt-1.5"
                placeholder="e.g. Ishaan Rao"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}

          <div>
            <Label>Email</Label>
            <Input
              className="mt-1.5"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <Label>Password</Label>
            <Input
              className="mt-1.5"
              type="password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !busy && submit()}
            />
          </div>

          {mode === 'signup' && (
            <div>
              <Label className="mb-1.5 block">I am a…</Label>
              <div className="grid grid-cols-3 gap-1.5">
                {ROLE_OPTS.map(({ key, roles: r, label, desc, Icon }) => {
                  const active = roles.length === r.length && roles.every((x) => r.includes(x))
                  return (
                    <button
                      key={key}
                      onClick={() => setRoles(r)}
                      className={cn(
                        'flex flex-col items-center gap-1 rounded-xl border px-2 py-2.5 text-center transition-all',
                        active
                          ? 'border-amber-300 bg-amber-400/12 shadow-[0_0_16px_-6px_rgba(245,165,36,0.5)]'
                          : 'border-white/10 bg-white/4 hover:border-white/25',
                      )}
                    >
                      <Icon className={cn('size-4', active ? 'text-amber-300' : 'text-muted-foreground')} />
                      <span className={cn('text-xs font-semibold', active ? 'text-amber-300' : 'text-foreground')}>{label}</span>
                      <span className="text-[9px] leading-tight text-muted-foreground">{desc}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-red-400/25 bg-red-400/8 px-3 py-2 text-xs font-medium text-red-300">
              {error}
            </div>
          )}

          <Button onClick={submit} disabled={busy} className="w-full">
            {busy
              ? 'Please wait…'
              : mode === 'signin'
                ? 'Sign in'
                : 'Create account'}
          </Button>

          {/* demo accounts */}
          <div className="rounded-xl border border-white/8 bg-white/3 p-3">
            <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Try a demo account (password: demo1234)
            </div>
            <div className="mt-2 grid grid-cols-2 gap-1.5">
              <button
                onClick={() => fillDemo(DEMO_RENTER_EMAIL)}
                className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-[11px] font-medium text-muted-foreground transition-colors hover:border-amber-300/40 hover:text-amber-300"
              >
                <UserRound className="size-3.5" /> Renter · Aarav
              </button>
              <button
                onClick={() => fillDemo(DEMO_HOST_EMAIL)}
                className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-[11px] font-medium text-muted-foreground transition-colors hover:border-teal-300/40 hover:text-teal-300"
              >
                <Building2 className="size-3.5" /> Host · Rhea
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

/* ------------------------------ AccountMenu ------------------------------ */

export function AccountMenu() {
  const me = useStore((s) => currentUser(s))
  const persona = useStore((s) => s.persona)
  const [open, setOpen] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  if (!me) {
    return (
      <Button size="sm" className="gap-1.5" onClick={() => actions.openAuth(true)}>
        <UserRoundPlus className="size-3.5" /> Sign in
      </Button>
    )
  }

  const canSwitch = me.roles.length > 1

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Account menu"
        className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 py-1 pl-1 pr-3 transition-colors hover:bg-white/10"
      >
        <span
          className="flex size-7 items-center justify-center rounded-full text-[11px] font-bold text-white"
          style={{ background: `linear-gradient(135deg, hsl(${me.hue} 80% 55%), hsl(${(me.hue + 40) % 360} 75% 40%))` }}
        >
          {me.initials}
        </span>
        <span className="hidden text-xs font-semibold sm:block">{me.name.split(' ')[0]}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-2xl border border-white/10 bg-[#131927]/95 p-2 shadow-2xl backdrop-blur-xl">
          <div className="border-b border-white/8 px-3 pb-2.5 pt-1.5">
            <div className="truncate text-sm font-bold">{me.name}</div>
            <div className="flex items-center gap-1 truncate text-[11px] text-muted-foreground">
              <Mail className="size-3 shrink-0" />
              <span className="truncate">{me.email}</span>
            </div>
            <div className="mt-1.5 flex gap-1">
              {me.roles.map((r) => (
                <span
                  key={r}
                  className="rounded-full bg-white/8 px-2 py-0.5 text-[10px] font-semibold capitalize text-muted-foreground"
                >
                  {r === 'renter' ? 'Renter' : 'Host'}
                </span>
              ))}
            </div>
          </div>

          {canSwitch && (
            <div className="border-b border-white/8 px-1 py-1.5">
              <div className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Viewing as
              </div>
              {me.roles.map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    actions.switchPersona(r)
                    setOpen(false)
                  }}
                  className={cn(
                    'flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-semibold transition-colors',
                    persona === r ? 'bg-amber-400/15 text-amber-300' : 'text-muted-foreground hover:bg-white/6',
                  )}
                >
                  {r === 'renter' ? <UserRound className="size-3.5" /> : <Building2 className="size-3.5" />}
                  {r === 'renter' ? 'Renter view' : 'Host view'}
                  {persona === r && <span className="ml-auto text-[10px]">●</span>}
                </button>
              ))}
            </div>
          )}

          <button
            onClick={() => {
              actions.signOut()
              setOpen(false)
              toast('Signed out')
            }}
            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-semibold text-red-300 transition-colors hover:bg-red-400/10"
          >
            <LogOut className="size-3.5" /> Sign out
          </button>
        </div>
      )}
    </div>
  )
}
