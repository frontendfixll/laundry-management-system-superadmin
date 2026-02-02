'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { 
  ArrowUpRight,
  Search,
  Filter,
  Calendar,
  Download,
  AlertTriangle,
  Eye,
  Clock,
  User,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  Activity,
  CheckCircle,
  XCircle,
  Timer,
  Users,
  Target,
  Zap
} from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts'

interface SupportEscalation {
  _id: string
  escalationId: string
  ticketId: string
  ticketTitle: string
  originalAssignee: {
    id: string
    name: string
    email: string
    role: string
  }
  escalatedTo: {
    id: string
    name: string
    email: string
    role: string
    level: number
  }
  escalatedBy: {
    id: string
    name: string
    email: string
    role: string
  }
  escalationReason: 'sla_breach' | 'complexity' | 'customer_request' | 'technical_expertise' | 'management_decision' | 'policy_violation'
  escalationLevel: 1 | 2 | 3 | 4 | 5
  priority: 'low' | 'medium' | 'high' | 'critical' | 'urgent'
  status: 'pending' | 'acknowledged' | 'in_progress' | 'resolved' | 'closed' | 'rejected'
  customer: {
    id: string
    name: string
    email: string
    tenantId: string
    tenantName: string
  }
  timeline: {
    escalatedAt: Date
    acknowledgedAt?: Date
    resolvedAt?: Date
    closedAt?: Date
  }
  slaMetrics: {
    originalSlaTarget: number // hours
    escalationTime: number // hours from ticket creation
    resolutionTime?: number // hours from escalation
    breachSeverity: 'none' | 'minor' | 'major' | 'critical'
  }
  escalationDetails: {
    reason: string
    description: string
    urgencyJustification: string
    expectedResolution: string
    customerImpact: string
    businessImpact: string
  }
  resolutionDetails?: {
    resolution: string
    resolutionType: 'resolved' | 'workaround' | 'escalated_further' | 'closed_unresolved'
    satisfactionScore?: number
    followUpRequired: boolean
    lessonsLearned?: string
  }
  communications: {
    id: string
    timestamp: Date
    from: string
    to: string
    message: string
    type: 'internal' | 'customer' | 'escalation'
  }[]
  tags: string[]
  metadata: {
    createdAt: Date
    updatedAt: Date
    version: number
  }
}

