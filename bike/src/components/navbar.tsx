import * as React from 'react'
import { Link, useRouterState } from '@tanstack/react-router'
import { toast } from 'sonner'
import { Bell, Bike, Building2, LayoutGrid, LogOut, Map as MapIcon, MessagesSquare, Navigation, UserRound } from 'lucide-react'
import { actions, currentUser, unreadTotalFor, useStore } from '@/store/store'
import { AccountMenu } from '@/components/auth'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { to: '/', label: 'Marketplace', Icon: LayoutGrid },
  { to: '/messages', label: 'Messages', Icon: MessagesSquare },
] as const

export function NotificationBell() {
  const unread = unreadTotalFor(useStore((s) => s))
  return (
    <button
      className="relative rounded-full border border-white/10 bg-white/5 p-2.5 text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
      aria-label={`Notifications, ${unread} unread`}
    >
      <Bell className="size-4.5" />
      {unread > 0 && (
        <span className="absolute -right-1 -top-1 flex min-w-5 items-center justify-center rounded-full bg-gradient-to-b from-amber-400 to-orange-500 px-1 text-[10px] font-bold text-[#1c1102] shadow-[0_2px_10px_rgba(245,165,36,0.6)]">
          {unread > 9 ? '9+' : unread}
        </span>
      )}
    </button>
  )
}

export function Navbar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const persona = useStore((s) => s.persona)

  const items = [
    ...NAV_ITEMS,
    persona === 'renter'
      ? ({ to: '/trips', label: 'My Trips', Icon: Navigation } as const)
      : ({ to: '/host', label: 'Host Studio', Icon: MapIcon } as const),
  ]

  return (
    <header className="sticky top-0 z-40">
      <div className="glass-strong border-x-0 border-t-0">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
          <Link to="/" className="group flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-b from-amber-400 to-orange-500 shadow-[0_6px_20px_-6px_rgba(245,165,36,0.7)] transition-transform group-hover:rotate-[-6deg]">
              <Bike className="size-5 text-[#1c1102]" />
            </span>
            <span className="hidden flex-col leading-none sm:flex">
              <span className="font-heading text-lg font-bold tracking-tight">
                ride<span className="text-gradient">goa</span>
              </span>
              <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                two wheels · one coast
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {items.map(({ to, label, Icon }) => {
              const active = to === '/' ? pathname === '/' : pathname.startsWith(to)
              return (
                <Link
                  key={to}
                  to={to}
                  className={cn(
                    'flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-medium transition-colors',
                    active ? 'bg-amber-400/12 text-amber-300' : 'text-muted-foreground hover:bg-white/6 hover:text-foreground',
                  )}
                >
                  <Icon className="size-4" />
                  {label}
                </Link>
              )
            })}
          </nav>

          <div className="flex items-center gap-2.5">
            <NotificationBell />
            <AccountMenu />
          </div>
        </div>
      </div>
    </header>
  )
}

export function MobileNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const persona = useStore((s) => s.persona)
  const me = useStore((s) => currentUser(s))
  const unread = unreadTotalFor(useStore((s) => s))
  const [menuOpen, setMenuOpen] = React.useState(false)
  const menuRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!menuOpen) return
    const onDoc = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [menuOpen])

  const items = [
    ...NAV_ITEMS,
    persona === 'renter'
      ? ({ to: '/trips', label: 'Trips', Icon: Navigation } as const)
      : ({ to: '/host', label: 'Host', Icon: MapIcon } as const),
  ]

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#0d1120]/90 backdrop-blur-xl md:hidden">
      <div className="mx-auto flex max-w-md items-stretch justify-around px-2 py-1.5">
        {items.map(({ to, label, Icon }) => {
          const active = to === '/' ? pathname === '/' : pathname.startsWith(to)
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                'relative flex flex-1 flex-col items-center gap-0.5 rounded-xl px-2 py-2 text-[10px] font-semibold transition-colors',
                active ? 'text-amber-300' : 'text-muted-foreground',
              )}
            >
              <Icon className="size-5" />
              {label}
              {to === '/messages' && unread > 0 && (
                <span className="absolute right-[22%] top-1 flex size-4 items-center justify-center rounded-full bg-gradient-to-b from-amber-400 to-orange-500 text-[9px] font-bold text-[#1c1102]">
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
              {active && <span className="absolute -bottom-px h-0.5 w-8 rounded-full bg-gradient-to-r from-amber-400 to-orange-500" />}
            </Link>
          )
        })}
        {me ? (
          <div ref={menuRef} className="relative flex flex-1 items-center justify-center">
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="flex flex-col items-center gap-0.5 rounded-xl px-2 py-2 text-[10px] font-semibold text-muted-foreground"
            >
              <span
                className="flex size-5 items-center justify-center rounded-full text-[9px] font-bold text-white"
                style={{ background: `linear-gradient(135deg, hsl(${me.hue} 80% 55%), hsl(${(me.hue + 40) % 360} 75% 40%))` }}
              >
                {me.initials}
              </span>
              {persona === 'renter' ? 'Renter' : 'Host'}
            </button>
            {menuOpen && (
              <div className="absolute bottom-full right-0 z-50 mb-2 w-52 overflow-hidden rounded-2xl border border-white/10 bg-[#131927]/95 p-2 shadow-2xl backdrop-blur-xl">
                <div className="border-b border-white/8 px-3 pb-2 pt-1">
                  <div className="truncate text-xs font-bold">{me.name}</div>
                  <div className="truncate text-[10px] text-muted-foreground">{me.email}</div>
                </div>
                {me.roles.length > 1 && (
                  <div className="border-b border-white/8 px-1 py-1.5">
                    {me.roles.map((r) => (
                      <button
                        key={r}
                        onClick={() => {
                          actions.switchPersona(r)
                          setMenuOpen(false)
                        }}
                        className={cn(
                          'flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-semibold',
                          persona === r ? 'bg-amber-400/15 text-amber-300' : 'text-muted-foreground',
                        )}
                      >
                        {r === 'renter' ? <UserRound className="size-3.5" /> : <Building2 className="size-3.5" />}
                        {r === 'renter' ? 'Renter view' : 'Host view'}
                      </button>
                    ))}
                  </div>
                )}
                <button
                  onClick={() => {
                    actions.signOut()
                    setMenuOpen(false)
                    toast('Signed out')
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-semibold text-red-300"
                >
                  <LogOut className="size-3.5" /> Sign out
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => actions.openAuth(true)}
            className="flex flex-1 flex-col items-center gap-0.5 rounded-xl px-2 py-2 text-[10px] font-semibold text-muted-foreground"
          >
            <UserRound className="size-5" />
            Sign in
          </button>
        )}
      </div>
    </nav>
  )
}
