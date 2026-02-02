'use client'

import { useState, useEffect } from 'react'
import { 
  Activity, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Server,
  Database,
  CreditCard,
  Bell,
  TrendingUp,
  TrendingDown,
  Users,
  Package,
  RefreshCw,
  Eye,
  ExternalLink,
  Target,
  Zap,
  Globe,
  Shield,
  BarChart3
} from 'lucide-react'

interface SystemAlert {
  id: string
  title: string
  description: string
  severity: 'high' | 'medium' | 'low'
  status: 'active' | 'resolved'
  affectedTenants: number
  createdAt: string
  category: 'payment' | 'orders' | 'system' | 'performance'
}

interface HealthStatus {
  overall: 'healthy' | 'degraded' | 'down'
  services: {
    api: { status: string; responseTime: number; uptime: number }
    database: { status: string; responseTime: number; uptime: number }
    payments: { status: string; responseTime: number; uptime: number }
    notifications: { status: string; responseTime: number; uptime: number }
  }
  metrics: {
    activeUsers: number
    ordersPerHour: number
    paymentSuccessRate: number
    averageResponseTime: number
  }
  lastUpdated: string
}

interface TenantHeatmap {
  tenantId: string
  tenantName: string
  tenantSlug: string
  ticketCount: number
  highPriorityCount: number
  escalatedCount: number
  riskScore: number
}

