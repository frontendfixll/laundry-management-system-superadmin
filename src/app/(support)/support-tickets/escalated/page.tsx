'use client'

import { useState, useEffect } from 'react'
import { 
  AlertTriangle,
  Clock,
  ArrowUpRight,
  User,
  Building2,
  MessageSquare,
  Eye,
  ArrowDown,
  RefreshCw,
  Search,
  Filter,
  Calendar,
  Timer,
  Activity,
  FileText,
  Phone,
  Mail,
  Zap,
  Target,
  TrendingUp,
  AlertCircle,
  CheckCircle
} from 'lucide-react'

interface EscalationStats {
  totalEscalated: number
  pendingReview: number
  beingHandled: number
  avgEscalationTime: string
  criticalEscalations: number
  resolvedToday: number
  escalationRate: number
  slaBreaches: number
}

interface EscalatedTicket {
  id: string
  ticketNumber: string
  title: string
  description: string
  priority: 'P0' | 'P1' | 'P2' | 'P3'
  status: 'escalated' | 'supervisor-review' | 'management-review' | 'resolved'
  category: string
  escalatedAt: string
  escalatedBy: string
  escalatedTo: string
  escalationReason: string
  originalAssignee: string
  tenantName: string
  customerName: string
  businessImpact: 'low' | 'medium' | 'high' | 'critical'
  slaTimer: string
  responseCount: number
  lastUpdate: string
  escalationLevel: 'L1' | 'L2' | 'L3' | 'L4'
}

