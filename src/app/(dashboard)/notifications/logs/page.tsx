'use client'

import React, { useState, useEffect } from 'react'
import { 
  FileText, 
  Search, 
  Filter, 
  Download, 
  RefreshCw,
  Clock,
  User,
  AlertTriangle,
  CheckCircle,
  Info,
  Eye,
  Calendar
} from 'lucide-react'

interface NotificationLog {
  id: string
  timestamp: string
  eventType: string
  priority: 'P0' | 'P1' | 'P2' | 'P3' | 'P4'
  title: string
  message: string
  recipient: {
    id: string
    email: string
    role: string
    tenantId?: string
  }
  status: 'sent' | 'delivered' | 'read' | 'failed' | 'pending'
  channel: 'websocket' | 'email' | 'sms' | 'push'
  metadata: {
    tenantName?: string
    classification: 'automatic' | 'manual'
    responseTime?: number
    errorMessage?: string
  }
}

const priorityConfig = {
  P0: { name: 'Critical', color: 'red', bgColor: 'bg-red-50', textColor: 'text-red-700' },
  P1: { name: 'High', color: 'orange', bgColor: 'bg-orange-50', textColor: 'text-orange-700' },
  P2: { name: 'Medium', color: 'blue', bgColor: 'bg-blue-50', textColor: 'text-blue-700' },
  P3: { name: 'Low', color: 'gray', bgColor: 'bg-gray-50', textColor: 'text-gray-700' },
  P4: { name: 'Silent', color: 'gray', bgColor: 'bg-gray-25', textColor: 'text-gray-500' }
}

const statusConfig = {
  sent: { name: 'Sent', color: 'blue', icon: CheckCircle },
  delivered: { name: 'Delivered', color: 'green', icon: CheckCircle },
  read: { name: 'Read', color: 'green', icon: Eye },
  failed: { name: 'Failed', color: 'red', icon: AlertTriangle },
  pending: { name: 'Pending', color: 'yellow', icon: Clock }
}

const channelConfig = {
  websocket: { name: 'WebSocket', color: 'blue' },
  email: { name: 'Email', color: 'green' },
  sms: { name: 'SMS', color: 'purple' },
  push: { name: 'Push', color: 'orange' }
}

