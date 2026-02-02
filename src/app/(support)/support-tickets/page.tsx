'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useSuperAdmin } from '@/store/authStore'
import {
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  Clock,
  Search,
  Filter,
  Eye,
  UserCheck,
  Phone,
  Mail,
  CreditCard,
  HelpCircle,
  ArrowUpRight,
  Timer,
  MapPin,
  Activity,
  Bell,
  Target,
  Settings,
  RefreshCw,
  Edit,
  Send,
  ExternalLink,
  AlertCircle,
  Info,
  CheckCircle2,
  XCircle,
  Pause,
  Play,
  RotateCcw,
  Plus,
  FileText,
  User,
  Building2,
  Calendar,
  Zap,
  TrendingUp,
  Users
} from 'lucide-react'

// Interfaces for Support Ticket System
interface SupportStats {
  totalTickets: number
  openTickets: number
  resolvedTickets: number
  avgResponseTime: string
  slaBreaches: number
  escalatedTickets: number
  todayTickets: number
  myAssignedTickets: number
}

interface Ticket {
  id: string
  ticketNumber: string
  title: string
  description: string
  user: {
    name: string
    email: string
    role: string
    tenantId?: string
  }
  priority: 'P0' | 'P1' | 'P2' | 'P3'
  status: 'new' | 'in-review' | 'in-progress' | 'waiting' | 'escalated' | 'resolved' | 'closed'
  category: 'payment' | 'order' | 'account' | 'system' | 'general' | 'refund' | 'technical'
  source: 'customer-app' | 'tenant-admin' | 'staff-panel' | 'email' | 'system-alert'
  slaTimer: string
  createdAt: string
  updatedAt: string
  assignedTo?: string
  escalatedTo?: string
  attachments?: string[]
  tenantId?: string
  tenantName?: string
  lastResponse?: string
  responseCount: number
}

