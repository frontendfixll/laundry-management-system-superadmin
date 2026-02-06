'use client'

import { useState, useEffect } from 'react'
import { Eye, EyeOff } from 'lucide-react'

interface RevenueCardProps {
  title: string
  amount: string | number
  subtitle?: string
  icon?: React.ReactNode
  storageKey: string
  className?: string
}

export function RevenueCard({
  title,
  amount,
  subtitle,
  icon,
  storageKey,
  className = ''
}: RevenueCardProps) {
  const [isVisible, setIsVisible] = useState(true)

  // Load preference from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
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
    
    if (typeof window !== 'undefined') {
      localStorage.setItem(`privacy-toggle-${storageKey}`, JSON.stringify(newVisibility))
    }
  }

  return (
    <div className={className || `bg-gradient-to-br from-slate-50 to-gray-50 border border-slate-100 rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          {/* Title row with eye icon positioned at the end of title */}
          <div className="flex items-center justify-between mb-1">
            {icon}
            <button
              onClick={handleToggle}
              className="p-1 hover:bg-gray-200 rounded-md transition-colors"
              title={isVisible ? 'Hide revenue amount' : 'Show revenue amount'}
              aria-label={isVisible ? 'Hide revenue amount' : 'Show revenue amount'}
            >
              {isVisible ? (
                <Eye className="w-3 h-3 text-gray-500 hover:text-gray-700" />
              ) : (
                <EyeOff className="w-3 h-3 text-gray-500 hover:text-gray-700" />
              )}
            </button>
          </div>
          
          {/* Amount display */}
          <div className="text-lg font-light text-gray-900 mb-1">
            {isVisible ? amount : '*****'}
          </div>
          
          {/* Title */}
          <div className="text-xs font-light text-gray-500 mb-1">
            {title}
          </div>
          
          {/* Subtitle if provided */}
          {subtitle && (
            <div className="text-xs text-gray-400 font-light">
              {isVisible ? subtitle : '*****'}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default RevenueCard