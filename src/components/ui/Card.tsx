import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

export function Card({
  interactive = false,
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement> & { interactive?: boolean }) {
  return (
    <div
      className={cn(
        'rounded-xl border border-slate-800 bg-slate-900/75',
        interactive && 'transition-colors duration-150 hover:border-slate-600',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('px-5 pt-5', className)} {...props}>
      {children}
    </div>
  )
}

export function CardContent({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('p-5', className)} {...props}>
      {children}
    </div>
  )
}

export function CardFooter({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('border-t border-slate-800/80 px-5 py-4', className)}
      {...props}
    >
      {children}
    </div>
  )
}
