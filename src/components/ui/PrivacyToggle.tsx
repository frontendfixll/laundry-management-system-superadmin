'use client'

import { useState, useEffect } from 'react'
import { Eye, EyeOff } from 'lucide-react'

interface PrivacyToggleProps {
  children: React.ReactNode
  hiddenText?: string
  className?: string
  buttonClassName?: string
  showLabel?: string
  hideLabel?: string
  defaultVisible?: boolean
  storageKey?: string // For persisting preference
  title?: string // Title text to align icon with
  iconPosition?: 'inline' | 'title-aligned' // Position of the icon
  iconClassName?: string // Custom class for the icon
}

export function PrivacyToggle({
  children,
  hiddenText = '*****',
  className = '',
  buttonClassName = 'p-1 hover:bg-gray-100 rounded-md transition-colors',
  showLabel = 'Show sensitive data',
  hideLabel = 'Hide sensitive data',
  defaultVisible = true,
  storageKey,
  title,
  iconPosition = 'inline',
  iconClassName = 'text-gray-500 hover:text-gray-700'
}: PrivacyToggleProps) {
  const [isVisible, setIsVisible] = useState(defaultVisible)

  // Load preference from localStorage on mount
  useEffect(() => {
    if (storageKey && typeof window !== 'undefined') {
      const saved = localStorage.getItem(`privacy-toggle-${storageKey}`)
      if (saved !== null) {
        setIsVisible(JSON.parse(saved))
      }
    }
  }, [storageKey])

  // Save preference to localStorage when changed
  const handleToggle = () => {
    const newVisibility = !isVisible
    setIsVisible(newVisibility)

    if (storageKey && typeof window !== 'undefined') {
      localStorage.setItem(`privacy-toggle-${storageKey}`, JSON.stringify(newVisibility))
    }
  }

  const IconButton = () => (
    <button
      onClick={handleToggle}
      className={buttonClassName}
      title={isVisible ? hideLabel : showLabel}
      aria-label={isVisible ? hideLabel : showLabel}
    >
      {isVisible ? (
        <Eye className={`w-4 h-4 ${iconClassName}`} />
      ) : (
        <EyeOff className={`w-4 h-4 ${iconClassName}`} />
      )}
    </button>
  )

  if (iconPosition === 'title-aligned' && title) {
    return (
      <div className={className}>
        {/* Title row with icon aligned to the end */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">{title}</span>
          <IconButton />
        </div>
        {/* Content row */}
        <div>
          {isVisible ? children : <span className="text-gray-500">{hiddenText}</span>}
        </div>
      </div>
    )
  }

  // Default inline layout
  return (
    <div className={`flex items-center ${className}`}>
      <div className="flex-1">
        {isVisible ? children : <span className="text-gray-500">{hiddenText}</span>}
      </div>
      <IconButton />
    </div>
  )
}

export default PrivacyToggle