export default function NotificationLogsPage() {
  const [logs, setLogs] = useState<NotificationLog[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPriority, setSelectedPriority] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedChannel, setSelectedChannel] = useState<string>('all')
  const [dateRange, setDateRange] = useState<string>('today')
  const [selectedLog, setSelectedLog] = useState<NotificationLog | null>(null)

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockLogs: NotificationLog[] = [
      {
        id: '1',
        timestamp: '2024-01-29T10:30:00Z',
        eventType: 'payment_failed',
        priority: 'P1',
        title: 'Payment Failed',
        message: 'Payment of $150.00 failed for order #12345',
        recipient: {
          id: 'user1',
          email: 'admin@tenant1.com',
          role: 'tenant_admin',
          tenantId: 'tenant1'
        },
        status: 'delivered',
        channel: 'websocket',
        metadata: {
          tenantName: 'Clean & Fresh Laundry',
          classification: 'automatic',
          responseTime: 250
        }
      },
      {
        id: '2',
        timestamp: '2024-01-29T10:25:00Z',
        eventType: 'security_alert',
        priority: 'P0',
        title: 'Security Alert',
        message: 'Multiple failed login attempts detected',
        recipient: {
          id: 'admin1',
          email: 'security@laundrylobby.com',
          role: 'super_admin'
        },
        status: 'read',
        channel: 'email',
        metadata: {
          classification: 'automatic',
          responseTime: 150
        }
      },
      {
        id: '3',
        timestamp: '2024-01-29T10:20:00Z',
        eventType: 'order_update',
        priority: 'P2',
        title: 'Order Status Update',
        message: 'Order #12346 has been picked up',
        recipient: {
          id: 'user2',
          email: 'customer@example.com',
          role: 'customer',
          tenantId: 'tenant1'
        },
        status: 'failed',
        channel: 'sms',
        metadata: {
          tenantName: 'Clean & Fresh Laundry',
          classification: 'automatic',
          errorMessage: 'SMS delivery failed: Invalid phone number'
        }
      },
      {
        id: '4',
        timestamp: '2024-01-29T10:15:00Z',
        eventType: 'system_maintenance',
        priority: 'P3',
        title: 'Maintenance Notification',
        message: 'Scheduled maintenance will begin at 2 AM EST',
        recipient: {
          id: 'user3',
          email: 'ops@tenant2.com',
          role: 'tenant_admin',
          tenantId: 'tenant2'
        },
        status: 'pending',
        channel: 'push',
        metadata: {
          tenantName: 'Express Wash Co.',
          classification: 'manual'
        }
      }
    ]

    setTimeout(() => {
      setLogs(mockLogs)
      setLoading(false)
    }, 1000)
  }, [])

  // Filter logs based on search and filters
  const filteredLogs = logs.filter(log => {
    const matchesSearch = searchTerm === '' || 
      log.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.recipient.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesPriority = selectedPriority === 'all' || log.priority === selectedPriority
    const matchesStatus = selectedStatus === 'all' || log.status === selectedStatus
    const matchesChannel = selectedChannel === 'all' || log.channel === selectedChannel
    
    return matchesSearch && matchesPriority && matchesStatus && matchesChannel
  })

  const exportLogs = () => {
    // Implementation for exporting logs
    console.log('Exporting logs...')
  }

  const refreshLogs = () => {
    setLoading(true)
    // Simulate API call
    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Notification Logs</h1>
          <p className="text-gray-600 mt-1">View detailed logs of all notification activities</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={refreshLogs}
            className="flex items-center px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
          <button
            onClick={exportLogs}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Logs</p>
              <p className="text-xl font-bold text-gray-900">{logs.length}</p>
            </div>
            <FileText className="w-6 h-6 text-gray-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Delivered</p>
              <p className="text-xl font-bold text-green-600">
                {logs.filter(l => l.status === 'delivered').length}
              </p>
            </div>
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Failed</p>
              <p className="text-xl font-bold text-red-600">
                {logs.filter(l => l.status === 'failed').length}
              </p>
            </div>
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-xl font-bold text-yellow-600">
                {logs.filter(l => l.status === 'pending').length}
              </p>
            </div>
            <Clock className="w-6 h-6 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Response</p>
              <p className="text-xl font-bold text-blue-600">
                {Math.round(logs.reduce((sum, l) => sum + (l.metadata.responseTime || 0), 0) / logs.length)}ms
              </p>
            </div>
            <Clock className="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Priority Filter */}
          <div>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Priorities</option>
              <option value="P0">P0 - Critical</option>
              <option value="P1">P1 - High</option>
              <option value="P2">P2 - Medium</option>
              <option value="P3">P3 - Low</option>
              <option value="P4">P4 - Silent</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="sent">Sent</option>
              <option value="delivered">Delivered</option>
              <option value="read">Read</option>
              <option value="failed">Failed</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          {/* Channel Filter */}
          <div>
            <select
              value={selectedChannel}
              onChange={(e) => setSelectedChannel(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Channels</option>
              <option value="websocket">WebSocket</option>
              <option value="email">Email</option>
              <option value="sms">SMS</option>
              <option value="push">Push</option>
            </select>
          </div>

          {/* Date Range */}
          <div>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="all">All Time</option>
            </select>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Recipient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Channel
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLogs.map((log) => {
                const priorityStyle = priorityConfig[log.priority]
                const statusStyle = statusConfig[log.status]
                const channelStyle = channelConfig[log.channel]
                const StatusIcon = statusStyle.icon

                return (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${priorityStyle.bgColor} ${priorityStyle.textColor}`}>
                        {log.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                      {log.title}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div>
                        <div className="font-medium">{log.recipient.email}</div>
                        <div className="text-gray-500">{log.recipient.role}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <StatusIcon className={`w-4 h-4 mr-2 text-${statusStyle.color}-600`} />
                        <span className={`text-sm text-${statusStyle.color}-600`}>
                          {statusStyle.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full bg-${channelStyle.color}-100 text-${channelStyle.color}-800`}>
                        {channelStyle.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {filteredLogs.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No logs found</h3>
            <p className="text-gray-600">Try adjusting your search criteria or filters.</p>
          </div>
        )}
      </div>

      {/* Log Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Notification Log Details</h3>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Timestamp</label>
                  <p className="text-sm text-gray-900">{new Date(selectedLog.timestamp).toLocaleString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Event Type</label>
                  <p className="text-sm text-gray-900">{selectedLog.eventType}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Priority</label>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${priorityConfig[selectedLog.priority].bgColor} ${priorityConfig[selectedLog.priority].textColor}`}>
                    {selectedLog.priority}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <p className="text-sm text-gray-900">{statusConfig[selectedLog.status].name}</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <p className="text-sm text-gray-900">{selectedLog.title}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Message</label>
                <p className="text-sm text-gray-900">{selectedLog.message}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Recipient</label>
                <div className="text-sm text-gray-900">
                  <p>Email: {selectedLog.recipient.email}</p>
                  <p>Role: {selectedLog.recipient.role}</p>
                  {selectedLog.recipient.tenantId && (
                    <p>Tenant: {selectedLog.metadata.tenantName}</p>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Channel</label>
                  <p className="text-sm text-gray-900">{channelConfig[selectedLog.channel].name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Classification</label>
                  <p className="text-sm text-gray-900">{selectedLog.metadata.classification}</p>
                </div>
              </div>
              
              {selectedLog.metadata.responseTime && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Response Time</label>
                  <p className="text-sm text-gray-900">{selectedLog.metadata.responseTime}ms</p>
                </div>
              )}
              
              {selectedLog.metadata.errorMessage && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Error Message</label>
                  <p className="text-sm text-red-600">{selectedLog.metadata.errorMessage}</p>
                </div>
              )}
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}