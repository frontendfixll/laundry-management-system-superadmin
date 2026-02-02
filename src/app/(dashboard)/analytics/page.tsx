'use client'

import { useState } from 'react'
import {
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  Building2,
  Calendar,
  Filter,
  Download,
  Plus,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Target,
  MapPin,
  Lightbulb
} from 'lucide-react'
import { useAnalyticsOverview, useAnalytics, useAnalyticsGeneration, useAnalyticsById } from '@/hooks/useAnalytics'

const timeframeOptions = [
  { value: '7d', label: '7 Days' },
  { value: '30d', label: '30 Days' },
  { value: '90d', label: '90 Days' },
  { value: '1y', label: '1 Year' }
]

const analyticsTypes = [
  { value: '', label: 'All Types' },
  { value: 'customer_retention', label: 'Customer Retention' },
  { value: 'branch_performance', label: 'Branch Performance' },
  { value: 'revenue_forecast', label: 'Revenue Forecast' },
  { value: 'expansion_analysis', label: 'Expansion Analysis' },
  { value: 'market_analysis', label: 'Market Analysis' }
]

const statusOptions = [
  { value: '', label: 'All Status' },
  { value: 'generating', label: 'Generating' },
  { value: 'completed', label: 'Completed' },
  { value: 'failed', label: 'Failed' },
  { value: 'scheduled', label: 'Scheduled' }
]

export default function AnalyticsPage() {
  const [timeframe, setTimeframe] = useState('30d')
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    search: '',
    page: 1,
    limit: 20
  })
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [selectedAnalytics, setSelectedAnalytics] = useState<string | null>(null)

  const { overview, loading: overviewLoading } = useAnalyticsOverview(timeframe)
  const { analytics, pagination, loading: analyticsLoading, refetch } = useAnalytics(filters)
  const { loading: generating } = useAnalyticsGeneration()

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'generating':
        return <Clock className="w-4 h-4 text-yellow-500" />
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />
      case 'scheduled':
        return <Calendar className="w-4 h-4 text-blue-500" />
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'customer_retention':
        return <Users className="w-4 h-4" />
      case 'branch_performance':
        return <Building2 className="w-4 h-4" />
      case 'revenue_forecast':
        return <TrendingUp className="w-4 h-4" />
      case 'expansion_analysis':
        return <MapPin className="w-4 h-4" />
      default:
        return <BarChart3 className="w-4 h-4" />
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-light text-gray-900">Analytics & Growth</h1>
          <p className="text-gray-500 text-xs mt-0.5">Advanced analytics and business intelligence</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            {timeframeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button
            onClick={() => setShowGenerateModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Generate Analysis</span>
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      {overviewLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      ) : overview && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Customer Metrics */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${overview.customerMetrics.growth >= 0
                  ? 'text-green-700 bg-green-100'
                  : 'text-red-700 bg-red-100'
                }`}>
                {formatPercentage(overview.customerMetrics.growth)}
              </span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-0.5">
              {overview.customerMetrics.totalCustomers.toLocaleString()}
            </h3>
            <p className="text-gray-500 text-xs">Total Customers</p>
            <div className="mt-2 text-[10px] text-gray-400 font-medium">
              {overview.customerMetrics.newCustomers} new • {overview.customerMetrics.retentionRate.toFixed(1)}% retention
            </div>
          </div>

          {/* Revenue Metrics */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${overview.revenueMetrics.growth >= 0
                  ? 'text-green-700 bg-green-100'
                  : 'text-red-700 bg-red-100'
                }`}>
                {formatPercentage(overview.revenueMetrics.growth)}
              </span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-0.5">
              {formatCurrency(overview.revenueMetrics.totalRevenue)}
            </h3>
            <p className="text-gray-500 text-xs">Total Revenue</p>
            <div className="mt-2 text-[10px] text-gray-400 font-medium">
              {formatCurrency(overview.revenueMetrics.averageOrderValue)} avg order
            </div>
          </div>

          {/* Order Metrics */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full text-blue-700 bg-blue-100">
                {overview.orderMetrics.completionRate.toFixed(1)}%
              </span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-0.5">
              {overview.orderMetrics.totalOrders.toLocaleString()}
            </h3>
            <p className="text-gray-500 text-xs">Total Orders</p>
            <div className="mt-2 text-[10px] text-gray-400 font-medium">
              {overview.orderMetrics.completedOrders} completed • {overview.orderMetrics.cancelledOrders} cancelled
            </div>
          </div>

          {/* Branch Metrics */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-orange-600" />
              </div>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full text-gray-700 bg-gray-100">
                {overview.branchMetrics.activeBranches}/{overview.branchMetrics.totalBranches}
              </span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-0.5">
              {formatCurrency(overview.branchMetrics.averageRevenuePerBranch)}
            </h3>
            <p className="text-gray-500 text-xs">Avg Revenue/Branch</p>
            <div className="mt-2 text-[10px] text-gray-400 font-medium">
              {formatCurrency(overview.branchMetrics.totalBranchRevenue)} total
            </div>
          </div>
        </div>
      )}

      {/* Analytics List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-light text-gray-900">Analytics Reports</h2>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                  value={filters.type}
                  onChange={(e) => setFilters({ ...filters, type: e.target.value, page: 1 })}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {analyticsTypes.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Search analytics..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {analyticsLoading ? (
            <div className="p-6">
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4 animate-pulse">
                    <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                    <div className="w-20 h-6 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          ) : analytics.length === 0 ? (
            <div className="p-12 text-center">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Analytics Found</h3>
              <p className="text-gray-600 mb-6">Generate your first analytics report to get started.</p>
              <button
                onClick={() => setShowGenerateModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors"
              >
                Generate Analysis
              </button>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Analytics
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Period
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analytics.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                          {getTypeIcon(item.type)}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {item.analyticsId}
                          </div>
                          <div className="text-sm text-gray-500">
                            by {item.createdBy?.name || 'System'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {item.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(item.status)}
                        <span className="text-sm text-gray-900 capitalize">
                          {item.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => setSelectedAnalytics(item._id)}
                        className="text-purple-600 hover:text-purple-900 flex items-center space-x-1"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {((pagination.current - 1) * pagination.limit) + 1} to {Math.min(pagination.current * pagination.limit, pagination.total)} of {pagination.total} results
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setFilters({ ...filters, page: pagination.current - 1 })}
                disabled={pagination.current === 1}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-700">
                Page {pagination.current} of {pagination.pages}
              </span>
              <button
                onClick={() => setFilters({ ...filters, page: pagination.current + 1 })}
                disabled={pagination.current === pagination.pages}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Generate Analysis Modal */}
      {showGenerateModal && (
        <GenerateAnalysisModal
          onClose={() => setShowGenerateModal(false)}
          onGenerated={() => {
            setShowGenerateModal(false)
            refetch()
          }}
        />
      )}

      {/* Analytics Detail Modal */}
      {selectedAnalytics && (
        <AnalyticsDetailModal
          analyticsId={selectedAnalytics}
          onClose={() => setSelectedAnalytics(null)}
        />
      )}
    </div>
  )
}

