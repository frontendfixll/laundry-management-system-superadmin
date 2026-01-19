'use client'

import { useState, useEffect } from 'react'
import { useAuthStore, useSalesUser } from '@/store/authStore'
import api from '@/lib/api'
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  Target,
  Clock,
  CheckCircle,
  AlertCircle,
  BarChart3,
  PieChart
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

interface DashboardStats {
  leads: {
    total: number
    new: number
    contacted: number
    qualified: number
    converted: number
    demo_scheduled: number
    negotiation: number
    lost: number
  }
  trials: {
    active: number
    expiringSoon: number
    expired: number
  }
  revenue: {
    total: number
    thisMonth: number
    target: number
    targetAchieved: number
  }
  performance: {
    conversionRate: number
    avgDealSize: number
    leadsAssigned: number
    leadsConverted: number
  }
}

interface ExpiringTrial {
  _id: string
  businessName: string
  contactPerson: {
    name: string
    phone: string
  }
  trial: {
    endDate: string
    daysRemaining: number
  }
}

interface ChartData {
  leadStatusData: Array<{
    name: string
    value: number
    color: string
  }>
  monthlyRevenueData: Array<{
    month: string
    revenue: number
    leads: number
  }>
  conversionFunnelData: Array<{
    stage: string
    count: number
    percentage: number
  }>
}

