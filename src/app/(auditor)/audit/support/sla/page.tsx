'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { superAdminApi } from '@/lib/superAdminApi'
import { 
  Timer,
  Search,
  Filter,
  Calendar,
  Download,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  TrendingUp,
  TrendingDown,
  Activity,
  Target
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

interface SLACompliance {
  _id: string
  slaId: string
  ticketId: string
  ticketTitle: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  category: string
  customer: {
    id: string
    name: string
    email: string
  }
  tenant: {
    id: string
    name: string
    businessName: string
  }
  assignedTo: {
    id: string
    name: string
    email: string
  }
  slaTargets: {
    firstResponseTime: number // in minutes
    resolutionTime: number // in minutes
    escalationTime: number // in minutes
  }
  actualTimes: {
    firstResponseTime?: number
    resolutionTime?: number
    escalationTime?: number
  }
  timestamps: {
    createdAt: Date
    firstResponseAt?: Date
    resolvedAt?: Date
    escalatedAt?: Date
  }
  compliance: {
    firstResponse: {
      status: 'met' | 'breached' | 'pending'
      variance: number // positive = early, negative = late
      percentage: number
    }
    resolution: {
      status: 'met' | 'breached' | 'pending'
      variance: number
      percentage: number
    }
    escalation: {
      status: 'met' | 'breached' | 'not_applicable'
      variance: number
      percentage: number
    }
    overall: {
      status: 'compliant' | 'breached' | 'at_risk'
      score: number
    }
  }
  breachDetails?: {
    type: 'first_response' | 'resolution' | 'escalation'
    breachTime: number
    impact: string
    reason: string
    mitigationActions: string[]
  }[]
  customerSatisfaction?: {
    rating: number
    feedback: string
    submittedAt: Date
  }
}

export default function SLACompliancePage() {
  const [slaRecords, setSlaRecords] = useState<SLACompliance[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPriority, setSelectedPriority] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [dateRange, setDateRange] = useState('7d')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [stats, setStats] = useState({
    totalTickets: 0,
    compliantTickets: 0,
    breachedTickets: 0,
    atRiskTickets: 0,
    avgFirstResponseTime: 0,
    avgResolutionTime: 0,
    overallComplianceRate: 0,
    customerSatisfaction: 0
  })

  useEffect(() => {
    fetchSLACompliance()
  }, [page, selectedPriority, selectedStatus, selectedCategory, dateRange, searchQuery])

  const fetchSLACompliance = async () => {
    try {
      setLoading(true)
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(selectedPriority !== 'all' && { priority: selectedPriority }),
        ...(selectedStatus !== 'all' && { status: selectedStatus }),
        ...(selectedCategory !== 'all' && { category: selectedCategory }),
        ...(searchQuery && { search: searchQuery }),
        range: dateRange
      })

      const data = await superAdminApi.get(`/audit/support/sla?${params}`)
      
      if (data.success) {
        setSlaRecords(data.data?.slaRecords || [])
        if (data.data?.stats) setStats(data.data.stats)
        setTotalPages(data.data?.pagination?.pages || 1)
      } else {
        throw new Error(data.message || 'Failed to fetch SLA compliance data')
      }

    } catch (error) {
      console.error('Error fetching SLA compliance data:', error)
      setSlaRecords([])
      setTotalPages(1)
    } finally {
      setLoading(false)
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

  const getComplianceColor = (status: string) => {
    switch (status) {
      case 'compliant':
      case 'met': return 'text-green-700 bg-green-100'
      case 'breached': return 'text-red-700 bg-red-100'
      case 'at_risk':
      case 'pending': return 'text-yellow-700 bg-yellow-100'
      case 'not_applicable': return 'text-gray-700 bg-gray-100'
      default: return 'text-gray-700 bg-gray-100'
    }
  }

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
  }

  const getVarianceDisplay = (variance: number, unit: string = 'min') => {
    if (variance === 0) return 'On time'
    const absVariance = Math.abs(variance)
    const sign = variance > 0 ? '+' : '-'
    return `${sign}${absVariance}${unit}`
  }

  const COLORS = ['#22C55E', '#EF4444', '#EAB308', '#6B7280']

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
              <Timer className="w-8 h-8 mr-3" />
              SLA Compliance Monitoring
            </h1>
            <p className="text-blue-100 mt-2">
              Real-time monitoring of service level agreement compliance and performance metrics
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-blue-100">Compliance Rate: {stats.overallComplianceRate}%</p>
            <p className="text-xs text-blue-200">SLA Monitoring</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-sm p-4 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Total</p>
              <p className="text-xl font-bold text-blue-900 mt-1">{stats.totalTickets}</p>
            </div>
            <Timer className="w-5 h-5 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-sm p-4 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-green-700 uppercase tracking-wide">Compliant</p>
              <p className="text-xl font-bold text-green-900 mt-1">{stats.compliantTickets}</p>
            </div>
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl shadow-sm p-4 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-red-700 uppercase tracking-wide">Breached</p>
              <p className="text-xl font-bold text-red-900 mt-1">{stats.breachedTickets}</p>
            </div>
            <XCircle className="w-5 h-5 text-red-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl shadow-sm p-4 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-yellow-700 uppercase tracking-wide">At Risk</p>
              <p className="text-xl font-bold text-yellow-900 mt-1">{stats.atRiskTickets}</p>
            </div>
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-sm p-4 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide">Avg Response</p>
              <p className="text-lg font-bold text-purple-900 mt-1">{stats.avgFirstResponseTime}m</p>
            </div>
            <Clock className="w-5 h-5 text-purple-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl shadow-sm p-4 border border-indigo-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wide">Avg Resolution</p>
              <p className="text-lg font-bold text-indigo-900 mt-1">{stats.avgResolutionTime}h</p>
            </div>
            <Activity className="w-5 h-5 text-indigo-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl shadow-sm p-4 border border-teal-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-teal-700 uppercase tracking-wide">Compliance</p>
              <p className="text-xl font-bold text-teal-900 mt-1">{stats.overallComplianceRate}%</p>
            </div>
            <Target className="w-5 h-5 text-teal-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl shadow-sm p-4 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-orange-700 uppercase tracking-wide">Satisfaction</p>
              <p className="text-xl font-bold text-orange-900 mt-1">{stats.customerSatisfaction}/5</p>
            </div>
            <TrendingUp className="w-5 h-5 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Charts - only show when there's data */}
      {slaRecords.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* SLA Compliance Overview */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
              SLA Compliance Overview
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Compliant', value: stats.compliantTickets || 0 },
                      { name: 'Breached', value: stats.breachedTickets || 0 },
                      { name: 'At Risk', value: stats.atRiskTickets || 0 }
                    ].filter(d => d.value > 0)}
                    cx="50%" cy="50%" outerRadius={80} dataKey="value" label
                  >
                    {[COLORS[0], COLORS[1], COLORS[2]].map((color, index) => (
                      <Cell key={`cell-${index}`} fill={color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* SLA Performance by Priority */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <Target className="w-5 h-5 mr-2 text-purple-600" />
              Performance by Priority
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={
                  ['critical', 'high', 'medium', 'low'].map(p => {
                    const priorityRecords = slaRecords.filter(r => r.priority === p)
                    const compliant = priorityRecords.filter(r => r.compliance.overall.status === 'compliant').length
                    const total = priorityRecords.length
                    return {
                      priority: p.charAt(0).toUpperCase() + p.slice(1),
                      compliance: total > 0 ? Math.round((compliant / total) * 100) : 0,
                      total
                    }
                  }).filter(d => d.total > 0)
                }>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="priority" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="compliance" fill="#3B82F6" name="Compliance %" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

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
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="compliant">Compliant</option>
            <option value="breached">Breached</option>
            <option value="at_risk">At Risk</option>
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            <option value="Technical Issues">Technical Issues</option>
            <option value="Delivery Issues">Delivery Issues</option>
            <option value="Payment Issues">Payment Issues</option>
            <option value="Quality Issues">Quality Issues</option>
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

      {/* SLA Records List */}
      <div className="space-y-4">
        {slaRecords.map((record) => (
          <div key={record._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {/* Header */}
                <div className="flex items-center space-x-3 mb-3">
                  <span className="font-mono text-sm text-gray-600">{record.ticketId}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(record.priority)}`}>
                    {record.priority.toUpperCase()}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getComplianceColor(record.compliance.overall.status)}`}>
                    {record.compliance.overall.status.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className="px-2 py-1 rounded-full text-xs font-medium text-blue-700 bg-blue-100">
                    Score: {record.compliance.overall.score}%
                  </span>
                </div>

                {/* Ticket Details */}
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{record.ticketTitle}</h3>
                  <div className="text-sm text-gray-600">
                    <p>Customer: {record.customer.name} ({record.customer.email})</p>
                    <p>Tenant: {record.tenant.businessName}</p>
                    <p>Assigned to: {record.assignedTo.name}</p>
                    <p>Category: {record.category}</p>
                  </div>
                </div>

                {/* SLA Targets vs Actual */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">SLA Performance</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* First Response */}
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-600">First Response</span>
                        <span className={`px-1 py-0.5 rounded text-xs ${getComplianceColor(record.compliance.firstResponse.status)}`}>
                          {record.compliance.firstResponse.status}
                        </span>
                      </div>
                      <div className="text-sm">
                        <p className="text-gray-700">Target: {formatDuration(record.slaTargets.firstResponseTime)}</p>
                        {record.actualTimes.firstResponseTime && (
                          <p className="text-gray-900 font-medium">
                            Actual: {formatDuration(record.actualTimes.firstResponseTime)}
                            <span className={`ml-2 text-xs ${record.compliance.firstResponse.variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              ({getVarianceDisplay(record.compliance.firstResponse.variance)})
                            </span>
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Resolution */}
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-600">Resolution</span>
                        <span className={`px-1 py-0.5 rounded text-xs ${getComplianceColor(record.compliance.resolution.status)}`}>
                          {record.compliance.resolution.status}
                        </span>
                      </div>
                      <div className="text-sm">
                        <p className="text-gray-700">Target: {formatDuration(record.slaTargets.resolutionTime)}</p>
                        {record.actualTimes.resolutionTime && (
                          <p className="text-gray-900 font-medium">
                            Actual: {formatDuration(record.actualTimes.resolutionTime)}
                            <span className={`ml-2 text-xs ${record.compliance.resolution.variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              ({getVarianceDisplay(record.compliance.resolution.variance)})
                            </span>
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Escalation */}
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-600">Escalation</span>
                        <span className={`px-1 py-0.5 rounded text-xs ${getComplianceColor(record.compliance.escalation.status)}`}>
                          {record.compliance.escalation.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="text-sm">
                        <p className="text-gray-700">Target: {formatDuration(record.slaTargets.escalationTime)}</p>
                        {record.actualTimes.escalationTime && (
                          <p className="text-gray-900 font-medium">
                            Actual: {formatDuration(record.actualTimes.escalationTime)}
                            <span className={`ml-2 text-xs ${record.compliance.escalation.variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              ({getVarianceDisplay(record.compliance.escalation.variance)})
                            </span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Breach Details */}
                {record.breachDetails && record.breachDetails.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <AlertTriangle className="w-4 h-4 mr-1 text-red-600" />
                      SLA Breaches
                    </h4>
                    <div className="space-y-2">
                      {record.breachDetails.map((breach, index) => (
                        <div key={index} className="bg-red-50 p-3 rounded-lg">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-red-900">
                              {breach.type.replace('_', ' ').toUpperCase()} BREACH
                            </span>
                            <span className="text-sm text-red-700">
                              +{formatDuration(breach.breachTime)} late
                            </span>
                          </div>
                          <p className="text-sm text-red-800 mb-1">{breach.reason}</p>
                          <p className="text-xs text-red-600">Impact: {breach.impact}</p>
                          {breach.mitigationActions.length > 0 && (
                            <div className="mt-2">
                              <p className="text-xs text-red-700 font-medium">Mitigation Actions:</p>
                              <ul className="text-xs text-red-600 list-disc list-inside">
                                {breach.mitigationActions.map((action, actionIndex) => (
                                  <li key={actionIndex}>{action}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Customer Satisfaction */}
                {record.customerSatisfaction && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Customer Satisfaction</h4>
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-blue-900">
                          Rating: {record.customerSatisfaction.rating}/5
                        </span>
                        <span className="text-xs text-blue-600">
                          {new Date(record.customerSatisfaction.submittedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-blue-800">{record.customerSatisfaction.feedback}</p>
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
                  <div>Created:</div>
                  <div>{new Date(record.timestamps.createdAt).toLocaleDateString()}</div>
                  <div>{new Date(record.timestamps.createdAt).toLocaleTimeString()}</div>
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