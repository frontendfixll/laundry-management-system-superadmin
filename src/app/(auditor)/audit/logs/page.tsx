'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { superAdminApi } from '@/lib/superAdminApi'
import { 
  Shield,
  FileText,
  Users,
  Activity,
  UserCircle,
  Search,
  Filter,
  Calendar,
  Download,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye
} from 'lucide-react'

interface AuditLog {
  _id: string
  timestamp: Date
  who: string
  role: string
  action: string
  entity: string
  entityId: string
  tenantId?: string
  tenantName?: string
  ipAddress: string
  userAgent: string
  outcome: 'success' | 'failure' | 'warning'
  details: any
  severity: 'low' | 'medium' | 'high' | 'critical'
}

export default function AuditLogsPage() {
  const { token } = useAuthStore()
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSeverity, setSelectedSeverity] = useState('all')
  const [selectedAction, setSelectedAction] = useState('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchAuditLogs()
  }, [page, selectedSeverity, selectedAction, searchQuery])

  const fetchAuditLogs = async () => {
    try {
      setLoading(true)
      
      console.log('🔍 Fetching audit logs with params:', { page, selectedSeverity, selectedAction, searchQuery })
      
      const params: any = {
        page,
        limit: 20 // Reduced limit for better pagination testing
      }
      
      if (selectedSeverity !== 'all') params.severity = selectedSeverity
      if (selectedAction !== 'all') params.action = selectedAction
      if (searchQuery) params.search = searchQuery
      
      const data = await superAdminApi.getAuditLogs(params)
      
      console.log('📊 Audit logs API response:', data)
      
      if (data.success && data.data) {
        setLogs(data.data.logs || [])
        setTotalPages(data.data.pagination?.pages || 1)
        
        console.log('✅ Successfully loaded audit logs:', data.data.logs?.length || 0, 'logs, page', page, 'of', data.data.pagination?.pages || 1)
      } else {
        throw new Error(data.message || 'Failed to fetch audit logs')
      }
    } catch (error) {
      console.error('❌ Error fetching audit logs:', error)
      console.log('🔧 API Error Details:', error.message)
      
      // Development mode: Show sample data for testing
      const isDevelopment = process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost'
      
      if (isDevelopment) {
        console.log('🔧 Development Mode: Loading sample audit logs for testing')
        
        // Generate sample audit logs with pagination
        const sampleLogs: AuditLog[] = Array.from({ length: 20 }, (_, i) => ({
          _id: `log_${page}_${i + 1}`,
          timestamp: new Date(Date.now() - (i * 3600000)), // Each log 1 hour apart
          who: ['admin@laundrylobby.com', 'auditor@laundrylobby.com', 'support@laundrylobby.com'][i % 3],
          role: ['SuperAdmin', 'Auditor', 'Support'][i % 3],
          action: ['CREATE_USER', 'UPDATE_TENANT', 'DELETE_ORDER', 'LOGIN_ATTEMPT', 'IMPERSONATE_USER'][i % 5],
          entity: ['User', 'Tenancy', 'Order', 'Session', 'Permission'][i % 5],
          entityId: `entity_${i + 1}`,
          tenantId: i % 3 === 0 ? undefined : `tenant_${(i % 3) + 1}`,
          tenantName: i % 3 === 0 ? 'Platform' : ['Clean Fresh', 'QuickWash', 'Express Laundry'][i % 3],
          ipAddress: `192.168.1.${100 + (i % 50)}`,
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          outcome: ['success', 'failure', 'warning'][i % 3] as 'success' | 'failure' | 'warning',
          details: { action: 'Sample audit log entry', timestamp: new Date() },
          severity: ['low', 'medium', 'high', 'critical'][i % 4] as 'low' | 'medium' | 'high' | 'critical'
        }))
        
        setLogs(sampleLogs)
        setTotalPages(5) // Show 5 pages for testing pagination
        
        console.log('✅ Loaded sample audit logs for development:', sampleLogs.length, 'logs')
      } else {
        // Production mode: Show empty state
        setLogs([])
        setTotalPages(1)
      }
    } finally {
      setLoading(false)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-700 bg-red-100 border-red-200'
      case 'high': return 'text-orange-700 bg-orange-100 border-orange-200'
      case 'medium': return 'text-yellow-700 bg-yellow-100 border-yellow-200'
      case 'low': return 'text-green-700 bg-green-100 border-green-200'
      default: return 'text-gray-700 bg-gray-100 border-gray-200'
    }
  }

  const getOutcomeIcon = (outcome: string) => {
    switch (outcome) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'failure': return <AlertTriangle className="w-4 h-4 text-red-600" />
      case 'warning': return <Clock className="w-4 h-4 text-yellow-600" />
      default: return <Eye className="w-4 h-4 text-gray-600" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center">
              <FileText className="w-8 h-8 mr-3" />
              Complete Audit Logs
            </h1>
            <p className="text-blue-100 mt-2">
              Comprehensive audit trail of all platform activities
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-blue-100">Total Logs: {logs.length}</p>
            {logs.length > 0 && (process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost') && (
              <p className="text-xs text-yellow-200 bg-yellow-600/20 px-2 py-1 rounded mt-1">
                🔧 {logs.some(l => l._id.startsWith('log_')) ? 'Development Sample Data' : 'Real Backend Data'}
              </p>
            )}
            <p className="text-xs text-blue-200">Page {page} of {totalPages}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex items-center space-x-2">
            <Search className="w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Severity</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          
          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Actions</option>
            <option value="CREATE">Create</option>
            <option value="UPDATE">Update</option>
            <option value="DELETE">Delete</option>
            <option value="LOGIN">Login</option>
            <option value="IMPERSONATE">Impersonate</option>
          </select>
          
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">Audit Trail</h3>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <FileText className="w-16 h-16 mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Audit Logs Found</h3>
            <p className="text-sm text-center max-w-md">
              {searchQuery || selectedSeverity !== 'all' || selectedAction !== 'all' 
                ? 'No logs match your current filters. Try adjusting your search criteria.'
                : 'No audit logs are available at the moment. Logs will appear here as system activities occur.'
              }
            </p>
            {(searchQuery || selectedSeverity !== 'all' || selectedAction !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('')
                  setSelectedSeverity('all')
                  setSelectedAction('all')
                  setPage(1)
                }}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Entity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tenant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Severity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Outcome
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{log.who}</div>
                        <div className="text-sm text-gray-500">{log.role}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.action}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{log.entity}</div>
                        <div className="text-sm text-gray-500">{log.entityId}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.tenantName || 'Platform'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(log.severity)}`}>
                        {log.severity.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getOutcomeIcon(log.outcome)}
                        <span className="ml-2 text-sm text-gray-900 capitalize">{log.outcome}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination - Always show for better UX */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-700">
              Page {page} of {totalPages}
            </div>
            {logs.length > 0 && (
              <div className="text-sm text-gray-500">
                Showing {logs.length} logs
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {/* First Page */}
            <button
              onClick={() => setPage(1)}
              disabled={page === 1}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              First
            </button>
            
            {/* Previous Page */}
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            
            {/* Page Numbers */}
            <div className="flex space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (page <= 3) {
                  pageNum = i + 1
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = page - 2 + i
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`px-3 py-1 border rounded-md text-sm ${
                      page === pageNum
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              })}
            </div>
            
            {/* Next Page */}
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
            
            {/* Last Page */}
            <button
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Last
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}