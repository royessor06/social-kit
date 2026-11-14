import Link from 'next/link'
import { buttonClasses } from '@/components/ui/Button'
import { cn } from '@/lib/cn'

export type AppHeaderProps = {
  activeNav?: 'home' | 'posters' | 'sites' | 'dashboard' | 'admin'
  user?: {
    name?: string | null
    email?: string | null
    isAdmin?: boolean
  } | null
  rightSlot?: React.ReactNode
}

export function AppHeader({ activeNav, user, rightSlot }: AppHeaderProps) {
  const navItems = [
    { key: 'home', href: '/', label: 'Accueil' },
    { key: 'posters', href: '/templates', label: 'Affiches' },
    { key: 'sites', href: '/site/nouveau', label: 'Sites vitrines' },
    ...(user ? [{ key: 'dashboard', href: '/dashboard', label: 'Mon espace' }] : []),
    ...(user?.isAdmin ? [{ key: 'admin', href: '/admin', label: 'Administration' }] : []),
  ] as const

  return (
    <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-8 gap-y-3 px-4 py-3.5 sm:px-6 lg:flex-nowrap">
        <Link
          href="/"
          className="text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-400"
        >
          SOCIAL KIT
        </Link>

        <nav
          aria-label="Navigation principale"
          className="order-3 flex w-full items-center gap-5 overflow-x-auto border-t border-slate-800/80 pt-2.5 text-sm text-slate-400 lg:order-none lg:w-auto lg:border-0 lg:pt-0"
        >
          {navItems.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className={cn(
                'whitespace-nowrap shrink-0 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-400',
                activeNav === item.key ? 'font-medium text-white' : 'text-slate-400'
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          {rightSlot ? (
            rightSlot
          ) : user ? (
            <Link
              href="/dashboard"
              className={buttonClasses({ variant: 'primary', size: 'sm' })}
            >
              Tableau de bord
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm text-slate-300 transition-colors hover:text-white whitespace-nowrap shrink-0"
              >
                Se connecter
              </Link>
              <Link
                href="/register"
                className={buttonClasses({ variant: 'primary', size: 'sm' })}
              >
                Commencer
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
