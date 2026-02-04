'use client'

import React, { useState, useEffect } from 'react'
import { AlertTriangle, TrendingUp, Users, DollarSign, Shield, Server, Zap, Eye, EyeOff, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSocketIONotifications } from '@/hooks/useSocketIONotifications'

interface LiveAlert {
  id: string
  title: string
  message: string
  priority: 'P0' | 'P1' | 'P2' | 'P3' | 'P4'
  eventType: string
  createdAt: string
  metadata?: any
}

export function LiveAlerts() {
  const { notifications, stats, isConnected } = useSocketIONotifications()
  const [isMinimized, setIsMinimized] = useState(false)
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set())

  // Filter for recent high-priority alerts (last 24 hours)
  const recentAlerts = notifications
    .filter(n => {
      const alertTime = new Date(n.createdAt).getTime()
      const now = Date.now()
      const twentyFourHours = 24 * 60 * 60 * 1000
      
      return (
        (n.priority === 'P0' || n.priority === 'P1' || n.priority === 'P2') &&
        (now - alertTime) < twentyFourHours &&
        !dismissedAlerts.has(n.id)
      )
    })
    .slice(0, 5) // Show max 5 alerts

  const handleDismissAlert = (alertId: string) => {
    setDismissedAlerts(prev => new Set([...prev, alertId]))
  }

  const getAlertIcon = (eventType: string, priority: string) => {
    if (eventType.includes('security') || eventType.includes('breach')) {
      return <Shield className={cn("w-4 h-4", priority === 'P0' ? 'text-red-500' : 'text-orange-500')} />
    }
    if (eventType.includes('payment') || eventType.includes('billing')) {
      return <DollarSign className={cn("w-4 h-4", priority === 'P0' ? 'text-red-500' : 'text-orange-500')} />
    }
    if (eventType.includes('tenant') || eventType.includes('user')) {
      return <Users className={cn("w-4 h-4", priority === 'P0' ? 'text-red-500' : 'text-orange-500')} />
    }
    if (eventType.includes('system') || eventType.includes('performance')) {
      return <Server className={cn("w-4 h-4", priority === 'P0' ? 'text-red-500' : 'text-orange-500')} />
    }
    return <AlertTriangle className={cn("w-4 h-4", priority === 'P0' ? 'text-red-500' : 'text-orange-500')} />
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'P0': return 'border-red-500 bg-red-50'
      case 'P1': return 'border-orange-500 bg-orange-50'
      case 'P2': return 'border-blue-500 bg-blue-50'
      default: return 'border-gray-500 bg-gray-50'
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  if (recentAlerts.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <h3 className="text-lg font-semibold text-gray-900">Live Platform Status</h3>
          </div>
          <div className={cn(
            "text-xs px-2 py-1 rounded-full font-medium",
            isConnected ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          )}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </div>
        </div>
        
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-green-500" />
          </div>
          <p className="text-sm font-medium text-gray-900">All Systems Operational</p>
          <p className="text-xs text-gray-500 mt-1">No critical alerts in the last 24 hours</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
          <h3 className="text-lg font-semibold text-gray-900">Live Platform Alerts</h3>
          <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-bold">
            {recentAlerts.length} Active
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className={cn(
            "text-xs px-2 py-1 rounded-full font-medium",
            isConnected ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          )}>
            {isConnected ? 'Live' : 'Offline'}
          </div>
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            {isMinimized ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Priority Summary */}
      {!isMinimized && (
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center gap-4 text-xs">
            {stats.byPriority.P0 > 0 && (
              <div className="flex items-center gap-1">
                <Zap className="w-3 h-3 text-red-500" />
                <span className="font-bold text-red-600">P0: {stats.byPriority.P0}</span>
              </div>
            )}
            {stats.byPriority.P1 > 0 && (
              <div className="flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-orange-500" />
                <span className="font-bold text-orange-600">P1: {stats.byPriority.P1}</span>
              </div>
            )}
            {stats.byPriority.P2 > 0 && (
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-blue-500" />
                <span className="font-bold text-blue-600">P2: {stats.byPriority.P2}</span>
              </div>
            )}
            <div className="ml-auto text-gray-500">
              Last updated: {formatTimeAgo(recentAlerts[0]?.createdAt || new Date().toISOString())}
            </div>
          </div>
        </div>
      )}

      {/* Alerts List */}
      {!isMinimized && (
        <div className="max-h-80 overflow-y-auto">
          {recentAlerts.map((alert) => (
            <div
              key={alert.id}
              className={cn(
                "p-4 border-l-4 border-b border-gray-100 last:border-b-0 transition-all duration-200",
                getPriorityColor(alert.priority)
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-white border flex items-center justify-center">
                    {getAlertIcon(alert.eventType, alert.priority)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn(
                        "text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full",
                        alert.priority === 'P0' ? "bg-red-100 text-red-700" :
                        alert.priority === 'P1' ? "bg-orange-100 text-orange-700" :
                        "bg-blue-100 text-blue-700"
                      )}>
                        {alert.priority}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatTimeAgo(alert.createdAt)}
                      </span>
                    </div>
                    
                    <h4 className="text-sm font-semibold text-gray-900 mb-1">
                      {alert.title}
                    </h4>
                    <p className="text-xs text-gray-600 line-clamp-2">
                      {alert.message}
                    </p>
                    
                    {/* Metadata */}
                    {alert.metadata && (
                      <div className="flex items-center gap-3 mt-2 text-xs">
                        {alert.metadata.tenantCount && (
                          <div className="flex items-center gap-1 text-gray-600">
                            <Users className="w-3 h-3" />
                            <span>{alert.metadata.tenantCount} tenants</span>
                          </div>
                        )}
                        {alert.metadata.amount && (
                          <div className="flex items-center gap-1 text-gray-600">
                            <DollarSign className="w-3 h-3" />
                            <span>${alert.metadata.amount.toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                <button
                  onClick={() => handleDismissAlert(alert.id)}
                  className="flex-shrink-0 p-1 hover:bg-white/50 rounded transition-colors"
                >
                  <X className="w-3 h-3 text-gray-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Minimized View */}
      {isMinimized && (
        <div className="p-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              {recentAlerts.length} active alerts
            </span>
            <div className="flex items-center gap-2">
              {stats.byPriority.P0 > 0 && (
                <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-bold">
                  {stats.byPriority.P0} Critical
                </span>
              )}
              {stats.byPriority.P1 > 0 && (
                <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-bold">
                  {stats.byPriority.P1} High
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}