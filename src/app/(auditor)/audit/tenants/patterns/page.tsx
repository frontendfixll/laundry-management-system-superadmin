'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { 
  TrendingUp,
  Search,
  Filter,
  Calendar,
  Download,
  Building2,
  Users,
  Clock,
  Activity,
  BarChart3,
  PieChart,
  AlertTriangle,
  CheckCircle,
  Eye,
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
  PieChart as RechartsPieChart,
  Cell,
  Pie,
  AreaChart,
  Area
} from 'recharts'

interface TenantPattern {
  _id: string
  tenantId: string
  tenantName: string
  businessName: string
  pattern: {
    peakHours: { hour: number; orderCount: number }[]
    peakDays: { day: string; orderCount: number }[]
    seasonalTrends: { month: string; revenue: number }[]
    customerBehavior: {
      averageOrderFrequency: number
      customerRetentionRate: number
      averageOrderValue: number
      preferredServices: { service: string; percentage: number }[]
    }
    operationalMetrics: {
      averageProcessingTime: number
      deliveryTimeCompliance: number
      qualityRating: number
      complaintRate: number
    }
  }
  anomalies: {
    type: string
    description: string
    severity: 'low' | 'medium' | 'high'
    detectedAt: Date
  }[]
  riskScore: number
  lastAnalyzed: Date
}

