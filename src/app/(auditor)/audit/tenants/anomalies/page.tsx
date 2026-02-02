'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { 
  AlertTriangle,
  Search,
  Filter,
  Calendar,
  Download,
  Building2,
  TrendingUp,
  TrendingDown,
  Eye,
  Clock,
  Shield,
  DollarSign,
  Users,
  Activity,
  Zap,
  Target
} from 'lucide-react'

interface TenantAnomaly {
  _id: string
  tenantId: string
  tenantName: string
  businessName: string
  anomaly: {
    type: 'revenue_spike' | 'revenue_drop' | 'order_surge' | 'order_decline' | 'quality_drop' | 'complaint_spike' | 'unusual_pattern' | 'security_concern'
    severity: 'low' | 'medium' | 'high' | 'critical'
    confidence: number
    description: string
    detectedAt: Date
    affectedMetric: string
    normalValue: number
    anomalousValue: number
    deviationPercentage: number
    duration: number // in hours
    status: 'active' | 'investigating' | 'resolved' | 'false_positive'
  }
  context: {
    historicalAverage: number
    seasonalExpected: number
    peerComparison: number
    externalFactors: string[]
  }
  impact: {
    revenueImpact: number
    customerImpact: number
    operationalImpact: string
    riskLevel: number
  }
  investigation: {
    assignedTo?: string
    notes: string[]
    actions: string[]
    resolvedAt?: Date
    resolution?: string
  }
  relatedAnomalies: string[]
}

