'use client'

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { Bell, X, CheckCircle, AlertTriangle, Info, XCircle, Shield, Package, CreditCard, User, Settings, Star, TrendingUp, Zap, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSocketIONotifications } from '@/hooks/useSocketIONotifications'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { superAdminApi } from '@/lib/superAdminApi'

interface Notification {
  id: string
  title: string
  message: string
  priority: 'P0' | 'P1' | 'P2' | 'P3' | 'P4'
  category: string
  eventType: string
  createdAt: string
  metadata?: any
  requiresAck?: boolean
  groupCount?: number
}

const getSuperAdminNotificationIcon = (priority: string, eventType: string) => {
  const iconProps = { className: "w-4 h-4" }

  // Priority-based icons for SuperAdmin
  switch (priority) {
    case 'P0':
      return <AlertTriangle {...iconProps} className="w-4 h-4 text-red-500 animate-pulse" />
    case 'P1':
      return <AlertCircle {...iconProps} className="w-4 h-4 text-orange-500" />
    case 'P2':
      return <Info {...iconProps} className="w-4 h-4 text-blue-500" />
    case 'P3':
      return <Bell {...iconProps} className="w-4 h-4 text-gray-500" />
    case 'P4':
      return <Bell {...iconProps} className="w-4 h-4 text-gray-400" />
    default:
      return <Bell {...iconProps} className="w-4 h-4 text-blue-500" />
  }
}

const getSuperAdminPriorityStyles = (priority: string) => {
  switch (priority) {
    case 'P0':
      return 'border-l-red-500 bg-gradient-to-r from-red-50 to-red-25 hover:from-red-100 hover:to-red-50 shadow-red-100'
    case 'P1':
      return 'border-l-orange-500 bg-gradient-to-r from-orange-50 to-orange-25 hover:from-orange-100 hover:to-orange-50 shadow-orange-100'
    case 'P2':
      return 'border-l-blue-500 bg-gradient-to-r from-blue-50 to-blue-25 hover:from-blue-100 hover:to-blue-50 shadow-blue-100'
    case 'P3':
      return 'border-l-gray-500 bg-gradient-to-r from-gray-50 to-gray-25 hover:from-gray-100 hover:to-gray-50'
    case 'P4':
      return 'border-l-gray-300 bg-gradient-to-r from-gray-25 to-white hover:from-gray-50 hover:to-gray-25'
    default:
      return 'border-l-blue-400 bg-gradient-to-r from-blue-50 to-blue-25 hover:from-blue-100 hover:to-blue-50'
  }
}

const formatTimeAgo = (dateString: string) => {
  const now = new Date()
  const date = new Date(dateString)
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 0) return 'Just now'
  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  return `${Math.floor(diffInSeconds / 86400)}d ago`
}