export default function DashboardPage() {
  const salesUser = useSalesUser()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [expiringTrials, setExpiringTrials] = useState<ExpiringTrial[]>([])
  const [chartData, setChartData] = useState<ChartData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [statsRes, trialsRes, revenueRes] = await Promise.all([
        api.get('/sales/analytics/dashboard-stats'),
        api.get('/sales/analytics/expiring-trials'),
        api.get('/sales/analytics/monthly-revenue')
      ])

      if (statsRes.data?.data) {
        const statsData = statsRes.data.data
        setStats({
          leads: statsData.leads,
          trials: statsData.trials || { active: 0, expiringSoon: 0, expired: 0 },
          revenue: statsData.revenue,
          performance: statsData.performance
        })
        
        // Prepare chart data with real data
        const leadStatusData = [
          { name: 'New', value: statsData.leads.new || 0, color: '#3B82F6' },
          { name: 'Contacted', value: statsData.leads.contacted || 0, color: '#F59E0B' },
          { name: 'Qualified', value: statsData.leads.qualified || 0, color: '#10B981' },
          { name: 'Demo Scheduled', value: statsData.leads.demo_scheduled || 0, color: '#8B5CF6' },
          { name: 'Negotiation', value: statsData.leads.negotiation || 0, color: '#F97316' },
          { name: 'Converted', value: statsData.leads.converted || 0, color: '#059669' },
          { name: 'Lost', value: statsData.leads.lost || 0, color: '#EF4444' }
        ].filter(item => item.value > 0)

        // Use real monthly revenue data
        const monthlyRevenueData = revenueRes.data?.data?.chartData || []

        // Conversion funnel data
        const total = statsData.leads.total || 1
        const conversionFunnelData = [
          { stage: 'Leads', count: total, percentage: 100 },
          { stage: 'Contacted', count: statsData.leads.contacted || 0, percentage: Math.round(((statsData.leads.contacted || 0) / total) * 100) },
          { stage: 'Qualified', count: statsData.leads.qualified || 0, percentage: Math.round(((statsData.leads.qualified || 0) / total) * 100) },
          { stage: 'Demo', count: statsData.leads.demo_scheduled || 0, percentage: Math.round(((statsData.leads.demo_scheduled || 0) / total) * 100) },
          { stage: 'Converted', count: statsData.leads.converted || 0, percentage: Math.round(((statsData.leads.converted || 0) / total) * 100) }
        ]

        setChartData({
          leadStatusData,
          monthlyRevenueData,
          conversionFunnelData
        })
      }

      if (trialsRes.data?.data) {
        setExpiringTrials(trialsRes.data.data)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Welcome Section - More Compact */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-xl shadow-md p-5 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Welcome back, {salesUser?.name}! 👋</h1>
            <p className="text-indigo-100 text-sm mt-1">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid - Compact & Colorful */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-sm hover:shadow-md transition-all p-4 border border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Total Leads</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">
                {salesUser?.performance?.leadsAssigned || 0}
              </p>
              <p className="text-xs text-green-600 font-medium mt-1">
                +{stats?.leads?.new || 0} new
              </p>
            </div>
            <div className="bg-blue-500 p-2.5 rounded-lg shadow-sm">
              <Users className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-sm hover:shadow-md transition-all p-4 border border-green-200">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs font-semibold text-green-700 uppercase tracking-wide">Conversion</p>
              <p className="text-2xl font-bold text-green-900 mt-1">
                {salesUser?.performance?.conversionRate?.toFixed(1) || 0}%
              </p>
              <p className="text-xs text-green-700 font-medium mt-1">
                {salesUser?.performance?.leadsConverted || 0} converted
              </p>
            </div>
            <div className="bg-green-500 p-2.5 rounded-lg shadow-sm">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-sm hover:shadow-md transition-all p-4 border border-purple-200">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide">Revenue</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">
                {formatCurrency(salesUser?.performance?.totalRevenue || 0)}
              </p>
              <p className="text-xs text-purple-700 font-medium mt-1">
                {formatCurrency(salesUser?.performance?.currentMonthRevenue || 0)} MTD
              </p>
            </div>
            <div className="bg-purple-500 p-2.5 rounded-lg shadow-sm">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl shadow-sm hover:shadow-md transition-all p-4 border border-orange-200">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs font-semibold text-orange-700 uppercase tracking-wide">Target</p>
              <p className="text-2xl font-bold text-orange-900 mt-1">
                {salesUser?.performance?.targetAchieved?.toFixed(0) || 0}%
              </p>
              <div className="w-full bg-orange-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full transition-all shadow-sm"
                  style={{ width: `${Math.min(salesUser?.performance?.targetAchieved || 0, 100)}%` }}
                />
              </div>
            </div>
            <div className="bg-orange-500 p-2.5 rounded-lg shadow-sm">
              <Target className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      {chartData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Lead Status Pie Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center">
                <PieChart className="w-5 h-5 mr-2 text-blue-600" />
                Lead Status Distribution
              </h3>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={chartData.leadStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.leadStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any) => [value, 'Leads']}
                    labelStyle={{ color: '#374151' }}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {chartData.leadStatusData.map((item, index) => (
                <div key={index} className="flex items-center text-sm">
                  <div 
                    className="w-3 h-3 rounded-full mr-2" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-gray-700">{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly Revenue Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-green-600" />
                Monthly Revenue Trend
              </h3>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData.monthlyRevenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#6B7280' }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#6B7280' }}
                    tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    formatter={(value: any) => [`₹${value.toLocaleString()}`, 'Revenue']}
                    labelStyle={{ color: '#374151' }}
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#10B981" 
                    fill="url(#revenueGradient)"
                    strokeWidth={3}
                  />
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.05}/>
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Conversion Funnel */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-purple-600" />
                Conversion Funnel
              </h3>
            </div>
            <div className="space-y-3">
              {chartData.conversionFunnelData.map((stage, index) => (
                <div key={index} className="relative">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{stage.stage}</span>
                    <span className="text-sm text-gray-600">{stage.count} ({stage.percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${stage.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center">
                <Target className="w-5 h-5 mr-2 text-orange-600" />
                Performance Metrics
              </h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="text-sm text-blue-700 font-medium">Conversion Rate</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {stats?.conversionRate?.toFixed(1) || 0}%
                  </p>
                </div>
                <div className="bg-blue-500 p-2 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div>
                  <p className="text-sm text-green-700 font-medium">Avg Deal Size</p>
                  <p className="text-2xl font-bold text-green-900">
                    {formatCurrency(salesUser?.performance?.avgDealSize || 0)}
                  </p>
                </div>
                <div className="bg-green-500 p-2 rounded-lg">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div>
                  <p className="text-sm text-purple-700 font-medium">Active Trials</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {stats?.trials?.active || 0}
                  </p>
                </div>
                <div className="bg-purple-500 p-2 rounded-lg">
                  <Clock className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Trials Expiring Soon - Compact & Styled */}
      {expiringTrials.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-red-100">
          <div className="px-4 py-3 bg-gradient-to-r from-red-50 to-orange-50 rounded-t-xl border-b border-red-100">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-red-900 flex items-center">
                <Clock className="w-4 h-4 mr-2 text-red-600" />
                Trials Expiring Soon
              </h2>
              <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                {expiringTrials.length}
              </span>
            </div>
          </div>
          <div className="divide-y divide-gray-100 max-h-60 overflow-y-auto">
            {expiringTrials.slice(0, 5).map((trial) => (
              <div key={trial._id} className="px-4 py-2.5 hover:bg-red-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 truncate">
                      {trial.businessName}
                    </h3>
                    <p className="text-xs text-gray-600 mt-0.5">
                      {trial.contactPerson?.name || 'N/A'} • {trial.contactPerson?.phone || 'N/A'}
                    </p>
                  </div>
                  <div className="text-right ml-4 flex-shrink-0">
                    <div className="bg-red-100 px-2 py-1 rounded-lg">
                      <span className="text-sm font-bold text-red-700">
                        {trial.trial.daysRemaining}d
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(trial.trial.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions - Compact & Colorful */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <a
          href="/leads?status=new"
          className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md p-4 hover:shadow-lg transition-all hover:scale-105 group"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-blue-100 font-semibold uppercase tracking-wide">New Leads</p>
              <p className="text-2xl font-bold text-white mt-1">
                {stats?.leads?.new || 0}
              </p>
            </div>
            <div className="bg-white/20 p-2.5 rounded-lg group-hover:bg-white/30 transition-colors">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
          </div>
        </a>

        <a
          href="/leads?status=qualified"
          className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-md p-4 hover:shadow-lg transition-all hover:scale-105 group"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-green-100 font-semibold uppercase tracking-wide">Qualified</p>
              <p className="text-2xl font-bold text-white mt-1">
                {stats?.leads?.qualified || 0}
              </p>
            </div>
            <div className="bg-white/20 p-2.5 rounded-lg group-hover:bg-white/30 transition-colors">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
          </div>
        </a>

        <a
          href="/sales/subscriptions"
          className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-md p-4 hover:shadow-lg transition-all hover:scale-105 group"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-purple-100 font-semibold uppercase tracking-wide">Active Trials</p>
              <p className="text-2xl font-bold text-white mt-1">
                {stats?.trials?.active || 0}
              </p>
            </div>
            <div className="bg-white/20 p-2.5 rounded-lg group-hover:bg-white/30 transition-colors">
              <Target className="w-6 h-6 text-white" />
            </div>
          </div>
        </a>
      </div>
    </div>
  )
}


