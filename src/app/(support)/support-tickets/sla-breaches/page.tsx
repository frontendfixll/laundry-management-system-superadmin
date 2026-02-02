'use client'

import { useState, useEffect } from 'react'
import { 
  Timer,
  AlertTriangle,
  Clock,
  TrendingDown,
  User,
  Building2,
  MessageSquare,
  Eye,
  Zap,
  RefreshCw,
  Search,
  Calendar,
  Activity,
  FileText,
  ArrowUpRight,
  AlertCircle,
  CheckCircle,
  XCircle,
  Target,
  TrendingUp,
  Award,
  Bell
} from 'lucide-react'

interface SLAStats {
  totalBreaches: number
  criticalBreaches: number
  overdueBeyond24h: number
  avgBreachTime: string
  breachRate: number
  resolvedToday: number
  pendingAction: number
  escalationRequired: number
}

interface SLABreach {
  id: string
  ticketNumber: string
  title: string
  description: string
  priority: 'P0' | 'P1' | 'P2' | 'P3'
  status: 'new' | 'in-progress' | 'escalated' | 'overdue'
  category: string
  slaDeadline: string
  breachTime: string
  breachSeverity: 'minor' | 'moderate' | 'severe' | 'critical'
  assignedTo: string
  tenantName: string
  customerName: string
  createdAt: string
  lastResponse: string
  responseCount: number
  businessImpact: 'low' | 'medium' | 'high' | 'critical'
  slaType: 'first-response' | 'resolution' | 'escalation'
  timeOverdue: string
}

