import { Loader2 } from 'lucide-react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    'bg-emerald-400 text-slate-950 font-semibold hover:bg-emerald-300 active:bg-emerald-400 shadow-sm shadow-emerald-950/20',
  secondary:
    'bg-slate-800 text-slate-100 font-medium hover:bg-slate-700 border border-slate-700/80',
  outline:
    'border border-slate-700 bg-transparent text-slate-200 font-medium hover:border-emerald-400/70 hover:text-white',
  ghost:
    'bg-transparent text-slate-300 font-medium hover:bg-slate-800/80 hover:text-white',
  danger:
    'border border-red-900/70 bg-red-950/60 text-red-200 font-medium hover:bg-red-900/70 hover:text-white',
}

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'min-h-9 px-3.5 py-1.5 text-xs rounded-lg gap-1.5',
  md: 'min-h-10 px-4 py-2 text-sm rounded-xl gap-2',
  lg: 'min-h-11 px-5 py-2.5 text-sm rounded-xl gap-2',
}

export function buttonClasses({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className,
}: {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
  className?: string
} = {}) {
  return cn(
    'inline-flex items-center justify-center whitespace-nowrap shrink-0 transition-colors duration-150',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400',
    'disabled:cursor-not-allowed disabled:opacity-50',
    VARIANT_CLASSES[variant],
    SIZE_CLASSES[size],
    fullWidth && 'w-full',
    className
  )
}

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  fullWidth?: boolean
  iconLeft?: ReactNode
  iconRight?: ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  iconLeft,
  iconRight,
  disabled,
  className,
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={buttonClasses({ variant, size, fullWidth, className })}
      {...props}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      ) : (
        iconLeft
      )}
      <span>{children}</span>
      {!loading && iconRight}
    </button>
  )
}
