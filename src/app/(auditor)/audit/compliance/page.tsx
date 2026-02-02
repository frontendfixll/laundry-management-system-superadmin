'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { superAdminApi } from '@/lib/superAdminApi'
import { 
  Shield,
  CheckCircle,
  AlertTriangle,
  Clock,
  FileText,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Download,
  Calendar,
  Filter,
  Search,
  Eye,
  Edit,
  AlertCircle
} from 'lucide-react'
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

interface ComplianceOverview {
  framework: string
  total: number
  compliant: number
  nonCompliant: number
  pendingReview: number
  highRisk: number
  overdue: number
  complianceRate: number
}

interface ComplianceRecord {
  _id: string
  framework: string
  requirement: string
  description: string
  category: string
  status: 'compliant' | 'non_compliant' | 'pending_review' | 'in_progress'
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  lastAssessment: {
    date: string
    assessedBy: string
    method: string
    notes: string
  }
  nextReview: string
  reviewFrequency: string
  scoreWeight: number
  remediation?: {
    required: boolean
    plan: string
    assignedTo: string
    dueDate: string
    status: string
  }
}

interface RiskDistribution {
  _id: string
  count: number
}

export default function ComplianceDashboardPage() {
  const { token } = useAuthStore()
  const [overview, setOverview] = useState<ComplianceOverview[]>([])
  const [records, setRecords] = useState<ComplianceRecord[]>([])
  const [riskDistribution, setRiskDistribution] = useState<RiskDistribution[]>([])
  const [complianceScore, setComplianceScore] = useState(0)
  const [overdueReviews, setOverdueReviews] = useState(0)
  const [loading, setLoading] = useState(true)
  const [selectedFramework, setSelectedFramework] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchComplianceData()
  }, [])

  const fetchComplianceData = async () => {
    try {
      setLoading(true)
      
      const data = await superAdminApi.getAuditCompliance()
      
      if (data.success) {
        setOverview(data.data.overview)
        setRecords(data.data.recentAssessments)
        setRiskDistribution(data.data.riskDistribution)
        setComplianceScore(data.data.complianceScore)
        setOverdueReviews(data.data.overdueReviews)
        
        console.log('✅ Successfully loaded real compliance data')
      } else {
        throw new Error(data.message || 'Failed to fetch compliance data')
      }
    } catch (error) {
      console.error('❌ Error fetching compliance data:', error)
      
      // Show empty state instead of mock data
      setOverview([])
      setRecords([])
      setRiskDistribution([])
      setComplianceScore(0)
      setOverdueReviews(0)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'text-green-700 bg-green-100 border-green-200'
      case 'non_compliant': return 'text-red-700 bg-red-100 border-red-200'
      case 'pending_review': return 'text-yellow-700 bg-yellow-100 border-yellow-200'
      case 'in_progress': return 'text-blue-700 bg-blue-100 border-blue-200'
      default: return 'text-gray-700 bg-gray-100 border-gray-200'
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-700 bg-green-100'
      case 'medium': return 'text-yellow-700 bg-yellow-100'
      case 'high': return 'text-orange-700 bg-orange-100'
      case 'critical': return 'text-red-700 bg-red-100'
      default: return 'text-gray-700 bg-gray-100'
    }
  }

  const COLORS = ['#10B981', '#F59E0B', '#EF4444', '#8B5CF6']

  const filteredRecords = records.filter(record => {
    const matchesFramework = selectedFramework === 'all' || record.framework === selectedFramework
    const matchesStatus = selectedStatus === 'all' || record.status === selectedStatus
    const matchesSearch = searchQuery === '' || 
      record.requirement.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesFramework && matchesStatus && matchesSearch
  })

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
              <Shield className="w-8 h-8 mr-3" />
              Compliance Dashboard
            </h1>
            <p className="text-purple-100 mt-2">
              Advanced compliance tracking and regulatory oversight
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-purple-100">Overall Compliance Score</p>
            <p className="text-3xl font-bold">{complianceScore.toFixed(1)}%</p>
            <p className="text-xs text-purple-200">
              {overdueReviews} overdue reviews
            </p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-sm p-5 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-green-700 uppercase tracking-wide">Compliant</p>
              <p className="text-2xl font-bold text-green-900 mt-1">
                {overview.reduce((sum, o) => sum + o.compliant, 0)}
              </p>
              <p className="text-xs text-green-600 mt-1">
                {overview.length} frameworks
              </p>
            </div>
            <div className="bg-green-500 p-3 rounded-lg">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl shadow-sm p-5 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-red-700 uppercase tracking-wide">Non-Compliant</p>
              <p className="text-2xl font-bold text-red-900 mt-1">
                {overview.reduce((sum, o) => sum + o.nonCompliant, 0)}
              </p>
              <p className="text-xs text-red-600 mt-1">
                {overview.reduce((sum, o) => sum + o.highRisk, 0)} high risk
              </p>
            </div>
            <div className="bg-red-500 p-3 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl shadow-sm p-5 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-yellow-700 uppercase tracking-wide">Pending Review</p>
              <p className="text-2xl font-bold text-yellow-900 mt-1">
                {overview.reduce((sum, o) => sum + o.pendingReview, 0)}
              </p>
              <p className="text-xs text-yellow-600 mt-1">
                {overdueReviews} overdue
              </p>
            </div>
            <div className="bg-yellow-500 p-3 rounded-lg">
              <Clock className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-sm p-5 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Total Requirements</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">
                {overview.reduce((sum, o) => sum + o.total, 0)}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Across all frameworks
              </p>
            </div>
            <div className="bg-blue-500 p-3 rounded-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Framework Compliance */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
            Framework Compliance Rates
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={overview}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="framework" />
                <YAxis />
                <Tooltip formatter={(value: any) => [`${value}%`, 'Compliance Rate']} />
                <Bar dataKey="complianceRate" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2 text-orange-600" />
            Risk Distribution
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ _id, count }) => `${_id}: ${count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {riskDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Framework Overview */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">Framework Overview</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Framework
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Compliant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Non-Compliant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pending
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Compliance Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  High Risk
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {overview.map((framework) => (
                <tr key={framework.framework} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{framework.framework}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {framework.total}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 rounded-full text-xs font-medium text-green-700 bg-green-100">
                      {framework.compliant}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 rounded-full text-xs font-medium text-red-700 bg-red-100">
                      {framework.nonCompliant}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 rounded-full text-xs font-medium text-yellow-700 bg-yellow-100">
                      {framework.pendingReview}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${framework.complianceRate}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-900">{framework.complianceRate.toFixed(1)}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {framework.highRisk > 0 ? (
                      <span className="px-2 py-1 rounded-full text-xs font-medium text-red-700 bg-red-100">
                        {framework.highRisk}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-500">None</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex items-center space-x-2">
            <Search className="w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search requirements..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          
          <select
            value={selectedFramework}
            onChange={(e) => setSelectedFramework(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Frameworks</option>
            <option value="GDPR">GDPR</option>
            <option value="PCI_DSS">PCI DSS</option>
            <option value="SOC2_TYPE_II">SOC 2 Type II</option>
            <option value="CCPA">CCPA</option>
          </select>
          
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Status</option>
            <option value="compliant">Compliant</option>
            <option value="non_compliant">Non-Compliant</option>
            <option value="pending_review">Pending Review</option>
            <option value="in_progress">In Progress</option>
          </select>
          
          <button className="bg-purple-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-purple-700 transition-colors flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {/* Compliance Requirements */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">Compliance Requirements</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Requirement
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Framework
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Risk Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Assessment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Next Review
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRecords.map((record) => (
                <tr key={record._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{record.requirement}</div>
                      <div className="text-sm text-gray-500">{record.description}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 rounded-full text-xs font-medium text-blue-700 bg-blue-100">
                      {record.framework}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(record.status)}`}>
                      {record.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(record.riskLevel)}`}>
                      {record.riskLevel.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(record.lastAssessment.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(record.nextReview).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button className="text-blue-600 hover:text-blue-900 mr-3">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="text-green-600 hover:text-green-900">
                      <Edit className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}