export function SuperAdminNotificationBell() {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const {
    notifications,
    stats,
    isConnected,
    isConnecting,
    connectionError,
    acknowledgeNotification,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    reconnect
  } = useSocketIONotifications()

  const handleNotificationClick = useCallback((notification: Notification) => {
    markAsRead(notification.id)
    setIsOpen(false)

    // Redirect to centralized notifications page with deep link
    router.push(`/notifications?id=${notification.id}`)
  }, [markAsRead, router])

  const handleMarkAllRead = useCallback(() => {
    markAllAsRead()
    toast.success('All notifications marked as read')
  }, [markAllAsRead])

  const handleToggleOpen = useCallback(() => {
    setIsOpen(prev => !prev)
  }, [])

  const handleAcknowledge = useCallback((notificationId: string) => {
    acknowledgeNotification(notificationId)
    toast.success('Critical alert acknowledged')
  }, [acknowledgeNotification])

  // SuperAdmin-specific notification grouping
  const groupedNotifications = useMemo(() => {
    const groups: Record<string, { notification: Notification; count: number }> = {}

    notifications.forEach(notif => {
      const key = `${notif.eventType}-${notif.priority}`
      if (groups[key]) {
        groups[key].count++
        if (new Date(notif.createdAt) > new Date(groups[key].notification.createdAt)) {
          groups[key].notification = notif
        }
      } else {
        groups[key] = { notification: { ...notif }, count: 1 }
      }
    })

    return Object.values(groups)
      .map(group => ({
        ...group.notification,
        groupCount: group.count
      }))
      .sort((a, b) => {
        // Sort by priority first (P0 > P1 > P2 > P3 > P4)
        const priorityOrder = { P0: 0, P1: 1, P2: 2, P3: 3, P4: 4 }
        const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] ?? 5
        const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] ?? 5

        if (aPriority !== bPriority) {
          return aPriority - bPriority
        }

        // Then by timestamp (newest first)
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      })
  }, [notifications])

  const displayedNotifications = groupedNotifications.slice(0, 10)
  const hasMoreNotifications = groupedNotifications.length > 10

  // Critical alerts count (P0 + P1)
  const criticalCount = stats.byPriority.P0 + stats.byPriority.P1

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleToggleOpen}
        className={cn(
          'superadmin-notification-bell-button',
          'relative p-2 rounded-xl transition-all duration-300',
          'hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
          isOpen ? 'bg-gradient-to-br from-blue-50 to-indigo-50 shadow-inner' : 'bg-transparent',
          !isConnected && 'opacity-50',
          criticalCount > 0 && 'animate-pulse'
        )}
      >
        <Bell className={cn(
          "w-5 h-5 transition-transform duration-300",
          isOpen && "scale-110",
          isConnected ? 'text-gray-600' : 'text-red-500',
          criticalCount > 0 && 'text-red-600'
        )} />

        {/* Connection status indicator */}
        {!isConnected && (
          <div className={cn(
            "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white shadow-sm",
            isConnecting ? 'bg-amber-500 animate-pulse' : 'bg-red-500'
          )} />
        )}

        {/* Critical alerts badge (P0 + P1) */}
        {criticalCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-gradient-to-br from-red-500 to-rose-600 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-lg border-2 border-white ring-1 ring-red-100 animate-pulse">
            {criticalCount > 99 ? '99+' : criticalCount}
          </span>
        )}

        {/* Regular unread badge */}
        {criticalCount === 0 && stats.unread > 0 && (
          <span className="absolute -top-1 -right-1 bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-lg border-2 border-white ring-1 ring-blue-100">
            {stats.unread > 99 ? '99+' : stats.unread}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="superadmin-notification-dropdown absolute top-full right-0 mt-2 w-96 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-100 z-[1000] overflow-clip transform origin-top-right transition-all duration-300 animate-in fade-in slide-in-from-top-2">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-indigo-50/50 to-blue-50/50">
            <div className="flex items-center space-x-3">
              <Shield className="w-5 h-5 text-indigo-600" />
              <div>
                <h3 className="text-base font-bold text-gray-900 tracking-tight">
                  Platform Alerts
                </h3>
                <p className="text-xs text-gray-500">SuperAdmin Dashboard</p>
              </div>
              {!isConnected && (
                <button
                  onClick={reconnect}
                  className="text-[10px] bg-red-50 text-red-600 px-2 py-0.5 rounded-full font-bold hover:bg-red-100 transition-colors uppercase tracking-wider"
                >
                  Offline
                </button>
              )}
            </div>
            <div className="flex items-center space-x-3">
              {stats.unread > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs text-blue-600 hover:text-blue-800 font-bold transition-colors flex items-center space-x-1"
                >
                  <CheckCircle className="w-3 h-3" />
                  <span>Mark all read</span>
                </button>
              )}
            </div>
          </div>

          {/* Connection error */}
          {connectionError && (
            <div className="px-6 py-2 bg-red-50/50 border-b border-red-100">
              <p className="text-[10px] text-red-600 font-medium flex items-center space-x-1">
                <XCircle className="w-3 h-3" />
                <span>Reconnecting to platform...</span>
              </p>
            </div>
          )}

          {/* Priority summary */}
          <div className="px-6 py-3 bg-gradient-to-r from-gray-50/50 to-white/50 border-b border-gray-50">
            <div className="flex items-center space-x-4 overflow-x-auto no-scrollbar">
              {stats.byPriority.P0 > 0 && (
                <div className="flex items-center space-x-1.5 flex-shrink-0 bg-red-50 px-2 py-1 rounded-lg border border-red-100">
                  <Zap className="w-3 h-3 text-red-500" />
                  <span className="text-[10px] font-bold text-red-600">CRITICAL: {stats.byPriority.P0}</span>
                </div>
              )}
              {stats.byPriority.P1 > 0 && (
                <div className="flex items-center space-x-1.5 flex-shrink-0 bg-orange-50 px-2 py-1 rounded-lg border border-orange-100">
                  <AlertTriangle className="w-3 h-3 text-orange-500" />
                  <span className="text-[10px] font-bold text-orange-600">HIGH: {stats.byPriority.P1}</span>
                </div>
              )}
              {stats.byPriority.P2 > 0 && (
                <div className="flex items-center space-x-1.5 flex-shrink-0 bg-blue-50 px-2 py-1 rounded-lg border border-blue-100">
                  <Info className="w-3 h-3 text-blue-500" />
                  <span className="text-[10px] font-bold text-blue-600">MEDIUM: {stats.byPriority.P2}</span>
                </div>
              )}
              {stats.byPriority.P3 > 0 && (
                <div className="flex items-center space-x-1.5 flex-shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                  <span className="text-[10px] font-bold text-gray-500">LOW: {stats.byPriority.P3}</span>
                </div>
              )}
            </div>
          </div>

          {/* Notifications list */}
          <div
            className="no-scrollbar"
            style={{
              maxHeight: '450px',
              overflowY: 'auto',
              overflowX: 'hidden'
            }}
          >
            {notifications.length === 0 ? (
              <div className="px-6 py-10 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-indigo-300" />
                </div>
                {isConnected ? (
                  <>
                    <p className="text-sm font-bold text-gray-900">Live — waiting for alerts</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Platform alerts (P0–P2) will appear here when they occur — e.g. critical tenant, payment, or security events.
                    </p>
                    <p className="text-[10px] text-indigo-500 mt-2 font-medium">Connection active</p>
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await superAdminApi.sendTestAlert();
                          toast.success('Test alert sent — it should appear above in a moment.');
                        } catch (e) {
                          toast.error('Could not send test alert');
                        }
                      }}
                      className="mt-3 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100"
                    >
                      Send test alert
                    </button>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-bold text-gray-900">Reconnect for live alerts</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Connect to receive platform alerts in real time.
                    </p>
                    <button
                      type="button"
                      onClick={() => { reconnect(); setIsOpen(false); }}
                      className="mt-3 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-1.5 rounded-lg"
                    >
                      Reconnect
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {displayedNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={cn(
                      'px-6 py-4 cursor-pointer transition-all duration-200 border-l-4 group relative shadow-sm',
                      getSuperAdminPriorityStyles(notification.priority),
                      !((notification as any).isRead || notification.metadata?.isRead) ? 'bg-white' : 'bg-gray-50/30'
                    )}
                  >
                    <div className="flex items-start space-x-4">
                      <div className={cn(
                        "flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center shadow-sm border",
                        notification.priority === 'P0' ? 'bg-red-50 border-red-100' :
                          notification.priority === 'P1' ? 'bg-orange-50 border-orange-100' :
                            notification.priority === 'P2' ? 'bg-blue-50 border-blue-100' : 'bg-gray-50 border-gray-100'
                      )}>
                        {getSuperAdminNotificationIcon(notification.priority, notification.eventType)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center space-x-2">
                            <span className={cn(
                              "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full",
                              notification.priority === 'P0' ? 'text-red-600 bg-red-100' :
                                notification.priority === 'P1' ? 'text-orange-600 bg-orange-100' :
                                  notification.priority === 'P2' ? 'text-blue-600 bg-blue-100' : 'text-gray-500 bg-gray-100'
                            )}>
                              {notification.priority}
                            </span>
                            {notification.groupCount && notification.groupCount > 1 && (
                              <span className="text-[9px] font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full">
                                {notification.groupCount} alerts
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] font-medium text-gray-400">
                            {formatTimeAgo(notification.createdAt)}
                          </span>
                        </div>

                        <p className="text-sm font-bold truncate leading-snug text-gray-900">
                          {notification.title}
                        </p>
                        <p className="text-xs mt-1 line-clamp-2 leading-relaxed text-gray-600">
                          {notification.message}
                        </p>

                        {/* SuperAdmin-specific metadata */}
                        {notification.metadata?.tenantCount && (
                          <div className="mt-2 flex items-center space-x-2">
                            <span className="text-[9px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-md font-bold">
                              {notification.metadata.tenantCount} tenants affected
                            </span>
                          </div>
                        )}

                        {notification.metadata?.amount && (
                          <div className="mt-2 flex items-center space-x-2">
                            <span className="text-[9px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-md font-bold">
                              ${notification.metadata.amount.toLocaleString()}
                            </span>
                          </div>
                        )}

                        {notification.requiresAck && (
                          <div className="mt-3">
                            <button
                              onClick={(e) => { e.stopPropagation(); handleAcknowledge(notification.id); }}
                              className="text-[10px] bg-red-50 text-red-700 px-3 py-1.5 rounded-lg font-bold border border-red-200 hover:bg-red-100 transition-colors flex items-center space-x-1"
                            >
                              <Shield className="w-3 h-3" />
                              <span>Acknowledge Critical Alert</span>
                            </button>
                          </div>
                        )}
                      </div>

                      {!((notification as any).isRead || notification.metadata?.isRead) && (
                        <div className={cn(
                          "absolute right-6 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full",
                          notification.priority === 'P0' || notification.priority === 'P1'
                            ? 'bg-red-500 animate-pulse'
                            : 'bg-blue-500'
                        )} />
                      )}
                    </div>
                  </div>
                ))}

                {hasMoreNotifications && (
                  <div className="px-6 py-3 bg-gray-50/50 text-center border-t border-gray-100">
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        router.push('/notifications');
                      }}
                      className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 uppercase tracking-widest transition-colors"
                    >
                      +{groupedNotifications.length - 10} more platform alerts
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50/50 to-white/50">
              <button
                onClick={() => {
                  setIsOpen(false);
                  router.push('/notifications');
                }}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center space-x-1"
              >
                <TrendingUp className="w-3 h-3" />
                <span>Platform Analytics</span>
              </button>
              <button
                onClick={clearNotifications}
                className="text-xs font-bold text-gray-400 hover:text-red-500 transition-colors flex items-center space-x-1"
              >
                <X className="w-3 h-3" />
                <span>Clear All</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}