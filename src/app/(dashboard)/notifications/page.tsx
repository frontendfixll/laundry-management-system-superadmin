'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { superAdminApi } from '@/lib/superAdminApi'
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Filter,
  Package,
  DollarSign,
  MessageSquare,
  AlertTriangle,
  Building,
  UserPlus,
  RefreshCw,
  Clock,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  CreditCard,
  PlusCircle,
  AlertCircle,
  Info
} from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface Notification {
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
    [key: string]: any
  }
}

const PRIORITY_CONFIG = {
  P0: { label: 'Critical', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200', icon: AlertTriangle },
  P1: { label: 'High', color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200', icon: AlertCircle },
  P2: { label: 'Medium', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200', icon: Info },
  P3: { label: 'Info', color: 'text-gray-700', bg: 'bg-gray-50', border: 'border-gray-200', icon: Bell },
  P4: { label: 'Low', color: 'text-gray-500', bg: 'bg-white', border: 'border-gray-100', icon: Clock },
}

function NotificationsContent() {
  const searchParams = useSearchParams()
  const notificationId = searchParams.get('id')

  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const [priorityFilter, setPriorityFilter] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ total: 0, pages: 1 })
  const [unreadCount, setUnreadCount] = useState(0)
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null)

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const response = await superAdminApi.getNotifications({
        page,
        limit: 20,
        unreadOnly: filter === 'unread',
        priority: priorityFilter || undefined
      })
      if (response.success) {
        setNotifications(response.data.notifications || [])
        setPagination(response.data.pagination || { total: 0, pages: 1 })
        setUnreadCount(response.data.unreadCount || 0)
      }
    } catch (error) {
      toast.error('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const handleDeepLink = async () => {
      if (notificationId) {
        // First check if it's already in the list
        const existing = notifications.find(n => n._id === notificationId)
        if (existing) {
          setSelectedNotification(existing)
          if (!existing.isRead) handleMarkAsRead([existing._id])
        } else {
          // If not in list, fetch it specifically
          try {
            const response = await superAdminApi.getNotification(notificationId)
            if (response.success && response.data) {
              const notif = response.data.notification || response.data
              setSelectedNotification(notif)
              if (!notif.isRead) handleMarkAsRead([notif._id])
            }
          } catch (e) {
            console.error('Failed to fetch specific notification:', e)
          }
        }
      }
    }

    if (notifications.length > 0) {
      handleDeepLink()
    }
  }, [notificationId, notifications.length])

  useEffect(() => {
    fetchNotifications()
  }, [page, filter, priorityFilter])

  const handleMarkAsRead = async (ids: string[]) => {
    try {
      await superAdminApi.markNotificationsAsRead(ids)
      setNotifications(prev =>
        prev.map(n => ids.includes(n._id) ? { ...n, isRead: true } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - ids.length))
      if (selectedNotification && ids.includes(selectedNotification._id)) {
        setSelectedNotification({ ...selectedNotification, isRead: true })
      }
    } catch (error) {
      toast.error('Failed to mark as read')
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await superAdminApi.markAllNotificationsAsRead()
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      setUnreadCount(0)
      toast.success('All notifications marked as read')
    } catch (error) {
      toast.error('Failed to mark all as read')
    }
  }

  const formatTime = (date: string) => {
    const d = new Date(date)
    return d.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getIcon = (notification: Notification) => {
    const iconSize = "w-5 h-5";
    switch (notification.type) {
      case 'NEW_TENANCY_SIGNUP': return <PlusCircle className={`${iconSize} text-green-600`} />
      case 'TENANCY_PAYMENT_RECEIVED': return <DollarSign className={`${iconSize} text-blue-600`} />
      case 'TENANCY_SUBSCRIPTION_UPDATED': return <CreditCard className={`${iconSize} text-indigo-600`} />
      case 'NEW_LEAD': return <UserPlus className={`${iconSize} text-purple-600`} />
      case 'NEW_COMPLAINT': return <MessageSquare className={`${iconSize} text-red-600`} />
      case 'TENANCY_SUBSCRIPTION_EXPIRING': return <AlertTriangle className={`${iconSize} text-orange-600`} />
      case 'TENANCY_SUBSCRIPTION_EXPIRED': return <ShieldAlert className={`${iconSize} text-red-700`} />
      default: return <Bell className={`${iconSize} text-gray-600`} />
    }
  }

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-gray-50">
      {/* Sidebar: List of Notifications */}
      <div className="w-1/2 flex flex-col border-r border-gray-200 bg-white">
        {/* List Header */}
        <div className="p-4 border-b border-gray-100 space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">Notifications</h1>
            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchNotifications()}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title="Refresh"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs font-semibold text-purple-600 hover:text-purple-700 hover:bg-purple-50 px-2 py-1 rounded"
                >
                  Mark all read
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => { setFilter('all'); setPage(1); }}
              className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${filter === 'all' && !priorityFilter
                ? 'bg-gray-900 text-white shadow-md'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
            >
              All
            </button>
            <button
              onClick={() => { setFilter('unread'); setPage(1); }}
              className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${filter === 'unread'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
            >
              Unread ({unreadCount})
            </button>
            <div className="w-px h-6 bg-gray-200 mx-1" />
            {Object.entries(PRIORITY_CONFIG).map(([level, config]) => (
              <button
                key={level}
                onClick={() => {
                  setPriorityFilter(priorityFilter === level ? null : level);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all border ${priorityFilter === level
                  ? `${config.bg} ${config.color} ${config.border} shadow-sm ring-1 ring-offset-1 ring-gray-200`
                  : 'bg-white text-gray-400 border-gray-100 hover:border-gray-300'
                  }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-3">
              <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full" />
              <p className="text-sm font-medium">Fetching notifications...</p>
            </div>
          ) : notifications.length > 0 ? (
            <div className="divide-y divide-gray-50">
              {notifications.map((notif) => (
                <button
                  key={notif._id}
                  onClick={() => {
                    setSelectedNotification(notif);
                    if (!notif.isRead) handleMarkAsRead([notif._id]);
                  }}
                  className={`w-full text-left p-4 transition-all hover:bg-gray-50 group relative ${selectedNotification?._id === notif._id ? 'bg-purple-50/50' : 'bg-white'
                    }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 transition-opacity ${notif.isRead ? 'opacity-0' : 'bg-purple-500'
                      }`} />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-[10px] font-black uppercase tracking-widest ${PRIORITY_CONFIG[notif.priority as keyof typeof PRIORITY_CONFIG]?.color || 'text-gray-400'
                          }`}>
                          {notif.priority || 'P3'}
                        </span>
                        <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap">
                          {formatTime(notif.createdAt)}
                        </span>
                      </div>
                      <h4 className={`text-sm leading-tight truncate ${!notif.isRead ? 'font-bold text-gray-900' : 'text-gray-600 font-medium'
                        }`}>
                        {notif.title}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {notif.message}
                      </p>
                    </div>

                    <ChevronRight className={`w-4 h-4 text-gray-300 mt-5 transition-transform ${selectedNotification?._id === notif._id ? 'translate-x-1 text-purple-400' : ''
                      }`} />
                  </div>

                  {selectedNotification?._id === notif._id && (
                    <div className="absolute inset-y-0 left-0 w-1 bg-purple-500" />
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8 text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <Bell className="w-8 h-8 text-gray-300" />
              </div>
              <p className="font-medium text-gray-500">No notifications found</p>
              <p className="text-xs mt-1">Try changing your filters or priority level</p>
            </div>
          )}
        </div>

        {/* List Pagination */}
        {pagination.pages > 1 && (
          <div className="p-3 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Page {page} of {pagination.pages}
            </p>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="p-1.5 rounded-md border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                <ChevronRight className="w-4 h-4 rotate-180" />
              </button>
              <button
                disabled={page === pagination.pages}
                onClick={() => setPage(p => p + 1)}
                className="p-1.5 rounded-md border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Content: Detailed View */}
      <div className="flex-1 overflow-y-auto bg-gray-50 p-8">
        {selectedNotification ? (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
              <div className={`h-2 ${notifPriorityColor(selectedNotification.priority)
                }`} />

              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ${notifTypeBg(selectedNotification.priority)
                    }`}>
                    {getIcon(selectedNotification)}
                  </div>
                  <div className="text-right">
                    <span className={`text-[10px] font-black uppercase tracking-widest border px-3 py-1 rounded-full ${PRIORITY_CONFIG[selectedNotification.priority as keyof typeof PRIORITY_CONFIG]?.bg || 'bg-gray-50'
                      } ${PRIORITY_CONFIG[selectedNotification.priority as keyof typeof PRIORITY_CONFIG]?.color || 'text-gray-400'
                      } ${PRIORITY_CONFIG[selectedNotification.priority as keyof typeof PRIORITY_CONFIG]?.border || 'border-gray-100'
                      }`}>
                      {selectedNotification.priority || 'P3'} Priority
                    </span>
                    <p className="text-xs text-gray-400 mt-2 font-medium">
                      Received at {formatTime(selectedNotification.createdAt)}
                    </p>
                  </div>
                </div>

                <h2 className="text-2xl font-black text-gray-900 leading-tight mb-4">
                  {selectedNotification.title}
                </h2>
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                  <p className="text-gray-700 leading-relaxed font-medium">
                    {selectedNotification.message}
                  </p>
                </div>

                {/* Meta Information / Actions */}
                <div className="mt-8 space-y-4">
                  <h5 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Related Information</h5>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-white border border-gray-100 rounded-2xl">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Type</p>
                      <p className="text-sm font-bold text-gray-700">{selectedNotification.type.replace(/_/g, ' ')}</p>
                    </div>
                    {selectedNotification.data?.tenancyId && (
                      <div className="p-4 bg-white border border-gray-100 rounded-2xl">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Tenancy ID</p>
                        <p className="text-xs font-mono font-bold text-purple-600 truncate">{selectedNotification.data.tenancyId}</p>
                      </div>
                    )}
                  </div>

                  {selectedNotification.data?.link && (
                    <Link
                      href={selectedNotification.data.link}
                      className="flex items-center justify-center gap-2 w-full mt-6 py-4 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-black transition-all shadow-xl shadow-black/10 active:scale-[0.98]"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Take Action / View Details
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {/* Admin Controls */}
            <div className="flex items-center justify-center gap-4 py-4">
              <button
                onClick={() => setSelectedNotification(null)}
                className="text-xs font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-colors"
              >
                Close View
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-2xl shadow-purple-500/10 mb-8 border border-purple-50">
              <Bell className="w-12 h-12 text-purple-200 animate-bounce" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-2">Select a notification</h3>
            <p className="text-gray-400 text-sm max-w-xs mx-auto">
              Click on any notification in the list to see the detailed breakdown and available actions.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function NotificationsPage() {
  return (
    <Suspense fallback={
      <div className="flex h-[calc(100vh-64px)] items-center justify-center bg-gray-50">
        <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full" />
      </div>
    }>
      <NotificationsContent />
    </Suspense>
  )
}

// Helper styling functions
function notifPriorityColor(priority?: string) {
  switch (priority) {
    case 'P0': return 'bg-red-500'
    case 'P1': return 'bg-orange-500'
    case 'P2': return 'bg-blue-500'
    case 'P3': return 'bg-purple-500'
    default: return 'bg-gray-300'
  }
}

function notifTypeBg(priority?: string) {
  switch (priority) {
    case 'P0': return 'bg-red-50'
    case 'P1': return 'bg-orange-50'
    case 'P2': return 'bg-blue-50'
    case 'P3': return 'bg-purple-50'
    default: return 'bg-gray-50'
  }
}