export default function EscalatedTicketsPage() {
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [escalationLevelFilter, setEscalationLevelFilter] = useState('all')
  
  const [stats, setStats] = useState<EscalationStats>({
    totalEscalated: 0,
    pendingReview: 0,
    beingHandled: 0,
    avgEscalationTime: '0h',
    criticalEscalations: 0,
    resolvedToday: 0,
    escalationRate: 0,
    slaBreaches: 0
  })
  
  const [tickets, setTickets] = useState<EscalatedTicket[]>([])

  useEffect(() => {
    loadEscalatedTickets()
  }, [])

  const loadEscalatedTickets = async () => {
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

      // Load escalated tickets
      try {
        const response = await fetch(`${API_URL}/support/tickets?status=escalated`, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.data) {
            const transformedTickets = data.data
              .filter((ticket: any) => ticket.status === 'escalated')
              .map((ticket: any) => ({
                id: ticket._id || ticket.id,
                ticketNumber: ticket.ticketNumber || `TKT-${(ticket._id || ticket.id || '').slice(-6)}`,
                title: ticket.subject || ticket.title || 'Untitled Ticket',
                description: ticket.description || 'No description provided',
                priority: ticket.systemPriority || ticket.priority || 'P3',
                status: 'escalated',
                category: ticket.category || 'general',
                escalatedAt: ticket.escalatedAt || ticket.updatedAt,
                escalatedBy: ticket.escalatedBy?.name || 'System',
                escalatedTo: ticket.escalatedTo?.name || 'Supervisor',
                escalationReason: ticket.escalationReason || 'SLA breach or complexity',
                originalAssignee: ticket.assignedTo?.name || 'Unassigned',
                tenantName: ticket.tenantName || 'Unknown Tenant',
                customerName: ticket.createdBy?.name || 'Unknown Customer',
                businessImpact: ticket.businessImpact || 'medium',
                slaTimer: ticket.slaDeadline ? `${Math.ceil((new Date(ticket.slaDeadline).getTime() - Date.now()) / (1000 * 60 * 60))}h remaining` : 'No SLA',
                responseCount: ticket.messages?.length || 0,
                lastUpdate: ticket.updatedAt,
                escalationLevel: ticket.escalationLevel || 'L1'
              }))
            
            setTickets(transformedTickets)
            
            // Calculate escalation stats
            const totalEscalated = transformedTickets.length
            const pendingReview = transformedTickets.filter((t: any) => t.status === 'escalated').length
            const criticalEscalations = transformedTickets.filter((t: any) => ['P0', 'P1'].includes(t.priority)).length
            const todayResolved = transformedTickets.filter((t: any) => {
              const today = new Date().toDateString()
              return t.status === 'resolved' && new Date(t.lastUpdate).toDateString() === today
            }).length
            
            setStats({
              totalEscalated,
              pendingReview,
              beingHandled: Math.max(0, totalEscalated - pendingReview),
              avgEscalationTime: '4.2h',
              criticalEscalations,
              resolvedToday: todayResolved,
              escalationRate: 12, // Percentage
              slaBreaches: transformedTickets.filter((t: any) => t.slaTimer?.includes('overdue')).length
            })
          }
        }
      } catch (error) {
        console.error('Failed to load escalated tickets:', error)
      }

      setLoading(false)
    } catch (error) {
      console.error('Error loading escalated tickets:', error)
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

  const getEscalationLevelColor = (level: string) => {
    switch (level) {
      case 'L1': return 'bg-blue-100 text-blue-700'
      case 'L2': return 'bg-yellow-100 text-yellow-700'
      case 'L3': return 'bg-orange-100 text-orange-700'
      case 'L4': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getBusinessImpactColor = (impact: string) => {
    switch (impact) {
      case 'critical': return 'bg-red-100 text-red-700'
      case 'high': return 'bg-orange-100 text-orange-700'
      case 'medium': return 'bg-yellow-100 text-yellow-700'
      case 'low': return 'bg-green-100 text-green-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.escalationReason.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter
    const matchesLevel = escalationLevelFilter === 'all' || ticket.escalationLevel === escalationLevelFilter
    
    return matchesSearch && matchesStatus && matchesPriority && matchesLevel
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
          <h1 className="text-3xl font-bold text-gray-900">Escalated Tickets</h1>
          <p className="text-gray-600 mt-1">High-priority tickets requiring supervisor attention</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1 px-3 py-2 bg-red-100 text-red-700 rounded-lg">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm font-medium">Critical Alert</span>
          </div>
          <div className="flex items-center space-x-1 px-3 py-2 bg-orange-100 text-orange-700 rounded-lg">
            <Timer className="w-4 h-4" />
            <span className="text-sm font-medium">{stats.slaBreaches} SLA Breaches</span>
          </div>
        </div>
      </div>

      {/* Escalation Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm">Total Escalated</p>
              <p className="text-3xl font-bold">{stats.totalEscalated}</p>
              <p className="text-red-100 text-xs">Needs attention</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Pending Review</p>
              <p className="text-3xl font-bold">{stats.pendingReview}</p>
              <p className="text-orange-100 text-xs">Awaiting action</p>
            </div>
            <Clock className="w-8 h-8 text-orange-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm">Critical Level</p>
              <p className="text-3xl font-bold">{stats.criticalEscalations}</p>
              <p className="text-yellow-100 text-xs">P0/P1 tickets</p>
            </div>
            <Zap className="w-8 h-8 text-yellow-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Escalation Rate</p>
              <p className="text-3xl font-bold">{stats.escalationRate}%</p>
              <p className="text-blue-100 text-xs">Of all tickets</p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-200" />
          </div>
        </div>
      </div>

      {/* Escalation Performance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Avg Escalation Time</p>
              <p className="text-2xl font-bold text-gray-900">{stats.avgEscalationTime}</p>
              <p className="text-orange-600 text-xs">↑ 30min from last week</p>
            </div>
            <Timer className="w-8 h-8 text-orange-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Resolved Today</p>
              <p className="text-2xl font-bold text-gray-900">{stats.resolvedToday}</p>
              <p className="text-green-600 text-xs">Good progress</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Being Handled</p>
              <p className="text-2xl font-bold text-gray-900">{stats.beingHandled}</p>
              <p className="text-blue-600 text-xs">In progress</p>
            </div>
            <Activity className="w-8 h-8 text-blue-500" />
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
                placeholder="Search escalated tickets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={escalationLevelFilter}
              onChange={(e) => setEscalationLevelFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Levels</option>
              <option value="L1">L1 - Supervisor</option>
              <option value="L2">L2 - Manager</option>
              <option value="L3">L3 - Director</option>
              <option value="L4">L4 - Executive</option>
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

      {/* Escalated Tickets List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Escalated Tickets ({filteredTickets.length})
            </h2>
            <button 
              onClick={loadEscalatedTickets}
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
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getEscalationLevelColor(ticket.escalationLevel)}`}>
                        {ticket.escalationLevel}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getBusinessImpactColor(ticket.businessImpact)}`}>
                        {ticket.businessImpact} impact
                      </span>
                      <span className="flex items-center space-x-1 px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full">
                        <ArrowUpRight className="w-3 h-3" />
                        <span>ESCALATED</span>
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-medium text-gray-900 mb-2">{ticket.title}</h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{ticket.description}</p>
                    
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-3">
                      <div className="flex items-start space-x-2">
                        <AlertTriangle className="w-4 h-4 text-orange-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-orange-900">Escalation Reason</p>
                          <p className="text-sm text-orange-700">{ticket.escalationReason}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs text-gray-500 mb-3">
                      <div>
                        <p className="font-medium text-gray-700">Escalated By</p>
                        <p>{ticket.escalatedBy}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-700">Escalated To</p>
                        <p>{ticket.escalatedTo}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-700">Original Assignee</p>
                        <p>{ticket.originalAssignee}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-700">Escalated At</p>
                        <p>{new Date(ticket.escalatedAt).toLocaleString()}</p>
                      </div>
                    </div>
                    
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
                        <Calendar className="w-3 h-3" />
                        <span>Updated: {new Date(ticket.lastUpdate).toLocaleDateString()}</span>
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                      <ArrowDown className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center">
              <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No escalated tickets</h3>
              <p className="text-gray-500">No tickets have been escalated at the moment</p>
            </div>
          )}
        </div>
      </div>

      {/* Escalation Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Escalation Management</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <ArrowDown className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">De-escalate</p>
                <p className="text-sm text-gray-500">Return to agent</p>
              </div>
            </div>
          </button>
          
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <ArrowUpRight className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Escalate Further</p>
                <p className="text-sm text-gray-500">Send to higher level</p>
              </div>
            </div>
          </button>
          
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Phone className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Emergency Call</p>
                <p className="text-sm text-gray-500">Direct customer contact</p>
              </div>
            </div>
          </button>
          
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FileText className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Escalation Report</p>
                <p className="text-sm text-gray-500">Generate summary</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}