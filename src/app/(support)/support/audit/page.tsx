'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'
import { 
  FileText,
  User,
  Shield,
  Activity,
  Clock,
  Search,
  Filter,
  Download,
  Eye,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Calendar,
  RefreshCw,
  Database,
  Settings,
  MessageSquare
} from 'lucide-react'

interface AuditLog {
  id: string
  timestamp: string
  userId: string
  userName: string
  userEmail: string
  action: string
  resource: string
  resourceId?: string
  details: string
  ipAddress: string
  userAgent: string
  outcome: 'success' | 'failure' | 'warning'
  category: 'authentication' | 'data_access' | 'system_change' | 'user_action' | 'security'
  severity: 'low' | 'medium' | 'high' | 'critical'
  metadata?: Record<string, any>
}

interface AuditStats {
  totalLogs: number
  todayLogs: number
  failedActions: number
  criticalEvents: number
  topActions: { action: string; count: number }[]
  topUsers: { user: string; count: number }[]
}

export default function SupportAuditLogsPage() {
  const [loading, setLoading] = useState(true)
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [stats, setStats] = useState<AuditStats>({
    totalLogs: 0,
    todayLogs: 0,
    failedActions: 0,
    criticalEvents: 0,
    topActions: [],
    topUsers: []
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [severityFilter, setSeverityFilter] = useState('all')
  const [outcomeFilter, setOutcomeFilter] = useState('all')
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadAuditLogs()
  }, [])

  const loadAuditLogs = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await api.get('/support/audit')
      const data = response.data
      const payload = data?.data || data

      setLogs(payload?.logs || [])
      setStats(payload?.stats || {
        totalLogs: 0,
        todayLogs: 0,
        failedActions: 0,
        criticalEvents: 0,
        topActions: [],
        topUsers: []
      })
    } catch (err: any) {
      console.error('Error loading audit logs:', err)
      setError(err?.response?.data?.message || 'Failed to load audit logs')
      setLogs([])
      setStats({ totalLogs: 0, todayLogs: 0, failedActions: 0, criticalEvents: 0, topActions: [], topUsers: [] })
    } finally {
      setLoading(false)
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'authentication': return 'bg-blue-100 text-blue-700'
      case 'data_access': return 'bg-purple-100 text-purple-700'
      case 'system_change': return 'bg-orange-100 text-orange-700'
      case 'user_action': return 'bg-green-100 text-green-700'
      case 'security': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-700'
      case 'high': return 'bg-orange-100 text-orange-700'
      case 'medium': return 'bg-yellow-100 text-yellow-700'
      case 'low': return 'bg-green-100 text-green-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getOutcomeIcon = (outcome: string) => {
    switch (outcome) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'failure': return <XCircle className="w-4 h-4 text-red-600" />
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-600" />
      default: return <Activity className="w-4 h-4 text-gray-600" />
    }
  }

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.details.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = categoryFilter === 'all' || log.category === categoryFilter
    const matchesSeverity = severityFilter === 'all' || log.severity === severityFilter
    const matchesOutcome = outcomeFilter === 'all' || log.outcome === outcomeFilter
    
    return matchesSearch && matchesCategory && matchesSeverity && matchesOutcome
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
          <h1 className="text-3xl font-bold text-gray-900">Support Audit Logs</h1>
          <p className="text-gray-600 mt-1">
            Complete audit trail of all support team actions and system events
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button 
            onClick={loadAuditLogs}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
          <p className="text-red-700">{error}</p>
          <button onClick={loadAuditLogs} className="text-red-600 hover:text-red-800 font-medium">Retry</button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Logs</p>
              <p className="text-3xl font-bold">{stats.totalLogs}</p>
              <p className="text-blue-100 text-xs">All time</p>
            </div>
            <FileText className="w-8 h-8 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Today's Logs</p>
              <p className="text-3xl font-bold">{stats.todayLogs}</p>
              <p className="text-green-100 text-xs">Last 24 hours</p>
            </div>
            <Clock className="w-8 h-8 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm">Failed Actions</p>
              <p className="text-3xl font-bold">{stats.failedActions}</p>
              <p className="text-red-100 text-xs">Requires attention</p>
            </div>
            <XCircle className="w-8 h-8 text-red-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Critical Events</p>
              <p className="text-3xl font-bold">{stats.criticalEvents}</p>
              <p className="text-orange-100 text-xs">High priority</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-orange-200" />
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
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              <option value="authentication">Authentication</option>
              <option value="data_access">Data Access</option>
              <option value="system_change">System Change</option>
              <option value="user_action">User Action</option>
              <option value="security">Security</option>
            </select>
            
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
            </select>
            
            <select
              value={outcomeFilter}
              onChange={(e) => setOutcomeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Outcomes</option>
              <option value="success">Success</option>
              <option value="failure">Failure</option>
              <option value="warning">Warning</option>
            </select>
          </div>
        </div>
      </div>

      {/* Audit Logs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Audit Logs ({filteredLogs.length})
          </h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {filteredLogs.length > 0 ? (
            filteredLogs.map((log) => (
              <div key={log.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      {getOutcomeIcon(log.outcome)}
                      <span className="text-sm font-medium text-gray-900">{log.action}</span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(log.category)}`}>
                        {log.category.replace('_', ' ').toUpperCase()}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(log.severity)}`}>
                        {log.severity.toUpperCase()}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">{log.details}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                      <div>
                        <p className="text-xs text-gray-500">User</p>
                        <p className="text-sm font-medium text-gray-900">{log.userName}</p>
                        <p className="text-xs text-gray-500">{log.userEmail}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Resource</p>
                        <p className="text-sm font-medium text-gray-900">{log.resource}</p>
                        {log.resourceId && (
                          <p className="text-xs text-gray-500 font-mono">{log.resourceId}</p>
                        )}
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Timestamp</p>
                        <p className="text-sm font-medium text-gray-900">{new Date(log.timestamp).toLocaleString()}</p>
                        <p className="text-xs text-gray-500">{log.ipAddress}</p>
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => setSelectedLog(log)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No audit logs found</h3>
              <p className="text-gray-500">No logs match your current filters</p>
            </div>
          )}
        </div>
      </div>

      {/* Log Details Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Audit Log Details</h2>
                <button 
                  onClick={() => setSelectedLog(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Action</p>
                  <p className="font-medium text-gray-900">{selectedLog.action}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Outcome</p>
                  <div className="flex items-center space-x-2">
                    {getOutcomeIcon(selectedLog.outcome)}
                    <span className="font-medium text-gray-900 capitalize">{selectedLog.outcome}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 mb-2">Details</p>
                <p className="text-sm text-gray-900 bg-gray-50 rounded-lg p-3">{selectedLog.details}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">User</p>
                  <p className="font-medium text-gray-900">{selectedLog.userName}</p>
                  <p className="text-sm text-gray-600">{selectedLog.userEmail}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Timestamp</p>
                  <p className="font-medium text-gray-900">{new Date(selectedLog.timestamp).toLocaleString()}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">IP Address</p>
                  <p className="font-mono text-sm text-gray-900">{selectedLog.ipAddress}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Resource</p>
                  <p className="font-medium text-gray-900">{selectedLog.resource}</p>
                  {selectedLog.resourceId && (
                    <p className="font-mono text-xs text-gray-600">{selectedLog.resourceId}</p>
                  )}
                </div>
              </div>
              
              {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Additional Metadata</p>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <pre className="text-xs text-gray-900 whitespace-pre-wrap">
                      {JSON.stringify(selectedLog.metadata, null, 2)}
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