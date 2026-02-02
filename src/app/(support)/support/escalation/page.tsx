'use client'

import { useState, useEffect } from 'react'
import { 
  ArrowUpRight,
  Clock,
  AlertTriangle,
  User,
  MessageSquare,
  CheckCircle,
  XCircle,
  Timer,
  Users,
  Phone,
  Mail,
  Calendar,
  Activity,
  RefreshCw
} from 'lucide-react'

interface EscalationRule {
  id: string
  name: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  triggerConditions: {
    timeThreshold: number // minutes
    ticketType: string[]
    customerTier: string[]
  }
  escalationPath: {
    level: number
    assignTo: string
    notifyUsers: string[]
    timeLimit: number // minutes
  }[]
  isActive: boolean
  createdAt: string
  lastTriggered?: string
}

interface EscalationEvent {
  id: string
  ticketId: string
  ticketTitle: string
  customerName: string
  customerEmail: string
  priority: string
  currentLevel: number
  maxLevel: number
  assignedTo: string
  escalatedAt: string
  resolvedAt?: string
  status: 'active' | 'resolved' | 'cancelled'
  escalationReason: string
  timeToResolve?: number
}

export default function EscalationMatrixPage() {
  const [loading, setLoading] = useState(true)
  const [rules, setRules] = useState<EscalationRule[]>([])
  const [events, setEvents] = useState<EscalationEvent[]>([])
  const [activeTab, setActiveTab] = useState<'rules' | 'events'>('events')
  const [stats, setStats] = useState({
    activeEscalations: 0,
    resolvedToday: 0,
    avgResolutionTime: '0m',
    criticalEscalations: 0
  })

  useEffect(() => {
    loadEscalationData()
  }, [])

  const loadEscalationData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('auth-storage')
      if (!token) return

      const parsed = JSON.parse(token)
      const authToken = parsed.state?.token
      if (!authToken) return

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://laundrylobby-backend-1.vercel.app/api'
      
      // Load escalation data
      const response = await fetch(`${API_URL}/support/escalation`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        console.log('🚨 Escalation data:', data)
        
        if (data.success) {
          // Use real data if available
          setRules(data.data.rules || [])
          setEvents(data.data.events || [])
          setStats(data.data.stats || stats)
        }
      } else {
        console.error('Failed to load escalation data:', response.status)
        setMockData()
      }
    } catch (error) {
      console.error('Error loading escalation data:', error)
      setMockData()
    } finally {
      setLoading(false)
    }
  }

  const setMockData = () => {
    const mockRules: EscalationRule[] = [
      {
        id: '1',
        name: 'Critical Payment Issues',
        priority: 'critical',
        triggerConditions: {
          timeThreshold: 15,
          ticketType: ['payment_failure', 'refund_issue'],
          customerTier: ['premium', 'enterprise']
        },
        escalationPath: [
          {
            level: 1,
            assignTo: 'Senior Support',
            notifyUsers: ['support-lead@laundrylobby.com'],
            timeLimit: 30
          },
          {
            level: 2,
            assignTo: 'Support Manager',
            notifyUsers: ['support-manager@laundrylobby.com'],
            timeLimit: 60
          }
        ],
        isActive: true,
        createdAt: '2026-01-20T10:00:00Z',
        lastTriggered: '2026-01-27T14:30:00Z'
      },
      {
        id: '2',
        name: 'Service Outage Reports',
        priority: 'high',
        triggerConditions: {
          timeThreshold: 5,
          ticketType: ['service_outage', 'system_down'],
          customerTier: ['all']
        },
        escalationPath: [
          {
            level: 1,
            assignTo: 'Technical Team',
            notifyUsers: ['tech-lead@laundrylobby.com'],
            timeLimit: 15
          },
          {
            level: 2,
            assignTo: 'Engineering Manager',
            notifyUsers: ['eng-manager@laundrylobby.com'],
            timeLimit: 30
          }
        ],
        isActive: true,
        createdAt: '2026-01-15T09:00:00Z'
      }
    ]

    const mockEvents: EscalationEvent[] = [
      {
        id: '1',
        ticketId: 'TKT-2026-001',
        ticketTitle: 'Payment gateway timeout causing order failures',
        customerName: 'CleanWash Laundry',
        customerEmail: 'admin@cleanwash.com',
        priority: 'critical',
        currentLevel: 2,
        maxLevel: 2,
        assignedTo: 'Support Manager',
        escalatedAt: '2026-01-27T14:30:00Z',
        status: 'active',
        escalationReason: 'No response for 30 minutes on critical payment issue',
        timeToResolve: 45
      },
      {
        id: '2',
        ticketId: 'TKT-2026-002',
        ticketTitle: 'Mobile app login issues affecting multiple users',
        customerName: 'QuickClean Services',
        customerEmail: 'support@quickclean.in',
        priority: 'high',
        currentLevel: 1,
        maxLevel: 2,
        assignedTo: 'Senior Support',
        escalatedAt: '2026-01-27T13:15:00Z',
        resolvedAt: '2026-01-27T14:00:00Z',
        status: 'resolved',
        escalationReason: 'Multiple customer complaints received',
        timeToResolve: 45
      }
    ]

    setRules(mockRules)
    setEvents(mockEvents)
    setStats({
      activeEscalations: mockEvents.filter(e => e.status === 'active').length,
      resolvedToday: mockEvents.filter(e => e.status === 'resolved').length,
      avgResolutionTime: '42m',
      criticalEscalations: mockEvents.filter(e => e.priority === 'critical' && e.status === 'active').length
    })
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-700'
      case 'high': return 'bg-orange-100 text-orange-700'
      case 'medium': return 'bg-yellow-100 text-yellow-700'
      case 'low': return 'bg-green-100 text-green-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-red-100 text-red-700'
      case 'resolved': return 'bg-green-100 text-green-700'
      case 'cancelled': return 'bg-gray-100 text-gray-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

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
          <h1 className="text-3xl font-bold text-gray-900">Escalation Matrix</h1>
          <p className="text-gray-600 mt-1">
            Manage support ticket escalation rules and monitor active escalations
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button 
            onClick={loadEscalationData}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm">Active Escalations</p>
              <p className="text-3xl font-bold">{stats.activeEscalations}</p>
              <p className="text-red-100 text-xs">Requiring attention</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Resolved Today</p>
              <p className="text-3xl font-bold">{stats.resolvedToday}</p>
              <p className="text-green-100 text-xs">Successfully handled</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Avg Resolution</p>
              <p className="text-3xl font-bold">{stats.avgResolutionTime}</p>
              <p className="text-blue-100 text-xs">Time to resolve</p>
            </div>
            <Timer className="w-8 h-8 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Critical Issues</p>
              <p className="text-3xl font-bold">{stats.criticalEscalations}</p>
              <p className="text-purple-100 text-xs">High priority</p>
            </div>
            <ArrowUpRight className="w-8 h-8 text-purple-200" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('events')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'events'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Active Escalations ({events.filter(e => e.status === 'active').length})
            </button>
            <button
              onClick={() => setActiveTab('rules')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'rules'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Escalation Rules ({rules.length})
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'events' ? (
            <div className="space-y-4">
              {Array.isArray(events) && events.length > 0 ? (
                events.map((event) => (
                  <div key={event.id} className="border border-gray-200 rounded-lg p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="text-sm font-mono text-blue-600">{event.ticketId || 'Unknown'}</span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(event.priority || 'medium')}`}>
                            {(event.priority || 'medium').toUpperCase()}
                          </span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(event.status || 'active')}`}>
                            {(event.status || 'active').toUpperCase()}
                          </span>
                          <span className="px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded-full">
                            Level {event.currentLevel || 1}/{event.maxLevel || 1}
                          </span>
                        </div>
                        
                        <h3 className="text-lg font-medium text-gray-900 mb-2">{event.ticketTitle || 'Untitled Ticket'}</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                          <div>
                            <p className="text-sm text-gray-500">Customer</p>
                            <p className="font-medium text-gray-900">{event.customerName || 'Unknown Customer'}</p>
                            <p className="text-xs text-gray-500">{event.customerEmail || 'No email'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Assigned To</p>
                            <p className="font-medium text-gray-900">{event.assignedTo || 'Unassigned'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Escalated</p>
                            <p className="font-medium text-gray-900">{event.escalatedAt ? new Date(event.escalatedAt).toLocaleString() : 'Unknown'}</p>
                            {event.resolvedAt && (
                              <p className="text-xs text-green-600">Resolved: {new Date(event.resolvedAt).toLocaleString()}</p>
                            )}
                          </div>
                        </div>
                        
                        <div className="mb-3">
                          <p className="text-sm text-gray-500">Escalation Reason</p>
                          <p className="text-sm text-gray-900">{event.escalationReason || 'No reason provided'}</p>
                        </div>
                        
                        {event.timeToResolve && (
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <Timer className="w-4 h-4" />
                            <span>Time to resolve: {event.timeToResolve} minutes</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {event.status === 'active' && (
                          <button className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors">
                            View Ticket
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <ArrowUpRight className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No active escalations</h3>
                  <p className="text-gray-500">All tickets are being handled within normal timeframes</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {Array.isArray(rules) && rules.length > 0 ? (
                rules.map((rule) => (
                  <div key={rule.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-medium text-gray-900">{rule.name || 'Unnamed Rule'}</h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(rule.priority || 'medium')}`}>
                            {(rule.priority || 'medium').toUpperCase()}
                          </span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${rule.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                            {rule.isActive ? 'ACTIVE' : 'INACTIVE'}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500">Trigger Conditions</p>
                            <p className="text-sm text-gray-900">Time threshold: {rule.triggerConditions?.timeThreshold || 0} minutes</p>
                            <p className="text-sm text-gray-900">Ticket types: {rule.triggerConditions?.ticketType?.join(', ') || 'None'}</p>
                            <p className="text-sm text-gray-900">Customer tiers: {rule.triggerConditions?.customerTier?.join(', ') || 'All'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Escalation Path</p>
                            {rule.escalationPath?.map((path, index) => (
                              <p key={index} className="text-sm text-gray-900">
                                Level {path.level || index + 1}: {path.assignTo || 'Unassigned'} ({path.timeLimit || 30}m)
                              </p>
                            )) || <p className="text-sm text-gray-500">No escalation path defined</p>}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-6 text-xs text-gray-500 mt-3">
                          <span className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>Created: {rule.createdAt ? new Date(rule.createdAt).toLocaleDateString() : 'Unknown'}</span>
                          </span>
                          {rule.lastTriggered && (
                            <span className="flex items-center space-x-1">
                              <Activity className="w-3 h-3" />
                              <span>Last triggered: {new Date(rule.lastTriggered).toLocaleString()}</span>
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors">
                          Edit Rule
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <ArrowUpRight className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No escalation rules configured</h3>
                  <p className="text-gray-500">Create escalation rules to automatically handle urgent tickets</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}