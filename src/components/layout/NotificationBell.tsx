'use client'

import { useState, useEffect, useRef } from 'react'
import { superAdminApi } from '@/lib/superAdminApi'
import {
    Bell,
    Package,
    DollarSign,
    MessageSquare,
    AlertTriangle,
} from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface Notification {
    _id: string
    title: string
    message: string
    type: string
    isRead: boolean
    createdAt: string
    data?: any
}

export default function NotificationBell() {
    const [showNotifications, setShowNotifications] = useState(false)
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [loading, setLoading] = useState(false)
    const notifRef = useRef<HTMLDivElement>(null)

    const fetchUnreadCount = async () => {
        try {
            const response = await superAdminApi.getNotificationUnreadCount()
            if (response.success) {
                setUnreadCount(response.data.unreadCount || 0)
            }
        } catch (error) {
            // console.log('🔔 NotificationBell mounted, manually fetching unread count')
        }
    }

    const fetchNotifications = async () => {
        try {
            setLoading(true)
            const response = await superAdminApi.getNotifications({ limit: 10 })
            if (response.success) {
                setNotifications(response.data.notifications || [])
                setUnreadCount(response.data.unreadCount || 0)
            }
        } catch (error) {
            // console.log('Could not fetch notifications')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchUnreadCount()
        const interval = setInterval(fetchUnreadCount, 30000)
        return () => clearInterval(interval)
    }, [])

    useEffect(() => {
        if (showNotifications) {
            fetchNotifications()
        }
    }, [showNotifications])

    // Auto mark as read when dropdown opens and notifications are loaded
    useEffect(() => {
        if (showNotifications && notifications.length > 0) {
            const unreadIds = notifications.filter(n => !n.isRead).map(n => n._id)
            if (unreadIds.length > 0) {
                // Small delay to let user see the notifications first
                const timer = setTimeout(() => {
                    handleMarkAsRead(unreadIds)
                }, 1500)
                return () => clearTimeout(timer)
            }
        }
    }, [showNotifications, notifications])

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
                setShowNotifications(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleMarkAsRead = async (notificationIds: string[]) => {
        try {
            await superAdminApi.markNotificationsAsRead(notificationIds)
            setNotifications(prev =>
                prev.map(n => notificationIds.includes(n._id) ? { ...n, isRead: true } : n)
            )
            setUnreadCount(prev => Math.max(0, prev - notificationIds.length))
        } catch (error) {
            // console.log('Could not mark as read')
        }
    }

    const handleMarkAllAsRead = async () => {
        try {
            await superAdminApi.markAllNotificationsAsRead()
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
            setUnreadCount(0)
            toast.success('All notifications marked as read')
        } catch (error) {
            // console.error('Failed to mark all as read:', error)
        }
    }

    const formatTime = (date: string) => {
        const d = new Date(date)
        const now = new Date()
        const diffMs = now.getTime() - d.getTime()
        const diffMins = Math.floor(diffMs / 60000)
        const diffHours = Math.floor(diffMs / 3600000)
        const diffDays = Math.floor(diffMs / 86400000)

        if (diffMins < 1) return 'Just now'
        if (diffMins < 60) return `${diffMins}m ago`
        if (diffHours < 24) return `${diffHours}h ago`
        if (diffDays < 7) return `${diffDays}d ago`
        return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
    }

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'ORDER_PLACED':
            case 'ORDER_ASSIGNED':
                return <Package className="w-4 h-4 text-blue-600" />
            case 'REFUND_REQUEST':
                return <DollarSign className="w-4 h-4 text-orange-600" />
            case 'NEW_COMPLAINT':
                return <MessageSquare className="w-4 h-4 text-red-600" />
            case 'security':
                return <AlertTriangle className="w-4 h-4 text-red-600" />
            case 'new_tenancy_signup':
            case 'subscription_purchased':
                return <Package className="w-4 h-4 text-green-600" />
            case 'payment_received':
                return <DollarSign className="w-4 h-4 text-green-600" />
            case 'new_lead':
                return <MessageSquare className="w-4 h-4 text-blue-500" />
            default:
                return <Bell className="w-4 h-4 text-purple-600" />
        }
    }

    const getNotificationBg = (type: string) => {
        switch (type) {
            case 'ORDER_PLACED':
            case 'ORDER_ASSIGNED':
                return 'bg-blue-100'
            case 'REFUND_REQUEST':
                return 'bg-orange-100'
            case 'NEW_COMPLAINT':
            case 'security':
                return 'bg-red-100'
            case 'new_tenancy_signup':
            case 'subscription_purchased':
            case 'payment_received':
                return 'bg-green-100'
            case 'new_lead':
                return 'bg-blue-50'
            default:
                return 'bg-purple-100'
        }
    }

    return (
        <div className="relative" ref={notifRef}>
            <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors relative"
            >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-blue-600 font-medium">{unreadCount} new</span>
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllAsRead}
                                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                                >
                                    Mark all read
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                        {loading ? (
                            <div className="text-center py-8 px-4">
                                <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                                <p className="text-gray-500 text-sm">Loading...</p>
                            </div>
                        ) : notifications.length > 0 ? (
                            notifications.map((notification) => (
                                <div
                                    key={notification._id}
                                    onClick={() => {
                                        if (!notification.isRead) {
                                            handleMarkAsRead([notification._id])
                                        }
                                    }}
                                    className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${!notification.isRead ? 'bg-blue-50' : ''
                                        }`}
                                >
                                    <div className="flex items-start space-x-3">
                                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${getNotificationBg(notification.type)}`}>
                                            {getNotificationIcon(notification.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm ${!notification.isRead ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                                                {notification.title}
                                            </p>
                                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                                                {notification.message}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-2">
                                                {formatTime(notification.createdAt)}
                                            </p>
                                        </div>
                                        {!notification.isRead && (
                                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 px-4">
                                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Bell className="w-6 h-6 text-gray-400" />
                                </div>
                                <p className="text-gray-500 text-sm">No notifications yet</p>
                            </div>
                        )}
                    </div>
                    <div className="p-4 border-t border-gray-200">
                        <Link
                            href="/notifications"
                            onClick={() => setShowNotifications(false)}
                            className="block w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                            View All Notifications
                        </Link>
                    </div>
                </div>
            )}
        </div>
    )
}
