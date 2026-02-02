'use client'

import { useState, useEffect } from 'react'
import { 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Activity,
  Server,
  Database,
  Wifi,
  Shield,
  Zap,
  RefreshCw,
  Bell,
  BellOff,
  Settings,
  Filter,
  Search,
  Eye,
  Calendar
} from 'lucide-react'

interface SystemAlert {
  id: string
  title: string
  description: string
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info'
  category: 'performance' | 'security' | 'connectivity' | 'database' | 'service' | 'infrastructure'
  status: 'active' | 'acknowledged' | 'resolved' | 'suppressed'
  source: string
  affectedServices: string[]
  createdAt: string
  acknowledgedAt?: string
  acknowledgedBy?: string
  resolvedAt?: string
  resolvedBy?: string
  metadata: {
    threshold?: number
    currentValue?: number
    expectedValue?: number
    errorCount?: number
    affectedUsers?: number
  }
}

interface AlertStats {
  totalAlerts: number
  activeAlerts: number
  criticalAlerts: number
  resolvedToday: number
  avgResolutionTime: string
  systemHealth: number
}

export default function SystemAlertsPage() {
  const [loading, setLoading] = useState(true)
  const [alerts, setAlerts] = useState<SystemAlert[]>([])
  const [stats, setStats] = useState<AlertStats>({
    totalAlerts: 0,
    activeAlerts: 0,
    criticalAlerts: 0,
    resolvedToday: 0,
    avgResolutionTime: '0m',
    systemHealth: 100
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [severityFilter, setSeverityFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedAlert, setSelectedAlert] = useState<SystemAlert | null>(null)

  useEffect(() => {
    loadSystemAlerts()
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadSystemAlerts, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadSystemAlerts = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('auth-storage')
      if (!token) return

      const parsed = JSON.parse(token)
      const authToken = parsed.state?.token
      if (!authToken) return

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://laundrylobby-backend-1.vercel.app/api'
      
      // Load system alerts
      const response = await fetch(`${API_URL}/support/system/alerts`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        console.log('🚨 System alerts data:', data)
        
        if (data.success) {
          setAlerts(data.data.alerts || [])
          setStats(data.data.stats || stats)
        }
      } else {
        console.error('Failed to load system alerts:', response.status)
        setMockData()
      }
    } catch (error) {
      console.error('Error loading system alerts:', error)
      setMockData()
    } finally {
      setLoading(false)
    }
  }

  const setMockData = () => {
    const mockAlerts: SystemAlert[] = [
      {
        id: '1',
        title: 'High Database Connection Pool Usage',
        description: 'Database connection pool is at 85% capacity, approaching critical threshold',
        severity: 'high',
        category: 'database',
        status: 'active',
        source: 'Database Monitor',
        affectedServices: ['User Authentication', 'Order Processing', 'Payment Gateway'],
        createdAt: '2026-01-27T15:30:00Z',
        metadata: {
          threshold: 80,
          currentValue: 85,
          expectedValue: 60
        }
      },
      {
        id: '2',
        title: 'API Response Time Degradation',
        description: 'Average API response time has increased by 40% in the last 15 minutes',
        severity: 'medium',
        category: 'performance',
        status: 'acknowledged',
        source: 'Performance Monitor',
        affectedServices: ['REST API', 'Mobile App', 'Web Dashboard'],
        createdAt: '2026-01-27T15:15:00Z',
        acknowledgedAt: '2026-01-27T15:20:00Z',
        acknowledgedBy: 'Platform Support',
        metadata: {
          threshold: 500,
          currentValue: 700,
          expectedValue: 300
        }
      },
      {
        id: '3',
        title: 'Failed Login Attempts Spike',
        description: 'Unusual spike in failed login attempts detected - possible brute force attack',
        severity: 'critical',
        category: 'security',
        status: 'active',
        source: 'Security Monitor',
        affectedServices: ['Authentication Service'],
        createdAt: '2026-01-27T15:00:00Z',
        metadata: {
          errorCount: 150,
          threshold: 50,
          affectedUsers: 25
        }
      },
      {
        id: '4',
        title: 'Payment Gateway Timeout',
        description: 'Payment gateway is experiencing intermittent timeouts',
        severity: 'high',
        category: 'service',
        status: 'resolved',
        source: 'Payment Monitor',
        affectedServices: ['Payment Processing', 'Subscription Billing'],
        createdAt: '2026-01-27T14:30:00Z',
        resolvedAt: '2026-01-27T14:45:00Z',
        resolvedBy: 'Technical Team',
        metadata: {
          errorCount: 12,
          affectedUsers: 8
        }
      },
      {
        id: '5',
        title: 'Disk Space Warning',
        description: 'Server disk space usage is at 75% capacity',
        severity: 'medium',
        category: 'infrastructure',
        status: 'active',
        source: 'Infrastructure Monitor',
        affectedServices: ['File Storage', 'Log Management'],
        createdAt: '2026-01-27T14:00:00Z',
        metadata: {
          threshold: 70,
          currentValue: 75,
          expectedValue: 50
        }
      }
    ]

    setAlerts(mockAlerts)
    setStats({
      totalAlerts: mockAlerts.length,
      activeAlerts: mockAlerts.filter(a => a.status === 'active').length,
      criticalAlerts: mockAlerts.filter(a => a.severity === 'critical' && a.status === 'active').length,
      resolvedToday: mockAlerts.filter(a => a.status === 'resolved').length,
      avgResolutionTime: '15m',
      systemHealth: 92
    })
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-700 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'low': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'info': return 'bg-gray-100 text-gray-700 border-gray-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="w-4 h-4" />
      case 'high': return <AlertTriangle className="w-4 h-4" />
      case 'medium': return <Clock className="w-4 h-4" />
      case 'low': return <Activity className="w-4 h-4" />
      case 'info': return <CheckCircle className="w-4 h-4" />
      default: return <Activity className="w-4 h-4" />
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'performance': return <Zap className="w-4 h-4" />
      case 'security': return <Shield className="w-4 h-4" />
      case 'connectivity': return <Wifi className="w-4 h-4" />
      case 'database': return <Database className="w-4 h-4" />
      case 'service': return <Server className="w-4 h-4" />
      case 'infrastructure': return <Activity className="w-4 h-4" />
      default: return <Activity className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-red-100 text-red-700'
      case 'acknowledged': return 'bg-yellow-100 text-yellow-700'
      case 'resolved': return 'bg-green-100 text-green-700'
      case 'suppressed': return 'bg-gray-100 text-gray-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const handleAcknowledgeAlert = async (alertId: string) => {
    // Update alert status to acknowledged
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? { ...alert, status: 'acknowledged', acknowledgedAt: new Date().toISOString(), acknowledgedBy: 'Platform Support' }
        : alert
    ))
  }

  const handleResolveAlert = async (alertId: string) => {
    // Update alert status to resolved
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? { ...alert, status: 'resolved', resolvedAt: new Date().toISOString(), resolvedBy: 'Platform Support' }
        : alert
    ))
  }

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = (alert.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (alert.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (alert.source || '').toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesSeverity = severityFilter === 'all' || alert.severity === severityFilter
    const matchesCategory = categoryFilter === 'all' || alert.category === categoryFilter
    const matchesStatus = statusFilter === 'all' || alert.status === statusFilter
    
    return matchesSearch && matchesSeverity && matchesCategory && matchesStatus
  })

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
          <h1 className="text-3xl font-bold text-gray-900">System Alerts</h1>
          <p className="text-gray-600 mt-1">
            Monitor and manage system alerts and notifications
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button 
            onClick={loadSystemAlerts}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
            <Settings className="w-4 h-4" />
            <span>Configure</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Alerts</p>
              <p className="text-3xl font-bold">{stats.totalAlerts}</p>
              <p className="text-blue-100 text-xs">All time</p>
            </div>
            <Bell className="w-8 h-8 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm">Active Alerts</p>
              <p className="text-3xl font-bold">{stats.activeAlerts}</p>
              <p className="text-red-100 text-xs">Needs attention</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Critical</p>
              <p className="text-3xl font-bold">{stats.criticalAlerts}</p>
              <p className="text-orange-100 text-xs">Urgent action</p>
            </div>
            <XCircle className="w-8 h-8 text-orange-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Resolved Today</p>
              <p className="text-3xl font-bold">{stats.resolvedToday}</p>
              <p className="text-green-100 text-xs">Successfully fixed</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">System Health</p>
              <p className="text-3xl font-bold">{stats.systemHealth}%</p>
              <p className="text-purple-100 text-xs">Overall status</p>
            </div>
            <Activity className="w-8 h-8 text-purple-200" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search alerts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
              <option value="info">Info</option>
            </select>
            
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              <option value="performance">Performance</option>
              <option value="security">Security</option>
              <option value="connectivity">Connectivity</option>
              <option value="database">Database</option>
              <option value="service">Service</option>
              <option value="infrastructure">Infrastructure</option>
            </select>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="acknowledged">Acknowledged</option>
              <option value="resolved">Resolved</option>
              <option value="suppressed">Suppressed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            System Alerts ({filteredAlerts.length})
          </h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {Array.isArray(filteredAlerts) && filteredAlerts.length > 0 ? (
            filteredAlerts.map((alert) => (
              <div key={alert.id} className={`p-6 hover:bg-gray-50 transition-colors border-l-4 ${getSeverityColor(alert.severity).replace('bg-', 'border-').replace('-100', '-300')}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      {getSeverityIcon(alert.severity || 'medium')}
                      <h3 className="text-lg font-medium text-gray-900">{alert.title || 'Untitled Alert'}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(alert.severity || 'medium')}`}>
                        {(alert.severity || 'medium').toUpperCase()}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(alert.status || 'active')}`}>
                        {(alert.status || 'active').toUpperCase()}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">{alert.description || 'No description available'}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                      <div>
                        <p className="text-xs text-gray-500">Source</p>
                        <div className="flex items-center space-x-2">
                          {getCategoryIcon(alert.category || 'performance')}
                          <p className="text-sm font-medium text-gray-900">{alert.source || 'Unknown Source'}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Affected Services</p>
                        <p className="text-sm text-gray-900">{alert.affectedServices?.join(', ') || 'No services specified'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Created</p>
                        <p className="text-sm text-gray-900">{alert.createdAt ? new Date(alert.createdAt).toLocaleString() : 'Unknown'}</p>
                      </div>
                    </div>
                    
                    {alert.metadata && (
                      <div className="bg-gray-50 rounded-lg p-3 mb-3">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          {alert.metadata.currentValue && (
                            <div>
                              <p className="text-gray-500">Current</p>
                              <p className="font-medium text-gray-900">{alert.metadata.currentValue}</p>
                            </div>
                          )}
                          {alert.metadata.threshold && (
                            <div>
                              <p className="text-gray-500">Threshold</p>
                              <p className="font-medium text-gray-900">{alert.metadata.threshold}</p>
                            </div>
                          )}
                          {alert.metadata.errorCount && (
                            <div>
                              <p className="text-gray-500">Errors</p>
                              <p className="font-medium text-gray-900">{alert.metadata.errorCount}</p>
                            </div>
                          )}
                          {alert.metadata.affectedUsers && (
                            <div>
                              <p className="text-gray-500">Affected Users</p>
                              <p className="font-medium text-gray-900">{alert.metadata.affectedUsers}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {alert.status === 'active' && (
                      <>
                        <button
                          onClick={() => handleAcknowledgeAlert(alert.id)}
                          className="px-3 py-1 bg-yellow-600 text-white text-xs rounded hover:bg-yellow-700 transition-colors"
                        >
                          Acknowledge
                        </button>
                        <button
                          onClick={() => handleResolveAlert(alert.id)}
                          className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                        >
                          Resolve
                        </button>
                      </>
                    )}
                    <button 
                      onClick={() => setSelectedAlert(alert)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center">
              <CheckCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No alerts found</h3>
              <p className="text-gray-500">All systems are running smoothly</p>
            </div>
          )}
        </div>
      </div>

      {/* Alert Details Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Alert Details</h2>
                <button 
                  onClick={() => setSelectedAlert(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  {getSeverityIcon(selectedAlert.severity || 'medium')}
                  <h3 className="text-xl font-medium text-gray-900">{selectedAlert.title || 'Untitled Alert'}</h3>
                </div>
                <p className="text-gray-600">{selectedAlert.description || 'No description available'}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Severity</p>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(selectedAlert.severity || 'medium')}`}>
                    {(selectedAlert.severity || 'medium').toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedAlert.status || 'active')}`}>
                    {(selectedAlert.status || 'active').toUpperCase()}
                  </span>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 mb-2">Affected Services</p>
                <div className="flex flex-wrap gap-2">
                  {selectedAlert.affectedServices?.map((service, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                      {service}
                    </span>
                  )) || <span className="text-sm text-gray-500">No services specified</span>}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Source</p>
                  <p className="font-medium text-gray-900">{selectedAlert.source || 'Unknown Source'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Category</p>
                  <p className="font-medium text-gray-900 capitalize">{selectedAlert.category || 'unknown'}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Created</p>
                <p className="font-medium text-gray-900">{selectedAlert.createdAt ? new Date(selectedAlert.createdAt).toLocaleString() : 'Unknown'}</p>
              </div>
              
              {selectedAlert.acknowledgedAt && (
                <div>
                  <p className="text-sm text-gray-500">Acknowledged</p>
                  <p className="font-medium text-gray-900">
                    {new Date(selectedAlert.acknowledgedAt).toLocaleString()} by {selectedAlert.acknowledgedBy || 'Unknown'}
                  </p>
                </div>
              )}
              
              {selectedAlert.resolvedAt && (
                <div>
                  <p className="text-sm text-gray-500">Resolved</p>
                  <p className="font-medium text-gray-900">
                    {new Date(selectedAlert.resolvedAt).toLocaleString()} by {selectedAlert.resolvedBy || 'Unknown'}
                  </p>
                </div>
              )}
              
              {selectedAlert.metadata && Object.keys(selectedAlert.metadata).length > 0 && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Technical Details</p>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <pre className="text-xs text-gray-900 whitespace-pre-wrap">
                      {JSON.stringify(selectedAlert.metadata, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}