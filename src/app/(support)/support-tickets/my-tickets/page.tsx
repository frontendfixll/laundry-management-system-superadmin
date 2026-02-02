'use client'

import { useState, useEffect } from 'react'
import { useSuperAdmin } from '@/store/authStore'
import { 
  User,
  Clock,
  AlertTriangle,
  CheckCircle,
  MessageSquare,
  Eye,
  Edit,
  ArrowUpRight,
  RefreshCw,
  Filter,
  Search,
  Calendar,
  Building2,
  FileText,
  Timer,
  Activity,
  Target,
  TrendingUp,
  Award,
  Zap
} from 'lucide-react'

interface MyTicketStats {
  totalAssigned: number
  inProgress: number
  resolved: number
  avgResolutionTime: string
  slaCompliance: number
  escalatedByMe: number
  todayResolved: number
  weeklyTarget: number
}

interface Ticket {
  id: string
  ticketNumber: string
  title: string
  description: string
  priority: 'P0' | 'P1' | 'P2' | 'P3'
  status: 'new' | 'in-review' | 'in-progress' | 'waiting' | 'escalated' | 'resolved' | 'closed'
  category: string
  slaTimer: string
  createdAt: string
  updatedAt: string
  tenantName: string
  customerName: string
  lastActivity: string
  responseCount: number
  assignedAt: string
}

