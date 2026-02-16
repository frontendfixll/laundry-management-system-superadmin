'use client'

/**
 * NotificationDetailDrawer - Microsoft 365 style right-to-left slide panel
 * SuperAdmin: full notification details when user clicks a notification.
 */

import React, { useEffect } from 'react'
import {
  X,
  Bell,
  Calendar,
  Clock,
  ExternalLink,
  Package,
  DollarSign,
  MessageSquare,
  AlertTriangle,
  Building,
  UserPlus,
  ShieldAlert,
  CreditCard,
  PlusCircle,
  AlertCircle,
  Info,
  FileText,
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export interface SuperAdminNotification {
  _id: string
  title: string
  message: string
  type: string
  isRead: boolean
  createdAt: string
  severity?: 'info' | 'success' | 'warning' | 'error'
  priority?: 'P0' | 'P1' | 'P2' | 'P3' | 'P4'
  data?: {
    tenancyId?: string
    ticketId?: string
    orderId?: string
    link?: string
    [key: string]: unknown
  }
}

const PRIORITY_CONFIG = {
  P0: { label: 'Critical', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-500', icon: AlertTriangle },
  P1: { label: 'High', color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-500', icon: AlertCircle },
  P2: { label: 'Medium', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-500', icon: Info },
  P3: { label: 'Info', color: 'text-gray-700', bg: 'bg-gray-50', border: 'border-gray-300', icon: Bell },
  P4: { label: 'Low', color: 'text-gray-500', bg: 'bg-white', border: 'border-gray-200', icon: Clock },
}

function getIcon(notification: SuperAdminNotification) {
  const iconSize = 'w-6 h-6'
  switch (notification.type) {
    case 'NEW_TENANCY_SIGNUP':
      return <PlusCircle className={`${iconSize} text-green-600`} />
    case 'TENANCY_PAYMENT_RECEIVED':
      return <DollarSign className={`${iconSize} text-blue-600`} />
    case 'TENANCY_SUBSCRIPTION_UPDATED':
      return <CreditCard className={`${iconSize} text-indigo-600`} />
    case 'NEW_LEAD':
      return <UserPlus className={`${iconSize} text-purple-600`} />
    case 'NEW_COMPLAINT':
      return <MessageSquare className={`${iconSize} text-red-600`} />
    case 'TENANCY_SUBSCRIPTION_EXPIRING':
      return <AlertTriangle className={`${iconSize} text-orange-600`} />
    case 'TENANCY_SUBSCRIPTION_EXPIRED':
      return <ShieldAlert className={`${iconSize} text-red-700`} />
    default:
      return <Bell className={`${iconSize} text-gray-600`} />
  }
}

interface NotificationDetailDrawerProps {
  notification: SuperAdminNotification | null
  open: boolean
  onClose: () => void
  onMarkAsRead?: (id: string) => void
}

export function NotificationDetailDrawer({
  notification,
  open,
  onClose,
  onMarkAsRead,
}: NotificationDetailDrawerProps) {
  useEffect(() => {
    if (open && notification && onMarkAsRead && !notification.isRead) {
      onMarkAsRead(notification._id)
    }
  }, [open, notification?._id, onMarkAsRead, notification?.isRead])

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

  if (!notification) return null

  const priority = notification.priority || 'P3'
  const config = PRIORITY_CONFIG[priority as keyof typeof PRIORITY_CONFIG] || PRIORITY_CONFIG.P3
  const IconComponent = config.icon

  const formatTime = (date: string) => {
    const d = new Date(date)
    return d.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const data = notification.data || {}
  const metaEntries = Object.entries(data).filter(
    ([key, value]) =>
      !['link'].includes(key) &&
      value !== undefined &&
      value !== null &&
      typeof value !== 'object'
  )

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 bg-black/20 z-40 transition-opacity duration-300',
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className={cn(
          'fixed top-0 right-0 h-full w-full max-w-lg sm:max-w-xl bg-white shadow-2xl z-50 flex flex-col',
          'transform transition-transform duration-300 ease-out',
          open ? 'translate-x-0' : 'translate-x-full'
        )}
        role="dialog"
        aria-label="Notification details"
      >
        <div className={cn('h-1 w-full shrink-0', config.border.replace('border-', 'bg-'))} />
        <div className="flex items-center justify-between p-4 border-b border-gray-100 shrink-0">
          <h2 className="text-lg font-bold text-gray-900">Notification details</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex items-start gap-4">
            <div className={cn('w-14 h-14 rounded-xl flex items-center justify-center shrink-0', config.bg)}>
              {getIcon(notification)}
            </div>
            <div className="min-w-0 flex-1">
              <span
                className={cn(
                  'inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full border',
                  config.bg,
                  config.color,
                  config.border.replace('border-', 'border-').replace('500', '200')
                )}
              >
                {config.label}
              </span>
              <p className="text-[11px] text-gray-500 mt-1.5 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {formatTime(notification.createdAt)}
              </p>
            </div>
          </div>

          <h3 className="text-xl font-bold text-gray-900 leading-tight">{notification.title}</h3>

          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <p className="text-sm text-gray-800 leading-relaxed">{notification.message}</p>
          </div>

          <div className="flex items-center gap-3 text-sm text-gray-600">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span>{formatTime(notification.createdAt)}</span>
          </div>

          <div className="p-4 bg-white border border-gray-100 rounded-xl">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Type</p>
            <p className="text-sm font-bold text-gray-700">{notification.type.replace(/_/g, ' ')}</p>
          </div>

          {metaEntries.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                <FileText className="w-3.5 h-3.5" />
                Related data
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {metaEntries.map(([key, value]) => (
                  <div key={key} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider truncate">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
                    </p>
                    <p className="text-xs font-medium text-gray-900 truncate" title={String(value)}>
                      {String(value)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.link && (
            <div className="pt-4 border-t border-gray-100">
              <Link
                href={data.link as string}
                className="flex items-center justify-center gap-2 w-full py-3 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-black transition-all"
              >
                <ExternalLink className="w-4 h-4" />
                Take action / View details
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
