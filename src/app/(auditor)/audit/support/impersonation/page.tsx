'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { 
  UserCircle,
  Search,
  Filter,
  Calendar,
  Download,
  AlertTriangle,
  Eye,
  Clock,
  Shield,
  Activity,
  TrendingUp,
  TrendingDown,
  Users,
  Target,
  CheckCircle,
  XCircle,
  Globe,
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

interface ImpersonationLog {
  _id: string
  sessionId: string
  impersonator: {
    id: string
    name: string
    email: string
    role: string
    ipAddress: string
    userAgent: string
  }
  targetUser: {
    id: string
    name: string
    email: string
    role: string
    tenantId: string
    tenantName: string
  }
  impersonationReason: 'customer_support' | 'technical_assistance' | 'account_recovery' | 'compliance_check' | 'security_investigation' | 'training_demo'
  approvalStatus: 'auto_approved' | 'manager_approved' | 'emergency_access' | 'pending_approval' | 'rejected'
  approvedBy?: {
    id: string
    name: string
    email: string
    role: string
  }
  session: {
    startedAt: Date
    endedAt?: Date
    duration?: number // minutes
    status: 'active' | 'ended' | 'terminated' | 'expired'
    terminationReason?: 'manual' | 'timeout' | 'security_breach' | 'policy_violation'
  }
  activities: {
    id: string
    timestamp: Date
    action: string
    resource: string
    details: string
    riskLevel: 'low' | 'medium' | 'high' | 'critical'
    ipAddress: string
  }[]
  security: {
    riskScore: number
    flaggedActivities: number
    sensitiveDataAccessed: boolean
    privilegeEscalation: boolean
    unusualBehavior: boolean
    complianceViolations: string[]
  }
  compliance: {
    gdprNotificationSent: boolean
    auditTrailComplete: boolean
    customerConsent: boolean
    dataAccessLogged: boolean
    retentionPolicyApplied: boolean
  }
  monitoring: {
    screenshotsTaken: number
    keystrokesLogged: boolean
    networkActivityMonitored: boolean
    fileAccessTracked: boolean
    alertsTriggered: string[]
  }
  metadata: {
    createdAt: Date
    updatedAt: Date
    version: number
  }
}

