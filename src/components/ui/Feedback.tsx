import { AlertCircle, CheckCircle2, Info, Loader2 } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

export type AlertVariant = 'error' | 'success' | 'info' | 'warning'

const ALERT_STYLES: Record<
  AlertVariant,
  { container: string; Icon: typeof AlertCircle; role: 'alert' | 'status' }
> = {
  error: {
    container: 'border-red-900/80 bg-red-950/60 text-red-200',
    Icon: AlertCircle,
    role: 'alert',
  },
  success: {
    container: 'border-emerald-900/80 bg-emerald-950/50 text-emerald-200',
    Icon: CheckCircle2,
    role: 'status',
  },
  warning: {
    container: 'border-amber-800/80 bg-amber-950/50 text-amber-200',
    Icon: AlertCircle,
    role: 'status',
  },
  info: {
    container: 'border-slate-700 bg-slate-900 text-slate-200',
    Icon: Info,
    role: 'status',
  },
}

export function Alert({
  variant = 'info',
  title,
  children,
  action,
  className,
}: {
  variant?: AlertVariant
  title?: string
  children: ReactNode
  action?: ReactNode
  className?: string
}) {
  const { container, Icon, role } = ALERT_STYLES[variant]

  return (
    <div
      role={role}
      className={cn(
        'flex flex-col gap-3 rounded-xl border p-4 text-sm sm:flex-row sm:items-start sm:justify-between',
        container,
        className
      )}
    >
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <div className="space-y-1">
          {title && <p className="font-semibold">{title}</p>}
          <div className="leading-relaxed opacity-95">{children}</div>
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: ReactNode
  title: string
  description: string
  action?: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/60 px-6 py-14 text-center',
        className
      )}
    >
      {icon && (
        <div
          className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-slate-800 bg-slate-950 text-slate-300"
          aria-hidden="true"
        >
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-400">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}

export function LoadingState({
  label = 'Chargement…',
  className,
}: {
  label?: string
  className?: string
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'flex min-h-[260px] flex-col items-center justify-center gap-3 text-sm text-slate-400',
        className
      )}
    >
      <Loader2 className="h-6 w-6 animate-spin text-emerald-400" aria-hidden="true" />
      <span>{label}</span>
    </div>
  )
}

export function SkeletonCard() {
  return (
    <div
      aria-hidden="true"
      className="animate-pulse overflow-hidden rounded-xl border border-slate-800 bg-slate-900/75"
    >
      <div className="h-52 bg-slate-800/70" />
      <div className="space-y-3 p-5">
        <div className="h-3 w-28 rounded bg-slate-800" />
        <div className="h-5 w-44 rounded bg-slate-800" />
        <div className="h-3 w-full rounded bg-slate-800/80" />
        <div className="h-3 w-4/5 rounded bg-slate-800/80" />
        <div className="flex gap-2 pt-3">
          <div className="h-9 flex-1 rounded-lg bg-slate-800" />
          <div className="h-9 flex-1 rounded-lg bg-slate-800" />
        </div>
      </div>
    </div>
  )
}
