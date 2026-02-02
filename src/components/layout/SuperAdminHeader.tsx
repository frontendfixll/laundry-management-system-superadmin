'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuthStore, useAuthInfo } from '@/store/authStore'
import { superAdminApi } from '@/lib/superAdminApi'
import {
  Settings,
  User,
  LogOut,
  Shield,
  Menu,
  Search,
  Mail
} from 'lucide-react'
import NotificationBell from './NotificationBell'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface SuperAdminHeaderProps {
  onMenuClick?: () => void
  sidebarCollapsed?: boolean
}

export default function SuperAdminHeader({ onMenuClick, sidebarCollapsed = false }: SuperAdminHeaderProps) {
  const { user, roleName, email, name } = useAuthInfo()
  const { logout } = useAuthStore()
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    try {
      await superAdminApi.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      logout()
      window.location.href = '/auth/login'
    }
  }

  return (
    <header className="bg-white h-16 border-b border-gray-200 shadow-sm transition-all duration-300 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Mobile Menu Button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 mr-2"
          >
            <Menu className="h-6 w-6 text-gray-600" />
          </button>

          {/* Search */}
          <div className="flex-1 max-w-lg">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search orders, customers..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-gray-50 focus:bg-white transition-colors"
              />
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">

            {/* Notifications */}
            <NotificationBell />

            {/* Profile Menu */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                title={email}
              >
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {name?.charAt(0).toUpperCase() || 'A'}
                  </span>
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-900 truncate max-w-[120px]">{name}</p>
                  <p className="text-[10px] text-gray-400 font-light truncate max-w-[120px]">{email}</p>
                </div>
              </button>

              {/* Profile Dropdown */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden">
                  <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                    <p className="text-sm font-semibold truncate">{name}</p>
                    <p className="text-xs text-blue-100 truncate flex items-center mt-1">
                      <Mail className="w-3 h-3 mr-1" />
                      {email}
                    </p>
                    <div className="mt-2 inline-block px-2 py-0.5 bg-white/20 rounded text-[10px] font-medium backdrop-blur-sm">
                      {roleName}
                    </div>
                  </div>

                  <div className="py-2">
                    <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <User className="w-4 h-4 mr-3" />
                      Profile Settings
                    </button>
                    <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <Shield className="w-4 h-4 mr-3" />
                      Security Settings
                    </button>
                    <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <Settings className="w-4 h-4 mr-3" />
                      Preferences
                    </button>
                  </div>

                  <div className="border-t border-gray-200 py-2">
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
