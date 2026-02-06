'use client'

import { useState, useEffect } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface PrivateRevenueCardProps {
  title: string
  amount: string | number
  subtitle?: string
  icon?: React.ReactNode
  storageKey: string
  className?: string
}

export function PrivateRevenueCard({
  title,
  amount,
  subtitle,
  icon,
  storageKey,
  className = ''
}: PrivateRevenueCardProps) {
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
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-1">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <button
            onClick={handleToggle}
            className="p-1 hover:bg-gray-100 rounded-md transition-colors"
            title={isVisible ? 'Hide revenue amount' : 'Show revenue amount'}
            aria-label={isVisible ? 'Hide revenue amount' : 'Show revenue amount'}
          >
            {isVisible ? (
              <Eye className="w-4 h-4 text-gray-500 hover:text-gray-700" />
            ) : (
              <EyeOff className="w-4 h-4 text-gray-500 hover:text-gray-700" />
            )}
          </button>
        </div>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {isVisible ? amount : '*****'}
        </div>
        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  )
}

export default PrivateRevenueCard