export default function SupportTicketsDashboard() {
  const admin = useSuperAdmin()
  const searchParams = useSearchParams()
  const filterParam = searchParams.get('filter')

  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')

  // Set initial filter based on URL parameter
  useEffect(() => {
    if (filterParam === 'assigned') {
      setStatusFilter('assigned_to_me')
    } else if (filterParam === 'escalated') {
      setStatusFilter('escalated')
    } else if (filterParam === 'sla-breach') {
      setStatusFilter('sla_breach')
    }
  }, [filterParam])

  const [stats, setStats] = useState<SupportStats>({
    totalTickets: 0,
    openTickets: 0,
    resolvedTickets: 0,
    avgResponseTime: '0h',
    slaBreaches: 0,
    escalatedTickets: 0,
    todayTickets: 0,
    myAssignedTickets: 0
  })

  const [tickets, setTickets] = useState<Ticket[]>([])
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)

  useEffect(() => {
    loadSupportTickets()
  }, [])

  const loadSupportTickets = async () => {
    try {
      // TODO: Replace with real API calls
      const token = localStorage.getItem('auth-storage')
      if (!token) {
        setLoading(false)
        return
      }

      const parsed = JSON.parse(token)
      const authToken = parsed.state?.token
      if (!authToken) {
        setLoading(false)
        return
      }

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://laundrylobby-backend-1.vercel.app/api'

      // Load support ticket statistics
      try {
        const statsResponse = await fetch(`${API_URL}/support/stats`, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        })

        if (statsResponse.ok) {
          const statsData = await statsResponse.json()
          if (statsData.success) {
            setStats({
              totalTickets: statsData.data.totalTickets || 0,
              openTickets: statsData.data.openTickets || 0,
              resolvedTickets: statsData.data.resolvedTickets || 0,
              avgResponseTime: statsData.data.avgResponseTime || '0h',
              slaBreaches: statsData.data.slaBreaches || 0,
              escalatedTickets: statsData.data.escalatedTickets || 0,
              todayTickets: statsData.data.todayTickets || 0,
              myAssignedTickets: statsData.data.myAssignedTickets || 0
            })
          }
        } else {
          console.error('Stats API failed:', statsResponse.status, statsResponse.statusText)
        }
      } catch (error) {
        console.error('Failed to load ticket stats:', error)
        // Use minimal fallback stats
        setStats({
          totalTickets: 0,
          openTickets: 0,
          resolvedTickets: 0,
          avgResponseTime: '0h',
          slaBreaches: 0,
          escalatedTickets: 0,
          todayTickets: 0,
          myAssignedTickets: 0
        })
      }

      // Load all support tickets
      try {
        const ticketsResponse = await fetch(`${API_URL}/support/tickets`, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        })

        if (ticketsResponse.ok) {
          const ticketsData = await ticketsResponse.json()
          console.log('🎫 Raw tickets data:', ticketsData)

          if (ticketsData.success && ticketsData.data) {
            // Transform backend data to frontend format
            const transformedTickets = ticketsData.data.map((ticket: any) => ({
              id: ticket._id || ticket.id,
              ticketNumber: ticket.ticketNumber || `TKT-${(ticket._id || ticket.id || '').slice(-6)}`,
              title: ticket.subject || ticket.title || 'Untitled Ticket',
              description: ticket.description || 'No description provided',
              user: {
                name: ticket.createdBy?.name || ticket.tenantName || 'Unknown User',
                email: ticket.createdBy?.email || 'unknown@email.com',
                role: ticket.createdBy?.role || 'tenant_admin',
                tenantId: ticket.tenantId
              },
              priority: ticket.systemPriority || ticket.priority || 'P3',
              status: ticket.status || 'new',
              category: ticket.category || 'general',
              source: 'tenant-admin',
              slaTimer: ticket.slaDeadline ? `${Math.ceil((new Date(ticket.slaDeadline).getTime() - Date.now()) / (1000 * 60 * 60))}h remaining` : 'No SLA',
              createdAt: ticket.createdAt,
              updatedAt: ticket.updatedAt,
              assignedTo: ticket.assignedTo?.name || null,
              tenantName: ticket.tenantName || 'Unknown Tenant',
              responseCount: ticket.messages?.length || 0,
              lastResponse: ticket.updatedAt !== ticket.createdAt ? 'Recently updated' : null,
              businessImpact: ticket.businessImpact
            }))

            console.log('🎫 Transformed tickets:', transformedTickets)
            setTickets(transformedTickets)
          } else {
            console.error('Invalid tickets response format:', ticketsData)
            setTickets([])
          }
        } else {
          console.error('Tickets API failed:', ticketsResponse.status, ticketsResponse.statusText)
          console.log('🔧 No tickets found or API unavailable')
          setTickets([])
        }
      } catch (error) {
        console.error('Failed to load support tickets:', error)
        console.log('🔧 API connection failed')
        setTickets([])
      }

      setLoading(false)
    } catch (error) {
      console.error('Error loading support tickets:', error)
      setLoading(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'P0': return 'bg-red-100 text-red-700 border-red-200'
      case 'P1': return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'P2': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'P3': return 'bg-green-100 text-green-700 border-green-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-700'
      case 'in-review': return 'bg-purple-100 text-purple-700'
      case 'in-progress': return 'bg-yellow-100 text-yellow-700'
      case 'waiting': return 'bg-orange-100 text-orange-700'
      case 'escalated': return 'bg-red-100 text-red-700'
      case 'resolved': return 'bg-green-100 text-green-700'
      case 'closed': return 'bg-gray-100 text-gray-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'payment': return <CreditCard className="w-4 h-4" />
      case 'order': return <FileText className="w-4 h-4" />
      case 'account': return <User className="w-4 h-4" />
      case 'system': return <Settings className="w-4 h-4" />
      case 'refund': return <RefreshCw className="w-4 h-4" />
      case 'technical': return <Zap className="w-4 h-4" />
      default: return <HelpCircle className="w-4 h-4" />
    }
  }

  const handleTicketAction = async (ticketId: string, action: 'reply' | 'resolve' | 'escalate' | 'edit') => {
    try {
      const token = localStorage.getItem('auth-storage')
      if (!token) return

      const parsed = JSON.parse(token)
      const authToken = parsed.state?.token
      if (!authToken) return

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://laundrylobby-backend-1.vercel.app/api'

      switch (action) {
        case 'reply':
          // TODO: Open reply modal or navigate to reply page
          alert('Reply functionality - would open reply interface')
          break

        case 'resolve':
          // Update ticket status to resolved
          const resolveResponse = await fetch(`${API_URL}/support/tickets/${ticketId}/resolve`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              resolution: 'Ticket resolved by platform support',
              status: 'resolved'
            })
          })

          if (resolveResponse.ok) {
            alert('Ticket resolved successfully')
            setSelectedTicket(null)
            loadSupportTickets() // Refresh the list
          } else {
            alert('Failed to resolve ticket')
          }
          break

        case 'escalate':
          // Escalate ticket
          const escalateResponse = await fetch(`${API_URL}/support/tickets/${ticketId}/escalate`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              escalationReason: 'Escalated by platform support',
              escalatedTo: 'supervisor'
            })
          })

          if (escalateResponse.ok) {
            alert('Ticket escalated successfully')
            setSelectedTicket(null)
            loadSupportTickets() // Refresh the list
          } else {
            alert('Failed to escalate ticket')
          }
          break

        case 'edit':
          // TODO: Open edit modal or navigate to edit page
          alert('Edit functionality - would open edit interface')
          break
      }
    } catch (error) {
      console.error(`Error ${action}ing ticket:`, error)
      alert(`Failed to ${action} ticket`)
    }
  }

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.tenantName?.toLowerCase().includes(searchTerm.toLowerCase())

    let matchesStatus = true
    if (statusFilter === 'assigned_to_me') {
      matchesStatus = ticket.assignedTo === admin?.email || ticket.assignedTo === 'support@gmail.com'
    } else if (statusFilter === 'escalated') {
      matchesStatus = ticket.status === 'escalated'
    } else if (statusFilter === 'sla_breach') {
      // Check if SLA timer indicates a breach (negative time or "overdue")
      matchesStatus = ticket.slaTimer?.includes('overdue') || ticket.slaTimer?.includes('-') || false
    } else if (statusFilter !== 'all') {
      matchesStatus = ticket.status === statusFilter
    }

    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter
    const matchesCategory = categoryFilter === 'all' || ticket.category === categoryFilter

    return matchesSearch && matchesStatus && matchesPriority && matchesCategory
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
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
          <h1 className="text-xl font-light text-gray-900 mb-0.5">
            {filterParam === 'assigned' ? 'My Tickets' :
              filterParam === 'escalated' ? 'Escalated Tickets' :
                filterParam === 'sla-breach' ? 'SLA Breaches' :
                  'Support Tickets'}
          </h1>
          <p className="text-gray-600 mt-1">
            {filterParam === 'assigned' ? 'Tickets assigned to you' :
              filterParam === 'escalated' ? 'Tickets that have been escalated' :
                filterParam === 'sla-breach' ? 'Tickets that have breached SLA' :
                  'Manage and resolve customer support tickets efficiently'}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1 px-3 py-2 bg-green-100 text-green-700 rounded-lg">
            <Activity className="w-4 h-4" />
            <span className="text-sm font-medium">Online</span>
          </div>
          <button
            onClick={() => window.location.href = '/support-tickets/create'}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Ticket</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Tickets</p>
              <p className="text-xl font-bold">{stats.totalTickets}</p>
              <p className="text-blue-100 text-xs">All time</p>
            </div>
            <MessageSquare className="w-8 h-8 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm">Open Tickets</p>
              <p className="text-3xl font-bold">{stats.openTickets}</p>
              <p className="text-red-100 text-xs">Need attention</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Resolved Today</p>
              <p className="text-3xl font-bold">{stats.todayTickets}</p>
              <p className="text-green-100 text-xs">Great progress!</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">My Assigned</p>
              <p className="text-3xl font-bold">{stats.myAssignedTickets}</p>
              <p className="text-purple-100 text-xs">Your workload</p>
            </div>
            <User className="w-8 h-8 text-purple-200" />
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-[10px] uppercase tracking-wider font-medium">Avg Response</p>
              <p className="text-xl font-bold text-gray-900">{stats.avgResponseTime}</p>
              <p className="text-green-600 text-xs">↓ 15% from last week</p>
            </div>
            <Timer className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">SLA Breaches</p>
              <p className="text-2xl font-bold text-gray-900">{stats.slaBreaches}</p>
              <p className="text-red-600 text-xs">↑ 2 from yesterday</p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-[10px] uppercase tracking-wider font-medium">Escalated</p>
              <p className="text-xl font-bold text-gray-900">{stats.escalatedTickets}</p>
              <p className="text-orange-600 text-xs">Needs attention</p>
            </div>
            <ArrowUpRight className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search tickets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="assigned_to_me">My Tickets</option>
              <option value="escalated">Escalated</option>
              <option value="sla_breach">SLA Breaches</option>
              <option value="new">New</option>
              <option value="in-progress">In Progress</option>
              <option value="waiting">Waiting</option>
              <option value="resolved">Resolved</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Priority</option>
              <option value="P0">P0 - Critical</option>
              <option value="P1">P1 - High</option>
              <option value="P2">P2 - Medium</option>
              <option value="P3">P3 - Low</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              <option value="payment">Payment</option>
              <option value="order">Order</option>
              <option value="refund">Refund</option>
              <option value="technical">Technical</option>
              <option value="account">Account</option>
              <option value="system">System</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tickets List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Support Tickets ({filteredTickets.length})
            </h2>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1">
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredTickets.length > 0 ? (
            filteredTickets.map((ticket) => (
              <div key={ticket.id} className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => setSelectedTicket(ticket)}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-sm font-mono text-blue-600">{ticket.ticketNumber}</span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(ticket.status)}`}>
                        {ticket.status.replace('-', ' ')}
                      </span>
                      <span className="flex items-center space-x-1 px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                        {getCategoryIcon(ticket.category)}
                        <span>{ticket.category}</span>
                      </span>
                    </div>

                    <h3 className="text-base font-semibold text-gray-900 mb-1">{ticket.title}</h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{ticket.description}</p>

                    <div className="flex items-center space-x-6 text-xs text-gray-500">
                      <span className="flex items-center space-x-1">
                        <UserCheck className="w-3 h-3" />
                        <span>{ticket.user.name}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Building2 className="w-3 h-3" />
                        <span>{ticket.tenantName}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>SLA: {ticket.slaTimer}</span>
                      </span>
                      {ticket.lastResponse && (
                        <span className="flex items-center space-x-1">
                          <MessageSquare className="w-3 h-3" />
                          <span>Last response: {ticket.lastResponse}</span>
                        </span>
                      )}
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {ticket.responseCount > 0 && (
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                        {ticket.responseCount} responses
                      </span>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedTicket(ticket)
                      }}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View ticket details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center">
              <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tickets found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <h2 className="text-base font-semibold text-gray-900 mb-3">Quick Actions</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => window.location.href = '/support-tickets/create'}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MessageSquare className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Create Ticket</p>
                <p className="text-sm text-gray-500">New support request</p>
              </div>
            </div>
          </button>

          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Bulk Resolve</p>
                <p className="text-sm text-gray-500">Close multiple tickets</p>
              </div>
            </div>
          </button>

          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <ArrowUpRight className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Escalate</p>
                <p className="text-sm text-gray-500">Send to supervisor</p>
              </div>
            </div>
          </button>

          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FileText className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Generate Report</p>
                <p className="text-sm text-gray-500">Export ticket data</p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <h2 className="text-xl font-semibold text-gray-900">Ticket Details</h2>
                  <span className="text-sm font-mono text-blue-600">{selectedTicket.ticketNumber}</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(selectedTicket.priority)}`}>
                    {selectedTicket.priority}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedTicket.status)}`}>
                    {selectedTicket.status.replace('-', ' ')}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Ticket Header */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">{selectedTicket.title}</h3>
                <p className="text-gray-600">{selectedTicket.description}</p>
              </div>

              {/* Ticket Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Customer Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">{selectedTicket.user.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span>{selectedTicket.user.email}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Building2 className="w-4 h-4 text-gray-400" />
                        <span>{selectedTicket.tenantName}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <UserCheck className="w-4 h-4 text-gray-400" />
                        <span className="capitalize">{selectedTicket.user.role.replace('_', ' ')}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Ticket Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">Category:</span>
                        <div className="flex items-center space-x-1">
                          {getCategoryIcon(selectedTicket.category)}
                          <span className="capitalize">{selectedTicket.category}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">Source:</span>
                        <span className="capitalize">{selectedTicket.source.replace('-', ' ')}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">SLA Timer:</span>
                        <span className={selectedTicket.slaTimer.includes('overdue') ? 'text-red-600' : 'text-gray-600'}>
                          {selectedTicket.slaTimer}
                        </span>
                      </div>
                      {selectedTicket.assignedTo && (
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">Assigned to:</span>
                          <span>{selectedTicket.assignedTo}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Timeline</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">Created:</span>
                        <span>{new Date(selectedTicket.createdAt).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">Last Updated:</span>
                        <span>{new Date(selectedTicket.updatedAt).toLocaleString()}</span>
                      </div>
                      {selectedTicket.responseCount > 0 && (
                        <div className="flex items-center space-x-2">
                          <MessageSquare className="w-4 h-4 text-gray-400" />
                          <span className="font-medium">Responses:</span>
                          <span>{selectedTicket.responseCount}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedTicket.businessImpact && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Business Impact</h4>
                      <p className="text-sm text-gray-600">{selectedTicket.businessImpact}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleTicketAction(selectedTicket.id, 'reply')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Reply</span>
                  </button>
                  <button
                    onClick={() => handleTicketAction(selectedTicket.id, 'resolve')}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Resolve</span>
                  </button>
                  <button
                    onClick={() => handleTicketAction(selectedTicket.id, 'escalate')}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center space-x-2"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                    <span>Escalate</span>
                  </button>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleTicketAction(selectedTicket.id, 'edit')}
                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => window.open(`/support-tickets/${selectedTicket.id}`, '_blank')}
                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Open</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}