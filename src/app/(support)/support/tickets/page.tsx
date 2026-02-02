'use client'

import { useState, useEffect } from 'react'
import { useSuperAdmin } from '@/store/authStore'
import { 
  MessageSquare, 
  Search, 
  Filter, 
  Plus,
  Eye,
  UserCheck,
  Mail,
  MapPin,
  Clock,
  ArrowUpRight,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Pause
} from 'lucide-react'

interface Ticket {
  id: string
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
  category: 'payment' | 'order' | 'account' | 'system' | 'general'
  source: 'customer-app' | 'tenant-admin' | 'staff-panel' | 'email' | 'system-alert'
  slaTimer: string
  createdAt: string
  updatedAt: string
  assignedTo?: string
  escalatedTo?: string
  tenantId?: string
  tenantName?: string
}

export default function TicketsPage() {
  const admin = useSuperAdmin()
  const [loading, setLoading] = useState(true)
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')

  useEffect(() => {
    loadTickets()
  }, [])

  const loadTickets = async () => {
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

      const response = await fetch(`${API_URL}/support/tickets`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setTickets(data.data)
        }
      }
      
      setLoading(false)
    } catch (error) {
      console.error('Error loading tickets:', error)
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
    const matchesSearch = ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (ticket.user?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (ticket.user?.email || '').toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter
    
    return matchesSearch && matchesStatus && matchesPriority
  })

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-64 animate-pulse"></div>
        <div className="grid grid-cols-1 gap-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
              <div className="space-y-3">
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
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
          <h1 className="text-3xl font-bold text-gray-900">Ticket Management</h1>
          <p className="text-gray-600 mt-1">
            Manage and track all support tickets across the platform
          </p>
        </div>
        
        <button 
          onClick={() => window.location.href = '/support/tickets/create'}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Create Ticket</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search tickets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="new">New</option>
              <option value="in-review">In Review</option>
              <option value="in-progress">In Progress</option>
              <option value="waiting">Waiting</option>
              <option value="escalated">Escalated</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
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
          
          <div className="text-sm text-gray-500">
            Showing {filteredTickets.length} of {tickets.length} tickets
          </div>
        </div>
      </div>

      {/* Ticket Lifecycle Status */}
      <div className="grid grid-cols-7 gap-4">
        {['new', 'in-review', 'in-progress', 'waiting', 'escalated', 'resolved', 'closed'].map((status) => (
          <div key={status} className="bg-white rounded-lg border border-gray-200 p-4 text-center">
            <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${getStatusColor(status).split(' ')[0]}`}></div>
            <p className="text-sm font-medium text-gray-900 capitalize">{status.replace('-', ' ')}</p>
            <p className="text-xs text-gray-500">
              {tickets.filter(t => t.status === status).length} tickets
            </p>
          </div>
        ))}
      </div>

      {/* Tickets List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {filteredTickets.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {filteredTickets.map((ticket) => (
              <div key={ticket.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-sm font-medium text-gray-900">{ticket.id}</span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(ticket.status)}`}>
                        {(ticket.status || 'unknown').replace('-', ' ')}
                      </span>
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                        {ticket.category}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-medium text-gray-900 mb-2">{ticket.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">{ticket.description}</p>
                    
                    <div className="flex items-center space-x-6 text-xs text-gray-500">
                      <span className="flex items-center space-x-1">
                        <UserCheck className="w-3 h-3" />
                        <span>{ticket.user?.name || 'Unknown User'} ({ticket.user?.role || 'Unknown Role'})</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Mail className="w-3 h-3" />
                        <span>{ticket.user?.email || 'No email'}</span>
                      </span>
                      {ticket.tenantName && (
                        <span className="flex items-center space-x-1">
                          <MapPin className="w-3 h-3" />
                          <span>{ticket.tenantName}</span>
                        </span>
                      )}
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>SLA: {ticket.slaTimer}</span>
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <UserCheck className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors">
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tickets found</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all' 
                ? 'Try adjusting your filters to see more tickets.'
                : 'No support tickets have been created yet.'
              }
            </p>
            <button 
              onClick={() => window.location.href = '/support/tickets/create'}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create First Ticket
            </button>
          </div>
        )}
      </div>
    </div>
  )
}