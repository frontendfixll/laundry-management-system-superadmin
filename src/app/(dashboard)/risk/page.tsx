'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { superAdminApi } from '@/lib/superAdminApi'
import { 
  Shield,
  AlertTriangle,
  Clock,
  TrendingUp,
  Users,
  FileText,
  Settings,
  RefreshCw,
  Eye,
  UserX,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react'

interface RiskOverview {
  complaintStats: {
    total: number
    open: number
    inProgress: number
    escalated: number
    resolved: number
    closed: number
    avgResolutionTime: number
  }
  escalatedComplaints: number
  slaBreaches: number
  fraudSuspicious: number
  blacklistStats: {
    totalEntries: number
    activeEntries: number
    highRiskEntries: number
    byType: Record<string, any>
  }
  pendingAppeals: number
  highRiskEntries: number
}

interface Complaint {
  _id: string
  complaintId: string
  title: string
  category: string
  severity: string
  status: string
  escalationLevel: number
  customerName: string
  createdAt: string
}

export default function RiskManagementPage() {
  const [overview, setOverview] = useState<RiskOverview | null>(null)
  const [escalatedComplaints, setEscalatedComplaints] = useState<Complaint[]>([])
  const [slaBreaches, setSlaBreaches] = useState<Complaint[]>([])
  const [fraudSuspicious, setFraudSuspicious] = useState<Complaint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [timeframe, setTimeframe] = useState('30d')
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchRiskOverview()
  }, [timeframe])

  const fetchRiskOverview = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await superAdminApi.getRiskOverview(timeframe)
      setOverview(response.data.overview)
      setEscalatedComplaints(response.data.escalatedComplaints)
      setSlaBreaches(response.data.slaBreaches)
      setFraudSuspicious(response.data.fraudSuspicious)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchRiskOverview()
    setRefreshing(false)
  }

  const getSeverityBadge = (severity: string) => {
    const severityConfig = {
      low: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      medium: { color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
      high: { color: 'bg-orange-100 text-orange-800', icon: AlertTriangle },
      critical: { color: 'bg-red-100 text-red-800', icon: XCircle }
    }

    const config = severityConfig[severity as keyof typeof severityConfig] || severityConfig.medium
    const Icon = config.icon

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {severity.charAt(0).toUpperCase() + severity.slice(1)}
      </span>
    )
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      open: { color: 'bg-blue-100 text-blue-800' },
      in_progress: { color: 'bg-yellow-100 text-yellow-800' },
      escalated: { color: 'bg-red-100 text-red-800' },
      resolved: { color: 'bg-green-100 text-green-800' },
      closed: { color: 'bg-gray-100 text-gray-800' }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.open

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Risk & Escalation Management</h1>
          <p className="text-gray-600">Monitor complaints, manage escalations, and handle security risks</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Timeframe Selector */}
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 disabled:opacity-50"
          >
            <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {overview && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Complaints</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {overview.complaintStats.total}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    {overview.complaintStats.resolved} resolved
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Escalated Cases</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {overview.escalatedComplaints}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Require attention
                  </p>
                </div>
                <div className="p-3 bg-red-100 rounded-full">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">SLA Breaches</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {overview.slaBreaches}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Past deadline
                  </p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Blacklist Entries</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {overview.blacklistStats.activeEntries}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    {overview.blacklistStats.highRiskEntries} high risk
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <UserX className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Complaint Statistics */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Complaint Status Overview</h2>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {overview.complaintStats.open}
                </div>
                <div className="text-sm text-gray-600">Open</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {overview.complaintStats.inProgress}
                </div>
                <div className="text-sm text-gray-600">In Progress</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {overview.complaintStats.escalated}
                </div>
                <div className="text-sm text-gray-600">Escalated</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {overview.complaintStats.resolved}
                </div>
                <div className="text-sm text-gray-600">Resolved</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">
                  {overview.complaintStats.closed}
                </div>
                <div className="text-sm text-gray-600">Closed</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round(overview.complaintStats.avgResolutionTime || 0)}m
                </div>
                <div className="text-sm text-gray-600">Avg Resolution</div>
              </div>
            </div>
          </div>

          {/* Critical Issues */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Escalated Complaints */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-gray-900">Escalated Complaints</h3>
                  <Link
                    href="/superadmin/risk/complaints?isEscalated=true"
                    className="text-sm text-purple-600 hover:text-purple-700"
                  >
                    View All
                  </Link>
                </div>
              </div>
              <div className="p-4">
                {escalatedComplaints.length > 0 ? (
                  <div className="space-y-3">
                    {escalatedComplaints.slice(0, 5).map((complaint) => (
                      <div key={complaint._id} className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {complaint.complaintId}
                          </div>
                          <div className="text-sm text-gray-500 truncate">
                            {complaint.customerName} • Level {complaint.escalationLevel}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getSeverityBadge(complaint.severity)}
                          <Link
                            href={`/superadmin/risk/complaints/${complaint._id}`}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No escalated complaints
                  </p>
                )}
              </div>
            </div>

            {/* SLA Breaches */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-gray-900">SLA Breaches</h3>
                  <Link
                    href="/superadmin/risk/complaints?slaBreached=true"
                    className="text-sm text-purple-600 hover:text-purple-700"
                  >
                    View All
                  </Link>
                </div>
              </div>
              <div className="p-4">
                {slaBreaches.length > 0 ? (
                  <div className="space-y-3">
                    {slaBreaches.slice(0, 5).map((complaint) => (
                      <div key={complaint._id} className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {complaint.complaintId}
                          </div>
                          <div className="text-sm text-gray-500 truncate">
                            {complaint.customerName}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(complaint.status)}
                          <Link
                            href={`/superadmin/risk/complaints/${complaint._id}`}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No SLA breaches
                  </p>
                )}
              </div>
            </div>

            {/* Fraud Suspicious */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-gray-900">Fraud Suspicious</h3>
                  <Link
                    href="/superadmin/risk/complaints?fraudRisk=high"
                    className="text-sm text-purple-600 hover:text-purple-700"
                  >
                    View All
                  </Link>
                </div>
              </div>
              <div className="p-4">
                {fraudSuspicious.length > 0 ? (
                  <div className="space-y-3">
                    {fraudSuspicious.slice(0, 5).map((complaint) => (
                      <div key={complaint._id} className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {complaint.complaintId}
                          </div>
                          <div className="text-sm text-gray-500 truncate">
                            {complaint.customerName}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                            High Risk
                          </span>
                          <Link
                            href={`/superadmin/risk/complaints/${complaint._id}`}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No suspicious cases
                  </p>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/superadmin/risk/complaints"
          className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow"
        >
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full mr-4">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Complaints</h3>
              <p className="text-sm text-gray-600">Manage all complaints</p>
            </div>
          </div>
        </Link>

        <Link
          href="/superadmin/risk/blacklist"
          className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow"
        >
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-full mr-4">
              <UserX className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Blacklist</h3>
              <p className="text-sm text-gray-600">Manage blacklisted entities</p>
            </div>
          </div>
        </Link>

        <Link
          href="/superadmin/risk/sla"
          className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow"
        >
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full mr-4">
              <Clock className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">SLA Config</h3>
              <p className="text-sm text-gray-600">Configure SLA rules</p>
            </div>
          </div>
        </Link>

        <Link
          href="/superadmin/risk/escalations"
          className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow"
        >
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-full mr-4">
              <AlertTriangle className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Escalations</h3>
              <p className="text-sm text-gray-600">Handle escalated cases</p>
              {overview && overview.escalatedComplaints > 0 && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 mt-1">
                  {overview.escalatedComplaints} pending
                </span>
              )}
            </div>
          </div>
        </Link>
      </div>
    </div>
  )
}