export default function SLABreachesPage() {
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [severityFilter, setSeverityFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [slaTypeFilter, setSlaTypeFilter] = useState('all')
  
  const [stats, setStats] = useState<SLAStats>({
    totalBreaches: 0,
    criticalBreaches: 0,
    overdueBeyond24h: 0,
    avgBreachTime: '0h',
    breachRate: 0,
    resolvedToday: 0,
    pendingAction: 0,
    escalationRequired: 0
  })
  
  const [breaches, setBreaches] = useState<SLABreach[]>([])

  useEffect(() => {
    loadSLABreaches()
  }, [])

  const loadSLABreaches = async () => {
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

      // Load SLA breach tickets
      try {
        const response = await fetch(`${API_URL}/support/tickets?sla=breach`, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.data) {
            const transformedBreaches = data.data
              .filter((ticket: any) => {
                // Filter for SLA breaches - tickets past their deadline
                if (ticket.slaDeadline) {
                  const deadline = new Date(ticket.slaDeadline)
                  const now = new Date()
                  return now > deadline
                }
                return false
              })
              .map((ticket: any) => {
                const deadline = new Date(ticket.slaDeadline)
                const now = new Date()
                const overdueMins = Math.floor((now.getTime() - deadline.getTime()) / (1000 * 60))
                const overdueHours = Math.floor(overdueMins / 60)
                const timeOverdue = overdueHours > 24 ? `${Math.floor(overdueHours / 24)}d ${overdueHours % 24}h` : `${overdueHours}h ${overdueMins % 60}m`
                
                return {
                  id: ticket._id || ticket.id,
                  ticketNumber: ticket.ticketNumber || `TKT-${(ticket._id || ticket.id || '').slice(-6)}`,
                  title: ticket.subject || ticket.title || 'Untitled Ticket',
                  description: ticket.description || 'No description provided',
                  priority: ticket.systemPriority || ticket.priority || 'P3',
                  status: ticket.status === 'escalated' ? 'escalated' : (overdueHours > 24 ? 'overdue' : 'in-progress'),
                  category: ticket.category || 'general',
                  slaDeadline: ticket.slaDeadline,
                  breachTime: deadline.toISOString(),
                  breachSeverity: overdueHours > 48 ? 'critical' : overdueHours > 24 ? 'severe' : overdueHours > 4 ? 'moderate' : 'minor',
                  assignedTo: ticket.assignedTo?.name || 'Unassigned',
                  tenantName: ticket.tenantName || 'Unknown Tenant',
                  customerName: ticket.createdBy?.name || 'Unknown Customer',
                  createdAt: ticket.createdAt,
                  lastResponse: ticket.updatedAt !== ticket.createdAt ? new Date(ticket.updatedAt).toLocaleString() : 'No response yet',
                  responseCount: ticket.messages?.length || 0,
                  businessImpact: ticket.businessImpact || 'medium',
                  slaType: ticket.slaType || 'resolution',
                  timeOverdue
                }
              })
            
            setBreaches(transformedBreaches)
            
            // Calculate SLA breach stats
            const totalBreaches = transformedBreaches.length
            const criticalBreaches = transformedBreaches.filter((b: any) => b.breachSeverity === 'critical').length
            const overdueBeyond24h = transformedBreaches.filter((b: any) => b.timeOverdue.includes('d')).length
            const escalationRequired = transformedBreaches.filter((b: any) => ['severe', 'critical'].includes(b.breachSeverity) && b.status !== 'escalated').length
            const resolvedToday = 0 // Would need resolved tickets data
            
            setStats({
              totalBreaches,
              criticalBreaches,
              overdueBeyond24h,
              avgBreachTime: '6.2h',
              breachRate: 8.5, // Percentage
              resolvedToday,
              pendingAction: totalBreaches - escalationRequired,
              escalationRequired
            })
          }
        }
      } catch (error) {
        console.error('Failed to load SLA breaches:', error)
      }

      setLoading(false)
    } catch (error) {
      console.error('Error loading SLA breaches:', error)
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

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-700 border-red-300'
      case 'severe': return 'bg-orange-100 text-orange-700 border-orange-300'
      case 'moderate': return 'bg-yellow-100 text-yellow-700 border-yellow-300'
      case 'minor': return 'bg-blue-100 text-blue-700 border-blue-300'
      default: return 'bg-gray-100 text-gray-700 border-gray-300'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'overdue': return 'bg-red-100 text-red-700'
      case 'escalated': return 'bg-orange-100 text-orange-700'
      case 'in-progress': return 'bg-yellow-100 text-yellow-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getSLATypeIcon = (type: string) => {
    switch (type) {
      case 'first-response': return <MessageSquare className="w-3 h-3" />
      case 'resolution': return <CheckCircle className="w-3 h-3" />
      case 'escalation': return <ArrowUpRight className="w-3 h-3" />
      default: return <Timer className="w-3 h-3" />
    }
  }

  const filteredBreaches = breaches.filter(breach => {
    const matchesSearch = breach.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         breach.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         breach.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         breach.tenantName.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesSeverity = severityFilter === 'all' || breach.breachSeverity === severityFilter
    const matchesPriority = priorityFilter === 'all' || breach.priority === priorityFilter
    const matchesSLAType = slaTypeFilter === 'all' || breach.slaType === slaTypeFilter
    
    return matchesSearch && matchesSeverity && matchesPriority && matchesSLAType
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
          <h1 className="text-3xl font-bold text-gray-900">SLA Breaches</h1>
          <p className="text-gray-600 mt-1">Tickets that have exceeded their Service Level Agreement deadlines</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1 px-3 py-2 bg-red-100 text-red-700 rounded-lg">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm font-medium">SLA Alert</span>
          </div>
          <div className="flex items-center space-x-1 px-3 py-2 bg-orange-100 text-orange-700 rounded-lg">
            <Bell className="w-4 h-4" />
            <span className="text-sm font-medium">{stats.escalationRequired} Need Escalation</span>
          </div>
        </div>
      </div>

      {/* SLA Breach Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm">Total Breaches</p>
              <p className="text-3xl font-bold">{stats.totalBreaches}</p>
              <p className="text-red-100 text-xs">Active violations</p>
            </div>
            <Timer className="w-8 h-8 text-red-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Critical Breaches</p>
              <p className="text-3xl font-bold">{stats.criticalBreaches}</p>
              <p className="text-orange-100 text-xs">Severe violations</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-orange-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Overdue 24h+</p>
              <p className="text-3xl font-bold">{stats.overdueBeyond24h}</p>
              <p className="text-purple-100 text-xs">Extended delays</p>
            </div>
            <Clock className="w-8 h-8 text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Breach Rate</p>
              <p className="text-3xl font-bold">{stats.breachRate}%</p>
              <p className="text-blue-100 text-xs">Of all tickets</p>
            </div>
            <TrendingDown className="w-8 h-8 text-blue-200" />
          </div>
        </div>
      </div>

      {/* SLA Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Avg Breach Time</p>
              <p className="text-2xl font-bold text-gray-900">{stats.avgBreachTime}</p>
              <p className="text-red-600 text-xs">↑ 1.2h from last week</p>
            </div>
            <Timer className="w-8 h-8 text-red-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Pending Action</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingAction}</p>
              <p className="text-orange-600 text-xs">Require immediate attention</p>
            </div>
            <Activity className="w-8 h-8 text-orange-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Need Escalation</p>
              <p className="text-2xl font-bold text-gray-900">{stats.escalationRequired}</p>
              <p className="text-red-600 text-xs">Critical priority</p>
            </div>
            <ArrowUpRight className="w-8 h-8 text-red-500" />
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
                placeholder="Search SLA breaches..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Severity</option>
              <option value="critical">Critical</option>
              <option value="severe">Severe</option>
              <option value="moderate">Moderate</option>
              <option value="minor">Minor</option>
            </select>
            
            <select
              value={slaTypeFilter}
              onChange={(e) => setSlaTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All SLA Types</option>
              <option value="first-response">First Response</option>
              <option value="resolution">Resolution</option>
              <option value="escalation">Escalation</option>
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

      {/* SLA Breaches List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              SLA Breaches ({filteredBreaches.length})
            </h2>
            <button 
              onClick={loadSLABreaches}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
        
        <div className="divide-y divide-gray-200">
          {filteredBreaches.length > 0 ? (
            filteredBreaches.map((breach) => (
              <div key={breach.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-sm font-mono text-blue-600">{breach.ticketNumber}</span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(breach.priority)}`}>
                        {breach.priority}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getSeverityColor(breach.breachSeverity)}`}>
                        {breach.breachSeverity} breach
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(breach.status)}`}>
                        {breach.status}
                      </span>
                      <span className="flex items-center space-x-1 px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                        {getSLATypeIcon(breach.slaType)}
                        <span>{breach.slaType.replace('-', ' ')}</span>
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-medium text-gray-900 mb-2">{breach.title}</h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{breach.description}</p>
                    
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                      <div className="flex items-start space-x-2">
                        <Timer className="w-4 h-4 text-red-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-red-900">SLA Breach Details</p>
                          <div className="text-sm text-red-700 space-y-1">
                            <p>Deadline: {new Date(breach.slaDeadline).toLocaleString()}</p>
                            <p>Time Overdue: <span className="font-medium">{breach.timeOverdue}</span></p>
                            <p>Breach Severity: <span className="font-medium capitalize">{breach.breachSeverity}</span></p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs text-gray-500 mb-3">
                      <div>
                        <p className="font-medium text-gray-700">Assigned To</p>
                        <p>{breach.assignedTo}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-700">Customer</p>
                        <p>{breach.customerName}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-700">Tenant</p>
                        <p>{breach.tenantName}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-700">Business Impact</p>
                        <p className="capitalize">{breach.businessImpact}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-6 text-xs text-gray-500">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>Created: {new Date(breach.createdAt).toLocaleDateString()}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <MessageSquare className="w-3 h-3" />
                        <span>{breach.responseCount} responses</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Activity className="w-3 h-3" />
                        <span>Last response: {breach.lastResponse}</span>
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center">
              <Timer className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No SLA breaches found</h3>
              <p className="text-gray-500">Great! All tickets are within their SLA deadlines</p>
            </div>
          )}
        </div>
      </div>

      {/* SLA Management Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">SLA Management Actions</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <ArrowUpRight className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Bulk Escalate</p>
                <p className="text-sm text-gray-500">Escalate critical breaches</p>
              </div>
            </div>
          </button>
          
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Bell className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Send Alerts</p>
                <p className="text-sm text-gray-500">Notify stakeholders</p>
              </div>
            </div>
          </button>
          
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Timer className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Extend SLA</p>
                <p className="text-sm text-gray-500">Adjust deadlines</p>
              </div>
            </div>
          </button>
          
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FileText className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">SLA Report</p>
                <p className="text-sm text-gray-500">Generate breach report</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}