export default function MyTicketsPage() {
  const admin = useSuperAdmin()
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  
  const [stats, setStats] = useState<MyTicketStats>({
    totalAssigned: 0,
    inProgress: 0,
    resolved: 0,
    avgResolutionTime: '0h',
    slaCompliance: 0,
    escalatedByMe: 0,
    todayResolved: 0,
    weeklyTarget: 20
  })
  
  const [tickets, setTickets] = useState<Ticket[]>([])

  useEffect(() => {
    loadMyTickets()
  }, [])

  const loadMyTickets = async () => {
    try {
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

      // Load my assigned tickets
      try {
        const response = await fetch(`${API_URL}/support/tickets?assignedTo=me`, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.data) {
            const transformedTickets = data.data.map((ticket: any) => ({
              id: ticket._id || ticket.id,
              ticketNumber: ticket.ticketNumber || `TKT-${(ticket._id || ticket.id || '').slice(-6)}`,
              title: ticket.subject || ticket.title || 'Untitled Ticket',
              description: ticket.description || 'No description provided',
              priority: ticket.systemPriority || ticket.priority || 'P3',
              status: ticket.status || 'new',
              category: ticket.category || 'general',
              slaTimer: ticket.slaDeadline ? `${Math.ceil((new Date(ticket.slaDeadline).getTime() - Date.now()) / (1000 * 60 * 60))}h remaining` : 'No SLA',
              createdAt: ticket.createdAt,
              updatedAt: ticket.updatedAt,
              tenantName: ticket.tenantName || 'Unknown Tenant',
              customerName: ticket.createdBy?.name || 'Unknown Customer',
              lastActivity: ticket.updatedAt !== ticket.createdAt ? 'Recently updated' : 'No recent activity',
              responseCount: ticket.messages?.length || 0,
              assignedAt: ticket.assignedAt || ticket.createdAt
            }))
            
            setTickets(transformedTickets)
            
            // Calculate stats
            const totalAssigned = transformedTickets.length
            const inProgress = transformedTickets.filter((t: any) => ['in-progress', 'in-review'].includes(t.status)).length
            const resolved = transformedTickets.filter((t: any) => ['resolved', 'closed'].includes(t.status)).length
            const todayResolved = transformedTickets.filter((t: any) => {
              const today = new Date().toDateString()
              return ['resolved', 'closed'].includes(t.status) && new Date(t.updatedAt).toDateString() === today
            }).length
            
            setStats({
              totalAssigned,
              inProgress,
              resolved,
              avgResolutionTime: '2.5h',
              slaCompliance: Math.round((resolved / Math.max(totalAssigned, 1)) * 100),
              escalatedByMe: transformedTickets.filter((t: any) => t.status === 'escalated').length,
              todayResolved,
              weeklyTarget: 20
            })
          }
        }
      } catch (error) {
        console.error('Failed to load my tickets:', error)
      }

      setLoading(false)
    } catch (error) {
      console.error('Error loading my tickets:', error)
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

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.customerName.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter
    
    return matchesSearch && matchesStatus && matchesPriority
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
          <h1 className="text-3xl font-bold text-gray-900">My Assigned Tickets</h1>
          <p className="text-gray-600 mt-1">Tickets currently assigned to you for resolution</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1 px-3 py-2 bg-green-100 text-green-700 rounded-lg">
            <Activity className="w-4 h-4" />
            <span className="text-sm font-medium">Active</span>
          </div>
          <div className="flex items-center space-x-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg">
            <Target className="w-4 h-4" />
            <span className="text-sm font-medium">{stats.todayResolved}/{stats.weeklyTarget} Weekly Goal</span>
          </div>
        </div>
      </div>

      {/* Personal Performance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Assigned</p>
              <p className="text-3xl font-bold">{stats.totalAssigned}</p>
              <p className="text-blue-100 text-xs">Your workload</p>
            </div>
            <User className="w-8 h-8 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm">In Progress</p>
              <p className="text-3xl font-bold">{stats.inProgress}</p>
              <p className="text-yellow-100 text-xs">Active work</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Resolved</p>
              <p className="text-3xl font-bold">{stats.resolved}</p>
              <p className="text-green-100 text-xs">Completed</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">SLA Compliance</p>
              <p className="text-3xl font-bold">{stats.slaCompliance}%</p>
              <p className="text-purple-100 text-xs">Performance</p>
            </div>
            <Award className="w-8 h-8 text-purple-200" />
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Avg Resolution Time</p>
              <p className="text-2xl font-bold text-gray-900">{stats.avgResolutionTime}</p>
              <p className="text-green-600 text-xs">↓ 20% from last week</p>
            </div>
            <Timer className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Today Resolved</p>
              <p className="text-2xl font-bold text-gray-900">{stats.todayResolved}</p>
              <p className="text-blue-600 text-xs">Great progress!</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Escalated</p>
              <p className="text-2xl font-bold text-gray-900">{stats.escalatedByMe}</p>
              <p className="text-orange-600 text-xs">Needs attention</p>
            </div>
            <ArrowUpRight className="w-8 h-8 text-orange-500" />
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
                placeholder="Search my tickets..."
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
              <option value="new">New</option>
              <option value="in-progress">In Progress</option>
              <option value="waiting">Waiting</option>
              <option value="escalated">Escalated</option>
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
          </div>
        </div>
      </div>

      {/* My Tickets List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              My Tickets ({filteredTickets.length})
            </h2>
            <button 
              onClick={loadMyTickets}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
        
        <div className="divide-y divide-gray-200">
          {filteredTickets.length > 0 ? (
            filteredTickets.map((ticket) => (
              <div key={ticket.id} className="p-6 hover:bg-gray-50 transition-colors">
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
                      <span className="text-xs text-gray-500">
                        Assigned: {new Date(ticket.assignedAt).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-medium text-gray-900 mb-2">{ticket.title}</h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{ticket.description}</p>
                    
                    <div className="flex items-center space-x-6 text-xs text-gray-500">
                      <span className="flex items-center space-x-1">
                        <User className="w-3 h-3" />
                        <span>{ticket.customerName}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Building2 className="w-3 h-3" />
                        <span>{ticket.tenantName}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Timer className="w-3 h-3" />
                        <span>SLA: {ticket.slaTimer}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <MessageSquare className="w-3 h-3" />
                        <span>{ticket.responseCount} responses</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Activity className="w-3 h-3" />
                        <span>{ticket.lastActivity}</span>
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center">
              <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tickets assigned</h3>
              <p className="text-gray-500">You don't have any tickets assigned to you at the moment</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions for My Tickets */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
              <div className="p-2 bg-blue-100 rounded-lg">
                <MessageSquare className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Bulk Update</p>
                <p className="text-sm text-gray-500">Update status/priority</p>
              </div>
            </div>
          </button>
          
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FileText className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">My Report</p>
                <p className="text-sm text-gray-500">Export my tickets</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}