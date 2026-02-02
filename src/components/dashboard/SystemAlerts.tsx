'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  AlertTriangle, 
  Shield, 
  DollarSign, 
  Server, 
  CheckCircle,
  X,
  ExternalLink,
  Loader2
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Alert {
  id?: string
  type: 'security' | 'business' | 'system'
  level: 'low' | 'medium' | 'high' | 'critical'
  message: string
  action: string
  actionUrl?: string
}

interface SystemAlertsProps {
  alerts: Alert[]
  loading?: boolean
  onDismiss?: (alertId: string) => void
  onClearAll?: () => void
}

const alertConfig = {
  security: {
    icon: Shield,
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    iconColor: 'text-red-600',
    defaultUrl: '/superadmin/audit'
  },
  business: {
    icon: DollarSign,
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    iconColor: 'text-yellow-600',
    defaultUrl: '/superadmin/financial'
  },
  system: {
    icon: Server,
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    iconColor: 'text-blue-600',
    defaultUrl: '/superadmin/settings'
  }
}

const levelConfig = {
  low: {
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    text: 'Low'
  },
  medium: {
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    text: 'Medium'
  },
  high: {
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    text: 'High'
  },
  critical: {
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    text: 'Critical'
  }
}

export default function SystemAlerts({ alerts, loading, onDismiss, onClearAll }: SystemAlertsProps) {
  const router = useRouter()
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set())
  const [clearingAll, setClearingAll] = useState(false)
  
  // Filter out dismissed alerts
  const safeAlerts = (alerts || []).filter((alert, index) => {
    const alertId = alert.id || `alert-${index}`
    return !dismissedAlerts.has(alertId)
  })
  
  const handleDismiss = (alert: Alert, index: number) => {
    const alertId = alert.id || `alert-${index}`
    
    // Add to dismissed set
    setDismissedAlerts(prev => new Set([...prev, alertId]))
    
    // Call parent callback if provided
    if (onDismiss) {
      onDismiss(alertId)
    }
    
    toast.success('Alert dismissed')
  }
  
  const handleClearAll = async () => {
    setClearingAll(true)
    
    // Dismiss all alerts locally
    const allAlertIds = (alerts || []).map((alert, index) => alert.id || `alert-${index}`)
    setDismissedAlerts(new Set(allAlertIds))
    
    // Call parent callback if provided
    if (onClearAll) {
      onClearAll()
    }
    
    toast.success('All alerts cleared')
    setClearingAll(false)
  }
  
  const handleAction = (alert: Alert) => {
    const alertStyle = alertConfig[alert.type]
    const url = alert.actionUrl || alertStyle.defaultUrl
    
    router.push(url)
  }
  
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg">
                <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <h3 className="text-lg font-semibold text-gray-900">System Alerts</h3>
          {safeAlerts.length > 0 && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-50 text-red-600 border border-red-200">
              {safeAlerts.length} Active
            </span>
          )}
        </div>
        
        {safeAlerts.length > 0 && (
          <button 
            onClick={handleClearAll}
            disabled={clearingAll}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50 flex items-center gap-1"
          >
            {clearingAll && <Loader2 className="w-3 h-3 animate-spin" />}
            Clear All
          </button>
        )}
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {safeAlerts.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <h4 className="text-sm font-medium text-gray-900 mb-1">All Systems Operational</h4>
            <p className="text-sm text-gray-500">No active alerts or issues detected</p>
          </div>
        ) : (
          safeAlerts.map((alert, index) => {
            const alertStyle = alertConfig[alert.type]
            const levelStyle = levelConfig[alert.level]
            const AlertIcon = alertStyle.icon
            
            return (
              <div
                key={alert.id || index}
                className={`flex items-start space-x-3 p-4 border rounded-lg ${alertStyle.bgColor} ${alertStyle.borderColor} hover:shadow-sm transition-shadow`}
              >
                {/* Alert Icon */}
                <div className={`flex-shrink-0 w-8 h-8 rounded-lg bg-white flex items-center justify-center border border-gray-200`}>
                  <AlertIcon className={`w-4 h-4 ${alertStyle.iconColor}`} />
                </div>

                {/* Alert Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${levelStyle.bgColor} ${levelStyle.color}`}>
                      {levelStyle.text}
                    </span>
                    <span className="text-xs text-gray-500 capitalize">
                      {alert.type}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-900 mb-2">
                    {alert.message}
                  </p>
                  
                  <button 
                    onClick={() => handleAction(alert)}
                    className="inline-flex items-center text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
                  >
                    {alert.action}
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </button>
                </div>

                {/* Dismiss Button */}
                <button 
                  onClick={() => handleDismiss(alert, index)}
                  className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded transition-colors"
                  title="Dismiss alert"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )
          })
        )}
      </div>

      {/* Alert Summary */}
      {safeAlerts.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold text-red-600">
                {safeAlerts.filter(a => a.level === 'critical').length}
              </div>
              <div className="text-xs text-gray-500">Critical</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-orange-600">
                {safeAlerts.filter(a => a.level === 'high').length}
              </div>
              <div className="text-xs text-gray-500">High</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-yellow-600">
                {safeAlerts.filter(a => a.level === 'medium').length}
              </div>
              <div className="text-xs text-gray-500">Medium</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-green-600">
                {safeAlerts.filter(a => a.level === 'low').length}
              </div>
              <div className="text-xs text-gray-500">Low</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
