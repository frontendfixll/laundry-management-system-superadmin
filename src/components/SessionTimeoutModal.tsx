'use client'

import { Clock, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SessionTimeoutModalProps {
  isOpen: boolean
  remainingTime: number
  onStayLoggedIn: () => void
  onLogout: () => void
}

export function SessionTimeoutModal({ 
  isOpen, 
  remainingTime, 
  onStayLoggedIn, 
  onLogout 
}: SessionTimeoutModalProps) {
  if (!isOpen) return null

  const minutes = Math.floor(remainingTime / 60)
  const seconds = remainingTime % 60

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 animate-in fade-in zoom-in duration-200">
        <div className="text-center">
          {/* Icon */}
          <div className="mx-auto h-16 w-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
            <Clock className="h-8 w-8 text-amber-600" />
          </div>
          
          {/* Title */}
          <h3 className="text-xl font-semibold text-gray-900 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Session Expiring Soon
          </h3>
          
          {/* Message */}
          <p className="text-gray-600 mb-4" style={{ fontSize: '15px' }}>
            Your session will expire due to inactivity.
          </p>
          
          {/* Countdown */}
          <div className="bg-gray-100 rounded-lg py-4 px-6 mb-6">
            <p className="text-sm text-gray-500 mb-1">Time remaining</p>
            <p className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </p>
          </div>
          
          {/* Actions */}
          <div className="flex space-x-3">
            <Button
              onClick={onLogout}
              variant="outline"
              className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
            <Button
              onClick={onStayLoggedIn}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
            >
              Stay Logged In
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
