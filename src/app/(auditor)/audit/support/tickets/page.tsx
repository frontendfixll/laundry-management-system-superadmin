'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { superAdminApi } from '@/lib/superAdminApi'
import { 
  MessageSquare,
  Search,
  Filter,
  Calendar,
  Download,
  Clock,
  User,
  AlertTriangle,
  CheckCircle,
  Eye,
  ArrowUpRight,
  Building2,
  Tag,
  Timer,
  Activity
} from 'lucide-react'

interface SupportTicket {
  _id: string
  ticketId: string
  title: string
  description: string
  status: 'open' | 'in_progress' | 'resolved' | 'closed' | 'escalated'
  priority: 'low' | 'medium' | 'high' | 'critical'
  category: string
  createdAt: Date
  updatedAt: Date
  resolvedAt?: Date
  customer: {
    id: string
    name: string
    email: string
    phone?: string
  }
  tenant: {
    id: string
    name: string
    businessName: string
  }
  assignedTo?: {
    id: string
    name: string
    email: string
    role: string
  }
  escalatedTo?: {
    id: string
    name: string
    email: string
    role: string
  }
  sla: {
    responseTime: number // in minutes
    resolutionTime: number // in minutes
    responseDeadline: Date
    resolutionDeadline: Date
    responseBreached: boolean
    resolutionBreached: boolean
  }
  metrics: {
    firstResponseTime?: number
    totalResponseTime: number
    resolutionTime?: number
    customerSatisfaction?: number
    escalationCount: number
  }
  tags: string[]
  attachments: string[]
  auditTrail: {
    action: string
    performedBy: string
    timestamp: Date
    details: string
  }[]
}

