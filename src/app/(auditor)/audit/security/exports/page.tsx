'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { 
  Download,
  Search,
  Filter,
  Calendar,
  Eye,
  AlertTriangle,
  FileText,
  Database,
  Shield,
  User,
  Clock,
  Activity,
  TrendingUp,
  CheckCircle,
  XCircle,
  Globe,
  HardDrive
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
  Cell
} from 'recharts'

interface DataExportEvent {
  _id: string
  exportId: string
  exportType: 'audit_logs' | 'user_data' | 'financial_data' | 'system_logs' | 'compliance_report' | 'security_report'
  requestedBy: {
    id: string
    name: string
    email: string
    role: string
    ipAddress: string
  }
  dataScope: {
    dateRange: {
      startDate: Date
      endDate: Date
    }
    tenants: string[]
    dataTypes: string[]
    recordCount: number
    estimatedSize: string
  }
  exportFormat: 'csv' | 'json' | 'pdf' | 'excel'
  status: 'requested' | 'processing' | 'completed' | 'failed' | 'cancelled'
  security: {
    accessLevel: 'public' | 'internal' | 'confidential' | 'restricted'
    encryptionUsed: boolean
    watermarkApplied: boolean
    accessRestrictions: string[]
  }
  compliance: {
    gdprCompliant: boolean
    dataMinimization: boolean
    purposeLimitation: string
    retentionPeriod: number // days
    approvalRequired: boolean
    approvedBy?: string
  }
  timeline: {
    requestedAt: Date
    processedAt?: Date
    completedAt?: Date
    downloadedAt?: Date
    expiresAt: Date
  }
  downloadInfo: {
    downloadCount: number
    lastDownloadAt?: Date
    downloadedBy: string[]
    fileSize?: string
    checksum?: string
  }
  auditTrail: {
    id: string
    timestamp: Date
    action: string
    performedBy: string
    details: string
  }[]
  riskAssessment: {
    riskLevel: 'low' | 'medium' | 'high' | 'critical'
    riskFactors: string[]
    mitigationMeasures: string[]
    reviewRequired: boolean
  }
}

