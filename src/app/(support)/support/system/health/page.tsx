'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'
import { 
  Activity,
  Server,
  Database,
  Wifi,
  Shield,
  Zap,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Minus,
  Monitor,
  HardDrive,
  Cpu,
  MemoryStick,
  Globe,
  Users
} from 'lucide-react'

interface HealthMetric {
  id: string
  name: string
  category: 'system' | 'database' | 'api' | 'infrastructure' | 'security'
  status: 'healthy' | 'warning' | 'critical' | 'unknown'
  value: number
  unit: string
  threshold: {
    warning: number
    critical: number
  }
  trend: 'up' | 'down' | 'stable'
  lastUpdated: string
  description: string
}

interface SystemComponent {
  id: string
  name: string
  type: 'service' | 'database' | 'server' | 'external'
  status: 'online' | 'degraded' | 'offline' | 'maintenance'
  uptime: number
  responseTime: number
  lastCheck: string
  dependencies: string[]
  location: string
}

interface HealthStats {
  overallHealth: number
  totalComponents: number
  healthyComponents: number
  warningComponents: number
  criticalComponents: number
  avgResponseTime: number
  systemUptime: number
}

export default function PlatformHealthPage() {
  const [loading, setLoading] = useState(true)
  const [metrics, setMetrics] = useState<HealthMetric[]>([])
  const [components, setComponents] = useState<SystemComponent[]>([])
  const [stats, setStats] = useState<HealthStats>({
    overallHealth: 100,
    totalComponents: 0,
    healthyComponents: 0,
    warningComponents: 0,
    criticalComponents: 0,
    avgResponseTime: 0,
    systemUptime: 99.9
  })
  const [activeTab, setActiveTab] = useState<'overview' | 'metrics' | 'components'>('overview')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadHealthData()
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadHealthData, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadHealthData = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await api.get('/support/system/health')
      const data = response.data
      const payload = data?.data || data

      setMetrics(payload?.metrics || [])
      setComponents(payload?.components || [])
      setStats(payload?.stats || {
        overallHealth: 100,
        totalComponents: 0,
        healthyComponents: 0,
        warningComponents: 0,
        criticalComponents: 0,
        avgResponseTime: 0,
        systemUptime: 99.9
      })
    } catch (err: any) {
      console.error('Error loading health data:', err)
      setError(err?.response?.data?.message || 'Failed to load platform health')
      setMetrics([])
      setComponents([])
      setStats({ overallHealth: 0, totalComponents: 0, healthyComponents: 0, warningComponents: 0, criticalComponents: 0, avgResponseTime: 0, systemUptime: 0 })
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'online': return 'bg-green-100 text-green-700'
      case 'warning':
      case 'degraded': return 'bg-yellow-100 text-yellow-700'
      case 'critical':
      case 'offline': return 'bg-red-100 text-red-700'
      case 'maintenance': return 'bg-blue-100 text-blue-700'
      case 'unknown': return 'bg-gray-100 text-gray-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'online': return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'warning':
      case 'degraded': return <AlertTriangle className="w-4 h-4 text-yellow-600" />
      case 'critical':
      case 'offline': return <XCircle className="w-4 h-4 text-red-600" />
      case 'maintenance': return <Clock className="w-4 h-4 text-blue-600" />
      default: return <Activity className="w-4 h-4 text-gray-600" />
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-red-500" />
      case 'down': return <TrendingDown className="w-4 h-4 text-green-500" />
      case 'stable': return <Minus className="w-4 h-4 text-gray-500" />
      default: return <Minus className="w-4 h-4 text-gray-500" />
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'system': return <Server className="w-5 h-5" />
      case 'database': return <Database className="w-5 h-5" />
      case 'api': return <Globe className="w-5 h-5" />
      case 'infrastructure': return <HardDrive className="w-5 h-5" />
      case 'security': return <Shield className="w-5 h-5" />
      default: return <Activity className="w-5 h-5" />
    }
  }

  const getComponentIcon = (type: string) => {
    switch (type) {
      case 'service': return <Server className="w-5 h-5" />
      case 'database': return <Database className="w-5 h-5" />
      case 'server': return <Monitor className="w-5 h-5" />
      case 'external': return <Globe className="w-5 h-5" />
      default: return <Activity className="w-5 h-5" />
    }
  }

  const getHealthColor = (health: number) => {
    if (health >= 95) return 'text-green-600'
    if (health >= 85) return 'text-yellow-600'
    return 'text-red-600'
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 bg-gray-200 rounded w-64 animate-pulse mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
          <h1 className="text-3xl font-bold text-gray-900">Platform Health</h1>
          <p className="text-gray-600 mt-1">
            Real-time monitoring of system health and performance metrics
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button 
            onClick={loadHealthData}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
          <p className="text-red-700">{error}</p>
          <button onClick={loadHealthData} className="text-red-600 hover:text-red-800 font-medium">Retry</button>
        </div>
      )}

      {/* Overall Health Card */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Overall System Health</h2>
            <div className="flex items-center space-x-4">
              <div className={`text-6xl font-bold ${getHealthColor(stats.overallHealth).replace('text-', 'text-white')}`}>
                {stats.overallHealth}%
              </div>
              <div className="text-blue-100">
                <p className="text-sm">System Uptime: {stats.systemUptime}%</p>
                <p className="text-sm">Avg Response: {stats.avgResponseTime}ms</p>
                <p className="text-sm">Last Updated: {new Date().toLocaleTimeString()}</p>
              </div>
            </div>
          </div>
          <div className="text-right">
            <Activity className="w-16 h-16 text-blue-200 mb-4" />
            <div className="text-blue-100 text-sm">
              <p>{stats.healthyComponents}/{stats.totalComponents} Components Healthy</p>
              <p>{stats.warningComponents} Warnings</p>
              <p>{stats.criticalComponents} Critical</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('metrics')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'metrics'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Metrics ({metrics.length})
            </button>
            <button
              onClick={() => setActiveTab('components')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'components'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Components ({components.length})
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.isArray(metrics) && metrics.slice(0, 6).map((metric) => (
                <div key={metric.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {getCategoryIcon(metric.category)}
                      <h3 className="text-lg font-medium text-gray-900">{metric.name}</h3>
                    </div>
                    {getStatusIcon(metric.status)}
                  </div>
                  
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-3xl font-bold text-gray-900">
                      {metric.value}{metric.unit}
                    </div>
                    {getTrendIcon(metric.trend)}
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">{metric.description}</p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Warning: {metric.threshold.warning}{metric.unit}</span>
                    <span>Critical: {metric.threshold.critical}{metric.unit}</span>
                  </div>
                  
                  <div className="mt-3 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        metric.status === 'healthy' ? 'bg-green-500' :
                        metric.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ 
                        width: `${Math.min((metric.value / metric.threshold.critical) * 100, 100)}%` 
                      }}
                    ></div>
                  </div>
                </div>
              ))}
              
              {(!Array.isArray(metrics) || metrics.length === 0) && (
                <div className="col-span-full text-center py-12">
                  <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No metrics available</h3>
                  <p className="text-gray-500">System metrics are currently being loaded</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'metrics' && (
            <div className="space-y-4">
              {Array.isArray(metrics) && metrics.map((metric) => (
                <div key={metric.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        {getCategoryIcon(metric.category)}
                        <h3 className="text-lg font-medium text-gray-900">{metric.name}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(metric.status)}`}>
                          {metric.status.toUpperCase()}
                        </span>
                        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full capitalize">
                          {metric.category}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3">{metric.description}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-xs text-gray-500">Current Value</p>
                          <p className="text-lg font-bold text-gray-900">{metric.value}{metric.unit}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Warning Threshold</p>
                          <p className="text-sm text-yellow-600">{metric.threshold.warning}{metric.unit}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Critical Threshold</p>
                          <p className="text-sm text-red-600">{metric.threshold.critical}{metric.unit}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Last Updated</p>
                          <p className="text-sm text-gray-900">{new Date(metric.lastUpdated).toLocaleTimeString()}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {getTrendIcon(metric.trend)}
                    </div>
                  </div>
                </div>
              ))}
              
              {(!Array.isArray(metrics) || metrics.length === 0) && (
                <div className="text-center py-12">
                  <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No metrics available</h3>
                  <p className="text-gray-500">System metrics are currently being loaded</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'components' && (
            <div className="space-y-4">
              {Array.isArray(components) && components.map((component) => (
                <div key={component.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        {getComponentIcon(component.type)}
                        <h3 className="text-lg font-medium text-gray-900">{component.name}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(component.status)}`}>
                          {component.status.toUpperCase()}
                        </span>
                        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full capitalize">
                          {component.type}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-3">
                        <div>
                          <p className="text-xs text-gray-500">Uptime</p>
                          <p className="text-sm font-medium text-gray-900">{component.uptime}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Response Time</p>
                          <p className="text-sm font-medium text-gray-900">
                            {component.responseTime > 0 ? `${component.responseTime}ms` : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Location</p>
                          <p className="text-sm font-medium text-gray-900">{component.location}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Last Check</p>
                          <p className="text-sm font-medium text-gray-900">{new Date(component.lastCheck).toLocaleTimeString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Dependencies</p>
                          <p className="text-sm font-medium text-gray-900">
                            {component.dependencies.length > 0 ? component.dependencies.join(', ') : 'None'}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(component.status)}
                    </div>
                  </div>
                </div>
              ))}
              
              {(!Array.isArray(components) || components.length === 0) && (
                <div className="text-center py-12">
                  <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No components available</h3>
                  <p className="text-gray-500">System components are currently being loaded</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}