export default function SupportTicketsAuditPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedPriority, setSelectedPriority] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [dateRange, setDateRange] = useState('30d')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [stats, setStats] = useState({
    totalTickets: 0,
    openTickets: 0,
    resolvedTickets: 0,
    escalatedTickets: 0,
    avgResolutionTime: 0,
    slaBreaches: 0,
    customerSatisfaction: 0
  })

  useEffect(() => {
    fetchSupportTickets()
  }, [page, selectedStatus, selectedPriority, selectedCategory, dateRange, searchQuery])

  const fetchSupportTickets = async () => {
    try {
      setLoading(true)
      
      const params: any = {
        page,
        limit: 20
      }
      
      if (selectedStatus !== 'all') params.status = selectedStatus
      if (selectedPriority !== 'all') params.priority = selectedPriority
      if (selectedCategory !== 'all') params.category = selectedCategory
      if (searchQuery) params.search = searchQuery
      params.range = dateRange
      
      const data = await superAdminApi.get(`/audit/support/tickets?${new URLSearchParams(params)}`)
      
      if (data.success) {
        setTickets(data.data.tickets)
        setStats(data.data.stats)
        setTotalPages(data.data.pagination.pages)
        
        console.log('✅ Successfully loaded real support tickets data')
      } else {
        throw new Error(data.message || 'Failed to fetch support tickets')
      }
      
    } catch (error) {
      console.error('❌ Error fetching support tickets:', error)
      
      // Show empty state instead of mock data
      setTickets([])
      setStats({
        totalTickets: 0,
        openTickets: 0,
        resolvedTickets: 0,
        escalatedTickets: 0,
        avgResolutionTime: 0,
        slaBreaches: 0,
        customerSatisfaction: 0
      })
      setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-blue-700 bg-blue-100'
      case 'in_progress': return 'text-orange-700 bg-orange-100'
      case 'resolved': return 'text-green-700 bg-green-100'
      case 'closed': return 'text-gray-700 bg-gray-100'
      case 'escalated': return 'text-red-700 bg-red-100'
      default: return 'text-gray-700 bg-gray-100'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-700 bg-red-100'
      case 'high': return 'text-orange-700 bg-orange-100'
      case 'medium': return 'text-yellow-700 bg-yellow-100'
      case 'low': return 'text-green-700 bg-green-100'
      default: return 'text-gray-700 bg-gray-100'
    }
  }

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    if (hours < 24) return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
    const days = Math.floor(hours / 24)
    const remainingHours = hours % 24
    return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`
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
              <MessageSquare className="w-8 h-8 mr-3" />
              Support Tickets Audit
            </h1>
            <p className="text-blue-100 mt-2">
              Comprehensive oversight of all support tickets, SLA compliance, and resolution tracking
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-blue-100">Total Tickets: {stats.totalTickets}</p>
            <p className="text-xs text-blue-200">Support Oversight</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-sm p-4 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Total</p>
              <p className="text-xl font-bold text-blue-900 mt-1">{stats.totalTickets}</p>
            </div>
            <MessageSquare className="w-5 h-5 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl shadow-sm p-4 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-orange-700 uppercase tracking-wide">Open</p>
              <p className="text-xl font-bold text-orange-900 mt-1">{stats.openTickets}</p>
            </div>
            <Clock className="w-5 h-5 text-orange-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-sm p-4 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-green-700 uppercase tracking-wide">Resolved</p>
              <p className="text-xl font-bold text-green-900 mt-1">{stats.resolvedTickets}</p>
            </div>
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl shadow-sm p-4 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-red-700 uppercase tracking-wide">Escalated</p>
              <p className="text-xl font-bold text-red-900 mt-1">{stats.escalatedTickets}</p>
            </div>
            <ArrowUpRight className="w-5 h-5 text-red-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-sm p-4 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide">Avg Resolution</p>
              <p className="text-lg font-bold text-purple-900 mt-1">{stats.avgResolutionTime}h</p>
            </div>
            <Timer className="w-5 h-5 text-purple-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl shadow-sm p-4 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-yellow-700 uppercase tracking-wide">SLA Breaches</p>
              <p className="text-xl font-bold text-yellow-900 mt-1">{stats.slaBreaches}</p>
            </div>
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl shadow-sm p-4 border border-indigo-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wide">Satisfaction</p>
              <p className="text-xl font-bold text-indigo-900 mt-1">{stats.customerSatisfaction}/5</p>
            </div>
            <Activity className="w-5 h-5 text-indigo-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="flex items-center space-x-2">
            <Search className="w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search tickets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
            <option value="escalated">Escalated</option>
          </select>

          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Priority</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            <option value="Delivery Issues">Delivery Issues</option>
            <option value="Payment Issues">Payment Issues</option>
            <option value="Quality Issues">Quality Issues</option>
            <option value="Account Issues">Account Issues</option>
            <option value="Technical Issues">Technical Issues</option>
          </select>

          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>

          <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Tickets List */}
      <div className="space-y-4">
        {tickets.map((ticket) => (
          <div key={ticket._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {/* Header */}
                <div className="flex items-center space-x-3 mb-3">
                  <span className="font-mono text-sm text-gray-600">{ticket.ticketId}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                    {ticket.status.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                    {ticket.priority.toUpperCase()}
                  </span>
                  <span className="px-2 py-1 rounded-full text-xs font-medium text-gray-700 bg-gray-100">
                    {ticket.category}
                  </span>
                  {ticket.sla.resolutionBreached && (
                    <span className="px-2 py-1 rounded-full text-xs font-medium text-red-700 bg-red-100">
                      SLA BREACH
                    </span>
                  )}
                </div>

                {/* Title & Description */}
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{ticket.title}</h3>
                  <p className="text-gray-600 text-sm">{ticket.description}</p>
                </div>

                {/* Customer & Tenant Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <h4 className="text-xs font-medium text-gray-700 mb-1">Customer</h4>
                    <p className="text-sm font-medium text-gray-900">{ticket.customer.name}</p>
                    <p className="text-xs text-gray-600">{ticket.customer.email}</p>
                    {ticket.customer.phone && (
                      <p className="text-xs text-gray-600">{ticket.customer.phone}</p>
                    )}
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <h4 className="text-xs font-medium text-gray-700 mb-1">Tenant</h4>
                    <p className="text-sm font-medium text-gray-900">{ticket.tenant.businessName}</p>
                    <p className="text-xs text-gray-600">{ticket.tenant.name}</p>
                  </div>
                </div>

                {/* Assignment & SLA */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <h4 className="text-xs font-medium text-gray-700 mb-1">Assigned To</h4>
                    {ticket.assignedTo ? (
                      <div>
                        <p className="text-sm font-medium text-gray-900">{ticket.assignedTo.name}</p>
                        <p className="text-xs text-gray-600">{ticket.assignedTo.role}</p>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">Unassigned</p>
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-gray-700 mb-1">SLA Status</h4>
                    <p className={`text-sm font-medium ${ticket.sla.resolutionBreached ? 'text-red-600' : 'text-green-600'}`}>
                      {ticket.sla.resolutionBreached ? 'Breached' : 'On Track'}
                    </p>
                    <p className="text-xs text-gray-600">
                      Due: {ticket.sla.resolutionDeadline.toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-gray-700 mb-1">Metrics</h4>
                    {ticket.metrics.firstResponseTime && (
                      <p className="text-xs text-gray-600">
                        First Response: {formatDuration(ticket.metrics.firstResponseTime)}
                      </p>
                    )}
                    {ticket.metrics.escalationCount > 0 && (
                      <p className="text-xs text-red-600">
                        Escalations: {ticket.metrics.escalationCount}
                      </p>
                    )}
                  </div>
                </div>

                {/* Tags */}
                {ticket.tags.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {ticket.tags.map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded flex items-center">
                          <Tag className="w-3 h-3 mr-1" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent Audit Trail */}
                {ticket.auditTrail.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Activity</h4>
                    <div className="space-y-1">
                      {ticket.auditTrail.slice(-2).map((entry, index) => (
                        <div key={index} className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                          <span className="font-medium">{entry.action.replace('_', ' ')}</span> by {entry.performedBy}
                          <span className="text-gray-500 ml-2">
                            {entry.timestamp.toLocaleDateString()} {entry.timestamp.toLocaleTimeString()}
                          </span>
                          {entry.details && <p className="mt-1">{entry.details}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions & Timestamp */}
              <div className="flex flex-col items-end space-y-2 ml-4">
                <button className="text-blue-600 hover:text-blue-800 p-2 rounded-md hover:bg-blue-50">
                  <Eye className="w-4 h-4" />
                </button>
                <div className="text-xs text-gray-500 text-right">
                  <div>Created: {ticket.createdAt.toLocaleDateString()}</div>
                  <div>Updated: {ticket.updatedAt.toLocaleDateString()}</div>
                  {ticket.resolvedAt && (
                    <div className="text-green-600">Resolved: {ticket.resolvedAt.toLocaleDateString()}</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white rounded-lg shadow-sm border border-gray-200 p-4">
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
  )
}