'use client'

import { useState, useEffect } from 'react'
import { 
  Activity,
  Search,
  Filter,
  Eye,
  RefreshCw,
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  Download,
  Code,
  Zap,
  Server,
  Globe,
  Copy,
  Info
} from 'lucide-react'

interface GatewayLog {
  id: string
  timestamp: string
  gateway: 'razorpay' | 'stripe' | 'payu' | 'cashfree'
  event: string
  transactionId?: string
  orderId?: string
  amount?: number
  currency: string
  status: 'success' | 'failed' | 'pending' | 'timeout'
  httpStatus: number
  requestId: string
  responseTime: number
  ipAddress: string
  userAgent?: string
  requestPayload?: Record<string, any>
  responsePayload?: Record<string, any>
  errorCode?: string
  errorMessage?: string
  retryAttempt: number
  webhookVerified?: boolean
}

interface GatewayStats {
  totalLogs: number
  successRate: number
  avgResponseTime: number
  errorRate: number
  timeoutRate: number
  byGateway: Record<string, number>
  byStatus: Record<string, number>
}

export default function GatewayLogsPage() {
  const [loading, setLoading] = useState(true)
  const [logs, setLogs] = useState<GatewayLog[]>([])
  const [stats, setStats] = useState<GatewayStats>({
    totalLogs: 0,
    successRate: 0,
    avgResponseTime: 0,
    errorRate: 0,
    timeoutRate: 0,
    byGateway: {},
    byStatus: {}
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [gatewayFilter, setGatewayFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedLog, setSelectedLog] = useState<GatewayLog | null>(null)

  useEffect(() => {
    loadGatewayLogs()
  }, [])

  const loadGatewayLogs = async () => {
    try {
      setLoading(true)
      // Mock data for gateway logs since this would typically come from gateway webhooks/logs
      setMockData()
    } catch (error) {
      console.error('Error loading gateway logs:', error)
      setMockData()
    } finally {
      setLoading(false)
    }
  }

  const setMockData = () => {
    const mockLogs: GatewayLog[] = [
      {
        id: '1',
        timestamp: '2026-01-27T12:30:45Z',
        gateway: 'razorpay',
        event: 'payment.captured',
        transactionId: 'pay_live_1234567890',
        orderId: 'ORD-2026-001',
        amount: 45000,
        currency: 'INR',
        status: 'success',
        httpStatus: 200,
        requestId: 'req_1234567890',
        responseTime: 245,
        ipAddress: '103.21.58.66',
        userAgent: 'Razorpay/1.0',
        retryAttempt: 0,
        webhookVerified: true,
        requestPayload: {
          amount: 45000,
          currency: 'INR',
          receipt: 'ORD-2026-001',
          payment_capture: 1
        },
        responsePayload: {
          id: 'pay_live_1234567890',
          status: 'captured',
          amount: 45000,
          currency: 'INR'
        }
      },
      {
        id: '2',
        timestamp: '2026-01-27T12:25:30Z',
        gateway: 'razorpay',
        event: 'payment.failed',
        transactionId: 'pay_live_0987654321',
        orderId: 'ORD-2026-002',
        amount: 32000,
        currency: 'INR',
        status: 'failed',
        httpStatus: 400,
        requestId: 'req_0987654321',
        responseTime: 180,
        ipAddress: '103.21.58.66',
        userAgent: 'Razorpay/1.0',
        retryAttempt: 1,
        webhookVerified: true,
        errorCode: 'BAD_REQUEST_ERROR',
        errorMessage: 'Payment failed due to insufficient funds',
        requestPayload: {
          amount: 32000,
          currency: 'INR',
          receipt: 'ORD-2026-002'
        },
        responsePayload: {
          error: {
            code: 'BAD_REQUEST_ERROR',
            description: 'Payment failed due to insufficient funds'
          }
        }
      },
      {
        id: '3',
        timestamp: '2026-01-27T12:20:15Z',
        gateway: 'stripe',
        event: 'payment_intent.succeeded',
        transactionId: 'pi_1234567890',
        orderId: 'ORD-2026-003',
        amount: 28000,
        currency: 'INR',
        status: 'success',
        httpStatus: 200,
        requestId: 'req_stripe_123',
        responseTime: 320,
        ipAddress: '54.187.174.169',
        userAgent: 'Stripe/1.0',
        retryAttempt: 0,
        webhookVerified: true,
        requestPayload: {
          amount: 28000,
          currency: 'inr',
          payment_method: 'pm_1234567890'
        },
        responsePayload: {
          id: 'pi_1234567890',
          status: 'succeeded',
          amount: 28000,
          currency: 'inr'
        }
      },
      {
        id: '4',
        timestamp: '2026-01-27T12:15:00Z',
        gateway: 'razorpay',
        event: 'payment.timeout',
        transactionId: 'pay_live_timeout123',
        orderId: 'ORD-2026-004',
        amount: 15000,
        currency: 'INR',
        status: 'timeout',
        httpStatus: 408,
        requestId: 'req_timeout123',
        responseTime: 30000,
        ipAddress: '103.21.58.66',
        retryAttempt: 2,
        webhookVerified: false,
        errorCode: 'GATEWAY_TIMEOUT',
        errorMessage: 'Request timeout after 30 seconds'
      }
    ]

    setLogs(mockLogs)
    
    const totalLogs = mockLogs.length
    const successCount = mockLogs.filter(log => log.status === 'success').length
    const failedCount = mockLogs.filter(log => log.status === 'failed').length
    const timeoutCount = mockLogs.filter(log => log.status === 'timeout').length
    const avgResponseTime = mockLogs.reduce((sum, log) => sum + log.responseTime, 0) / totalLogs

    setStats({
      totalLogs,
      successRate: (successCount / totalLogs) * 100,
      avgResponseTime: Math.round(avgResponseTime),
      errorRate: (failedCount / totalLogs) * 100,
      timeoutRate: (timeoutCount / totalLogs) * 100,
      byGateway: {
        razorpay: mockLogs.filter(log => log.gateway === 'razorpay').length,
        stripe: mockLogs.filter(log => log.gateway === 'stripe').length
      },
      byStatus: {
        success: successCount,
        failed: failedCount,
        timeout: timeoutCount,
        pending: mockLogs.filter(log => log.status === 'pending').length
      }
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-700'
      case 'failed': return 'bg-red-100 text-red-700'
      case 'pending': return 'bg-yellow-100 text-yellow-700'
      case 'timeout': return 'bg-orange-100 text-orange-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4" />
      case 'failed': return <XCircle className="w-4 h-4" />
      case 'pending': return <Clock className="w-4 h-4" />
      case 'timeout': return <AlertTriangle className="w-4 h-4" />
      default: return <Info className="w-4 h-4" />
    }
  }

  const getGatewayIcon = (gateway: string) => {
    switch (gateway) {
      case 'razorpay': return <Zap className="w-4 h-4 text-blue-600" />
      case 'stripe': return <Server className="w-4 h-4 text-purple-600" />
      case 'payu': return <Globe className="w-4 h-4 text-green-600" />
      case 'cashfree': return <Activity className="w-4 h-4 text-orange-600" />
      default: return <Server className="w-4 h-4 text-gray-600" />
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.transactionId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.requestId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.event.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesGateway = gatewayFilter === 'all' || log.gateway === gatewayFilter
    const matchesStatus = statusFilter === 'all' || log.status === statusFilter
    
    return matchesSearch && matchesGateway && matchesStatus
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
          <h1 className="text-3xl font-bold text-gray-900">Gateway Logs</h1>
          <p className="text-gray-600 mt-1">
            Monitor payment gateway events and API responses
          </p>
        </div>
        
        <button 
          onClick={loadGatewayLogs}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Events</p>
              <p className="text-3xl font-bold">{stats.totalLogs}</p>
              <p className="text-blue-100 text-xs">Gateway events</p>
            </div>
            <Activity className="w-8 h-8 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Success Rate</p>
              <p className="text-3xl font-bold">{stats.successRate.toFixed(1)}%</p>
              <p className="text-green-100 text-xs">Successful events</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm">Avg Response</p>
              <p className="text-3xl font-bold">{stats.avgResponseTime}ms</p>
              <p className="text-yellow-100 text-xs">Response time</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm">Error Rate</p>
              <p className="text-3xl font-bold">{stats.errorRate.toFixed(1)}%</p>
              <p className="text-red-100 text-xs">Failed events</p>
            </div>
            <XCircle className="w-8 h-8 text-red-200" />
          </div>
        </div>
      </div>

      {/* Gateway Breakdown */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Gateway Breakdown</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(stats.byGateway).map(([gateway, count]) => (
            <div key={gateway} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                {getGatewayIcon(gateway)}
                <div>
                  <p className="text-sm font-medium text-gray-900 capitalize">{gateway}</p>
                  <p className="text-xs text-gray-500">{count} events</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900">{count}</p>
                <p className="text-xs text-gray-500">
                  {stats.totalLogs > 0 ? Math.round((count / stats.totalLogs) * 100) : 0}%
                </p>
              </div>
            </div>
          ))}
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
                placeholder="Search by transaction ID, order ID, event..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={gatewayFilter}
              onChange={(e) => setGatewayFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Gateways</option>
              <option value="razorpay">Razorpay</option>
              <option value="stripe">Stripe</option>
              <option value="payu">PayU</option>
              <option value="cashfree">Cashfree</option>
            </select>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
              <option value="pending">Pending</option>
              <option value="timeout">Timeout</option>
            </select>
          </div>
        </div>
      </div>

      {/* Logs List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Gateway Events ({filteredLogs.length})
            </h2>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1">
              <Download className="w-4 h-4" />
              <span>Export Logs</span>
            </button>
          </div>
        </div>
        
        <div className="divide-y divide-gray-200">
          {filteredLogs.length > 0 ? (
            filteredLogs.map((log) => (
              <div key={log.id} className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                   onClick={() => setSelectedLog(log)}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="flex items-center space-x-2">
                        {getGatewayIcon(log.gateway)}
                        <span className="text-sm font-medium text-gray-900 capitalize">{log.gateway}</span>
                      </div>
                      <span className="text-sm font-mono text-blue-600">{log.event}</span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center space-x-1 ${getStatusColor(log.status)}`}>
                        {getStatusIcon(log.status)}
                        <span>{log.status.toUpperCase()}</span>
                      </span>
                      <span className="text-xs text-gray-500">HTTP {log.httpStatus}</span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
                      <div>
                        <p className="text-sm text-gray-500">Transaction ID</p>
                        <p className="text-sm font-mono text-gray-900">{log.transactionId || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Order ID</p>
                        <p className="text-sm font-mono text-gray-900">{log.orderId || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Amount</p>
                        <p className="text-sm font-medium text-gray-900">
                          {log.amount ? `₹${(log.amount / 100).toLocaleString()}` : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Response Time</p>
                        <p className="text-sm text-gray-900">{log.responseTime}ms</p>
                      </div>
                    </div>
                    
                    {log.errorMessage && (
                      <div className="mb-3">
                        <p className="text-sm text-gray-500">Error</p>
                        <p className="text-sm text-red-600">{log.errorCode}: {log.errorMessage}</p>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-6 text-xs text-gray-500">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(log.timestamp).toLocaleString()}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Code className="w-3 h-3" />
                        <span>Request ID: {log.requestId}</span>
                      </span>
                      {log.retryAttempt > 0 && (
                        <span className="flex items-center space-x-1">
                          <RefreshCw className="w-3 h-3" />
                          <span>Retry #{log.retryAttempt}</span>
                        </span>
                      )}
                      {log.webhookVerified !== undefined && (
                        <span className="flex items-center space-x-1">
                          {log.webhookVerified ? (
                            <CheckCircle className="w-3 h-3 text-green-500" />
                          ) : (
                            <XCircle className="w-3 h-3 text-red-500" />
                          )}
                          <span>Webhook {log.webhookVerified ? 'Verified' : 'Failed'}</span>
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation()
                        copyToClipboard(log.requestId)
                      }}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center">
              <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No gateway logs found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>
      </div>

      {/* Log Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Gateway Log Details</h2>
                <button 
                  onClick={() => setSelectedLog(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Event Information */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Event Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Gateway:</span>
                    <span className="ml-2 font-medium capitalize">{selectedLog.gateway}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Event:</span>
                    <span className="ml-2 font-mono">{selectedLog.event}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Status:</span>
                    <span className={`ml-2 px-2 py-1 text-xs rounded-full ${getStatusColor(selectedLog.status)}`}>
                      {selectedLog.status}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">HTTP Status:</span>
                    <span className="ml-2 font-mono">{selectedLog.httpStatus}</span>
                  </div>
                </div>
              </div>

              {/* Request/Response Payloads */}
              {selectedLog.requestPayload && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Request Payload</h3>
                  <pre className="bg-gray-100 p-4 rounded-lg text-xs overflow-x-auto">
                    {JSON.stringify(selectedLog.requestPayload, null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.responsePayload && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Response Payload</h3>
                  <pre className="bg-gray-100 p-4 rounded-lg text-xs overflow-x-auto">
                    {JSON.stringify(selectedLog.responsePayload, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}