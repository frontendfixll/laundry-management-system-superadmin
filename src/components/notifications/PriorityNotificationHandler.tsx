'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { AlertTriangle, Shield, X, CheckCircle, Clock, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'react-hot-toast'

interface CriticalNotification {
  id: string
  title: string
  message: string
  priority: 'P0' | 'P1'
  eventType: string
  createdAt: string
  metadata?: any
  requiresAck?: boolean
}

interface PriorityNotificationHandlerProps {
  notifications: any[]
  onAcknowledge: (notificationId: string) => void
}

export function PriorityNotificationHandler({
  notifications,
  onAcknowledge
}: PriorityNotificationHandlerProps) {
  const [criticalModal, setCriticalModal] = useState<CriticalNotification | null>(null)
  const [acknowledgedIds, setAcknowledgedIds] = useState<Set<string>>(new Set())

  // Handle P0 critical notifications with modal popup
  useEffect(() => {
    const criticalNotifications = notifications.filter(n =>
      n.priority === 'P0' &&
      !acknowledgedIds.has(n.id) &&
      !n.metadata?.isRead &&
      !n.isRead
    )

    if (criticalNotifications.length > 0 && !criticalModal) {
      const latest = criticalNotifications[0]
      setCriticalModal(latest)

      // Play critical alert sound
      // try {
      //   const audio = new Audio('/critical-alert.mp3')
      //   audio.volume = 0.8
      //   audio.play().catch(() => {
      //     // Fallback to default sound
      //     const fallbackAudio = new Audio('/notification-sound.mp3')
      //     fallbackAudio.volume = 0.8
      //     fallbackAudio.play().catch(() => {})
      //   })
      // } catch (error) {
      //   // console.warn('Could not play critical alert sound:', error)
      // }

      // Browser notification for critical alerts
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(`🚨 CRITICAL PLATFORM ALERT`, {
          body: `${latest.title}: ${latest.message}`,
          icon: '/favicon.ico',
          tag: latest.id,
          requireInteraction: true
        })
      }
    }
  }, [notifications, acknowledgedIds, criticalModal])

  const handleAcknowledge = useCallback((notificationId: string) => {
    setAcknowledgedIds(prev => new Set(Array.from(prev).concat(notificationId)))
    onAcknowledge(notificationId)
    setCriticalModal(null)
    toast.success('Critical alert acknowledged')
  }, [onAcknowledge])

  const handleDismiss = useCallback(() => {
    if (criticalModal) {
      setAcknowledgedIds(prev => new Set(Array.from(prev).concat(criticalModal.id)))
      setCriticalModal(null)
    }
  }, [criticalModal])

  // P1 High priority notifications with enhanced toast
  useEffect(() => {
    const highPriorityNotifications = notifications.filter(n =>
      n.priority === 'P1' &&
      !acknowledgedIds.has(n.id) &&
      !n.metadata?.isRead &&
      !n.isRead
    )

    highPriorityNotifications.forEach(notification => {
      if (!acknowledgedIds.has(notification.id)) {
        setAcknowledgedIds(prev => new Set(Array.from(prev).concat(notification.id)))

        toast(
          (t) => (
            <div className="flex flex-col gap-3 p-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                <span className="text-xs font-black uppercase tracking-wider bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                  P1 HIGH PRIORITY
                </span>
              </div>
              <div className="font-bold text-gray-900">{notification.title}</div>
              <div className="text-sm text-gray-700">{notification.message}</div>
              {notification.metadata?.tenantCount && (
                <div className="text-xs text-gray-600 flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  <span>Affects {notification.metadata.tenantCount} tenant(s)</span>
                </div>
              )}
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => {
                    onAcknowledge(notification.id)
                    toast.dismiss(t.id)
                  }}
                  className="bg-orange-600 text-white text-xs px-3 py-1.5 rounded hover:bg-orange-700 transition-colors font-bold flex items-center gap-1"
                >
                  <CheckCircle className="w-3 h-3" />
                  Acknowledge
                </button>
                <button
                  onClick={() => toast.dismiss(t.id)}
                  className="bg-gray-200 text-gray-700 text-xs px-3 py-1.5 rounded hover:bg-gray-300 transition-colors font-bold"
                >
                  Dismiss
                </button>
              </div>
            </div>
          ),
          {
            duration: 15000,
            position: 'top-right',
            style: {
              borderLeft: '4px solid #ea580c',
              minWidth: '350px',
              maxWidth: '450px'
            }
          }
        )
      }
    })
  }, [notifications, acknowledgedIds, onAcknowledge])

  if (!criticalModal) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl border-4 border-red-500 animate-in zoom-in-95 duration-300">
        {/* Critical Alert Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center animate-pulse">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-xs font-black uppercase tracking-widest opacity-90">
                  CRITICAL PLATFORM ALERT
                </div>
                <div className="text-lg font-bold">P0 - Immediate Action Required</div>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="text-white/70 hover:text-white transition-colors p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Alert Content */}
        <div className="p-6 space-y-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {criticalModal.title}
            </h3>
            <p className="text-gray-700 leading-relaxed">
              {criticalModal.message}
            </p>
          </div>

          {/* Metadata */}
          {criticalModal.metadata && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              {criticalModal.metadata.tenantCount && (
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">Affected Tenants:</span>
                  <span className="text-red-600 font-bold">{criticalModal.metadata.tenantCount}</span>
                </div>
              )}
              {criticalModal.metadata.amount && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">Financial Impact:</span>
                  <span className="text-red-600 font-bold">${criticalModal.metadata.amount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="font-medium">Alert Time:</span>
                <span className="text-gray-600">{new Date(criticalModal.createdAt).toLocaleString()}</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={() => handleAcknowledge(criticalModal.id)}
              className="flex-1 bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors font-bold flex items-center justify-center gap-2"
            >
              <Shield className="w-4 h-4" />
              Acknowledge & Take Action
            </button>
            <button
              onClick={handleDismiss}
              className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Dismiss
            </button>
          </div>

          {/* Warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-yellow-800">
                <span className="font-bold">Critical alerts require immediate attention.</span>
                <br />
                This notification will persist until acknowledged by a SuperAdmin.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}