export default function TenantPatternsPage() {
  const [patterns, setPatterns] = useState<TenantPattern[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMetric, setSelectedMetric] = useState('orders')
  const [dateRange, setDateRange] = useState('30d')
  const [selectedTenant, setSelectedTenant] = useState<string>('all')

  useEffect(() => {
    fetchTenantPatterns()
  }, [dateRange, selectedMetric, searchQuery])

  const fetchTenantPatterns = async () => {
    try {
      setLoading(true)
      
      const params = new URLSearchParams({
        range: dateRange,
        metric: selectedMetric,
        ...(searchQuery && { search: searchQuery })
      })

      const response = await fetch(`/api/superadmin/audit/tenants/patterns?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth-storage') ? JSON.parse(localStorage.getItem('auth-storage')).state?.token : ''}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch tenant patterns')
      }
      
      const data = await response.json()
      
      if (data.success) {
        setPatterns(data.data.patterns)
      } else {
        throw new Error(data.message || 'Failed to fetch tenant patterns')
      }
      
    } catch (error) {
      console.error('Error fetching tenant patterns:', error)
      // Fallback to mock data
      const mockPatterns: TenantPattern[] = [
        {
          _id: '1',
          tenantId: 'tenant_001',
          tenantName: 'clean-fresh',
          businessName: 'Clean & Fresh Laundry',
          pattern: {
            peakHours: [
              { hour: 9, orderCount: 45 },
              { hour: 12, orderCount: 67 },
              { hour: 18, orderCount: 89 },
              { hour: 20, orderCount: 56 }
            ],
            peakDays: [
              { day: 'Monday', orderCount: 234 },
              { day: 'Tuesday', orderCount: 189 },
              { day: 'Wednesday', orderCount: 267 },
              { day: 'Thursday', orderCount: 298 },
              { day: 'Friday', orderCount: 345 },
              { day: 'Saturday', orderCount: 456 },
              { day: 'Sunday', orderCount: 123 }
            ],
            seasonalTrends: [
              { month: 'Jan', revenue: 45000 },
              { month: 'Feb', revenue: 52000 },
              { month: 'Mar', revenue: 48000 },
              { month: 'Apr', revenue: 61000 },
              { month: 'May', revenue: 58000 },
              { month: 'Jun', revenue: 67000 }
            ],
            customerBehavior: {
              averageOrderFrequency: 2.3,
              customerRetentionRate: 78.5,
              averageOrderValue: 0,
              preferredServices: [
                { service: 'Dry Cleaning', percentage: 45 },
                { service: 'Wash & Fold', percentage: 35 },
                { service: 'Ironing', percentage: 20 }
              ]
            },
            operationalMetrics: {
              averageProcessingTime: 24.5,
              deliveryTimeCompliance: 92.3,
              qualityRating: 4.6,
              complaintRate: 2.1
            }
          },
          anomalies: [
            {
              type: 'UNUSUAL_PEAK',
              description: 'Unexpected order spike on Tuesday 3 PM (300% above normal)',
              severity: 'medium',
              detectedAt: new Date(Date.now() - 86400000)
            },
            {
              type: 'QUALITY_DROP',
              description: 'Quality rating dropped below 4.0 for 3 consecutive days',
              severity: 'high',
              detectedAt: new Date(Date.now() - 172800000)
            }
          ],
          riskScore: 2,
          lastAnalyzed: new Date()
        },
        {
          _id: '2',
          tenantId: 'tenant_002',
          tenantName: 'quickwash',
          businessName: 'QuickWash Services',
          pattern: {
            peakHours: [
              { hour: 8, orderCount: 23 },
              { hour: 13, orderCount: 34 },
              { hour: 19, orderCount: 45 },
              { hour: 21, orderCount: 28 }
            ],
            peakDays: [
              { day: 'Monday', orderCount: 156 },
              { day: 'Tuesday', orderCount: 134 },
              { day: 'Wednesday', orderCount: 178 },
              { day: 'Thursday', orderCount: 189 },
              { day: 'Friday', orderCount: 234 },
              { day: 'Saturday', orderCount: 267 },
              { day: 'Sunday', orderCount: 89 }
            ],
            seasonalTrends: [
              { month: 'Jan', revenue: 23000 },
              { month: 'Feb', revenue: 28000 },
              { month: 'Mar', revenue: 25000 },
              { month: 'Apr', revenue: 31000 },
              { month: 'May', revenue: 29000 },
              { month: 'Jun', revenue: 34000 }
            ],
            customerBehavior: {
              averageOrderFrequency: 1.8,
              customerRetentionRate: 65.2,
              averageOrderValue: 134.56,
              preferredServices: [
                { service: 'Express Wash', percentage: 60 },
                { service: 'Regular Wash', percentage: 30 },
                { service: 'Dry Cleaning', percentage: 10 }
              ]
            },
            operationalMetrics: {
              averageProcessingTime: 18.2,
              deliveryTimeCompliance: 87.6,
              qualityRating: 4.2,
              complaintRate: 4.3
            }
          },
          anomalies: [
            {
              type: 'HIGH_COMPLAINT_RATE',
              description: 'Complaint rate increased to 8.5% (normal: 2-3%)',
              severity: 'high',
              detectedAt: new Date(Date.now() - 259200000)
            }
          ],
          riskScore: 4,
          lastAnalyzed: new Date(Date.now() - 3600000)
        }
      ]
      setPatterns(mockPatterns)
    } finally {
      setLoading(false)
    }
  }

  const getRiskColor = (score: number) => {
    if (score >= 4) return 'text-red-700 bg-red-100'
    if (score >= 3) return 'text-orange-700 bg-orange-100'
    if (score >= 2) return 'text-yellow-700 bg-yellow-100'
    return 'text-green-700 bg-green-100'
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-700 bg-red-100'
      case 'medium': return 'text-orange-700 bg-orange-100'
      case 'low': return 'text-green-700 bg-green-100'
      default: return 'text-gray-700 bg-gray-100'
    }
  }

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']

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
              <TrendingUp className="w-8 h-8 mr-3" />
              Tenant Behavior Patterns
            </h1>
            <p className="text-blue-100 mt-2">
              Advanced analytics of tenant operational patterns, customer behavior, and business trends
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-blue-100">Analyzed Tenants: {patterns.length}</p>
            <p className="text-xs text-blue-200">Pattern Analysis</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="orders">Order Patterns</option>
            <option value="revenue">Revenue Patterns</option>
            <option value="customers">Customer Behavior</option>
            <option value="operations">Operational Metrics</option>
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
            Export Analysis
          </button>
        </div>
      </div>

      {/* Pattern Analysis Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {patterns.map((pattern) => (
          <div key={pattern._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{pattern.businessName}</h3>
                <p className="text-sm text-gray-500">{pattern.tenantName}</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(pattern.riskScore)}`}>
                  Risk: {pattern.riskScore}/5
                </span>
                <button className="text-blue-600 hover:text-blue-800">
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Peak Hours Chart */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Peak Hours Pattern</h4>
              <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={pattern.pattern.peakHours}>
                    <XAxis dataKey="hour" tickFormatter={(hour) => `${hour}:00`} />
                    <YAxis />
                    <Tooltip formatter={(value) => [value, 'Orders']} />
                    <Bar dataKey="orderCount" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Customer Behavior Metrics */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-700 font-medium">Retention Rate</p>
                <p className="text-lg font-bold text-blue-900">
                  {pattern.pattern.customerBehavior.customerRetentionRate}%
                </p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-xs text-green-700 font-medium">Avg Order Value</p>
                <p className="text-lg font-bold text-green-900">
                  ₹{pattern.pattern.customerBehavior.averageOrderValue.toFixed(0)}
                </p>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <p className="text-xs text-purple-700 font-medium">Order Frequency</p>
                <p className="text-lg font-bold text-purple-900">
                  {pattern.pattern.customerBehavior.averageOrderFrequency}/month
                </p>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <p className="text-xs text-orange-700 font-medium">Quality Rating</p>
                <p className="text-lg font-bold text-orange-900">
                  {pattern.pattern.operationalMetrics.qualityRating}/5
                </p>
              </div>
            </div>

            {/* Anomalies */}
            {pattern.anomalies.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-1 text-orange-600" />
                  Recent Anomalies
                </h4>
                <div className="space-y-2">
                  {pattern.anomalies.slice(0, 2).map((anomaly, index) => (
                    <div key={index} className="p-2 bg-gray-50 rounded text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{anomaly.type.replace('_', ' ')}</span>
                        <span className={`px-1 py-0.5 rounded text-xs ${getSeverityColor(anomaly.severity)}`}>
                          {anomaly.severity}
                        </span>
                      </div>
                      <p className="text-gray-600">{anomaly.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Aggregated Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Service Preferences */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <PieChart className="w-5 h-5 mr-2 text-green-600" />
            Service Preferences Across Tenants
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={[
                    { name: 'Dry Cleaning', value: 35 },
                    { name: 'Wash & Fold', value: 30 },
                    { name: 'Express Wash', value: 20 },
                    { name: 'Ironing', value: 15 }
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
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Operational Performance */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <Target className="w-5 h-5 mr-2 text-blue-600" />
            Operational Performance Trends
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={[
                { month: 'Jan', compliance: 89, quality: 4.2, complaints: 3.1 },
                { month: 'Feb', compliance: 91, quality: 4.3, complaints: 2.8 },
                { month: 'Mar', compliance: 88, quality: 4.1, complaints: 3.4 },
                { month: 'Apr', compliance: 93, quality: 4.4, complaints: 2.5 },
                { month: 'May', compliance: 90, quality: 4.3, complaints: 2.9 },
                { month: 'Jun', compliance: 92, quality: 4.5, complaints: 2.3 }
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="compliance" stroke="#3B82F6" name="Delivery Compliance %" />
                <Line type="monotone" dataKey="quality" stroke="#10B981" name="Quality Rating" />
                <Line type="monotone" dataKey="complaints" stroke="#EF4444" name="Complaint Rate %" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Pattern Insights Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start">
          <Activity className="w-6 h-6 text-blue-600 mt-1 mr-4" />
          <div>
            <h4 className="text-lg font-medium text-blue-900">Key Pattern Insights</h4>
            <div className="text-sm text-blue-800 mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="font-medium">📈 Peak Performance Patterns:</p>
                <ul className="list-disc list-inside space-y-1 mt-1">
                  <li>Weekend orders are 40% higher than weekdays</li>
                  <li>Evening hours (6-8 PM) show highest activity</li>
                  <li>Friday-Saturday combination drives 35% of weekly revenue</li>
                </ul>
              </div>
              <div>
                <p className="font-medium">🎯 Customer Behavior Trends:</p>
                <ul className="list-disc list-inside space-y-1 mt-1">
                  <li>Average customer retention rate: 72%</li>
                  <li>Dry cleaning services have highest profit margins</li>
                  <li>Express services drive customer loyalty</li>
                </ul>
              </div>
              <div>
                <p className="font-medium">⚠️ Risk Indicators:</p>
                <ul className="list-disc list-inside space-y-1 mt-1">
                  <li>Quality ratings below 4.0 correlate with churn</li>
                  <li>Complaint rates above 4% indicate operational issues</li>
                  <li>Delivery delays impact customer retention significantly</li>
                </ul>
              </div>
              <div>
                <p className="font-medium">💡 Optimization Opportunities:</p>
                <ul className="list-disc list-inside space-y-1 mt-1">
                  <li>Staff scheduling optimization for peak hours</li>
                  <li>Service bundling to increase order value</li>
                  <li>Quality monitoring systems for early intervention</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}