export default function DataExportEventsPage() {
  const [exports, setExports] = useState<DataExportEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedRisk, setSelectedRisk] = useState('all')
  const [dateRange, setDateRange] = useState('30d')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [stats, setStats] = useState({
    totalExports: 0,
    activeExports: 0,
    highRiskExports: 0,
    complianceRate: 0,
    avgProcessingTime: 0,
    dataVolume: '0 GB'
  })

  useEffect(() => {
    fetchDataExports()
  }, [page, selectedType, selectedStatus, selectedRisk, dateRange, searchQuery])

  const fetchDataExports = async () => {
    try {
      setLoading(true)
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(selectedType !== 'all' && { type: selectedType }),
        ...(selectedStatus !== 'all' && { status: selectedStatus }),
        ...(selectedRisk !== 'all' && { risk: selectedRisk }),
        ...(searchQuery && { search: searchQuery }),
        range: dateRange
      })

      const response = await fetch(`/api/superadmin/audit/security/exports?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth-storage') ? JSON.parse(localStorage.getItem('auth-storage')).state?.token : ''}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch data export events')
      }
      
      const data = await response.json()
      
      if (data.success) {
        setExports(data.data.exports)
        setStats(data.data.stats)
        setTotalPages(data.data.pagination.pages)
      } else {
        throw new Error(data.message || 'Failed to fetch data export events')
      }
      
    } catch (error) {
      console.error('Error fetching data export events:', error)
      // Fallback to mock data
      const mockExports: DataExportEvent[] = [
        {
          _id: '1',
          exportId: 'EXP-2024-001',
          exportType: 'audit_logs',
          requestedBy: {
            id: 'auditor1',
            name: 'Jane Smith',
            email: 'jane@laundrylobby.com',
            role: 'Platform Auditor',
            ipAddress: '192.168.1.100'
          },
          dataScope: {
            dateRange: {
              startDate: new Date(2024, 0, 1),
              endDate: new Date(2024, 0, 31)
            },
            tenants: ['tenant1', 'tenant2', 'tenant3'],
            dataTypes: ['user_actions', 'system_events', 'security_logs'],
            recordCount: 125000,
            estimatedSize: '45.2 MB'
          },
          exportFormat: 'csv',
          status: 'completed',
          security: {
            accessLevel: 'confidential',
            encryptionUsed: true,
            watermarkApplied: true,
            accessRestrictions: ['ip_whitelist', 'time_limited', 'download_limit']
          },
          compliance: {
            gdprCompliant: true,
            dataMinimization: true,
            purposeLimitation: 'Compliance audit and security review',
            retentionPeriod: 90,
            approvalRequired: true,
            approvedBy: 'compliance@laundrylobby.com'
          },
          timeline: {
            requestedAt: new Date(2024, 0, 15, 10, 30),
            processedAt: new Date(2024, 0, 15, 10, 35),
            completedAt: new Date(2024, 0, 15, 11, 15),
            downloadedAt: new Date(2024, 0, 15, 11, 20),
            expiresAt: new Date(2024, 0, 22, 11, 15)
          },
          downloadInfo: {
            downloadCount: 2,
            lastDownloadAt: new Date(2024, 0, 16, 9, 30),
            downloadedBy: ['jane@laundrylobby.com', 'compliance@laundrylobby.com'],
            fileSize: '45.2 MB',
            checksum: 'sha256:a1b2c3d4e5f6...'
          },
          auditTrail: [
            {
              id: 'audit1',
              timestamp: new Date(2024, 0, 15, 10, 30),
              action: 'Export Requested',
              performedBy: 'jane@laundrylobby.com',
              details: 'Audit logs export requested for compliance review'
            },
            {
              id: 'audit2',
              timestamp: new Date(2024, 0, 15, 11, 20),
              action: 'File Downloaded',
              performedBy: 'jane@laundrylobby.com',
              details: 'Export file downloaded from secure portal'
            }
          ],
          riskAssessment: {
            riskLevel: 'medium',
            riskFactors: ['large_dataset', 'sensitive_data', 'external_access'],
            mitigationMeasures: ['encryption', 'watermarking', 'access_controls', 'audit_logging'],
            reviewRequired: true
          }
        },
        {
          _id: '2',
          exportId: 'EXP-2024-002',
          exportType: 'financial_data',
          requestedBy: {
            id: 'finance1',
            name: 'Robert Chen',
            email: 'robert@laundrylobby.com',
            role: 'Platform Finance Admin',
            ipAddress: '192.168.1.105'
          },
          dataScope: {
            dateRange: {
              startDate: new Date(2024, 0, 1),
              endDate: new Date(2024, 0, 31)
            },
            tenants: ['all'],
            dataTypes: ['transactions', 'refunds', 'settlements'],
            recordCount: 89000,
            estimatedSize: '67.8 MB'
          },
          exportFormat: 'excel',
          status: 'processing',
          security: {
            accessLevel: 'restricted',
            encryptionUsed: true,
            watermarkApplied: true,
            accessRestrictions: ['ip_whitelist', 'mfa_required', 'approval_required']
          },
          compliance: {
            gdprCompliant: true,
            dataMinimization: true,
            purposeLimitation: 'Financial reporting and tax compliance',
            retentionPeriod: 180,
            approvalRequired: true,
            approvedBy: 'cfo@laundrylobby.com'
          },
          timeline: {
            requestedAt: new Date(2024, 0, 16, 14, 15),
            processedAt: new Date(2024, 0, 16, 14, 20),
            expiresAt: new Date(2024, 0, 23, 14, 15)
          },
          downloadInfo: {
            downloadCount: 0,
            downloadedBy: []
          },
          auditTrail: [
            {
              id: 'audit3',
              timestamp: new Date(2024, 0, 16, 14, 15),
              action: 'Export Requested',
              performedBy: 'robert@laundrylobby.com',
              details: 'Financial data export for monthly reporting'
            },
            {
              id: 'audit4',
              timestamp: new Date(2024, 0, 16, 14, 20),
              action: 'Processing Started',
              performedBy: 'system',
              details: 'Export processing initiated with high security controls'
            }
          ],
          riskAssessment: {
            riskLevel: 'high',
            riskFactors: ['financial_data', 'pii_included', 'large_scope', 'regulatory_data'],
            mitigationMeasures: ['strong_encryption', 'approval_workflow', 'access_logging', 'time_limits'],
            reviewRequired: true
          }
        }
      ]

      const mockStats = {
        totalExports: 234,
        activeExports: 12,
        highRiskExports: 45,
        complianceRate: 98.5,
        avgProcessingTime: 8.5,
        dataVolume: '2.3 TB'
      }

      setExports(mockExports)
      setStats(mockStats)
      setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-700 bg-green-100'
      case 'processing': return 'text-blue-700 bg-blue-100'
      case 'requested': return 'text-yellow-700 bg-yellow-100'
      case 'failed': return 'text-red-700 bg-red-100'
      case 'cancelled': return 'text-gray-700 bg-gray-100'
      default: return 'text-gray-700 bg-gray-100'
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'critical': return 'text-red-700 bg-red-100 border-red-300'
      case 'high': return 'text-red-700 bg-red-100'
      case 'medium': return 'text-orange-700 bg-orange-100'
      case 'low': return 'text-green-700 bg-green-100'
      default: return 'text-gray-700 bg-gray-100'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'audit_logs': return 'text-blue-700 bg-blue-100'
      case 'user_data': return 'text-purple-700 bg-purple-100'
      case 'financial_data': return 'text-green-700 bg-green-100'
      case 'system_logs': return 'text-gray-700 bg-gray-100'
      case 'compliance_report': return 'text-indigo-700 bg-indigo-100'
      case 'security_report': return 'text-red-700 bg-red-100'
      default: return 'text-gray-700 bg-gray-100'
    }
  }

  const getAccessLevelColor = (level: string) => {
    switch (level) {
      case 'restricted': return 'text-red-700 bg-red-100'
      case 'confidential': return 'text-orange-700 bg-orange-100'
      case 'internal': return 'text-blue-700 bg-blue-100'
      case 'public': return 'text-green-700 bg-green-100'
      default: return 'text-gray-700 bg-gray-100'
    }
  }

  const COLORS = ['#EF4444', '#F97316', '#EAB308', '#22C55E', '#3B82F6']

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
              <Download className="w-8 h-8 mr-3" />
              Data Export Events
            </h1>
            <p className="text-blue-100 mt-2">
              Comprehensive tracking of all data export activities and security monitoring
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-blue-100">Compliance Rate: {stats.complianceRate}%</p>
            <p className="text-xs text-blue-200">Export Monitoring</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-sm p-4 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Total</p>
              <p className="text-xl font-bold text-blue-900 mt-1">{stats.totalExports}</p>
            </div>
            <Download className="w-5 h-5 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl shadow-sm p-4 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-orange-700 uppercase tracking-wide">Active</p>
              <p className="text-xl font-bold text-orange-900 mt-1">{stats.activeExports}</p>
            </div>
            <Activity className="w-5 h-5 text-orange-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl shadow-sm p-4 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-red-700 uppercase tracking-wide">High Risk</p>
              <p className="text-xl font-bold text-red-900 mt-1">{stats.highRiskExports}</p>
            </div>
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-sm p-4 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-green-700 uppercase tracking-wide">Compliance</p>
              <p className="text-xl font-bold text-green-900 mt-1">{stats.complianceRate}%</p>
            </div>
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-sm p-4 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide">Avg Time</p>
              <p className="text-xl font-bold text-purple-900 mt-1">{stats.avgProcessingTime}m</p>
            </div>
            <Clock className="w-5 h-5 text-purple-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl shadow-sm p-4 border border-indigo-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wide">Volume</p>
              <p className="text-xl font-bold text-indigo-900 mt-1">{stats.dataVolume}</p>
            </div>
            <HardDrive className="w-5 h-5 text-indigo-600" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Export Trends */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
            Export Activity Trends
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={[
                { month: 'Jan', exports: 45, high_risk: 12, failed: 2 },
                { month: 'Feb', exports: 52, high_risk: 15, failed: 1 },
                { month: 'Mar', exports: 38, high_risk: 8, failed: 3 },
                { month: 'Apr', exports: 61, high_risk: 18, failed: 2 },
                { month: 'May', exports: 47, high_risk: 11, failed: 1 },
                { month: 'Jun', exports: 55, high_risk: 14, failed: 2 }
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="exports" stroke="#3B82F6" strokeWidth={2} />
                <Line type="monotone" dataKey="high_risk" stroke="#F97316" strokeWidth={2} />
                <Line type="monotone" dataKey="failed" stroke="#EF4444" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Export Types */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <Database className="w-5 h-5 mr-2 text-purple-600" />
            Export Types Distribution
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Audit Logs', value: 35, color: '#3B82F6' },
                    { name: 'Financial Data', value: 25, color: '#10B981' },
                    { name: 'User Data', value: 20, color: '#8B5CF6' },
                    { name: 'System Logs', value: 12, color: '#6B7280' },
                    { name: 'Reports', value: 8, color: '#F59E0B' }
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
              placeholder="Search exports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            <option value="audit_logs">Audit Logs</option>
            <option value="user_data">User Data</option>
            <option value="financial_data">Financial Data</option>
            <option value="system_logs">System Logs</option>
            <option value="compliance_report">Compliance Report</option>
            <option value="security_report">Security Report</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="requested">Requested</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={selectedRisk}
            onChange={(e) => setSelectedRisk(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Risk Levels</option>
            <option value="low">Low Risk</option>
            <option value="medium">Medium Risk</option>
            <option value="high">High Risk</option>
            <option value="critical">Critical Risk</option>
          </select>

          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last Year</option>
          </select>

          <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Export Events List */}
      <div className="space-y-4">
        {exports.map((exportEvent) => (
          <div key={exportEvent._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {/* Header */}
                <div className="flex items-center space-x-3 mb-3">
                  <span className="font-mono text-sm text-gray-600">{exportEvent.exportId}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(exportEvent.status)}`}>
                    {exportEvent.status.toUpperCase()}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(exportEvent.exportType)}`}>
                    {exportEvent.exportType.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(exportEvent.riskAssessment.riskLevel)}`}>
                    {exportEvent.riskAssessment.riskLevel.toUpperCase()} RISK
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAccessLevelColor(exportEvent.security.accessLevel)}`}>
                    {exportEvent.security.accessLevel.toUpperCase()}
                  </span>
                </div>

                {/* Requester Info */}
                <div className="mb-4">
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-gray-900">{exportEvent.requestedBy.name}</span>
                      <span className="text-gray-600">({exportEvent.requestedBy.role})</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Globe className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{exportEvent.requestedBy.ipAddress}</span>
                    </div>
                  </div>
                </div>

                {/* Data Scope */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Data Scope</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="text-center p-2 bg-blue-50 rounded">
                      <p className="text-xs text-blue-700">Records</p>
                      <p className="text-sm font-bold text-blue-900">{exportEvent.dataScope.recordCount.toLocaleString()}</p>
                    </div>
                    <div className="text-center p-2 bg-green-50 rounded">
                      <p className="text-xs text-green-700">Size</p>
                      <p className="text-sm font-bold text-green-900">{exportEvent.dataScope.estimatedSize}</p>
                    </div>
                    <div className="text-center p-2 bg-purple-50 rounded">
                      <p className="text-xs text-purple-700">Tenants</p>
                      <p className="text-sm font-bold text-purple-900">{exportEvent.dataScope.tenants.length}</p>
                    </div>
                    <div className="text-center p-2 bg-orange-50 rounded">
                      <p className="text-xs text-orange-700">Format</p>
                      <p className="text-sm font-bold text-orange-900">{exportEvent.exportFormat.toUpperCase()}</p>
                    </div>
                  </div>
                </div>

                {/* Security & Compliance */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Security & Compliance</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <h5 className="text-xs font-medium text-blue-700 mb-1">Security Measures</h5>
                      <div className="flex flex-wrap gap-1">
                        {exportEvent.security.encryptionUsed && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">Encrypted</span>
                        )}
                        {exportEvent.security.watermarkApplied && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">Watermarked</span>
                        )}
                        {exportEvent.security.accessRestrictions.map((restriction, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                            {restriction.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <h5 className="text-xs font-medium text-green-700 mb-1">Compliance</h5>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-green-800">GDPR Compliant</span>
                          {exportEvent.compliance.gdprCompliant ? (
                            <CheckCircle className="w-3 h-3 text-green-600" />
                          ) : (
                            <XCircle className="w-3 h-3 text-red-600" />
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-green-800">Data Minimization</span>
                          {exportEvent.compliance.dataMinimization ? (
                            <CheckCircle className="w-3 h-3 text-green-600" />
                          ) : (
                            <XCircle className="w-3 h-3 text-red-600" />
                          )}
                        </div>
                        <p className="text-xs text-green-700">Retention: {exportEvent.compliance.retentionPeriod} days</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Timeline</h4>
                  <div className="flex items-center space-x-4 text-xs text-gray-600">
                    <div>
                      <span className="font-medium">Requested:</span>
                      <span className="ml-1">{exportEvent.timeline.requestedAt.toLocaleString()}</span>
                    </div>
                    {exportEvent.timeline.completedAt && (
                      <div>
                        <span className="font-medium">Completed:</span>
                        <span className="ml-1">{exportEvent.timeline.completedAt.toLocaleString()}</span>
                      </div>
                    )}
                    <div>
                      <span className="font-medium">Expires:</span>
                      <span className="ml-1">{exportEvent.timeline.expiresAt.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Download Info */}
                {exportEvent.downloadInfo.downloadCount > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Download Activity</h4>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-700">Downloads: {exportEvent.downloadInfo.downloadCount}</span>
                        <span className="text-xs text-gray-500">
                          Last: {exportEvent.downloadInfo.lastDownloadAt?.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {exportEvent.downloadInfo.downloadedBy.map((user, index) => (
                          <span key={index} className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded">
                            {user}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Risk Assessment */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Risk Assessment</h4>
                  <div className="bg-orange-50 p-3 rounded-lg">
                    <div className="flex flex-wrap gap-1 mb-2">
                      {exportEvent.riskAssessment.riskFactors.map((factor, index) => (
                        <span key={index} className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded">
                          {factor.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {exportEvent.riskAssessment.mitigationMeasures.map((measure, index) => (
                        <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                          {measure.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions & Status */}
              <div className="flex flex-col items-end space-y-2 ml-4">
                <button className="text-blue-600 hover:text-blue-800 p-2 rounded-md hover:bg-blue-50">
                  <Eye className="w-4 h-4" />
                </button>
                <div className="text-xs text-gray-500 text-right">
                  <div>Requested:</div>
                  <div>{exportEvent.timeline.requestedAt.toLocaleDateString()}</div>
                  <div className="text-gray-400">{exportEvent.timeline.requestedAt.toLocaleTimeString()}</div>
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