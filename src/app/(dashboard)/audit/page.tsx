'use client'

import { useState } from 'react'
import { 
  Shield, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Calendar,
  User,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Globe,
  Smartphone,
  Monitor,
  FileText,
  TrendingUp,
  Users,
  Database,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react'
import { useAudit, useAuditLog } from '@/hooks/useAudit'

const categoryOptions = [
  { value: '', label: 'All Categories' },
  { value: 'auth', label: 'Authentication' },
  { value: 'orders', label: 'Orders' },
  { value: 'branches', label: 'Branches' },
  { value: 'users', label: 'Users' },
  { value: 'finances', label: 'Finances' },
  { value: 'settings', label: 'Settings' },
  { value: 'system', label: 'System' },
  { value: 'audit', label: 'Audit' },
  { value: 'risk_management', label: 'Risk Management' }
]

const riskLevelOptions = [
  { value: '', label: 'All Risk Levels' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' }
]

const statusOptions = [
  { value: '', label: 'All Status' },
  { value: 'success', label: 'Success' },
  { value: 'failure', label: 'Failure' },
  { value: 'warning', label: 'Warning' }
]

export default function AuditPage() {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 8,
    category: '',
    riskLevel: '',
    status: '',
    search: '',
    startDate: '',
    endDate: '',
    sortBy: 'timestamp',
    sortOrder: 'desc'
  })
  const [selectedLog, setSelectedLog] = useState<string | null>(null)
  const [timeframe, setTimeframe] = useState('30d')
  const [goToPage, setGoToPage] = useState('')

  const { 
    logs, 
    stats, 
    activitySummary,
    pagination, 
    loading, 
    error,
    exportLogs,
    refetch 
  } = useAudit(filters, timeframe)

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'critical':
        return 'text-red-600 bg-red-100 border-red-200'
      case 'high':
        return 'text-orange-600 bg-orange-100 border-orange-200'
      case 'medium':
        return 'text-yellow-600 bg-yellow-100 border-yellow-200'
      case 'low':
        return 'text-green-600 bg-green-100 border-green-200'
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'failure':
        return <XCircle className="w-4 h-4 text-red-500" />
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'auth':
        return <Shield className="w-4 h-4" />
      case 'users':
        return <Users className="w-4 h-4" />
      case 'settings':
        return <Settings className="w-4 h-4" />
      case 'system':
        return <Database className="w-4 h-4" />
      default:
        return <Activity className="w-4 h-4" />
    }
  }

  const handleExport = async (format: 'json' | 'csv') => {
    try {
      await exportLogs(format, filters)
    } catch (error) {
      console.error('Export failed:', error)
    }
  }

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const current = pagination.current
    const total = pagination.pages
    
    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i)
    } else {
      pages.push(1)
      if (current > 3) pages.push('...')
      
      const start = Math.max(2, current - 1)
      const end = Math.min(total - 1, current + 1)
      
      for (let i = start; i <= end; i++) pages.push(i)
      
      if (current < total - 2) pages.push('...')
      pages.push(total)
    }
    return pages
  }

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page })
  }

  const handleGoToPage = (e: React.FormEvent) => {
    e.preventDefault()
    const page = parseInt(goToPage)
    if (page >= 1 && page <= pagination.pages) {
      setFilters({ ...filters, page })
      setGoToPage('')
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
          <p className="text-gray-600">Monitor system activity and security events</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
          <button
            onClick={() => handleExport('csv')}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Activity Summary */}
      {activitySummary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {activitySummary.last24h.toLocaleString()}
            </h3>
            <p className="text-gray-600 text-sm">Activities (24h)</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {activitySummary.last7d.toLocaleString()}
            </h3>
            <p className="text-gray-600 text-sm">Activities (7d)</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              {activitySummary.criticalAlerts > 0 && (
                <span className="text-sm font-medium px-2 py-1 rounded-full text-red-700 bg-red-100">
                  Alert
                </span>
              )}
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {activitySummary.criticalAlerts}
            </h3>
            <p className="text-gray-600 text-sm">Critical Alerts</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-yellow-600" />
              </div>
              {activitySummary.failedLogins > 10 && (
                <span className="text-sm font-medium px-2 py-1 rounded-full text-yellow-700 bg-yellow-100">
                  High
                </span>
              )}
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {activitySummary.failedLogins}
            </h3>
            <p className="text-gray-600 text-sm">Failed Logins</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Database className="w-6 h-6 text-purple-600" />
              </div>
              {activitySummary.systemErrors > 5 && (
                <span className="text-sm font-medium px-2 py-1 rounded-full text-purple-700 bg-purple-100">
                  Warning
                </span>
              )}
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {activitySummary.systemErrors}
            </h3>
            <p className="text-gray-600 text-sm">System Errors</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value, page: 1 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {categoryOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Risk Level</label>
            <select
              value={filters.riskLevel}
              onChange={(e) => setFilters({ ...filters, riskLevel: e.target.value, page: 1 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {riskLevelOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value, page: 1 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value, page: 1 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder="Search logs by action, description, or user..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Audit Logs Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-6">
              <div className="space-y-4">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4 animate-pulse">
                    <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                    <div className="w-20 h-6 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          ) : logs.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Audit Logs Found</h3>
              <p className="text-gray-600">No logs match your current filters.</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Activity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Risk Level
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                          {getCategoryIcon(log.category)}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {log.action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {log.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{log.userEmail}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {log.category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRiskLevelColor(log.riskLevel)}`}>
                        {log.riskLevel.charAt(0).toUpperCase() + log.riskLevel.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(log.status)}
                        <span className="text-sm text-gray-900 capitalize">
                          {log.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>
                        {new Date(log.timestamp).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(log.timestamp).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => setSelectedLog(log._id)}
                        className="text-purple-600 hover:text-purple-900 flex items-center space-x-1"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Info - Always show when there's data */}
        {pagination && pagination.total > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-700">
              Showing {((pagination.current - 1) * pagination.limit) + 1} to {Math.min(pagination.current * pagination.limit, pagination.total)} of {pagination.total} logs
            </div>
            
            {pagination.pages > 1 && (
              <div className="flex items-center gap-2">
                {/* First Page */}
                <button 
                  onClick={() => handlePageChange(1)} 
                  disabled={pagination.current === 1}
                  className="hidden sm:flex px-2 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  title="First Page"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </button>
                
                {/* Previous */}
                <button 
                  onClick={() => handlePageChange(pagination.current - 1)} 
                  disabled={pagination.current === 1}
                  className="flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline ml-1">Previous</span>
                </button>
                
                {/* Page Numbers */}
                <div className="flex items-center gap-1">
                  {getPageNumbers().map((page, index) => (
                    page === '...' ? (
                      <span key={`ellipsis-${index}`} className="px-2 text-gray-500">...</span>
                    ) : (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page as number)}
                        className={`min-w-[36px] px-3 py-1 border rounded-md text-sm ${
                          pagination.current === page 
                            ? 'bg-purple-600 text-white border-purple-600' 
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    )
                  ))}
                </div>
                
                {/* Next */}
                <button 
                  onClick={() => handlePageChange(pagination.current + 1)} 
                  disabled={pagination.current === pagination.pages}
                  className="flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <span className="hidden sm:inline mr-1">Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
                
                {/* Last Page */}
                <button 
                  onClick={() => handlePageChange(pagination.pages)} 
                  disabled={pagination.current === pagination.pages}
                  className="hidden sm:flex px-2 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  title="Last Page"
                >
                  <ChevronsRight className="w-4 h-4" />
                </button>
                
                {/* Go to Page - only show when more than 10 pages */}
                {pagination.pages > 10 && (
                  <form onSubmit={handleGoToPage} className="flex items-center gap-2 ml-4 pl-4 border-l border-gray-200">
                    <span className="text-sm text-gray-600 hidden sm:inline">Go to page</span>
                    <input
                      type="number"
                      min="1"
                      max={pagination.pages}
                      value={goToPage}
                      onChange={(e) => setGoToPage(e.target.value)}
                      placeholder="#"
                      className="w-14 px-2 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-center"
                    />
                    <button type="submit" disabled={!goToPage} className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50">
                      Go
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Log Detail Modal */}
      {selectedLog && (
        <LogDetailModal
          logId={selectedLog}
          onClose={() => setSelectedLog(null)}
        />
      )}
    </div>
  )
}

// Helper function to format description - remove API paths and make human readable
function formatDescription(description: string, action: string): string {
  if (!description) return action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  
  // Remove API path patterns like "- GET /api/..." or "- POST /api/..."
  let formatted = description.replace(/\s*-\s*(GET|POST|PUT|DELETE|PATCH)\s+\/api\/[^\s]*/gi, '')
  
  // Clean up any remaining technical patterns
  formatted = formatted.replace(/\s*-\s*$/g, '').trim()
  
  // If description is empty after cleanup, generate from action
  if (!formatted || formatted === action) {
    return action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }
  
  return formatted
}

// Helper function to format IP address
function formatIpAddress(ip: string): { display: string; isLocal: boolean } {
  if (!ip) return { display: 'Unknown', isLocal: false }
  
  const localIps = ['::1', '127.0.0.1', 'localhost', '::ffff:127.0.0.1']
  const isLocal = localIps.includes(ip) || ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.')
  
  if (ip === '::1' || ip === '::ffff:127.0.0.1') {
    return { display: 'Localhost (127.0.0.1)', isLocal: true }
  }
  
  return { display: ip, isLocal }
}

// Helper function to parse user agent
function parseUserAgent(userAgent: string): { browser: string; os: string; device: string } {
  if (!userAgent) return { browser: 'Unknown', os: 'Unknown', device: 'Unknown' }
  
  // Browser detection
  let browser = 'Unknown Browser'
  if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
    const match = userAgent.match(/Chrome\/(\d+)/)
    browser = `Chrome ${match ? match[1] : ''}`
  } else if (userAgent.includes('Firefox')) {
    const match = userAgent.match(/Firefox\/(\d+)/)
    browser = `Firefox ${match ? match[1] : ''}`
  } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
    const match = userAgent.match(/Version\/(\d+)/)
    browser = `Safari ${match ? match[1] : ''}`
  } else if (userAgent.includes('Edg')) {
    const match = userAgent.match(/Edg\/(\d+)/)
    browser = `Edge ${match ? match[1] : ''}`
  }
  
  // OS detection
  let os = 'Unknown OS'
  if (userAgent.includes('Windows NT 10')) os = 'Windows 10/11'
  else if (userAgent.includes('Windows NT 6.3')) os = 'Windows 8.1'
  else if (userAgent.includes('Windows NT 6.1')) os = 'Windows 7'
  else if (userAgent.includes('Mac OS X')) os = 'macOS'
  else if (userAgent.includes('Linux')) os = 'Linux'
  else if (userAgent.includes('Android')) os = 'Android'
  else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) os = 'iOS'
  
  // Device detection
  let device = 'Desktop'
  if (userAgent.includes('Mobile') || userAgent.includes('Android')) device = 'Mobile'
  else if (userAgent.includes('Tablet') || userAgent.includes('iPad')) device = 'Tablet'
  
  return { browser, os, device }
}

// Helper function to format metadata for display
function formatMetadataValue(key: string, value: any): { label: string; displayValue: string; isImportant: boolean } {
  const importantKeys = ['orderId', 'orderNumber', 'amount', 'userId', 'branchId', 'status', 'error']
  const isImportant = importantKeys.includes(key)
  
  // Format the label
  const label = key
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase())
    .trim()
  
  // Format the value
  let displayValue = value
  if (typeof value === 'object' && value !== null) {
    displayValue = JSON.stringify(value)
  } else if (typeof value === 'boolean') {
    displayValue = value ? 'Yes' : 'No'
  } else if (key.toLowerCase().includes('amount') || key.toLowerCase().includes('price')) {
    displayValue = `₹${Number(value).toLocaleString('en-IN')}`
  }
  
  return { label, displayValue: String(displayValue), isImportant }
}

// Log Detail Modal Component
function LogDetailModal({ logId, onClose }: { logId: string, onClose: () => void }) {
  const { log, loading } = useAuditLog(logId)

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!log) {
    return null
  }

  const formattedDescription = formatDescription(log.description, log.action)
  const ipInfo = formatIpAddress(log.ipAddress)
  const userAgentInfo = parseUserAgent(log.userAgent)
  
  // Filter out technical metadata keys for cleaner display
  const technicalKeys = ['method', 'url', 'statusCode', 'query', 'headers', 'responseTime']
  const displayMetadata = log.metadata ? 
    Object.entries(log.metadata).filter(([key]) => !technicalKeys.includes(key)) : []

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Audit Log Details</h2>
            <p className="text-gray-600 mt-1">
              {new Date(log.timestamp).toLocaleString('en-IN', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              })}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Main Info Grid */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Action</h3>
              <p className="text-gray-900 font-medium">{log.action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Category</h3>
              <p className="text-gray-900 font-medium">{log.category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">User</h3>
              <p className="text-gray-900 font-medium">{log.userEmail}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Risk Level</h3>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getRiskLevelColor(log.riskLevel)}`}>
                {log.riskLevel.charAt(0).toUpperCase() + log.riskLevel.slice(1)}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
            <h3 className="text-xs font-medium text-blue-700 uppercase tracking-wider mb-2">Description</h3>
            <p className="text-blue-900">{formattedDescription}</p>
          </div>

          {/* Device & Location Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* IP Address */}
            {log.ipAddress && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  IP Address
                </h3>
                <div className="flex items-center gap-2">
                  <p className="text-gray-900 font-mono">{ipInfo.display}</p>
                  {ipInfo.isLocal && (
                    <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">Local</span>
                  )}
                </div>
              </div>
            )}

            {/* Device Info */}
            {log.userAgent && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Monitor className="w-4 h-4" />
                  Device Info
                </h3>
                <div className="space-y-1">
                  <p className="text-gray-900 text-sm">
                    <span className="text-gray-500">Browser:</span> {userAgentInfo.browser}
                  </p>
                  <p className="text-gray-900 text-sm">
                    <span className="text-gray-500">OS:</span> {userAgentInfo.os}
                  </p>
                  <p className="text-gray-900 text-sm">
                    <span className="text-gray-500">Device:</span> {userAgentInfo.device}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Additional Data - Formatted */}
          {displayMetadata.length > 0 && (
            <div>
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Additional Details</h3>
              <div className="bg-gray-50 rounded-lg divide-y divide-gray-200">
                {displayMetadata.map(([key, value]) => {
                  const { label, displayValue, isImportant } = formatMetadataValue(key, value)
                  return (
                    <div key={key} className={`px-4 py-3 flex justify-between items-center ${isImportant ? 'bg-yellow-50' : ''}`}>
                      <span className="text-sm text-gray-600">{label}</span>
                      <span className={`text-sm ${isImportant ? 'font-medium text-gray-900' : 'text-gray-700'}`}>
                        {displayValue}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Technical Details (Collapsible) */}
          {log.metadata && (log.metadata.method || log.metadata.url || log.metadata.statusCode) && (
            <details className="group">
              <summary className="text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700 flex items-center gap-2">
                <span>Technical Details</span>
                <span className="text-gray-400 group-open:rotate-90 transition-transform">▶</span>
              </summary>
              <div className="mt-3 bg-gray-900 rounded-lg p-4 text-sm font-mono text-gray-300 overflow-x-auto">
                {log.metadata.method && <div><span className="text-green-400">Method:</span> {log.metadata.method}</div>}
                {log.metadata.url && <div><span className="text-blue-400">URL:</span> {log.metadata.url}</div>}
                {log.metadata.statusCode && <div><span className="text-yellow-400">Status:</span> {log.metadata.statusCode}</div>}
                {log.metadata.query && Object.keys(log.metadata.query).length > 0 && (
                  <div><span className="text-purple-400">Query:</span> {JSON.stringify(log.metadata.query)}</div>
                )}
              </div>
            </details>
          )}
        </div>
      </div>
    </div>
  )
}



function getRiskLevelColor(level: string) {
  switch (level) {
    case 'critical':
      return 'text-red-600 bg-red-100 border-red-200'
    case 'high':
      return 'text-orange-600 bg-orange-100 border-orange-200'
    case 'medium':
      return 'text-yellow-600 bg-yellow-100 border-yellow-200'
    case 'low':
      return 'text-green-600 bg-green-100 border-green-200'
    default:
      return 'text-gray-600 bg-gray-100 border-gray-200'
  }
}
