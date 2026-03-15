'use client'

/**
 * SlidePanel - Microsoft 365 style right-to-left slide panel for view/edit content.
 * Use instead of centered Dialog when you want detail/edit to open from the right.
 */

import React, { useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SlidePanelProps {
  open: boolean
  onClose: () => void
  title?: React.ReactNode
  width?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
  className?: string
  hideHeader?: boolean
  accentBar?: string
  footer?: React.ReactNode
  children: React.ReactNode
}

const widthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  full: 'max-w-full',
}

export function SlidePanel({
  open,
  onClose,
  title,
  width = 'xl',
  className,
  hideHeader = false,
  accentBar,
  footer,
  children,
}: SlidePanelProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (open) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <>
      <div
        className="fixed inset-0 bg-black/20 z-[200] transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={cn(
          'fixed top-0 right-0 h-full w-full bg-white shadow-2xl z-[201] flex flex-col',
          'transform transition-transform duration-300 ease-out',
          open ? 'translate-x-0' : 'translate-x-full',
          widthClasses[width],
          className
        )}
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === 'string' ? title : 'Panel'}
      >
        {accentBar && <div className={cn('h-1 w-full shrink-0', accentBar)} />}
        {!hideHeader && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0 bg-white gap-3">
            {title != null && (
              <h2 className="text-lg font-semibold text-gray-900 min-w-0 flex-1">{title}</h2>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors shrink-0"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto min-h-0 px-6 py-4">{children}</div>
        {footer && (
          <div className="shrink-0 border-t border-gray-100 bg-white px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </>
  )
}
