'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { 
  Activity,
  Search,
  Filter,
  Calendar,
  Download,
  Server,
  Database,
  Zap,
  AlertTriangle,
  CheckCircle,
  Clock,
  Cpu,
  HardDrive,
  Wifi
} from 'lucide-react'

interface SystemEventLog {
  _id: string
  timestamp: Date
  system: string
  component: string
  event: string
  level: 'info' | 'warning' | 'error' | 'critical'
  message: string
  details: any
  duration?: number
  affectedUsers?: number
  tenantId?: string
  tenantName?: string
  resolved: boolean
  resolvedAt?: Date
  resolvedBy?: string
}

export default function SystemEventLogsPage() {
  const [logs, setLogs] = useState<SystemEventLog[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLevel, setSelectedLevel] = useState('all')
  const [selectedSystem, setSelectedSystem] = useState('all')
  const [dateRange, setDateRange] = useState('24h')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchSystemEventLogs()
  }, [page, selectedLevel, selectedSystem, dateRange, searchQuery])

  const fetchSystemEventLogs = async () => {
    try {
      setLoading(true)
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50',
        ...(selectedLevel !== 'all' && { level: selectedLevel }),
        ...(selectedSystem !== 'all' && { system: selectedSystem }),
        ...(searchQuery && { search: searchQuery })
      })

      const response = await fetch(`/api/superadmin/audit/logs/system?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth-storage') ? JSON.parse(localStorage.getItem('auth-storage')).state?.token : ''}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch system event logs')
      }
      
      const data = await response.json()
      
      if (data.success) {
        setLogs(data.data.logs)
        setTotalPages(data.data.pagination.pages)
      } else {
        throw new Error(data.message || 'Failed to fetch system event logs')
      }
      
    } catch (error) {
      console.error('Error fetching system event logs:', error)
      // Fallback to mock data
      const mockLogs: SystemEventLog[] = [
        {
          _id: '1',
          timestamp: new Date(),
          system: 'Database',
          component: 'MongoDB',
          event: 'CONNECTION_POOL_EXHAUSTED',
          level: 'critical',
          message: 'Database connection pool exhausted - 500 concurrent connections',
          details: {
            pool_size: 500,
            active_connections: 500,
            waiting_requests: 150,
            avg_response_time: '2.5s'
          },
          duration: 300000, // 5 minutes
          affectedUsers: 0,
          resolved: true,
          resolvedAt: new Date(Date.now() - 240000),
          resolvedBy: 'auto-scaling'
        },
        {
          _id: '2',
          timestamp: new Date(Date.now() - 600000),
          system: 'Payment Gateway',
          component: 'Stripe API',
          event: 'API_RATE_LIMIT_EXCEEDED',
          level: 'warning',
          message: 'Stripe API rate limit exceeded - requests throttled',
          details: {
            requests_per_second: 120,
            limit: 100,
            throttled_requests: 45,
            retry_after: '60s'
          },
          duration: 120000, // 2 minutes
          affectedUsers: 23,
          resolved: true,
          resolvedAt: new Date(Date.now() - 480000),
          resolvedBy: 'automatic-retry'
        },
        {
          _id: '3',
          timestamp: new Date(Date.now() - 1200000),
          system: 'WebSocket',
          component: 'Socket.IO',
          event: 'HIGH_MEMORY_USAGE',
          level: 'warning',
          message: 'WebSocket server memory usage above 85% threshold',
          details: {
            memory_usage: '87%',
            active_connections: 15000,
            memory_limit: '2GB',
            current_usage: '1.74GB'
          },
          resolved: false
        },
        {
          _id: '4',
          timestamp: new Date(Date.now() - 1800000),
          system: 'File Storage',
          component: 'AWS S3',
          event: 'UPLOAD_FAILURE_SPIKE',
          level: 'error',
          message: 'Unusual spike in file upload failures detected',
          details: {
            failure_rate: '15%',
            normal_rate: '2%',
            failed_uploads: 89,
            total_uploads: 593,
            error_codes: ['403', '500', '503']
          },
          duration: 900000, // 15 minutes
          affectedUsers: 0,
          resolved: true,
          resolvedAt: new Date(Date.now() - 900000),
          resolvedBy: 'support@laundrylobby.com'
        }
      ]
      setLogs(mockLogs)
      setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-700 bg-red-100'
      case 'error': return 'text-orange-700 bg-orange-100'
      case 'warning': return 'text-yellow-700 bg-yellow-100'
      case 'info': return 'text-blue-700 bg-blue-100'
      default: return 'text-gray-700 bg-gray-100'
    }
  }

  const getSystemIcon = (system: string) => {
    switch (system.toLowerCase()) {
      case 'database': return <Database className="w-4 h-4" />
      case 'payment gateway': return <Zap className="w-4 h-4" />
      case 'websocket': return <Wifi className="w-4 h-4" />
      case 'file storage': return <HardDrive className="w-4 h-4" />
      case 'api server': return <Server className="w-4 h-4" />
      default: return <Cpu className="w-4 h-4" />
    }
  }

  const getSystemColor = (system: string) => {
    switch (system.toLowerCase()) {
      case 'database': return 'text-green-700 bg-green-100'
      case 'payment gateway': return 'text-purple-700 bg-purple-100'
      case 'websocket': return 'text-blue-700 bg-blue-100'
      case 'file storage': return 'text-orange-700 bg-orange-100'
      case 'api server': return 'text-indigo-700 bg-indigo-100'
      default: return 'text-gray-700 bg-gray-100'
    }
  }

  const formatDuration = (ms?: number) => {
    if (!ms) return 'N/A'
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}m ${seconds}s`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center">
              <Activity className="w-8 h-8 mr-3" />
              System Event Audit Logs
            </h1>
            <p className="text-blue-100 mt-2">
              Comprehensive monitoring of system events, performance, and infrastructure health
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-blue-100">Total Events: {logs.length}</p>
            <p className="text-xs text-blue-200">System Monitoring</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl shadow-sm p-5 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-red-700 uppercase tracking-wide">Critical Events</p>
              <p className="text-2xl font-bold text-red-900 mt-1">
                {logs.filter(l => l.level === 'critical').length}
              </p>
            </div>
            <div className="bg-red-500 p-3 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl shadow-sm p-5 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-orange-700 uppercase tracking-wide">Error Events</p>
              <p className="text-2xl font-bold text-orange-900 mt-1">
                {logs.filter(l => l.level === 'error').length}
              </p>
            </div>
            <div className="bg-orange-500 p-3 rounded-lg">
              <Zap className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-sm p-5 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-green-700 uppercase tracking-wide">Resolved Issues</p>
              <p className="text-2xl font-bold text-green-900 mt-1">
                {logs.filter(l => l.resolved).length}
              </p>
            </div>
            <div className="bg-green-500 p-3 rounded-lg">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-sm p-5 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Affected Users</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">
                {logs.reduce((sum, l) => sum + (l.affectedUsers || 0), 0)}
              </p>
            </div>
            <div className="bg-blue-500 p-3 rounded-lg">
              <Server className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="flex items-center space-x-2">
            <Search className="w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Levels</option>
            <option value="critical">Critical</option>
            <option value="error">Error</option>
            <option value="warning">Warning</option>
            <option value="info">Info</option>
          </select>

          <select
            value={selectedSystem}
            onChange={(e) => setSelectedSystem(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Systems</option>
            <option value="Database">Database</option>
            <option value="Payment Gateway">Payment Gateway</option>
            <option value="WebSocket">WebSocket</option>
            <option value="File Storage">File Storage</option>
            <option value="API Server">API Server</option>
          </select>

          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>

          <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* System Event Logs Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">System Event Logs</h3>
          <p className="text-sm text-gray-600 mt-1">Real-time monitoring of system performance and infrastructure events</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  System
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Event
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Message
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Affected Users
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {logs.map((log) => (
                <tr key={log._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div className="font-medium">{log.timestamp.toLocaleDateString()}</div>
                      <div className="text-gray-500">{log.timestamp.toLocaleTimeString()}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center w-fit ${getSystemColor(log.system)}`}>
                      {getSystemIcon(log.system)}
                      <span className="ml-1">{log.system}</span>
                    </span>
                    <div className="text-xs text-gray-500 mt-1">{log.component}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{log.event}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(log.level)}`}>
                      {log.level.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs">
                      {log.message}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDuration(log.duration)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {log.affectedUsers?.toLocaleString() || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {log.resolved ? (
                      <div>
                        <span className="px-2 py-1 rounded-full text-xs font-medium text-green-700 bg-green-100 flex items-center w-fit">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          RESOLVED
                        </span>
                        {log.resolvedAt && (
                          <div className="text-xs text-gray-500 mt-1">
                            {log.resolvedAt.toLocaleTimeString()}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="px-2 py-1 rounded-full text-xs font-medium text-orange-700 bg-orange-100 flex items-center w-fit">
                        <Clock className="w-3 h-3 mr-1" />
                        ONGOING
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs">
                      <details className="cursor-pointer">
                        <summary className="text-blue-600 hover:text-blue-800 text-xs">View details</summary>
                        <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                          <pre className="whitespace-pre-wrap">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                          {log.resolvedBy && (
                            <div className="mt-2 pt-2 border-t border-gray-200">
                              <strong>Resolved by:</strong> {log.resolvedBy}
                            </div>
                          )}
                        </div>
                      </details>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Page {page} of {totalPages}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}