export default function SupportEscalationsPage() {
  const [escalations, setEscalations] = useState<SupportEscalation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedReason, setSelectedReason] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedLevel, setSelectedLevel] = useState('all')
  const [dateRange, setDateRange] = useState('30d')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [stats, setStats] = useState({
    totalEscalations: 0,
    activeEscalations: 0,
    avgResolutionTime: 0,
    escalationRate: 0,
    slaBreaches: 0,
    customerSatisfaction: 0
  })

  useEffect(() => {
    fetchEscalations()
  }, [page, selectedReason, selectedStatus, selectedLevel, dateRange, searchQuery])

  const fetchEscalations = async () => {
    try {
      setLoading(true)
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(selectedReason !== 'all' && { reason: selectedReason }),
        ...(selectedStatus !== 'all' && { status: selectedStatus }),
        ...(selectedLevel !== 'all' && { level: selectedLevel }),
        ...(searchQuery && { search: searchQuery }),
        range: dateRange
      })

      const response = await fetch(`/api/superadmin/audit/support/escalations?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth-storage') ? JSON.parse(localStorage.getItem('auth-storage')).state?.token : ''}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch escalations')
      }
      
      const data = await response.json()
      
      if (data.success) {
        setEscalations(data.data.escalations)
        setStats(data.data.stats)
        setTotalPages(data.data.pagination.pages)
      } else {
        throw new Error(data.message || 'Failed to fetch escalations')
      }
      
    } catch (error) {
      console.error('Error fetching escalations:', error)
      // Fallback to mock data
      const mockEscalations: SupportEscalation[] = [
        {
          _id: '1',
          escalationId: 'ESC-2024-001',
          ticketId: 'TKT-2024-1234',
          ticketTitle: 'Payment Gateway Integration Issue - Critical Production Bug',
          originalAssignee: {
            id: 'support1',
            name: 'Sarah Johnson',
            email: 'sarah@laundrylobby.com',
            role: 'Support Agent L1'
          },
          escalatedTo: {
            id: 'support2',
            name: 'Michael Chen',
            email: 'michael@laundrylobby.com',
            role: 'Senior Support Engineer',
            level: 2
          },
          escalatedBy: {
            id: 'support1',
            name: 'Sarah Johnson',
            email: 'sarah@laundrylobby.com',
            role: 'Support Agent L1'
          },
          escalationReason: 'technical_expertise',
          escalationLevel: 2,
          priority: 'critical',
          status: 'in_progress',
          customer: {
            id: 'cust1',
            name: 'QuickWash Laundromat',
            email: 'admin@quickwash.com',
            tenantId: 'tenant1',
            tenantName: 'QuickWash'
          },
          timeline: {
            escalatedAt: new Date(2024, 0, 15, 14, 30),
            acknowledgedAt: new Date(2024, 0, 15, 14, 45),
          },
          slaMetrics: {
            originalSlaTarget: 4,
            escalationTime: 2.5,
            breachSeverity: 'major'
          },
          escalationDetails: {
            reason: 'Technical Expertise Required',
            description: 'Customer experiencing payment gateway failures affecting 80% of transactions. L1 support unable to diagnose root cause.',
            urgencyJustification: 'Critical business impact - customer losing revenue due to failed payments',
            expectedResolution: 'Identify and fix payment gateway integration issue within 2 hours',
            customerImpact: 'High - 80% payment failure rate causing significant revenue loss',
            businessImpact: 'Medium - Potential customer churn and reputation damage'
          },
          communications: [
            {
              id: 'comm1',
              timestamp: new Date(2024, 0, 15, 14, 30),
              from: 'Sarah Johnson',
              to: 'Michael Chen',
              message: 'Escalating due to technical complexity. Customer reports 80% payment failures.',
              type: 'escalation'
            },
            {
              id: 'comm2',
              timestamp: new Date(2024, 0, 15, 14, 45),
              from: 'Michael Chen',
              to: 'Sarah Johnson',
              message: 'Acknowledged. Investigating payment gateway logs now.',
              type: 'internal'
            }
          ],
          tags: ['payment', 'gateway', 'critical', 'production'],
          metadata: {
            createdAt: new Date(2024, 0, 15, 14, 30),
            updatedAt: new Date(2024, 0, 15, 15, 15),
            version: 1
          }
        },
        {
          _id: '2',
          escalationId: 'ESC-2024-002',
          ticketId: 'TKT-2024-1235',
          ticketTitle: 'Customer Data Privacy Concern - GDPR Compliance',
          originalAssignee: {
            id: 'support3',
            name: 'Emma Wilson',
            email: 'emma@laundrylobby.com',
            role: 'Support Agent L1'
          },
          escalatedTo: {
            id: 'legal1',
            name: 'David Rodriguez',
            email: 'david@laundrylobby.com',
            role: 'Legal & Compliance Manager',
            level: 3
          },
          escalatedBy: {
            id: 'support3',
            name: 'Emma Wilson',
            email: 'emma@laundrylobby.com',
            role: 'Support Agent L1'
          },
          escalationReason: 'policy_violation',
          escalationLevel: 3,
          priority: 'high',
          status: 'resolved',
          customer: {
            id: 'cust2',
            name: 'CleanCo Services',
            email: 'privacy@cleanco.com',
            tenantId: 'tenant2',
            tenantName: 'CleanCo'
          },
          timeline: {
            escalatedAt: new Date(2024, 0, 14, 10, 15),
            acknowledgedAt: new Date(2024, 0, 14, 10, 30),
            resolvedAt: new Date(2024, 0, 14, 16, 45)
          },
          slaMetrics: {
            originalSlaTarget: 24,
            escalationTime: 1.5,
            resolutionTime: 6.5,
            breachSeverity: 'none'
          },
          escalationDetails: {
            reason: 'GDPR Compliance Issue',
            description: 'Customer requesting data deletion under GDPR Article 17 (Right to Erasure). Complex case involving multiple data systems.',
            urgencyJustification: 'Legal compliance requirement with potential regulatory implications',
            expectedResolution: 'Complete data erasure within GDPR 30-day timeframe',
            customerImpact: 'Medium - Customer exercising legal rights',
            businessImpact: 'High - Regulatory compliance and potential fines'
          },
          resolutionDetails: {
            resolution: 'Successfully processed GDPR data deletion request across all systems. Provided confirmation certificate to customer.',
            resolutionType: 'resolved',
            satisfactionScore: 5,
            followUpRequired: false,
            lessonsLearned: 'Need automated GDPR deletion workflow to reduce manual processing time'
          },
          communications: [
            {
              id: 'comm3',
              timestamp: new Date(2024, 0, 14, 10, 15),
              from: 'Emma Wilson',
              to: 'David Rodriguez',
              message: 'GDPR deletion request requires legal review and multi-system coordination.',
              type: 'escalation'
            },
            {
              id: 'comm4',
              timestamp: new Date(2024, 0, 14, 16, 45),
              from: 'David Rodriguez',
              to: 'Emma Wilson',
              message: 'Data deletion completed. Customer notified with confirmation certificate.',
              type: 'internal'
            }
          ],
          tags: ['gdpr', 'privacy', 'legal', 'compliance'],
          metadata: {
            createdAt: new Date(2024, 0, 14, 10, 15),
            updatedAt: new Date(2024, 0, 14, 16, 45),
            version: 2
          }
        }
      ]

      const mockStats = {
        totalEscalations: 0,
        activeEscalations: 23,
        avgResolutionTime: 4.2,
        escalationRate: 12.5,
        slaBreaches: 8,
        customerSatisfaction: 4.3
      }

      setEscalations(mockEscalations)
      setStats(mockStats)
      setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-700 bg-yellow-100'
      case 'acknowledged': return 'text-blue-700 bg-blue-100'
      case 'in_progress': return 'text-purple-700 bg-purple-100'
      case 'resolved': return 'text-green-700 bg-green-100'
      case 'closed': return 'text-gray-700 bg-gray-100'
      case 'rejected': return 'text-red-700 bg-red-100'
      default: return 'text-gray-700 bg-gray-100'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-700 bg-red-100 border-red-300'
      case 'critical': return 'text-red-700 bg-red-100'
      case 'high': return 'text-orange-700 bg-orange-100'
      case 'medium': return 'text-yellow-700 bg-yellow-100'
      case 'low': return 'text-green-700 bg-green-100'
      default: return 'text-gray-700 bg-gray-100'
    }
  }

  const getReasonColor = (reason: string) => {
    switch (reason) {
      case 'sla_breach': return 'text-red-700 bg-red-100'
      case 'complexity': return 'text-purple-700 bg-purple-100'
      case 'customer_request': return 'text-blue-700 bg-blue-100'
      case 'technical_expertise': return 'text-indigo-700 bg-indigo-100'
      case 'management_decision': return 'text-gray-700 bg-gray-100'
      case 'policy_violation': return 'text-orange-700 bg-orange-100'
      default: return 'text-gray-700 bg-gray-100'
    }
  }

  const getBreachSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-700 bg-red-100'
      case 'major': return 'text-orange-700 bg-orange-100'
      case 'minor': return 'text-yellow-700 bg-yellow-100'
      case 'none': return 'text-green-700 bg-green-100'
      default: return 'text-gray-700 bg-gray-100'
    }
  }

  const COLORS = ['#EF4444', '#F97316', '#EAB308', '#22C55E', '#3B82F6']

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center">
              <ArrowUpRight className="w-8 h-8 mr-3" />
              Support Escalation History
            </h1>
            <p className="text-orange-100 mt-2">
              Complete audit trail of support ticket escalations and resolution tracking
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-orange-100">Escalation Rate: {stats.escalationRate}%</p>
            <p className="text-xs text-orange-200">Resolution Tracking</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-sm p-4 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Total</p>
              <p className="text-xl font-bold text-blue-900 mt-1">{stats.totalEscalations}</p>
            </div>
            <ArrowUpRight className="w-5 h-5 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl shadow-sm p-4 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-orange-700 uppercase tracking-wide">Active</p>
              <p className="text-xl font-bold text-orange-900 mt-1">{stats.activeEscalations}</p>
            </div>
            <Activity className="w-5 h-5 text-orange-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-sm p-4 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-green-700 uppercase tracking-wide">Avg Time</p>
              <p className="text-xl font-bold text-green-900 mt-1">{stats.avgResolutionTime}h</p>
            </div>
            <Clock className="w-5 h-5 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-sm p-4 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide">Rate</p>
              <p className="text-xl font-bold text-purple-900 mt-1">{stats.escalationRate}%</p>
            </div>
            <TrendingUp className="w-5 h-5 text-purple-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl shadow-sm p-4 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-red-700 uppercase tracking-wide">SLA Breach</p>
              <p className="text-xl font-bold text-red-900 mt-1">{stats.slaBreaches}</p>
            </div>
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl shadow-sm p-4 border border-indigo-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wide">Satisfaction</p>
              <p className="text-xl font-bold text-indigo-900 mt-1">{stats.customerSatisfaction}/5</p>
            </div>
            <Target className="w-5 h-5 text-indigo-600" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Escalation Trends */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-orange-600" />
            Escalation Trends
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={[
                { month: 'Jan', escalations: 45, resolved: 42, sla_breach: 3 },
                { month: 'Feb', escalations: 38, resolved: 36, sla_breach: 2 },
                { month: 'Mar', escalations: 52, resolved: 48, sla_breach: 4 },
                { month: 'Apr', escalations: 41, resolved: 39, sla_breach: 2 },
                { month: 'May', escalations: 35, resolved: 34, sla_breach: 1 },
                { month: 'Jun', escalations: 47, resolved: 45, sla_breach: 2 }
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="escalations" stackId="1" stroke="#F97316" fill="#F97316" fillOpacity={0.6} />
                <Area type="monotone" dataKey="resolved" stackId="2" stroke="#22C55E" fill="#22C55E" fillOpacity={0.6} />
                <Area type="monotone" dataKey="sla_breach" stackId="3" stroke="#EF4444" fill="#EF4444" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Escalation Reasons */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <Target className="w-5 h-5 mr-2 text-purple-600" />
            Escalation Reasons
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Technical Expertise', value: 35, color: '#3B82F6' },
                    { name: 'SLA Breach', value: 25, color: '#EF4444' },
                    { name: 'Complexity', value: 20, color: '#8B5CF6' },
                    { name: 'Customer Request', value: 12, color: '#F59E0B' },
                    { name: 'Policy Violation', value: 8, color: '#10B981' }
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {COLORS.map((color, index) => (
                    <Cell key={`cell-${index}`} fill={color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
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
              placeholder="Search escalations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          
          <select
            value={selectedReason}
            onChange={(e) => setSelectedReason(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">All Reasons</option>
            <option value="sla_breach">SLA Breach</option>
            <option value="complexity">Complexity</option>
            <option value="customer_request">Customer Request</option>
            <option value="technical_expertise">Technical Expertise</option>
            <option value="management_decision">Management Decision</option>
            <option value="policy_violation">Policy Violation</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="acknowledged">Acknowledged</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
            <option value="rejected">Rejected</option>
          </select>

          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">All Levels</option>
            <option value="1">Level 1</option>
            <option value="2">Level 2</option>
            <option value="3">Level 3</option>
            <option value="4">Level 4</option>
            <option value="5">Level 5</option>
          </select>

          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last Year</option>
          </select>

          <button className="bg-orange-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-orange-700 transition-colors flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Escalations List */}
      <div className="space-y-4">
        {escalations.map((escalation) => (
          <div key={escalation._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {/* Header */}
                <div className="flex items-center space-x-3 mb-3">
                  <span className="font-mono text-sm text-gray-600">{escalation.escalationId}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(escalation.status)}`}>
                    {escalation.status.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(escalation.priority)}`}>
                    {escalation.priority.toUpperCase()}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getReasonColor(escalation.escalationReason)}`}>
                    {escalation.escalationReason.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                    Level {escalation.escalationLevel}
                  </span>
                </div>

                {/* Ticket Info */}
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{escalation.ticketTitle}</h3>
                  <p className="text-sm text-gray-600">Ticket: {escalation.ticketId}</p>
                  <p className="text-sm text-gray-600">Customer: {escalation.customer.name} ({escalation.customer.tenantName})</p>
                </div>

                {/* Escalation Path */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Escalation Path</h4>
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{escalation.originalAssignee.name}</span>
                      <span className="text-xs text-gray-500">({escalation.originalAssignee.role})</span>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-orange-500" />
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-blue-500" />
                      <span className="text-blue-700 font-medium">{escalation.escalatedTo.name}</span>
                      <span className="text-xs text-blue-600">({escalation.escalatedTo.role})</span>
                    </div>
                  </div>
                </div>

                {/* SLA Metrics */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">SLA Metrics</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="text-center p-2 bg-blue-50 rounded">
                      <p className="text-xs text-blue-700">Target</p>
                      <p className="text-sm font-bold text-blue-900">{escalation.slaMetrics.originalSlaTarget}h</p>
                    </div>
                    <div className="text-center p-2 bg-orange-50 rounded">
                      <p className="text-xs text-orange-700">Escalation</p>
                      <p className="text-sm font-bold text-orange-900">{escalation.slaMetrics.escalationTime}h</p>
                    </div>
                    {escalation.slaMetrics.resolutionTime && (
                      <div className="text-center p-2 bg-green-50 rounded">
                        <p className="text-xs text-green-700">Resolution</p>
                        <p className="text-sm font-bold text-green-900">{escalation.slaMetrics.resolutionTime}h</p>
                      </div>
                    )}
                    <div className="text-center p-2 rounded">
                      <p className="text-xs text-gray-700">Breach</p>
                      <span className={`text-sm font-bold px-2 py-1 rounded ${getBreachSeverityColor(escalation.slaMetrics.breachSeverity)}`}>
                        {escalation.slaMetrics.breachSeverity}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Escalation Details */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Escalation Details</h4>
                  <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                    <div>
                      <span className="text-xs font-medium text-gray-600">Reason:</span>
                      <p className="text-sm text-gray-800">{escalation.escalationDetails.reason}</p>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-gray-600">Description:</span>
                      <p className="text-sm text-gray-800">{escalation.escalationDetails.description}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div>
                        <span className="text-xs font-medium text-gray-600">Customer Impact:</span>
                        <p className="text-sm text-gray-800">{escalation.escalationDetails.customerImpact}</p>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-gray-600">Business Impact:</span>
                        <p className="text-sm text-gray-800">{escalation.escalationDetails.businessImpact}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Resolution Details */}
                {escalation.resolutionDetails && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Resolution</h4>
                    <div className="bg-green-50 p-3 rounded-lg space-y-2">
                      <div>
                        <span className="text-xs font-medium text-green-700">Resolution:</span>
                        <p className="text-sm text-green-800">{escalation.resolutionDetails.resolution}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs font-medium text-green-700">Type:</span>
                          <span className="text-sm text-green-800 ml-1">{escalation.resolutionDetails.resolutionType.replace('_', ' ')}</span>
                        </div>
                        {escalation.resolutionDetails.satisfactionScore && (
                          <div>
                            <span className="text-xs font-medium text-green-700">Satisfaction:</span>
                            <span className="text-sm text-green-800 ml-1">{escalation.resolutionDetails.satisfactionScore}/5</span>
                          </div>
                        )}
                      </div>
                      {escalation.resolutionDetails.lessonsLearned && (
                        <div>
                          <span className="text-xs font-medium text-green-700">Lessons Learned:</span>
                          <p className="text-sm text-green-800">{escalation.resolutionDetails.lessonsLearned}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Recent Communications */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Communications</h4>
                  <div className="space-y-2">
                    {escalation.communications.slice(0, 2).map((comm) => (
                      <div key={comm.id} className="bg-blue-50 p-2 rounded text-sm">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-blue-900">{comm.from}</span>
                          <span className="text-xs text-blue-600">{comm.timestamp.toLocaleString()}</span>
                        </div>
                        <p className="text-blue-800">{comm.message}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {escalation.tags.map((tag, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions & Timestamp */}
              <div className="flex flex-col items-end space-y-2 ml-4">
                <button className="text-blue-600 hover:text-blue-800 p-2 rounded-md hover:bg-blue-50">
                  <Eye className="w-4 h-4" />
                </button>
                <div className="text-xs text-gray-500 text-right">
                  <div>Escalated:</div>
                  <div>{escalation.timeline.escalatedAt.toLocaleDateString()}</div>
                  <div className="text-gray-400">{escalation.timeline.escalatedAt.toLocaleTimeString()}</div>
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