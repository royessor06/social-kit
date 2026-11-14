'use client'

import { ChevronDown } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { cn } from '@/lib/cn'

export type DropdownItem =
  | {
      type?: 'action'
      label: string
      href?: string
      onClick?: () => void
      danger?: boolean
      icon?: ReactNode
    }
  | {
      type: 'separator'
    }

export function DropdownMenu({
  label,
  items,
  align = 'right',
  className,
}: {
  label: ReactNode
  items: DropdownItem[]
  align?: 'left' | 'right'
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const menuId = useId()

  useEffect(() => {
    if (!open) return
    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handlePointerDown)
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  return (
    <div ref={containerRef} className={cn('relative inline-block', className)}>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        onClick={() => setOpen((current) => !current)}
        className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-slate-700/90 bg-slate-900 px-3 py-1.5 text-sm font-medium text-slate-200 transition-colors hover:border-slate-600 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400 whitespace-nowrap shrink-0"
      >
        <span>{label}</span>
        <ChevronDown
          className={cn(
            'h-4 w-4 text-slate-400 transition-transform duration-150',
            open && 'rotate-180'
          )}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div
          id={menuId}
          role="menu"
          className={cn(
            'absolute z-40 mt-2 min-w-48 overflow-hidden rounded-xl border border-slate-800 bg-slate-900 p-1.5 shadow-xl',
            align === 'right' ? 'right-0' : 'left-0'
          )}
        >
          {items.map((item, index) => {
            if (item.type === 'separator') {
              return <div key={`sep-${index}`} className="my-1 border-t border-slate-800" />
            }

            const itemClasses = cn(
              'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors focus-visible:outline-2 focus-visible:outline-emerald-400',
              item.danger
                ? 'text-red-300 hover:bg-red-950/60 hover:text-red-200'
                : 'text-slate-200 hover:bg-slate-800 hover:text-white'
            )

            if (item.href) {
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  className={itemClasses}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              )
            }

            return (
              <button
                key={item.label}
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false)
                  item.onClick?.()
                }}
                className={itemClasses}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
