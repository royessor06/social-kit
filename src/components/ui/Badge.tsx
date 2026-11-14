import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

export type BadgeVariant = 'neutral' | 'accent' | 'success' | 'warning' | 'danger'

const BADGE_CLASSES: Record<BadgeVariant, string> = {
  neutral: 'border-slate-700 bg-slate-800/80 text-slate-200',
  accent: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
  success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
  warning: 'border-amber-500/30 bg-amber-500/10 text-amber-200',
  danger: 'border-red-500/30 bg-red-500/10 text-red-200',
}

export function Badge({
  variant = 'neutral',
  className,
  children,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { variant?: BadgeVariant }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap',
        BADGE_CLASSES[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}