// Generate Analysis Modal Component
function GenerateAnalysisModal({ onClose, onGenerated }: {
  onClose: () => void
  onGenerated: () => void
}) {
  const [analysisType, setAnalysisType] = useState('customer_retention')
  const [formData, setFormData] = useState({
    startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    forecastHorizon: 12,
    methodology: 'linear_regression',
    targetLocation: {
      city: '',
      area: '',
      pincode: ''
    },
    marketData: {
      populationDensity: 0,
      averageIncome: 0,
      competitorCount: 0,
      marketSaturation: 0,
      demandEstimate: 0
    }
  })

  const {
    loading,
    generateCustomerRetentionAnalysis,
    generateBranchPerformanceAnalysis,
    generateRevenueForecast,
    generateExpansionAnalysis
  } = useAnalyticsGeneration()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      switch (analysisType) {
        case 'customer_retention':
          await generateCustomerRetentionAnalysis({
            startDate: formData.startDate,
            endDate: formData.endDate
          })
          break
        case 'branch_performance':
          await generateBranchPerformanceAnalysis({
            startDate: formData.startDate,
            endDate: formData.endDate
          })
          break
        case 'revenue_forecast':
          await generateRevenueForecast({
            startDate: formData.startDate,
            endDate: formData.endDate,
            forecastHorizon: formData.forecastHorizon,
            methodology: formData.methodology
          })
          break
        case 'expansion_analysis':
          await generateExpansionAnalysis({
            targetLocation: formData.targetLocation,
            marketData: formData.marketData
          })
          break
      }
      onGenerated()
    } catch (error) {
      console.error('Failed to generate analysis:', error)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Generate Analytics</h2>
          <p className="text-gray-600 mt-1">Create a new analytics report</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Analysis Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Analysis Type
            </label>
            <select
              value={analysisType}
              onChange={(e) => setAnalysisType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="customer_retention">Customer Retention Analysis</option>
              <option value="branch_performance">Branch Performance Analysis</option>
              <option value="revenue_forecast">Revenue Forecast</option>
              <option value="expansion_analysis">Expansion Analysis</option>
            </select>
          </div>

          {/* Common Fields */}
          {analysisType !== 'expansion_analysis' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
          )}

          {/* Revenue Forecast Specific Fields */}
          {analysisType === 'revenue_forecast' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Forecast Horizon (months)
                </label>
                <input
                  type="number"
                  min="1"
                  max="36"
                  value={formData.forecastHorizon}
                  onChange={(e) => setFormData({ ...formData, forecastHorizon: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Methodology
                </label>
                <select
                  value={formData.methodology}
                  onChange={(e) => setFormData({ ...formData, methodology: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="linear_regression">Linear Regression</option>
                  <option value="exponential_smoothing">Exponential Smoothing</option>
                  <option value="arima">ARIMA</option>
                </select>
              </div>
            </div>
          )}

          {/* Expansion Analysis Specific Fields */}
          {analysisType === 'expansion_analysis' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Target Location</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      value={formData.targetLocation.city}
                      onChange={(e) => setFormData({
                        ...formData,
                        targetLocation: { ...formData.targetLocation, city: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Area
                    </label>
                    <input
                      type="text"
                      value={formData.targetLocation.area}
                      onChange={(e) => setFormData({
                        ...formData,
                        targetLocation: { ...formData.targetLocation, area: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pincode
                    </label>
                    <input
                      type="text"
                      value={formData.targetLocation.pincode}
                      onChange={(e) => setFormData({
                        ...formData,
                        targetLocation: { ...formData.targetLocation, pincode: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Market Data</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Population Density
                    </label>
                    <input
                      type="number"
                      value={formData.marketData.populationDensity}
                      onChange={(e) => setFormData({
                        ...formData,
                        marketData: { ...formData.marketData, populationDensity: parseFloat(e.target.value) }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Average Income (₹)
                    </label>
                    <input
                      type="number"
                      value={formData.marketData.averageIncome}
                      onChange={(e) => setFormData({
                        ...formData,
                        marketData: { ...formData.marketData, averageIncome: parseFloat(e.target.value) }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Competitor Count
                    </label>
                    <input
                      type="number"
                      value={formData.marketData.competitorCount}
                      onChange={(e) => setFormData({
                        ...formData,
                        marketData: { ...formData.marketData, competitorCount: parseInt(e.target.value) }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Demand Estimate
                    </label>
                    <input
                      type="number"
                      value={formData.marketData.demandEstimate}
                      onChange={(e) => setFormData({
                        ...formData,
                        marketData: { ...formData.marketData, demandEstimate: parseFloat(e.target.value) }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
              <span>{loading ? 'Generating...' : 'Generate Analysis'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Analytics Detail Modal Component
function AnalyticsDetailModal({ analyticsId, onClose }: {
  analyticsId: string
  onClose: () => void
}) {
  const { analytics, loading } = useAnalyticsById(analyticsId)

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{analytics.analyticsId}</h2>
            <p className="text-gray-600 mt-1">
              {analytics.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} •
              {new Date(analytics.startDate).toLocaleDateString()} - {new Date(analytics.endDate).toLocaleDateString()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Insights */}
          {analytics.insights && analytics.insights.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <Lightbulb className="w-5 h-5 text-yellow-500" />
                <span>Key Insights</span>
              </h3>
              <div className="space-y-3">
                {analytics.insights.map((insight, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${insight.impact === 'high' ? 'bg-red-500' :
                          insight.impact === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                        }`}></div>
                      <div className="flex-1">
                        <p className="text-gray-900 font-medium">{insight.insight}</p>
                        {insight.recommendedActions.length > 0 && (
                          <div className="mt-2">
                            <p className="text-sm text-gray-600 mb-1">Recommended Actions:</p>
                            <ul className="text-sm text-gray-700 space-y-1">
                              {insight.recommendedActions.map((action, actionIndex) => (
                                <li key={actionIndex} className="flex items-start space-x-2">
                                  <Target className="w-3 h-3 text-purple-500 mt-0.5 flex-shrink-0" />
                                  <span>{action}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Additional content based on analytics type would go here */}
          <div className="text-center text-gray-500 py-8">
            <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p>Detailed analytics visualization would be displayed here</p>
          </div>
        </div>
      </div>
    </div>
  )
}
