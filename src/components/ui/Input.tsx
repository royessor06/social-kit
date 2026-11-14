import { useId } from 'react'
import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react'
import { cn } from '@/lib/cn'

type FieldShellProps = {
  id: string
  label?: string
  hint?: string
  error?: string
  required?: boolean
  children: ReactNode
}

function FieldShell({ id, label, hint, error, required, children }: FieldShellProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-slate-200">
          {label}
          {required && (
            <span className="ml-1 text-emerald-400" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="text-xs text-slate-400">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-xs text-red-300">
          {error}
        </p>
      )}
    </div>
  )
}

const baseControlClasses =
  'w-full rounded-xl border border-slate-700/90 bg-slate-950 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 transition-colors duration-150 focus:border-emerald-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/20 disabled:cursor-not-allowed disabled:opacity-60'

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  hint?: string
  error?: string
  leadingIcon?: ReactNode
}

export function Input({
  id,
  label,
  hint,
  error,
  required,
  leadingIcon,
  className,
  ...props
}: InputProps) {
  const generatedId = useId()
  const fieldId = id ?? generatedId
  const describedBy = error
    ? `${fieldId}-error`
    : hint
      ? `${fieldId}-hint`
      : undefined

  return (
    <FieldShell id={fieldId} label={label} hint={hint} error={error} required={required}>
      <div className="relative">
        {leadingIcon && (
          <span
            className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-slate-400"
            aria-hidden="true"
          >
            {leadingIcon}
          </span>
        )}
        <input
          id={fieldId}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={cn(
            baseControlClasses,
            leadingIcon ? 'pl-10' : undefined,
            error && 'border-red-500/80 focus:border-red-400',
            className
          )}
          {...props}
        />
      </div>
    </FieldShell>
  )
}

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string
  hint?: string
  error?: string
}

export function Textarea({
  id,
  label,
  hint,
  error,
  required,
  className,
  ...props
}: TextareaProps) {
  const generatedId = useId()
  const fieldId = id ?? generatedId
  const describedBy = error
    ? `${fieldId}-error`
    : hint
      ? `${fieldId}-hint`
      : undefined

  return (
    <FieldShell id={fieldId} label={label} hint={hint} error={error} required={required}>
      <textarea
        id={fieldId}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        className={cn(
          baseControlClasses,
          error && 'border-red-500/80 focus:border-red-400',
          className
        )}
        {...props}
      />
    </FieldShell>
  )
}

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string
  hint?: string
  error?: string
}

export function Select({
  id,
  label,
  hint,
  error,
  required,
  className,
  children,
  ...props
}: SelectProps) {
  const generatedId = useId()
  const fieldId = id ?? generatedId
  const describedBy = error
    ? `${fieldId}-error`
    : hint
      ? `${fieldId}-hint`
      : undefined

  return (
    <FieldShell id={fieldId} label={label} hint={hint} error={error} required={required}>
      <select
        id={fieldId}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        className={cn(
          baseControlClasses,
          error && 'border-red-500/80 focus:border-red-400',
          className
        )}
        {...props}
      >
        {children}
      </select>
    </FieldShell>
  )
}
