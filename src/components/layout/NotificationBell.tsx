'use client'

import { useState, useEffect, useRef } from 'react'
import { useNotifications } from '@/hooks/useNotifications'
import {
    Bell,
    Package,
    DollarSign,
    MessageSquare,
    AlertTriangle,
    Building2,
    Target,
    Shield,
    CreditCard,
    UserPlus,
    Wifi,
    WifiOff,
} from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function NotificationBell() {
    const [showNotifications, setShowNotifications] = useState(false)
    const notifRef = useRef<HTMLDivElement>(null)

    const {
        notifications,
        unreadCount,
        isConnected,
        markAsRead,
        markMultipleAsRead,
        markAllAsRead,
        fetchNotifications,
    } = useNotifications()

    // Fetch notifications when dropdown opens
    useEffect(() => {
        if (showNotifications) {
            fetchNotifications()
        }
    }, [showNotifications, fetchNotifications])

    // Auto mark visible notifications as read after 1.5s
    useEffect(() => {
        if (showNotifications && notifications.length > 0) {
            const unreadIds = notifications.filter(n => !n.isRead).map(n => n._id)
            if (unreadIds.length > 0) {
                const timer = setTimeout(() => {
                    markMultipleAsRead(unreadIds)
                }, 1500)
                return () => clearTimeout(timer)
            }
        }
    }, [showNotifications, notifications, markMultipleAsRead])

    // Click outside to close
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
                setShowNotifications(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleMarkAllAsRead = () => {
        markAllAsRead()
        toast.success('All notifications marked as read')
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
            case 'order_placed':
            case 'ORDER_PLACED':
            case 'order_assigned':
            case 'ORDER_ASSIGNED':
                return <Package className="w-4 h-4 text-blue-600" />
            case 'refund_request':
            case 'REFUND_REQUEST':
                return <DollarSign className="w-4 h-4 text-orange-600" />
            case 'new_complaint':
            case 'NEW_COMPLAINT':
                return <MessageSquare className="w-4 h-4 text-red-600" />
            case 'security_alert':
            case 'multiple_login_attempts':
            case 'account_locked':
                return <Shield className="w-4 h-4 text-red-600" />
            case 'new_tenancy_signup':
                return <Building2 className="w-4 h-4 text-green-600" />
            case 'tenancy_payment_received':
            case 'payment_received':
                return <CreditCard className="w-4 h-4 text-green-600" />
            case 'tenancy_subscription_expiring':
            case 'tenancy_subscription_expired':
            case 'subscription_expiring':
                return <AlertTriangle className="w-4 h-4 text-orange-600" />
            case 'new_lead':
                return <Target className="w-4 h-4 text-blue-500" />
            case 'new_staff_added':
            case 'admin_created':
                return <UserPlus className="w-4 h-4 text-indigo-600" />
            default:
                return <Bell className="w-4 h-4 text-purple-600" />
        }
    }

    const getNotificationBg = (type: string) => {
        if (type.includes('order') || type === 'ORDER_PLACED' || type === 'ORDER_ASSIGNED') return 'bg-blue-100'
        if (type.includes('refund') || type === 'REFUND_REQUEST') return 'bg-orange-100'
        if (type.includes('complaint') || type === 'NEW_COMPLAINT' || type.includes('security') || type.includes('locked')) return 'bg-red-100'
        if (type.includes('tenancy') || type.includes('payment') || type.includes('subscription')) return 'bg-green-100'
        if (type.includes('lead')) return 'bg-blue-50'
        if (type.includes('staff') || type.includes('admin')) return 'bg-indigo-100'
        return 'bg-purple-100'
    }

    const displayNotifications = notifications.slice(0, 10)

    return (
        <div className="relative" ref={notifRef}>
            <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors relative"
            >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium animate-pulse">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
                {/* Connection indicator */}
                <span className={`absolute bottom-0 right-0 w-2 h-2 rounded-full border border-white ${isConnected ? 'bg-green-500' : 'bg-red-400'}`} />
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                            {isConnected ? (
                                <Wifi className="w-3.5 h-3.5 text-green-500" />
                            ) : (
                                <WifiOff className="w-3.5 h-3.5 text-red-400" />
                            )}
                        </div>
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
                        {displayNotifications.length > 0 ? (
                            displayNotifications.map((notification) => (
                                <div
                                    key={notification._id}
                                    onClick={() => {
                                        if (!notification.isRead) {
                                            markAsRead(notification._id)
                                        }
                                    }}
                                    className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${!notification.isRead ? 'bg-blue-50' : ''}`}
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
                                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2 animate-pulse" />
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
                                {!isConnected && (
                                    <p className="text-xs text-red-400 mt-1">Offline - reconnecting...</p>
                                )}
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