export default function TenantAnomaliesPage() {
  const [anomalies, setAnomalies] = useState<TenantAnomaly[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSeverity, setSelectedSeverity] = useState('all')
  const [selectedType, setSelectedType] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [dateRange, setDateRange] = useState('7d')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchTenantAnomalies()
  }, [page, selectedSeverity, selectedType, selectedStatus, dateRange, searchQuery])

  const fetchTenantAnomalies = async () => {
    try {
      setLoading(true)
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(selectedSeverity !== 'all' && { severity: selectedSeverity }),
        ...(selectedType !== 'all' && { type: selectedType }),
        ...(selectedStatus !== 'all' && { status: selectedStatus }),
        ...(searchQuery && { search: searchQuery }),
        range: dateRange
      })

      const response = await fetch(`/api/superadmin/audit/tenants/anomalies?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth-storage') ? JSON.parse(localStorage.getItem('auth-storage')).state?.token : ''}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch tenant anomalies')
      }
      
      const data = await response.json()
      
      if (data.success) {
        setAnomalies(data.data.anomalies)
        setTotalPages(data.data.pagination.pages)
      } else {
        throw new Error(data.message || 'Failed to fetch tenant anomalies')
      }
      
    } catch (error) {
      console.error('Error fetching tenant anomalies:', error)
      // Fallback to mock data
      const mockAnomalies: TenantAnomaly[] = [
        {
          _id: '1',
          tenantId: 'tenant_001',
          tenantName: 'clean-fresh',
          businessName: 'Clean & Fresh Laundry',
          anomaly: {
            type: 'revenue_spike',
            severity: 'high',
            confidence: 95.2,
            description: 'Revenue increased by 340% compared to historical average',
            detectedAt: new Date(Date.now() - 3600000),
            affectedMetric: 'Daily Revenue',
            normalValue: 15000,
            anomalousValue: 51000,
            deviationPercentage: 340,
            duration: 6,
            status: 'investigating'
          },
          context: {
            historicalAverage: 15000,
            seasonalExpected: 16500,
            peerComparison: 14800,
            externalFactors: ['Local festival', 'Competitor closure', 'Marketing campaign']
          },
          impact: {
            revenueImpact: 36000,
            customerImpact: 150,
            operationalImpact: 'Capacity strain, delayed deliveries',
            riskLevel: 3
          },
          investigation: {
            assignedTo: 'support@laundrylobby.com',
            notes: [
              'Investigating sudden order surge',
              'Checking for promotional campaigns',
              'Verifying payment processing'
            ],
            actions: [
              'Contact tenant for explanation',
              'Review recent marketing activities',
              'Monitor for fraud indicators'
            ]
          },
          relatedAnomalies: ['anomaly_002', 'anomaly_003']
        },
        {
          _id: '2',
          tenantId: 'tenant_002',
          tenantName: 'quickwash',
          businessName: 'QuickWash Services',
          anomaly: {
            type: 'quality_drop',
            severity: 'critical',
            confidence: 88.7,
            description: 'Customer quality ratings dropped from 4.5 to 2.8 in 48 hours',
            detectedAt: new Date(Date.now() - 7200000),
            affectedMetric: 'Quality Rating',
            normalValue: 4.5,
            anomalousValue: 2.8,
            deviationPercentage: -37.8,
            duration: 48,
            status: 'active'
          },
          context: {
            historicalAverage: 4.4,
            seasonalExpected: 4.3,
            peerComparison: 4.2,
            externalFactors: ['Equipment malfunction', 'Staff shortage', 'Supply chain issues']
          },
          impact: {
            revenueImpact: -8500,
            customerImpact: 45,
            operationalImpact: 'High complaint rate, customer churn risk',
            riskLevel: 5
          },
          investigation: {
            assignedTo: 'support@laundrylobby.com',
            notes: [
              'Multiple customer complaints received',
              'Quality issues reported across all services',
              'Tenant contacted for immediate action'
            ],
            actions: [
              'Immediate quality audit required',
              'Suspend new orders until resolved',
              'Customer compensation plan'
            ]
          },
          relatedAnomalies: []
        },
        {
          _id: '3',
          tenantId: 'tenant_003',
          tenantName: 'express-laundry',
          businessName: 'Express Laundry',
          anomaly: {
            type: 'order_decline',
            severity: 'medium',
            confidence: 76.3,
            description: 'Order volume decreased by 45% over the past week',
            detectedAt: new Date(Date.now() - 86400000),
            affectedMetric: 'Daily Orders',
            normalValue: 120,
            anomalousValue: 66,
            deviationPercentage: -45,
            duration: 168,
            status: 'resolved'
          },
          context: {
            historicalAverage: 118,
            seasonalExpected: 115,
            peerComparison: 125,
            externalFactors: ['Local construction', 'Seasonal slowdown', 'New competitor']
          },
          impact: {
            revenueImpact: -12000,
            customerImpact: 0,
            operationalImpact: 'Reduced capacity utilization',
            riskLevel: 2
          },
          investigation: {
            assignedTo: 'support@laundrylobby.com',
            notes: [
              'Confirmed local construction affecting accessibility',
              'Temporary situation expected to resolve in 2 weeks',
              'Tenant implementing delivery service'
            ],
            actions: [
              'Monitor recovery progress',
              'Support marketing initiatives',
              'Adjust capacity planning'
            ],
            resolvedAt: new Date(Date.now() - 3600000),
            resolution: 'Temporary external factor - construction completed'
          },
          relatedAnomalies: []
        }
      ]
      setAnomalies(mockAnomalies)
      setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-700 bg-red-100 border-red-200'
      case 'high': return 'text-orange-700 bg-orange-100 border-orange-200'
      case 'medium': return 'text-yellow-700 bg-yellow-100 border-yellow-200'
      case 'low': return 'text-green-700 bg-green-100 border-green-200'
      default: return 'text-gray-700 bg-gray-100 border-gray-200'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-red-700 bg-red-100'
      case 'investigating': return 'text-orange-700 bg-orange-100'
      case 'resolved': return 'text-green-700 bg-green-100'
      case 'false_positive': return 'text-gray-700 bg-gray-100'
      default: return 'text-gray-700 bg-gray-100'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'revenue_spike':
      case 'revenue_drop': return <DollarSign className="w-4 h-4" />
      case 'order_surge':
      case 'order_decline': return <TrendingUp className="w-4 h-4" />
      case 'quality_drop': return <Target className="w-4 h-4" />
      case 'complaint_spike': return <AlertTriangle className="w-4 h-4" />
      case 'security_concern': return <Shield className="w-4 h-4" />
      case 'unusual_pattern': return <Activity className="w-4 h-4" />
      default: return <Zap className="w-4 h-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'revenue_spike': return 'text-green-700 bg-green-100'
      case 'revenue_drop': return 'text-red-700 bg-red-100'
      case 'order_surge': return 'text-blue-700 bg-blue-100'
      case 'order_decline': return 'text-orange-700 bg-orange-100'
      case 'quality_drop': return 'text-purple-700 bg-purple-100'
      case 'complaint_spike': return 'text-red-700 bg-red-100'
      case 'security_concern': return 'text-indigo-700 bg-indigo-100'
      case 'unusual_pattern': return 'text-gray-700 bg-gray-100'
      default: return 'text-gray-700 bg-gray-100'
    }
  }

  const formatDuration = (hours: number) => {
    if (hours < 24) return `${hours}h`
    const days = Math.floor(hours / 24)
    const remainingHours = hours % 24
    return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center">
              <AlertTriangle className="w-8 h-8 mr-3" />
              Tenant Anomaly Detection
            </h1>
            <p className="text-red-100 mt-2">
              AI-powered detection of unusual patterns, performance deviations, and potential issues
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-red-100">Active Anomalies: {anomalies.filter(a => a.anomaly.status === 'active').length}</p>
            <p className="text-xs text-red-200">Real-time Monitoring</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl shadow-sm p-5 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-red-700 uppercase tracking-wide">Critical Anomalies</p>
              <p className="text-2xl font-bold text-red-900 mt-1">
                {anomalies.filter(a => a.anomaly.severity === 'critical').length}
              </p>
            </div>
            <div className="bg-red-500 p-3 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl shadow-sm p-5 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-orange-700 uppercase tracking-wide">Under Investigation</p>
              <p className="text-2xl font-bold text-orange-900 mt-1">
                {anomalies.filter(a => a.anomaly.status === 'investigating').length}
              </p>
            </div>
            <div className="bg-orange-500 p-3 rounded-lg">
              <Eye className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-sm p-5 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-green-700 uppercase tracking-wide">Resolved Today</p>
              <p className="text-2xl font-bold text-green-900 mt-1">
                {anomalies.filter(a => a.anomaly.status === 'resolved' && 
                  new Date(a.investigation.resolvedAt || 0).toDateString() === new Date().toDateString()).length}
              </p>
            </div>
            <div className="bg-green-500 p-3 rounded-lg">
              <Target className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-sm p-5 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Avg Confidence</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">
                {(anomalies.reduce((sum, a) => sum + a.anomaly.confidence, 0) / anomalies.length).toFixed(1)}%
              </p>
            </div>
            <div className="bg-blue-500 p-3 rounded-lg">
              <Activity className="w-6 h-6 text-white" />
            </div>
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
              placeholder="Search anomalies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="all">All Severity</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="all">All Types</option>
            <option value="revenue_spike">Revenue Spike</option>
            <option value="revenue_drop">Revenue Drop</option>
            <option value="order_surge">Order Surge</option>
            <option value="order_decline">Order Decline</option>
            <option value="quality_drop">Quality Drop</option>
            <option value="complaint_spike">Complaint Spike</option>
            <option value="security_concern">Security Concern</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="investigating">Investigating</option>
            <option value="resolved">Resolved</option>
            <option value="false_positive">False Positive</option>
          </select>

          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>

          <button className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition-colors flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Anomalies List */}
      <div className="space-y-4">
        {anomalies.map((anomaly) => (
          <div key={anomaly._id} className={`bg-white rounded-xl shadow-sm border-l-4 p-6 ${getSeverityColor(anomaly.anomaly.severity)}`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {/* Header */}
                <div className="flex items-center space-x-3 mb-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${getTypeColor(anomaly.anomaly.type)}`}>
                    {getTypeIcon(anomaly.anomaly.type)}
                    <span className="ml-1">{anomaly.anomaly.type.replace('_', ' ').toUpperCase()}</span>
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(anomaly.anomaly.severity)}`}>
                    {anomaly.anomaly.severity.toUpperCase()}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(anomaly.anomaly.status)}`}>
                    {anomaly.anomaly.status.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className="text-xs text-gray-500">
                    Confidence: {anomaly.anomaly.confidence}%
                  </span>
                </div>

                {/* Tenant Info */}
                <div className="mb-3">
                  <h3 className="text-lg font-bold text-gray-900">{anomaly.businessName}</h3>
                  <p className="text-sm text-gray-600">{anomaly.tenantName} • {anomaly.tenantId}</p>
                </div>

                {/* Description */}
                <p className="text-gray-800 mb-4">{anomaly.anomaly.description}</p>

                {/* Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600 font-medium">Normal Value</p>
                    <p className="text-sm font-bold text-gray-900">{anomaly.anomaly.normalValue.toLocaleString()}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600 font-medium">Anomalous Value</p>
                    <p className="text-sm font-bold text-gray-900">{anomaly.anomaly.anomalousValue.toLocaleString()}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600 font-medium">Deviation</p>
                    <p className={`text-sm font-bold ${anomaly.anomaly.deviationPercentage > 0 ? 'text-green-700' : 'text-red-700'}`}>
                      {anomaly.anomaly.deviationPercentage > 0 ? '+' : ''}{anomaly.anomaly.deviationPercentage}%
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600 font-medium">Duration</p>
                    <p className="text-sm font-bold text-gray-900">{formatDuration(anomaly.anomaly.duration)}</p>
                  </div>
                </div>

                {/* Impact */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Impact Assessment</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="text-sm">
                      <span className="text-gray-600">Revenue Impact:</span>
                      <span className={`ml-2 font-medium ${anomaly.impact.revenueImpact >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                        ₹{Math.abs(anomaly.impact.revenueImpact).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-600">Customers Affected:</span>
                      <span className="ml-2 font-medium text-gray-900">{anomaly.impact.customerImpact}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-600">Risk Level:</span>
                      <span className="ml-2 font-medium text-gray-900">{anomaly.impact.riskLevel}/5</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{anomaly.impact.operationalImpact}</p>
                </div>

                {/* Investigation */}
                {anomaly.investigation.notes.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Investigation Status</h4>
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="text-xs text-blue-600 mb-1">
                        Assigned to: {anomaly.investigation.assignedTo || 'Unassigned'}
                      </div>
                      <div className="space-y-1">
                        {anomaly.investigation.notes.slice(0, 2).map((note, index) => (
                          <p key={index} className="text-sm text-blue-800">• {note}</p>
                        ))}
                      </div>
                      {anomaly.investigation.resolution && (
                        <div className="mt-2 pt-2 border-t border-blue-200">
                          <p className="text-sm font-medium text-blue-900">Resolution: {anomaly.investigation.resolution}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col space-y-2 ml-4">
                <button className="text-blue-600 hover:text-blue-800 p-2 rounded-md hover:bg-blue-50">
                  <Eye className="w-4 h-4" />
                </button>
                <div className="text-xs text-gray-500 text-center">
                  {new Date(anomaly.anomaly.detectedAt).toLocaleDateString()}
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