export default function SystemMonitoringPage() {
  const [loading, setLoading] = useState(true)
  const [alerts, setAlerts] = useState<SystemAlert[]>([])
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null)
  const [tenantHeatmap, setTenantHeatmap] = useState<TenantHeatmap[]>([])
  const [timeframe, setTimeframe] = useState('24h')

  useEffect(() => {
    loadSystemData()
  }, [timeframe])

  const loadSystemData = async () => {
    try {
      const token = localStorage.getItem('auth-storage')
      if (!token) return

      const parsed = JSON.parse(token)
      const authToken = parsed.state?.token
      if (!authToken) return

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://laundrylobby-backend-1.vercel.app/api'
      
      // Load system alerts
      try {
        const alertsResponse = await fetch(`${API_URL}/support/system/alerts`, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        })

        if (alertsResponse.ok) {
          const alertsData = await alertsResponse.json()
          if (alertsData.success) {
            setAlerts(alertsData.data.alerts || [])
          }
        } else {
          // Mock alerts
          setAlerts([
            {
              id: '1',
              title: 'High Payment Failure Rate',
              description: 'Payment failure rate exceeded 15% in the last hour',
              severity: 'high',
              status: 'active',
              affectedTenants: 5,
              createdAt: '2026-01-27T10:30:00Z',
              category: 'payment'
            },
            {
              id: '2',
              title: 'Stuck Orders Alert',
              description: '12 orders stuck in processing for more than 24 hours',
              severity: 'medium',
              status: 'active',
              affectedTenants: 3,
              createdAt: '2026-01-27T08:15:00Z',
              category: 'orders'
            }
          ])
        }
      } catch (error) {
        console.error('Failed to load alerts:', error)
      }

      // Load platform health
      try {
        const healthResponse = await fetch(`${API_URL}/support/system/health`, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        })

        if (healthResponse.ok) {
          const healthData = await healthResponse.json()
          if (healthData.success) {
            setHealthStatus(healthData.data)
          }
        } else {
          // Mock health data
          setHealthStatus({
            overall: 'healthy',
            services: {
              api: { status: 'healthy', responseTime: 120, uptime: 99.9 },
              database: { status: 'healthy', responseTime: 45, uptime: 99.95 },
              payments: { status: 'degraded', responseTime: 800, uptime: 98.5 },
              notifications: { status: 'healthy', responseTime: 200, uptime: 99.8 }
            },
            metrics: {
              activeUsers: 1250,
              ordersPerHour: 45,
              paymentSuccessRate: 94.2,
              averageResponseTime: 180
            },
            lastUpdated: new Date().toISOString()
          })
        }
      } catch (error) {
        console.error('Failed to load health status:', error)
      }

      // Load tenant heatmap
      try {
        const heatmapResponse = await fetch(`${API_URL}/support/system/heatmap?timeframe=${timeframe}`, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        })

        if (heatmapResponse.ok) {
          const heatmapData = await heatmapResponse.json()
          if (heatmapData.success) {
            setTenantHeatmap(heatmapData.data.heatmap || [])
          }
        } else {
          // Mock heatmap data
          setTenantHeatmap([
            {
              tenantId: '1',
              tenantName: 'CleanWash Laundry',
              tenantSlug: 'cleanwash',
              ticketCount: 8,
              highPriorityCount: 3,
              escalatedCount: 1,
              riskScore: 14
            },
            {
              tenantId: '2',
              tenantName: 'QuickClean Services',
              tenantSlug: 'quickclean',
              ticketCount: 5,
              highPriorityCount: 2,
              escalatedCount: 0,
              riskScore: 9
            },
            {
              tenantId: '3',
              tenantName: 'FreshClean Express',
              tenantSlug: 'freshclean',
              ticketCount: 3,
              highPriorityCount: 1,
              escalatedCount: 0,
              riskScore: 5
            }
          ])
        }
      } catch (error) {
        console.error('Failed to load tenant heatmap:', error)
      }

    } catch (error) {
      console.error('Failed to load system data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'low': return 'bg-blue-100 text-blue-700 border-blue-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getServiceStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'healthy': return 'text-green-600'
      case 'degraded': return 'text-yellow-600'
      case 'down': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getServiceStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'healthy': return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'degraded': return <AlertTriangle className="w-5 h-5 text-yellow-600" />
      case 'down': return <XCircle className="w-5 h-5 text-red-600" />
      default: return <Clock className="w-5 h-5 text-gray-600" />
    }
  }

  const getRiskScoreColor = (score: number) => {
    if (score >= 15) return 'bg-red-100 text-red-700'
    if (score >= 10) return 'bg-yellow-100 text-yellow-700'
    if (score >= 5) return 'bg-blue-100 text-blue-700'
    return 'bg-green-100 text-green-700'
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-48"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
              <div className="space-y-3">
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Monitoring</h1>
          <p className="text-gray-600 mt-1">
            Monitor platform health, system alerts, and tenant issue patterns
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button 
            onClick={loadSystemData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* System Health Overview */}
      {healthStatus && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Platform Health Status</h2>
            <div className="flex items-center space-x-2">
              {healthStatus.overall === 'healthy' ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : healthStatus.overall === 'degraded' ? (
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600" />
              )}
              <span className={`font-medium ${getServiceStatusColor(healthStatus.overall)}`}>
                {healthStatus.overall.charAt(0).toUpperCase() + healthStatus.overall.slice(1)}
              </span>
            </div>
          </div>

          {/* Services Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {Object.entries(healthStatus.services).map(([service, data]) => (
              <div key={service} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900 capitalize">{service}</h3>
                  {getServiceStatusIcon(data.status)}
                </div>
                <div className="space-y-1 text-sm">
                  <p className="text-gray-600">Response: {data.responseTime}ms</p>
                  <p className="text-gray-600">Uptime: {data.uptime}%</p>
                </div>
              </div>
            ))}
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Users className="w-5 h-5 text-blue-600 mr-2" />
                <span className="text-2xl font-bold text-gray-900">{healthStatus.metrics.activeUsers.toLocaleString()}</span>
              </div>
              <p className="text-sm text-gray-600">Active Users</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Package className="w-5 h-5 text-green-600 mr-2" />
                <span className="text-2xl font-bold text-gray-900">{healthStatus.metrics.ordersPerHour}</span>
              </div>
              <p className="text-sm text-gray-600">Orders/Hour</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <CreditCard className="w-5 h-5 text-purple-600 mr-2" />
                <span className="text-2xl font-bold text-gray-900">{healthStatus.metrics.paymentSuccessRate}%</span>
              </div>
              <p className="text-sm text-gray-600">Payment Success</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Zap className="w-5 h-5 text-yellow-600 mr-2" />
                <span className="text-2xl font-bold text-gray-900">{healthStatus.metrics.averageResponseTime}ms</span>
              </div>
              <p className="text-sm text-gray-600">Avg Response</p>
            </div>
          </div>

          <div className="mt-4 text-xs text-gray-500">
            Last updated: {new Date(healthStatus.lastUpdated).toLocaleString()}
          </div>
        </div>
      )}

      {/* System Alerts */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">System Alerts</h2>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">{alerts.filter(a => a.status === 'active').length} active</span>
            </div>
          </div>
        </div>
        
        <div className="divide-y divide-gray-200">
          {alerts.length > 0 ? (
            alerts.map((alert) => (
              <div key={alert.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getSeverityColor(alert.severity)}`}>
                        {alert.severity.toUpperCase()}
                      </span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full capitalize">
                        {alert.category}
                      </span>
                      <span className="text-xs text-gray-500">
                        {alert.affectedTenants} tenants affected
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-medium text-gray-900 mb-2">{alert.title}</h3>
                    <p className="text-gray-600 mb-3">{alert.description}</p>
                    
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(alert.createdAt).toLocaleString()}</span>
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
                      <Eye className="w-4 h-4" />
                      <span>Investigate</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">All systems operational</h3>
              <p className="text-gray-500">No active alerts at this time</p>
            </div>
          )}
        </div>
      </div>

      {/* Tenant Issue Heatmap */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Tenant Issue Heatmap</h2>
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="1h">Last Hour</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
            </select>
          </div>
        </div>
        
        <div className="p-6">
          {tenantHeatmap.length > 0 ? (
            <div className="space-y-4">
              {tenantHeatmap.map((tenant) => (
                <div key={tenant.tenantId} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-medium text-gray-900">{tenant.tenantName}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRiskScoreColor(tenant.riskScore)}`}>
                        Risk Score: {tenant.riskScore}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-6 text-sm text-gray-600">
                      <span className="flex items-center space-x-1">
                        <Target className="w-4 h-4" />
                        <span>{tenant.ticketCount} tickets</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <AlertTriangle className="w-4 h-4" />
                        <span>{tenant.highPriorityCount} high priority</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <TrendingUp className="w-4 h-4" />
                        <span>{tenant.escalatedCount} escalated</span>
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-1 text-sm">
                      <Eye className="w-4 h-4" />
                      <span>View Details</span>
                    </button>
                    <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No issues detected</h3>
              <p className="text-gray-500">All tenants are operating normally</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">System Actions</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Create Alert</p>
                <p className="text-sm text-gray-500">Manual system alert</p>
              </div>
            </div>
          </button>
          
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BarChart3 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">View Metrics</p>
                <p className="text-sm text-gray-500">Detailed analytics</p>
              </div>
            </div>
          </button>
          
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Shield className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Security Status</p>
                <p className="text-sm text-gray-500">Check security</p>
              </div>
            </div>
          </button>
          
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Globe className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Network Status</p>
                <p className="text-sm text-gray-500">Check connectivity</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}