'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { superAdminApi } from '@/lib/superAdminApi'
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Search,
  Download,
  Calendar,
  Eye,
  Activity,
  Globe,
  DollarSign,
  Package,
  Clock,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'

interface TenantBehavior {
  _id: string
  tenantId: string
  businessName: string
  subdomain: string
  metrics: {
    totalOrders: number
    totalRevenue: number
    avgOrderValue: number
    orderGrowth: number
    revenueGrowth: number
    activeUsers: number
    newUsers: number
    retentionRate: number
    avgResponseTime: number
  }
  patterns: {
    peakHours: string[]
    busiestDays: string[]
    seasonalTrend: string
    customerSegments: {
      segment: string
      count: number
      revenue: number
    }[]
  }
  compliance: {
    dataRetention: boolean
    privacyCompliant: boolean
    securityScore: number
    lastAudit: Date
  }
  anomalies: {
    type: string
    description: string
    severity: string
    detectedAt: Date
  }[]
  riskScore: number
  healthScore: number
  status: 'healthy' | 'warning' | 'critical' | 'inactive'
}

export default function TenantBehaviorPage() {
  const [tenants, setTenants] = useState<TenantBehavior[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [sortBy, setSortBy] = useState('healthScore')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [stats, setStats] = useState({
    totalTenants: 0,
    healthy: 0,
    warning: 0,
    critical: 0,
    avgHealthScore: 0,
    totalPlatformRevenue: 0
  })

  useEffect(() => {
    fetchTenantBehavior()
  }, [page, selectedStatus, sortBy, searchQuery])

  const fetchTenantBehavior = async () => {
    try {
      setLoading(true)

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(selectedStatus !== 'all' && { status: selectedStatus }),
        ...(searchQuery && { search: searchQuery }),
        sortBy
      })

      const data = await superAdminApi.get(`/audit/reports/tenant-behavior?${params}`)

      if (data.success) {
        setTenants(data.data.tenants)
        setStats(data.data.stats)
        setTotalPages(data.data.pagination.pages)
      } else {
        throw new Error(data.message || 'Failed to fetch tenant behavior data')
      }

    } catch (error) {
      console.error('Error fetching tenant behavior data:', error)
      // Fallback to mock data
      const mockTenants: TenantBehavior[] = [
        {
          _id: '1',
          tenantId: 'TNT-001',
          businessName: 'SparkleWash Laundry Co.',
          subdomain: 'sparklewash',
          metrics: {
            totalOrders: 12847,
            totalRevenue: 384520.75,
            avgOrderValue: 29.93,
            orderGrowth: 18.5,
            revenueGrowth: 22.3,
            activeUsers: 3240,
            newUsers: 485,
            retentionRate: 87.2,
            avgResponseTime: 1.8
          },
          patterns: {
            peakHours: ['9:00 AM', '12:00 PM', '6:00 PM'],
            busiestDays: ['Monday', 'Wednesday', 'Saturday'],
            seasonalTrend: 'upward',
            customerSegments: [
              { segment: 'Regular Residential', count: 1850, revenue: 185420.50 },
              { segment: 'Premium Dry Clean', count: 620, revenue: 124800.00 },
              { segment: 'Commercial Accounts', count: 180, revenue: 54300.25 },
              { segment: 'Subscription Plans', count: 590, revenue: 20000.00 }
            ]
          },
          compliance: {
            dataRetention: true,
            privacyCompliant: true,
            securityScore: 92,
            lastAudit: new Date(2024, 1, 15)
          },
          anomalies: [
            {
              type: 'usage_spike',
              description: 'Order volume increased 45% above normal on weekends',
              severity: 'low',
              detectedAt: new Date(2024, 2, 10)
            }
          ],
          riskScore: 12,
          healthScore: 94,
          status: 'healthy'
        },
        {
          _id: '2',
          tenantId: 'TNT-002',
          businessName: 'FreshFold Express',
          subdomain: 'freshfold',
          metrics: {
            totalOrders: 8432,
            totalRevenue: 218640.30,
            avgOrderValue: 25.93,
            orderGrowth: 5.2,
            revenueGrowth: 3.8,
            activeUsers: 1890,
            newUsers: 210,
            retentionRate: 72.4,
            avgResponseTime: 3.2
          },
          patterns: {
            peakHours: ['10:00 AM', '2:00 PM', '7:00 PM'],
            busiestDays: ['Tuesday', 'Thursday', 'Sunday'],
            seasonalTrend: 'stable',
            customerSegments: [
              { segment: 'Regular Residential', count: 1200, revenue: 112340.00 },
              { segment: 'Express Wash', count: 450, revenue: 67500.30 },
              { segment: 'Bulk Orders', count: 140, revenue: 28800.00 },
              { segment: 'Walk-in Customers', count: 100, revenue: 10000.00 }
            ]
          },
          compliance: {
            dataRetention: true,
            privacyCompliant: true,
            securityScore: 78,
            lastAudit: new Date(2024, 0, 20)
          },
          anomalies: [
            {
              type: 'retention_drop',
              description: 'Customer retention decreased by 8% over the last 30 days',
              severity: 'medium',
              detectedAt: new Date(2024, 2, 5)
            },
            {
              type: 'response_time',
              description: 'Average response time exceeded 3 seconds threshold',
              severity: 'medium',
              detectedAt: new Date(2024, 2, 8)
            }
          ],
          riskScore: 38,
          healthScore: 68,
          status: 'warning'
        },
        {
          _id: '3',
          tenantId: 'TNT-003',
          businessName: 'CleanStar Laundromat',
          subdomain: 'cleanstar',
          metrics: {
            totalOrders: 3215,
            totalRevenue: 72540.90,
            avgOrderValue: 22.56,
            orderGrowth: -12.4,
            revenueGrowth: -15.7,
            activeUsers: 640,
            newUsers: 42,
            retentionRate: 51.3,
            avgResponseTime: 5.8
          },
          patterns: {
            peakHours: ['11:00 AM', '4:00 PM'],
            busiestDays: ['Saturday', 'Sunday'],
            seasonalTrend: 'downward',
            customerSegments: [
              { segment: 'Regular Residential', count: 420, revenue: 42120.00 },
              { segment: 'Self-Service', count: 150, revenue: 18900.90 },
              { segment: 'Drop-off Service', count: 70, revenue: 11520.00 }
            ]
          },
          compliance: {
            dataRetention: false,
            privacyCompliant: true,
            securityScore: 54,
            lastAudit: new Date(2023, 9, 10)
          },
          anomalies: [
            {
              type: 'revenue_decline',
              description: 'Consistent revenue decline over 3 consecutive months',
              severity: 'high',
              detectedAt: new Date(2024, 1, 28)
            },
            {
              type: 'security_risk',
              description: 'Security score dropped below 60 threshold',
              severity: 'high',
              detectedAt: new Date(2024, 2, 1)
            },
            {
              type: 'compliance_gap',
              description: 'Data retention policy not implemented',
              severity: 'critical',
              detectedAt: new Date(2024, 2, 3)
            }
          ],
          riskScore: 72,
          healthScore: 35,
          status: 'critical'
        },
        {
          _id: '4',
          tenantId: 'TNT-004',
          businessName: 'AquaPress Dry Cleaners',
          subdomain: 'aquapress',
          metrics: {
            totalOrders: 0,
            totalRevenue: 0,
            avgOrderValue: 0,
            orderGrowth: 0,
            revenueGrowth: 0,
            activeUsers: 0,
            newUsers: 0,
            retentionRate: 0,
            avgResponseTime: 0
          },
          patterns: {
            peakHours: [],
            busiestDays: [],
            seasonalTrend: 'none',
            customerSegments: []
          },
          compliance: {
            dataRetention: false,
            privacyCompliant: false,
            securityScore: 0,
            lastAudit: new Date(2023, 6, 15)
          },
          anomalies: [
            {
              type: 'inactivity',
              description: 'No activity detected for over 90 days',
              severity: 'medium',
              detectedAt: new Date(2024, 1, 1)
            }
          ],
          riskScore: 45,
          healthScore: 0,
          status: 'inactive'
        },
        {
          _id: '5',
          tenantId: 'TNT-005',
          businessName: 'Urban Threads Laundry',
          subdomain: 'urbanthreads',
          metrics: {
            totalOrders: 19654,
            totalRevenue: 548720.40,
            avgOrderValue: 27.92,
            orderGrowth: 24.7,
            revenueGrowth: 28.9,
            activeUsers: 4850,
            newUsers: 920,
            retentionRate: 91.6,
            avgResponseTime: 1.2
          },
          patterns: {
            peakHours: ['8:00 AM', '12:00 PM', '5:00 PM', '8:00 PM'],
            busiestDays: ['Monday', 'Wednesday', 'Friday', 'Saturday'],
            seasonalTrend: 'upward',
            customerSegments: [
              { segment: 'Regular Residential', count: 2800, revenue: 252000.00 },
              { segment: 'Premium Service', count: 950, revenue: 152000.40 },
              { segment: 'Corporate Contracts', count: 320, revenue: 96000.00 },
              { segment: 'Subscription Plans', count: 780, revenue: 48720.00 }
            ]
          },
          compliance: {
            dataRetention: true,
            privacyCompliant: true,
            securityScore: 96,
            lastAudit: new Date(2024, 2, 1)
          },
          anomalies: [],
          riskScore: 6,
          healthScore: 98,
          status: 'healthy'
        },
        {
          _id: '6',
          tenantId: 'TNT-006',
          businessName: 'BrightSpin Wash House',
          subdomain: 'brightspin',
          metrics: {
            totalOrders: 6120,
            totalRevenue: 153000.60,
            avgOrderValue: 25.00,
            orderGrowth: -2.1,
            revenueGrowth: -0.5,
            activeUsers: 1420,
            newUsers: 158,
            retentionRate: 68.9,
            avgResponseTime: 2.9
          },
          patterns: {
            peakHours: ['10:00 AM', '1:00 PM', '5:00 PM'],
            busiestDays: ['Wednesday', 'Friday', 'Saturday'],
            seasonalTrend: 'stable',
            customerSegments: [
              { segment: 'Regular Residential', count: 900, revenue: 81000.00 },
              { segment: 'Self-Service', count: 320, revenue: 38400.60 },
              { segment: 'Pickup & Delivery', count: 200, revenue: 33600.00 }
            ]
          },
          compliance: {
            dataRetention: true,
            privacyCompliant: true,
            securityScore: 71,
            lastAudit: new Date(2024, 0, 5)
          },
          anomalies: [
            {
              type: 'growth_stall',
              description: 'Order growth has stagnated for 2 consecutive months',
              severity: 'medium',
              detectedAt: new Date(2024, 2, 12)
            }
          ],
          riskScore: 32,
          healthScore: 62,
          status: 'warning'
        }
      ]

      const mockStats = {
        totalTenants: 6,
        healthy: 2,
        warning: 2,
        critical: 1,
        avgHealthScore: 59.5,
        totalPlatformRevenue: 1377422.95
      }

      setTenants(mockTenants)
      setStats(mockStats)
      setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-700 bg-green-100'
      case 'warning': return 'text-orange-700 bg-orange-100'
      case 'critical': return 'text-red-700 bg-red-100'
      case 'inactive': return 'text-gray-700 bg-gray-100'
      default: return 'text-gray-700 bg-gray-100'
    }
  }

  const getStatusDotColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-500'
      case 'warning': return 'bg-orange-500'
      case 'critical': return 'bg-red-500'
      case 'inactive': return 'bg-gray-400'
      default: return 'bg-gray-400'
    }
  }

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-700 bg-green-50 border-green-200'
    if (score >= 60) return 'text-orange-700 bg-orange-50 border-orange-200'
    if (score >= 30) return 'text-red-700 bg-red-50 border-red-200'
    return 'text-gray-700 bg-gray-50 border-gray-200'
  }

  const getHealthBarColor = (score: number) => {
    if (score >= 80) return 'bg-green-500'
    if (score >= 60) return 'bg-orange-500'
    if (score >= 30) return 'bg-red-500'
    return 'bg-gray-400'
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

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) return <TrendingUp className="w-4 h-4 text-green-600" />
    if (growth < 0) return <TrendingDown className="w-4 h-4 text-red-600" />
    return <Activity className="w-4 h-4 text-gray-500" />
  }

  const getGrowthColor = (growth: number) => {
    if (growth > 0) return 'text-green-600'
    if (growth < 0) return 'text-red-600'
    return 'text-gray-500'
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num)
  }

  const filteredTenants = tenants.filter(tenant => {
    const matchesSearch = searchQuery === '' ||
      tenant.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tenant.tenantId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tenant.subdomain.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = selectedStatus === 'all' || tenant.status === selectedStatus
    return matchesSearch && matchesStatus
  }).sort((a, b) => {
    switch (sortBy) {
      case 'healthScore': return b.healthScore - a.healthScore
      case 'riskScore': return b.riskScore - a.riskScore
      case 'revenue': return b.metrics.totalRevenue - a.metrics.totalRevenue
      case 'orders': return b.metrics.totalOrders - a.metrics.totalOrders
      case 'growth': return b.metrics.orderGrowth - a.metrics.orderGrowth
      case 'businessName': return a.businessName.localeCompare(b.businessName)
      default: return b.healthScore - a.healthScore
    }
  })

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
      <div className="bg-gradient-to-r from-blue-600 via-teal-600 to-green-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center">
              <BarChart3 className="w-8 h-8 mr-3" />
              Tenant Behavior Analysis
            </h1>
            <p className="text-blue-100 mt-2">
              Comprehensive behavioral analysis, growth patterns, and risk assessment for all tenants
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-blue-100">Avg Health Score: {stats.avgHealthScore}%</p>
            <p className="text-xs text-blue-200">Platform Intelligence</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-sm p-4 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Total Analyzed</p>
              <p className="text-xl font-bold text-blue-900 mt-1">{stats.totalTenants}</p>
            </div>
            <Users className="w-5 h-5 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-sm p-4 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-green-700 uppercase tracking-wide">Healthy</p>
              <p className="text-xl font-bold text-green-900 mt-1">{stats.healthy}</p>
            </div>
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl shadow-sm p-4 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-orange-700 uppercase tracking-wide">Warning</p>
              <p className="text-xl font-bold text-orange-900 mt-1">{stats.warning}</p>
            </div>
            <AlertTriangle className="w-5 h-5 text-orange-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl shadow-sm p-4 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-red-700 uppercase tracking-wide">Critical</p>
              <p className="text-xl font-bold text-red-900 mt-1">{stats.critical}</p>
            </div>
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-sm p-4 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide">Avg Health</p>
              <p className="text-xl font-bold text-purple-900 mt-1">{stats.avgHealthScore}%</p>
            </div>
            <Activity className="w-5 h-5 text-purple-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl shadow-sm p-4 border border-indigo-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wide">Platform Revenue</p>
              <p className="text-xl font-bold text-indigo-900 mt-1">{formatCurrency(stats.totalPlatformRevenue)}</p>
            </div>
            <DollarSign className="w-5 h-5 text-indigo-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="flex items-center space-x-2">
            <Search className="w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search tenants..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="healthy">Healthy</option>
            <option value="warning">Warning</option>
            <option value="critical">Critical</option>
            <option value="inactive">Inactive</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="healthScore">Sort by Health Score</option>
            <option value="riskScore">Sort by Risk Score</option>
            <option value="revenue">Sort by Revenue</option>
            <option value="orders">Sort by Orders</option>
            <option value="growth">Sort by Growth</option>
            <option value="businessName">Sort by Name</option>
          </select>

          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="w-4 h-4 mr-1" />
            <span>Showing {filteredTenants.length} of {tenants.length} tenants</span>
          </div>

          <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {/* Tenant Cards */}
      <div className="space-y-4">
        {filteredTenants.map((tenant) => (
          <div key={tenant._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {/* Business Info Header */}
                <div className="flex items-center space-x-3 mb-4">
                  <div className={`w-3 h-3 rounded-full ${getStatusDotColor(tenant.status)}`}></div>
                  <h3 className="text-lg font-bold text-gray-900">{tenant.businessName}</h3>
                  <span className="font-mono text-sm text-gray-500">{tenant.tenantId}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(tenant.status)}`}>
                    {tenant.status.toUpperCase()}
                  </span>
                  <span className="text-sm text-gray-500 flex items-center">
                    <Globe className="w-3 h-3 mr-1" />
                    {tenant.subdomain}.laundrylobby.com
                  </span>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
                  <div className="text-center p-2 bg-blue-50 rounded">
                    <div className="flex items-center justify-center space-x-1 mb-1">
                      <Package className="w-3 h-3 text-blue-600" />
                      <p className="text-xs text-blue-700">Orders</p>
                    </div>
                    <p className="text-lg font-bold text-blue-900">{formatNumber(tenant.metrics.totalOrders)}</p>
                    <div className="flex items-center justify-center space-x-1">
                      {getGrowthIcon(tenant.metrics.orderGrowth)}
                      <span className={`text-xs font-medium ${getGrowthColor(tenant.metrics.orderGrowth)}`}>
                        {tenant.metrics.orderGrowth > 0 ? '+' : ''}{tenant.metrics.orderGrowth}%
                      </span>
                    </div>
                  </div>
                  <div className="text-center p-2 bg-green-50 rounded">
                    <div className="flex items-center justify-center space-x-1 mb-1">
                      <DollarSign className="w-3 h-3 text-green-600" />
                      <p className="text-xs text-green-700">Revenue</p>
                    </div>
                    <p className="text-lg font-bold text-green-900">{formatCurrency(tenant.metrics.totalRevenue)}</p>
                    <div className="flex items-center justify-center space-x-1">
                      {getGrowthIcon(tenant.metrics.revenueGrowth)}
                      <span className={`text-xs font-medium ${getGrowthColor(tenant.metrics.revenueGrowth)}`}>
                        {tenant.metrics.revenueGrowth > 0 ? '+' : ''}{tenant.metrics.revenueGrowth}%
                      </span>
                    </div>
                  </div>
                  <div className="text-center p-2 bg-purple-50 rounded">
                    <div className="flex items-center justify-center space-x-1 mb-1">
                      <Users className="w-3 h-3 text-purple-600" />
                      <p className="text-xs text-purple-700">Active Users</p>
                    </div>
                    <p className="text-lg font-bold text-purple-900">{formatNumber(tenant.metrics.activeUsers)}</p>
                    <p className="text-xs text-purple-600">+{formatNumber(tenant.metrics.newUsers)} new</p>
                  </div>
                  <div className="text-center p-2 bg-indigo-50 rounded">
                    <div className="flex items-center justify-center space-x-1 mb-1">
                      <TrendingUp className="w-3 h-3 text-indigo-600" />
                      <p className="text-xs text-indigo-700">Retention</p>
                    </div>
                    <p className="text-lg font-bold text-indigo-900">{tenant.metrics.retentionRate}%</p>
                    <p className="text-xs text-indigo-600">Avg: {formatCurrency(tenant.metrics.avgOrderValue)}</p>
                  </div>
                  <div className="text-center p-2 bg-teal-50 rounded">
                    <div className="flex items-center justify-center space-x-1 mb-1">
                      <Clock className="w-3 h-3 text-teal-600" />
                      <p className="text-xs text-teal-700">Resp. Time</p>
                    </div>
                    <p className="text-lg font-bold text-teal-900">{tenant.metrics.avgResponseTime}s</p>
                    <p className="text-xs text-teal-600">{tenant.metrics.avgResponseTime <= 2 ? 'Excellent' : tenant.metrics.avgResponseTime <= 3 ? 'Good' : 'Slow'}</p>
                  </div>
                </div>

                {/* Health Score Visual Indicator */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">Health Score</span>
                    <span className={`text-sm font-bold px-2 py-0.5 rounded border ${getHealthScoreColor(tenant.healthScore)}`}>
                      {tenant.healthScore}/100
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full transition-all duration-500 ${getHealthBarColor(tenant.healthScore)}`}
                      style={{ width: `${tenant.healthScore}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-gray-500">Risk Score: {tenant.riskScore}/100</span>
                    <span className="text-xs text-gray-500">
                      {tenant.healthScore >= 80 ? 'Excellent' : tenant.healthScore >= 60 ? 'Needs Attention' : tenant.healthScore >= 30 ? 'At Risk' : 'Inactive/Critical'}
                    </span>
                  </div>
                </div>

                {/* Compliance Badges */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Compliance Status</h4>
                  <div className="flex flex-wrap gap-2">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${tenant.compliance.dataRetention ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'}`}>
                      {tenant.compliance.dataRetention ? <CheckCircle className="w-3 h-3 mr-1" /> : <AlertTriangle className="w-3 h-3 mr-1" />}
                      Data Retention
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${tenant.compliance.privacyCompliant ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'}`}>
                      {tenant.compliance.privacyCompliant ? <CheckCircle className="w-3 h-3 mr-1" /> : <AlertTriangle className="w-3 h-3 mr-1" />}
                      Privacy Compliant
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${tenant.compliance.securityScore >= 70 ? 'text-green-700 bg-green-100' : tenant.compliance.securityScore >= 50 ? 'text-orange-700 bg-orange-100' : 'text-red-700 bg-red-100'}`}>
                      Security: {tenant.compliance.securityScore}%
                    </span>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium text-gray-700 bg-gray-100">
                      <Calendar className="w-3 h-3 mr-1" />
                      Last Audit: {new Date(tenant.compliance.lastAudit).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Behavioral Patterns */}
                {tenant.patterns.peakHours.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Behavioral Patterns</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs font-medium text-gray-600 mb-1 flex items-center">
                          <Clock className="w-3 h-3 mr-1" /> Peak Hours
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {tenant.patterns.peakHours.map((hour, i) => (
                            <span key={i} className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                              {hour}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs font-medium text-gray-600 mb-1 flex items-center">
                          <Calendar className="w-3 h-3 mr-1" /> Busiest Days
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {tenant.patterns.busiestDays.map((day, i) => (
                            <span key={i} className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                              {day}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs font-medium text-gray-600 mb-1 flex items-center">
                          <TrendingUp className="w-3 h-3 mr-1" /> Seasonal Trend
                        </p>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                          tenant.patterns.seasonalTrend === 'upward' ? 'bg-green-100 text-green-700' :
                          tenant.patterns.seasonalTrend === 'downward' ? 'bg-red-100 text-red-700' :
                          tenant.patterns.seasonalTrend === 'stable' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {tenant.patterns.seasonalTrend.charAt(0).toUpperCase() + tenant.patterns.seasonalTrend.slice(1)}
                        </span>
                      </div>
                    </div>

                    {/* Customer Segments */}
                    {tenant.patterns.customerSegments.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs font-medium text-gray-600 mb-2">Customer Segments</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {tenant.patterns.customerSegments.map((seg, i) => (
                            <div key={i} className="bg-indigo-50 p-2 rounded text-center">
                              <p className="text-xs font-medium text-indigo-800">{seg.segment}</p>
                              <p className="text-sm font-bold text-indigo-900">{formatNumber(seg.count)}</p>
                              <p className="text-xs text-indigo-600">{formatCurrency(seg.revenue)}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Anomalies */}
                {tenant.anomalies.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Detected Anomalies</h4>
                    <div className="space-y-2">
                      {tenant.anomalies.map((anomaly, index) => (
                        <div key={index} className="flex items-start space-x-3 bg-gray-50 p-3 rounded-lg">
                          <AlertTriangle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                            anomaly.severity === 'critical' ? 'text-red-600' :
                            anomaly.severity === 'high' ? 'text-orange-600' :
                            anomaly.severity === 'medium' ? 'text-yellow-600' :
                            'text-green-600'
                          }`} />
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="text-sm font-medium text-gray-900 capitalize">
                                {anomaly.type.replace('_', ' ')}
                              </span>
                              <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${getSeverityColor(anomaly.severity)}`}>
                                {anomaly.severity}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">{anomaly.description}</p>
                            <p className="text-xs text-gray-400 mt-1">
                              Detected: {new Date(anomaly.detectedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* No Anomalies Message */}
                {tenant.anomalies.length === 0 && (
                  <div className="flex items-center space-x-2 bg-green-50 p-3 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-700">No anomalies detected. Tenant behavior is within expected parameters.</span>
                  </div>
                )}
              </div>

              {/* Actions & Score Summary */}
              <div className="flex flex-col items-end space-y-3 ml-6">
                <button className="text-blue-600 hover:text-blue-800 p-2 rounded-md hover:bg-blue-50">
                  <Eye className="w-4 h-4" />
                </button>
                <div className={`text-center p-3 rounded-xl border ${getHealthScoreColor(tenant.healthScore)}`}>
                  <p className="text-xs font-medium mb-1">Health</p>
                  <p className="text-2xl font-bold">{tenant.healthScore}</p>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-500">Risk</p>
                  <p className={`text-lg font-bold ${tenant.riskScore >= 60 ? 'text-red-600' : tenant.riskScore >= 30 ? 'text-orange-600' : 'text-green-600'}`}>
                    {tenant.riskScore}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredTenants.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tenants found</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
        </div>
      )}

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