export default function ImpersonationLogsPage() {
  const [logs, setLogs] = useState<ImpersonationLog[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedReason, setSelectedReason] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedRisk, setSelectedRisk] = useState('all')
  const [dateRange, setDateRange] = useState('30d')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [stats, setStats] = useState({
    totalSessions: 0,
    activeSessions: 0,
    highRiskSessions: 0,
    avgDuration: 0,
    complianceRate: 0,
    flaggedActivities: 0
  })

  useEffect(() => {
    fetchImpersonationLogs()
  }, [page, selectedReason, selectedStatus, selectedRisk, dateRange, searchQuery])

  const fetchImpersonationLogs = async () => {
    try {
      setLoading(true)
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(selectedReason !== 'all' && { reason: selectedReason }),
        ...(selectedStatus !== 'all' && { status: selectedStatus }),
        ...(selectedRisk !== 'all' && { risk: selectedRisk }),
        ...(searchQuery && { search: searchQuery }),
        range: dateRange
      })

      const response = await fetch(`/api/superadmin/audit/support/impersonation?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth-storage') ? JSON.parse(localStorage.getItem('auth-storage')).state?.token : ''}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch impersonation logs')
      }
      
      const data = await response.json()
      
      if (data.success) {
        setLogs(data.data.logs)
        setStats(data.data.stats)
        setTotalPages(data.data.pagination.pages)
      } else {
        throw new Error(data.message || 'Failed to fetch impersonation logs')
      }
      
    } catch (error) {
      console.error('Error fetching impersonation logs:', error)
      // Fallback to mock data
      const mockLogs: ImpersonationLog[] = [
        {
          _id: '1',
          sessionId: 'IMP-2024-001',
          impersonator: {
            id: 'support1',
            name: 'Sarah Johnson',
            email: 'sarah@laundrylobby.com',
            role: 'Platform Support',
            ipAddress: '192.168.1.100',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          },
          targetUser: {
            id: 'user1',
            name: 'John Smith',
            email: 'john@quickwash.com',
            role: 'Customer',
            tenantId: 'tenant1',
            tenantName: 'QuickWash Laundromat'
          },
          impersonationReason: 'customer_support',
          approvalStatus: 'manager_approved',
          approvedBy: {
            id: 'manager1',
            name: 'Mike Wilson',
            email: 'mike@laundrylobby.com',
            role: 'Support Manager'
          },
          session: {
            startedAt: new Date(2024, 0, 15, 14, 30),
            endedAt: new Date(2024, 0, 15, 14, 45),
            duration: 15,
            status: 'ended',
            terminationReason: 'manual'
          },
          activities: [
            {
              id: 'act1',
              timestamp: new Date(2024, 0, 15, 14, 32),
              action: 'View Order History',
              resource: '/orders',
              details: 'Accessed customer order history to investigate payment issue',
              riskLevel: 'low',
              ipAddress: '192.168.1.100'
            },
            {
              id: 'act2',
              timestamp: new Date(2024, 0, 15, 14, 35),
              action: 'Update Payment Method',
              resource: '/payment-methods',
              details: 'Updated expired credit card information',
              riskLevel: 'medium',
              ipAddress: '192.168.1.100'
            },
            {
              id: 'act3',
              timestamp: new Date(2024, 0, 15, 14, 40),
              action: 'Process Refund',
              resource: '/refunds',
              details: 'Processed $25.50 refund for failed order',
              riskLevel: 'high',
              ipAddress: '192.168.1.100'
            }
          ],
          security: {
            riskScore: 6.5,
            flaggedActivities: 1,
            sensitiveDataAccessed: true,
            privilegeEscalation: false,
            unusualBehavior: false,
            complianceViolations: []
          },
          compliance: {
            gdprNotificationSent: true,
            auditTrailComplete: true,
            customerConsent: true,
            dataAccessLogged: true,
            retentionPolicyApplied: true
          },
          monitoring: {
            screenshotsTaken: 8,
            keystrokesLogged: true,
            networkActivityMonitored: true,
            fileAccessTracked: true,
            alertsTriggered: ['sensitive_data_access']
          },
          metadata: {
            createdAt: new Date(2024, 0, 15, 14, 30),
            updatedAt: new Date(2024, 0, 15, 14, 45),
            version: 1
          }
        },
        {
          _id: '2',
          sessionId: 'IMP-2024-002',
          impersonator: {
            id: 'support2',
            name: 'David Chen',
            email: 'david@laundrylobby.com',
            role: 'Senior Support Engineer',
            ipAddress: '192.168.1.105',
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
          },
          targetUser: {
            id: 'admin1',
            name: 'Lisa Rodriguez',
            email: 'lisa@cleanco.com',
            role: 'Tenant Admin',
            tenantId: 'tenant2',
            tenantName: 'CleanCo Services'
          },
          impersonationReason: 'technical_assistance',
          approvalStatus: 'auto_approved',
          session: {
            startedAt: new Date(2024, 0, 16, 9, 15),
            endedAt: new Date(2024, 0, 16, 10, 30),
            duration: 75,
            status: 'ended',
            terminationReason: 'manual'
          },
          activities: [
            {
              id: 'act4',
              timestamp: new Date(2024, 0, 16, 9, 20),
              action: 'Access System Settings',
              resource: '/settings',
              details: 'Reviewed integration configuration settings',
              riskLevel: 'medium',
              ipAddress: '192.168.1.105'
            },
            {
              id: 'act5',
              timestamp: new Date(2024, 0, 16, 9, 45),
              action: 'Update API Configuration',
              resource: '/integrations/api',
              details: 'Fixed webhook endpoint configuration',
              riskLevel: 'high',
              ipAddress: '192.168.1.105'
            },
            {
              id: 'act6',
              timestamp: new Date(2024, 0, 16, 10, 15),
              action: 'Test Integration',
              resource: '/integrations/test',
              details: 'Performed integration test to verify fix',
              riskLevel: 'low',
              ipAddress: '192.168.1.105'
            }
          ],
          security: {
            riskScore: 7.2,
            flaggedActivities: 2,
            sensitiveDataAccessed: true,
            privilegeEscalation: true,
            unusualBehavior: false,
            complianceViolations: ['admin_access_without_explicit_approval']
          },
          compliance: {
            gdprNotificationSent: true,
            auditTrailComplete: true,
            customerConsent: false,
            dataAccessLogged: true,
            retentionPolicyApplied: true
          },
          monitoring: {
            screenshotsTaken: 15,
            keystrokesLogged: true,
            networkActivityMonitored: true,
            fileAccessTracked: true,
            alertsTriggered: ['privilege_escalation', 'admin_access']
          },
          metadata: {
            createdAt: new Date(2024, 0, 16, 9, 15),
            updatedAt: new Date(2024, 0, 16, 10, 30),
            version: 1
          }
        }
      ]

      const mockStats = {
        totalSessions: 89,
        activeSessions: 3,
        highRiskSessions: 12,
        avgDuration: 28.5,
        complianceRate: 94.3,
        flaggedActivities: 23
      }

      setLogs(mockLogs)
      setStats(mockStats)
      setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-700 bg-green-100'
      case 'ended': return 'text-blue-700 bg-blue-100'
      case 'terminated': return 'text-red-700 bg-red-100'
      case 'expired': return 'text-gray-700 bg-gray-100'
      default: return 'text-gray-700 bg-gray-100'
    }
  }

  const getRiskColor = (risk: number) => {
    if (risk >= 8) return 'text-red-700 bg-red-100 border-red-300'
    if (risk >= 6) return 'text-orange-700 bg-orange-100'
    if (risk >= 4) return 'text-yellow-700 bg-yellow-100'
    return 'text-green-700 bg-green-100'
  }

  const getActivityRiskColor = (risk: string) => {
    switch (risk) {
      case 'critical': return 'text-red-700 bg-red-100'
      case 'high': return 'text-orange-700 bg-orange-100'
      case 'medium': return 'text-yellow-700 bg-yellow-100'
      case 'low': return 'text-green-700 bg-green-100'
      default: return 'text-gray-700 bg-gray-100'
    }
  }

  const getApprovalColor = (status: string) => {
    switch (status) {
      case 'auto_approved': return 'text-blue-700 bg-blue-100'
      case 'manager_approved': return 'text-green-700 bg-green-100'
      case 'emergency_access': return 'text-orange-700 bg-orange-100'
      case 'pending_approval': return 'text-yellow-700 bg-yellow-100'
      case 'rejected': return 'text-red-700 bg-red-100'
      default: return 'text-gray-700 bg-gray-100'
    }
  }

  const COLORS = ['#EF4444', '#F97316', '#EAB308', '#22C55E', '#3B82F6']

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center">
              <UserCircle className="w-8 h-8 mr-3" />
              Support Impersonation Logs
            </h1>
            <p className="text-purple-100 mt-2">
              Complete audit trail of all support impersonation sessions and activities
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-purple-100">Compliance Rate: {stats.complianceRate}%</p>
            <p className="text-xs text-purple-200">Security Monitoring</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-sm p-4 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Total</p>
              <p className="text-xl font-bold text-blue-900 mt-1">{stats.totalSessions}</p>
            </div>
            <UserCircle className="w-5 h-5 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-sm p-4 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-green-700 uppercase tracking-wide">Active</p>
              <p className="text-xl font-bold text-green-900 mt-1">{stats.activeSessions}</p>
            </div>
            <Activity className="w-5 h-5 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl shadow-sm p-4 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-red-700 uppercase tracking-wide">High Risk</p>
              <p className="text-xl font-bold text-red-900 mt-1">{stats.highRiskSessions}</p>
            </div>
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-sm p-4 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide">Avg Duration</p>
              <p className="text-xl font-bold text-purple-900 mt-1">{stats.avgDuration}m</p>
            </div>
            <Clock className="w-5 h-5 text-purple-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl shadow-sm p-4 border border-indigo-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wide">Compliance</p>
              <p className="text-xl font-bold text-indigo-900 mt-1">{stats.complianceRate}%</p>
            </div>
            <Shield className="w-5 h-5 text-indigo-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl shadow-sm p-4 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-orange-700 uppercase tracking-wide">Flagged</p>
              <p className="text-xl font-bold text-orange-900 mt-1">{stats.flaggedActivities}</p>
            </div>
            <Zap className="w-5 h-5 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Session Trends */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-purple-600" />
            Impersonation Session Trends
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={[
                { month: 'Jan', sessions: 23, high_risk: 5, flagged: 8 },
                { month: 'Feb', sessions: 18, high_risk: 3, flagged: 6 },
                { month: 'Mar', sessions: 31, high_risk: 7, flagged: 12 },
                { month: 'Apr', sessions: 25, high_risk: 4, flagged: 9 },
                { month: 'May', sessions: 19, high_risk: 2, flagged: 5 },
                { month: 'Jun', sessions: 28, high_risk: 6, flagged: 10 }
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="sessions" stackId="1" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.6} />
                <Area type="monotone" dataKey="high_risk" stackId="2" stroke="#F97316" fill="#F97316" fillOpacity={0.6} />
                <Area type="monotone" dataKey="flagged" stackId="3" stroke="#EF4444" fill="#EF4444" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Impersonation Reasons */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <Target className="w-5 h-5 mr-2 text-indigo-600" />
            Impersonation Reasons
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Customer Support', value: 45, color: '#3B82F6' },
                    { name: 'Technical Assistance', value: 25, color: '#8B5CF6' },
                    { name: 'Account Recovery', value: 15, color: '#10B981' },
                    { name: 'Security Investigation', value: 10, color: '#EF4444' },
                    { name: 'Compliance Check', value: 5, color: '#F59E0B' }
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
              placeholder="Search sessions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          
          <select
            value={selectedReason}
            onChange={(e) => setSelectedReason(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Reasons</option>
            <option value="customer_support">Customer Support</option>
            <option value="technical_assistance">Technical Assistance</option>
            <option value="account_recovery">Account Recovery</option>
            <option value="compliance_check">Compliance Check</option>
            <option value="security_investigation">Security Investigation</option>
            <option value="training_demo">Training Demo</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="ended">Ended</option>
            <option value="terminated">Terminated</option>
            <option value="expired">Expired</option>
          </select>

          <select
            value={selectedRisk}
            onChange={(e) => setSelectedRisk(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Risk Levels</option>
            <option value="low">Low Risk (0-4)</option>
            <option value="medium">Medium Risk (4-6)</option>
            <option value="high">High Risk (6-8)</option>
            <option value="critical">Critical Risk (8+)</option>
          </select>

          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last Year</option>
          </select>

          <button className="bg-purple-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-purple-700 transition-colors flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Impersonation Logs List */}
      <div className="space-y-4">
        {logs.map((log) => (
          <div key={log._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {/* Header */}
                <div className="flex items-center space-x-3 mb-3">
                  <span className="font-mono text-sm text-gray-600">{log.sessionId}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(log.session.status)}`}>
                    {log.session.status.toUpperCase()}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getApprovalColor(log.approvalStatus)}`}>
                    {log.approvalStatus.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(log.security.riskScore)}`}>
                    RISK: {log.security.riskScore}/10
                  </span>
                </div>

                {/* Impersonation Details */}
                <div className="mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Impersonator</h4>
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="flex items-center space-x-2 mb-1">
                          <UserCircle className="w-4 h-4 text-blue-600" />
                          <span className="font-medium text-blue-900">{log.impersonator.name}</span>
                        </div>
                        <p className="text-sm text-blue-800">{log.impersonator.email}</p>
                        <p className="text-xs text-blue-700">{log.impersonator.role}</p>
                        <p className="text-xs text-blue-600">IP: {log.impersonator.ipAddress}</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Target User</h4>
                      <div className="bg-purple-50 p-3 rounded-lg">
                        <div className="flex items-center space-x-2 mb-1">
                          <Users className="w-4 h-4 text-purple-600" />
                          <span className="font-medium text-purple-900">{log.targetUser.name}</span>
                        </div>
                        <p className="text-sm text-purple-800">{log.targetUser.email}</p>
                        <p className="text-xs text-purple-700">{log.targetUser.role} - {log.targetUser.tenantName}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Session Info */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Session Information</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="text-center p-2 bg-green-50 rounded">
                      <p className="text-xs text-green-700">Reason</p>
                      <p className="text-sm font-bold text-green-900">{log.impersonationReason.replace('_', ' ')}</p>
                    </div>
                    <div className="text-center p-2 bg-blue-50 rounded">
                      <p className="text-xs text-blue-700">Duration</p>
                      <p className="text-sm font-bold text-blue-900">{log.session.duration || 'Active'}m</p>
                    </div>
                    <div className="text-center p-2 bg-orange-50 rounded">
                      <p className="text-xs text-orange-700">Activities</p>
                      <p className="text-sm font-bold text-orange-900">{log.activities.length}</p>
                    </div>
                    <div className="text-center p-2 bg-red-50 rounded">
                      <p className="text-xs text-red-700">Flagged</p>
                      <p className="text-sm font-bold text-red-900">{log.security.flaggedActivities}</p>
                    </div>
                  </div>
                </div>

                {/* Recent Activities */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Activities</h4>
                  <div className="space-y-2">
                    {log.activities.slice(0, 3).map((activity) => (
                      <div key={activity.id} className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-900">{activity.action}</span>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded text-xs ${getActivityRiskColor(activity.riskLevel)}`}>
                              {activity.riskLevel}
                            </span>
                            <span className="text-xs text-gray-500">{activity.timestamp.toLocaleTimeString()}</span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-700">{activity.details}</p>
                        <p className="text-xs text-gray-600">Resource: {activity.resource}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Security Assessment */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Security Assessment</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-orange-50 p-3 rounded-lg">
                      <h5 className="text-xs font-medium text-orange-700 mb-2">Risk Factors</h5>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-orange-800">Sensitive Data</span>
                          {log.security.sensitiveDataAccessed ? (
                            <CheckCircle className="w-3 h-3 text-orange-600" />
                          ) : (
                            <XCircle className="w-3 h-3 text-gray-400" />
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-orange-800">Privilege Escalation</span>
                          {log.security.privilegeEscalation ? (
                            <CheckCircle className="w-3 h-3 text-orange-600" />
                          ) : (
                            <XCircle className="w-3 h-3 text-gray-400" />
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-orange-800">Unusual Behavior</span>
                          {log.security.unusualBehavior ? (
                            <CheckCircle className="w-3 h-3 text-orange-600" />
                          ) : (
                            <XCircle className="w-3 h-3 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <h5 className="text-xs font-medium text-green-700 mb-2">Compliance Status</h5>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-green-800">GDPR Notification</span>
                          {log.compliance.gdprNotificationSent ? (
                            <CheckCircle className="w-3 h-3 text-green-600" />
                          ) : (
                            <XCircle className="w-3 h-3 text-red-600" />
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-green-800">Audit Trail</span>
                          {log.compliance.auditTrailComplete ? (
                            <CheckCircle className="w-3 h-3 text-green-600" />
                          ) : (
                            <XCircle className="w-3 h-3 text-red-600" />
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-green-800">Customer Consent</span>
                          {log.compliance.customerConsent ? (
                            <CheckCircle className="w-3 h-3 text-green-600" />
                          ) : (
                            <XCircle className="w-3 h-3 text-red-600" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Monitoring Info */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Monitoring & Alerts</h4>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2">
                      <div className="text-center">
                        <p className="text-xs text-blue-700">Screenshots</p>
                        <p className="text-sm font-bold text-blue-900">{log.monitoring.screenshotsTaken}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-blue-700">Keystrokes</p>
                        <p className="text-sm font-bold text-blue-900">{log.monitoring.keystrokesLogged ? 'Yes' : 'No'}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-blue-700">Network</p>
                        <p className="text-sm font-bold text-blue-900">{log.monitoring.networkActivityMonitored ? 'Yes' : 'No'}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-blue-700">File Access</p>
                        <p className="text-sm font-bold text-blue-900">{log.monitoring.fileAccessTracked ? 'Yes' : 'No'}</p>
                      </div>
                    </div>
                    {log.monitoring.alertsTriggered.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-blue-700 mb-1">Alerts Triggered:</p>
                        <div className="flex flex-wrap gap-1">
                          {log.monitoring.alertsTriggered.map((alert, index) => (
                            <span key={index} className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
                              {alert.replace('_', ' ')}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Approval Info */}
                {log.approvedBy && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Approval Details</h4>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-900">{log.approvedBy.name}</span>
                        <span className="text-xs text-green-700">({log.approvedBy.role})</span>
                      </div>
                      <p className="text-xs text-green-800 mt-1">{log.approvedBy.email}</p>
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
                  <div>Started:</div>
                  <div>{log.session.startedAt.toLocaleDateString()}</div>
                  <div className="text-gray-400">{log.session.startedAt.toLocaleTimeString()}</div>
                  {log.session.endedAt && (
                    <>
                      <div className="mt-1">Ended:</div>
                      <div>{log.session.endedAt.toLocaleDateString()}</div>
                      <div className="text-gray-400">{log.session.endedAt.toLocaleTimeString()}</div>
                    </>
                  )}
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