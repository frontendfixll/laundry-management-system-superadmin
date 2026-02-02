'use client'

import { useState, useEffect } from 'react'
import { useAuthStore, useAuditorUser } from '@/store/authStore'
import { superAdminApi } from '@/lib/superAdminApi'
import { 
  Shield,
  Eye,
  FileText,
  Users,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
  Search,
  Filter,
  Calendar,
  Globe,
  Lock,
  Activity,
  TrendingUp,
  BarChart3,
  PieChart,
  RefreshCw,
  Target,
  Building2,
  CreditCard,
  Receipt,
  UserCheck,
  Settings,
  Database,
  Zap
} from 'lucide-react'
import {
  PieChart as RechartsPieChart,
  Cell,
  Pie,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts'

interface AuditStats {
  totalAuditLogs: number
  todayLogs: number
  criticalEvents: number
  securityAlerts: number
  crossTenantAccess: number
  financialTransactions: number
  userActions: number
  systemEvents: number
}

interface AuditLog {
  _id: string
  timestamp: Date
  who: string
  role: string
  action: string
  entity: string
  entityId: string
  tenantId?: string
  tenantName?: string
  ipAddress: string
  userAgent: string
  outcome: 'success' | 'failure' | 'warning'
  details: any
  severity: 'low' | 'medium' | 'high' | 'critical'
}

interface TenantOverview {
  _id: string
  name: string
  businessName: string
  totalOrders: number
  totalRevenue: number
  activeUsers: number
  lastActivity: Date
  status: 'active' | 'inactive' | 'suspended'
  riskScore: number
}

interface FinancialIntegrity {
  totalTransactions: number
  totalAmount: number
  discrepancies: number
  pendingReconciliation: number
  refundRate: number
  chargebackRate: number
}

export default function AuditDashboard() {
  const admin = useAuditorUser()
  const [stats, setStats] = useState<AuditStats | null>(null)
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [tenantOverview, setTenantOverview] = useState<TenantOverview[]>([])
  const [financialIntegrity, setFinancialIntegrity] = useState<FinancialIntegrity | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSeverity, setSelectedSeverity] = useState('all')
  const [dataSource, setDataSource] = useState<'real' | 'mock'>('mock')

  useEffect(() => {
    fetchAuditData()
  }, [selectedTimeRange])

  const fetchAuditData = async () => {
    try {
      setLoading(true)
      
      const data = await superAdminApi.getAuditDashboard(selectedTimeRange)
      
      if (data.success) {
        // Use real data from backend
        setStats(data.data.stats)
        setAuditLogs(data.data.recentAuditLogs.map((log: any) => ({
          ...log,
          timestamp: new Date(log.timestamp)
        })))
        setTenantOverview(data.data.tenantOverview.map((tenant: any) => ({
          ...tenant,
          lastActivity: new Date(tenant.lastActivity)
        })))
        setFinancialIntegrity(data.data.financialIntegrity)
        setDataSource('real')
        
        console.log('✅ Successfully loaded real audit data')
      } else {
        throw new Error(data.message || 'Failed to fetch audit data')
      }
      
    } catch (error) {
      console.error('❌ Error fetching audit data:', error)
      
      // Show empty state instead of mock data
      setStats({
        totalAuditLogs: 0,
        todayLogs: 0,
        criticalEvents: 0,
        securityAlerts: 0,
        crossTenantAccess: 0,
        financialTransactions: 0,
        userActions: 0,
        systemEvents: 0
      })
      setAuditLogs([])
      setTenantOverview([])
      setFinancialIntegrity({
        totalTransactions: 0,
        totalAmount: 0,
        discrepancies: 0,
        pendingReconciliation: 0,
        refundRate: 0,
        chargebackRate: 0
      })
      setDataSource('real')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-700 bg-red-100'
      case 'high': return 'text-orange-700 bg-orange-100'
      case 'medium': return 'text-yellow-700 bg-yellow-100'
      case 'low': return 'text-green-700 bg-green-100'
      default: return 'text-gray-700 bg-gray-100'
    }
  }

  const getOutcomeColor = (outcome: string) => {
    switch (outcome) {
      case 'success': return 'text-green-700 bg-green-100'
      case 'failure': return 'text-red-700 bg-red-100'
      case 'warning': return 'text-yellow-700 bg-yellow-100'
      default: return 'text-gray-700 bg-gray-100'
    }
  }

  const getRiskScoreColor = (score: number) => {
    if (score >= 4) return 'text-red-700 bg-red-100'
    if (score >= 3) return 'text-orange-700 bg-orange-100'
    if (score >= 2) return 'text-yellow-700 bg-yellow-100'
    return 'text-green-700 bg-green-100'
  }

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
              <Shield className="w-8 h-8 mr-3" />
              Platform Audit Dashboard
            </h1>
            <p className="text-orange-100 mt-2">
              Comprehensive read-only access to all platform data for auditing and compliance
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-orange-100">Auditor: {admin?.name}</p>
            <p className="text-xs text-orange-200">
              {dataSource === 'real' ? '🟢 Live Data' : '🟡 Demo Data'} • Read-Only Access
            </p>
          </div>
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="flex items-center justify-between bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-gray-500" />
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="1h">Last Hour</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Search className="w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search audit logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 w-64"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button 
            onClick={fetchAuditData}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Loading...' : 'Refresh Data'}
          </button>
          <button className="bg-orange-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-orange-700 transition-colors flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Export Audit Report
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-sm p-5 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Total Audit Logs</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">
                {stats?.totalAuditLogs?.toLocaleString() || 0}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                +{stats?.todayLogs || 0} today
              </p>
            </div>
            <div className="bg-blue-500 p-3 rounded-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl shadow-sm p-5 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-red-700 uppercase tracking-wide">Critical Events</p>
              <p className="text-2xl font-bold text-red-900 mt-1">
                {stats?.criticalEvents || 0}
              </p>
              <p className="text-xs text-red-600 mt-1">
                {stats?.securityAlerts || 0} security alerts
              </p>
            </div>
            <div className="bg-red-500 p-3 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-sm p-5 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-green-700 uppercase tracking-wide">Cross-Tenant Access</p>
              <p className="text-2xl font-bold text-green-900 mt-1">
                {stats?.crossTenantAccess || 0}
              </p>
              <p className="text-xs text-green-600 mt-1">
                Platform-wide visibility
              </p>
            </div>
            <div className="bg-green-500 p-3 rounded-lg">
              <Globe className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-sm p-5 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide">Financial Transactions</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">
                {stats?.financialTransactions?.toLocaleString() || 0}
              </p>
              <p className="text-xs text-purple-600 mt-1">
                Transparency & integrity
              </p>
            </div>
            <div className="bg-purple-500 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Audit Logs */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-orange-600" />
                Recent Audit Trail
              </h3>
              <div className="flex items-center space-x-2">
                <select
                  value={selectedSeverity}
                  onChange={(e) => setSelectedSeverity(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="all">All Severity</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {auditLogs.map((log) => (
              <div key={log._id} className="px-6 py-4 border-b border-gray-100 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(log.severity)}`}>
                        {log.severity.toUpperCase()}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getOutcomeColor(log.outcome)}`}>
                        {log.outcome.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-sm text-gray-900 font-medium mb-1">
                      <span className="text-blue-600">{log.who}</span> ({log.role}) → 
                      <span className="text-orange-600 ml-1">{log.action}</span> → 
                      <span className="text-purple-600 ml-1">{log.entity}</span>
                    </div>
                    <div className="text-xs text-gray-600 space-y-1">
                      <div>Tenant: <span className="font-medium">{log.tenantName || 'Platform'}</span></div>
                      <div>IP: <span className="font-mono">{log.ipAddress}</span></div>
                      <div>Time: <span className="font-medium">{log.timestamp.toLocaleString()}</span></div>
                    </div>
                  </div>
                  <div className="text-right text-xs text-gray-500">
                    <div>{log.timestamp.toLocaleTimeString()}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Integrity Check */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 flex items-center">
              <DollarSign className="w-5 h-5 mr-2 text-green-600" />
              Financial Integrity
            </h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div>
                <p className="text-sm text-green-700 font-medium">Total Transactions</p>
                <p className="text-xl font-bold text-green-900">
                  {financialIntegrity?.totalTransactions?.toLocaleString() || 0}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-green-600">
                  {formatCurrency(financialIntegrity?.totalAmount || 0)}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <div>
                <p className="text-sm text-red-700 font-medium">Discrepancies</p>
                <p className="text-xl font-bold text-red-900">
                  {financialIntegrity?.discrepancies || 0}
                </p>
              </div>
              <div className="bg-red-500 p-2 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-white" />
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div>
                <p className="text-sm text-yellow-700 font-medium">Pending Reconciliation</p>
                <p className="text-xl font-bold text-yellow-900">
                  {financialIntegrity?.pendingReconciliation || 0}
                </p>
              </div>
              <div className="bg-yellow-500 p-2 rounded-lg">
                <Clock className="w-4 h-4 text-white" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-700 font-medium">Refund Rate</p>
                <p className="text-lg font-bold text-blue-900">
                  {financialIntegrity?.refundRate || 0}%
                </p>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <p className="text-xs text-purple-700 font-medium">Chargeback Rate</p>
                <p className="text-lg font-bold text-purple-900">
                  {financialIntegrity?.chargebackRate || 0}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cross-Tenant Overview */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 flex items-center">
            <Building2 className="w-5 h-5 mr-2 text-blue-600" />
            Cross-Tenant Overview
          </h3>
          <p className="text-sm text-gray-600 mt-1">Platform-wide visibility across all tenants</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tenant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Orders
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Users
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Risk Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Activity
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tenantOverview.map((tenant) => (
                <tr key={tenant._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{tenant.businessName}</div>
                      <div className="text-sm text-gray-500">{tenant.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {tenant.totalOrders.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(tenant.totalRevenue)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {tenant.activeUsers}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      tenant.status === 'active' ? 'text-green-700 bg-green-100' :
                      tenant.status === 'inactive' ? 'text-gray-700 bg-gray-100' :
                      'text-red-700 bg-red-100'
                    }`}>
                      {tenant.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskScoreColor(tenant.riskScore)}`}>
                      {tenant.riskScore}/5
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {tenant.lastActivity.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md p-6 hover:shadow-lg transition-all hover:scale-105 group text-white">
          <div className="flex items-center justify-between">
            <div className="text-left">
              <p className="text-sm text-blue-100 font-semibold uppercase tracking-wide">Security Audit</p>
              <p className="text-lg font-bold mt-1">View Security Logs</p>
            </div>
            <div className="bg-white/20 p-3 rounded-lg group-hover:bg-white/30 transition-colors">
              <Shield className="w-6 h-6 text-white" />
            </div>
          </div>
        </button>

        <button className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-md p-6 hover:shadow-lg transition-all hover:scale-105 group text-white">
          <div className="flex items-center justify-between">
            <div className="text-left">
              <p className="text-sm text-green-100 font-semibold uppercase tracking-wide">Compliance Report</p>
              <p className="text-lg font-bold mt-1">Generate Report</p>
            </div>
            <div className="bg-white/20 p-3 rounded-lg group-hover:bg-white/30 transition-colors">
              <FileText className="w-6 h-6 text-white" />
            </div>
          </div>
        </button>

        <button className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-md p-6 hover:shadow-lg transition-all hover:scale-105 group text-white">
          <div className="flex items-center justify-between">
            <div className="text-left">
              <p className="text-sm text-purple-100 font-semibold uppercase tracking-wide">Export Data</p>
              <p className="text-lg font-bold mt-1">Watermarked Export</p>
            </div>
            <div className="bg-white/20 p-3 rounded-lg group-hover:bg-white/30 transition-colors">
              <Download className="w-6 h-6 text-white" />
            </div>
          </div>
        </button>
      </div>
    </div>
  )
}