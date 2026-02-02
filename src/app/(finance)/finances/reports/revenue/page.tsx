'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { superAdminApi } from '@/lib/superAdminApi'
import { 
  BarChart3,
  Download,
  Calendar,
  Filter,
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  FileText,
  Building2,
  Users,
  CreditCard,
  RefreshCw
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
  Area,
  ComposedChart
} from 'recharts'

interface RevenueReport {
  period: string
  totalRevenue: number
  platformCommission: number
  tenantRevenue: number
  transactionCount: number
  avgTransactionValue: number
  growth: number
  tenantBreakdown: {
    tenantId: string
    tenantName: string
    revenue: number
    transactions: number
    growth: number
  }[]
}

interface ReportFilters {
  dateRange: string
  reportType: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
  tenantFilter: string
  includeRefunds: boolean
}

export default function RevenueReportsPage() {
  const [reports, setReports] = useState<RevenueReport[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<ReportFilters>({
    dateRange: '30d',
    reportType: 'daily',
    tenantFilter: 'all',
    includeRefunds: true
  })
  const [selectedReport, setSelectedReport] = useState<RevenueReport | null>(null)

  useEffect(() => {
    fetchRevenueReports()
  }, [filters])

  const fetchRevenueReports = async () => {
    try {
      setLoading(true)
      
      const params = {
        range: filters.dateRange,
        type: filters.reportType,
        tenant: filters.tenantFilter,
        includeRefunds: filters.includeRefunds
      }

      const data = await superAdminApi.getRevenueReports(params)
      
      if (data.success) {
        setReports(data.data.reports)
        if (data.data.reports.length > 0) {
          setSelectedReport(data.data.reports[0])
        }
      } else {
        throw new Error(data.message || 'Failed to fetch revenue reports')
      }
      
    } catch (error) {
      console.error('Error fetching revenue reports:', error)
      
      // Show empty state instead of mock data
      setReports([])
      setSelectedReport(null)
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

  const generatePDFReport = () => {
    // Implementation for PDF generation
    console.log('Generating PDF report...')
  }

  const exportToExcel = () => {
    // Implementation for Excel export
    console.log('Exporting to Excel...')
  }

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4']

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center">
              <BarChart3 className="w-8 h-8 mr-3" />
              Revenue Reports & Analytics
            </h1>
            <p className="text-green-100 mt-2">
              Comprehensive revenue analysis and detailed financial reporting
            </p>
          </div>
          <div className="flex space-x-3">
            <button 
              onClick={generatePDFReport}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
            >
              <FileText className="w-4 h-4 mr-2" />
              PDF Report
            </button>
            <button 
              onClick={exportToExcel}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
            >
              <Download className="w-4 h-4 mr-2" />
              Excel Export
            </button>
          </div>
        </div>
      </div>

      {/* Report Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
            <select
              value={filters.dateRange}
              onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="6m">Last 6 Months</option>
              <option value="1y">Last Year</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
            <select
              value={filters.reportType}
              onChange={(e) => setFilters({...filters, reportType: e.target.value as any})}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tenant Filter</label>
            <select
              value={filters.tenantFilter}
              onChange={(e) => setFilters({...filters, tenantFilter: e.target.value})}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Tenants</option>
              <option value="top10">Top 10 Tenants</option>
              <option value="active">Active Tenants Only</option>
              <option value="new">New Tenants</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Options</label>
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.includeRefunds}
                  onChange={(e) => setFilters({...filters, includeRefunds: e.target.checked})}
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <span className="ml-2 text-sm text-gray-700">Include Refunds</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      {selectedReport && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-sm p-5 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Total Revenue</p>
                <p className="text-2xl font-bold text-blue-900 mt-1">
                  {formatCurrency(selectedReport.totalRevenue)}
                </p>
                <div className="flex items-center space-x-1 mt-1">
                  {selectedReport.growth > 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-600" />
                  )}
                  <p className={`text-xs ${selectedReport.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {selectedReport.growth > 0 ? '+' : ''}{selectedReport.growth}%
                  </p>
                </div>
              </div>
              <div className="bg-blue-500 p-3 rounded-lg">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-sm p-5 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-green-700 uppercase tracking-wide">Platform Commission</p>
                <p className="text-2xl font-bold text-green-900 mt-1">
                  {formatCurrency(selectedReport.platformCommission)}
                </p>
                <p className="text-xs text-green-600">
                  {((selectedReport.platformCommission / selectedReport.totalRevenue) * 100).toFixed(1)}% of total
                </p>
              </div>
              <div className="bg-green-500 p-3 rounded-lg">
                <PieChart className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-sm p-5 border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide">Transactions</p>
                <p className="text-2xl font-bold text-purple-900 mt-1">
                  {selectedReport.transactionCount.toLocaleString()}
                </p>
                <p className="text-xs text-purple-600">Total transactions</p>
              </div>
              <div className="bg-purple-500 p-3 rounded-lg">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl shadow-sm p-5 border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-orange-700 uppercase tracking-wide">Avg Transaction</p>
                <p className="text-2xl font-bold text-orange-900 mt-1">
                  {formatCurrency(selectedReport.avgTransactionValue)}
                </p>
                <p className="text-xs text-orange-600">Per transaction</p>
              </div>
              <div className="bg-orange-500 p-3 rounded-lg">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Revenue Trends Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
          Revenue Trends Over Time
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={reports}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip formatter={(value, name) => [
                name === 'totalRevenue' || name === 'platformCommission' || name === 'tenantRevenue' 
                  ? formatCurrency(Number(value)) 
                  : value,
                name === 'totalRevenue' ? 'Total Revenue' :
                name === 'platformCommission' ? 'Platform Commission' :
                name === 'tenantRevenue' ? 'Tenant Revenue' :
                name === 'transactionCount' ? 'Transactions' : name
              ]} />
              <Area yAxisId="left" type="monotone" dataKey="totalRevenue" fill="#3B82F6" fillOpacity={0.3} stroke="#3B82F6" />
              <Area yAxisId="left" type="monotone" dataKey="platformCommission" fill="#10B981" fillOpacity={0.3} stroke="#10B981" />
              <Bar yAxisId="right" dataKey="transactionCount" fill="#F59E0B" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tenant Performance */}
      {selectedReport && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 flex items-center">
              <Building2 className="w-5 h-5 mr-2 text-blue-600" />
              Tenant Performance Breakdown - {selectedReport.period}
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tenant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transactions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg Transaction
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Growth
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Commission
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Performance
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {selectedReport.tenantBreakdown.map((tenant, index) => (
                  <tr key={tenant.tenantId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                            #{index + 1}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{tenant.tenantName}</div>
                          <div className="text-sm text-gray-500">{tenant.tenantId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{formatCurrency(tenant.revenue)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{tenant.transactions.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatCurrency(tenant.revenue / tenant.transactions)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {tenant.growth > 0 ? (
                          <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                        )}
                        <span className={`text-sm font-medium ${tenant.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {tenant.growth > 0 ? '+' : ''}{tenant.growth}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatCurrency(tenant.revenue * 0.1)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full" 
                            style={{ width: `${Math.min(100, (tenant.revenue / 600000) * 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500">
                          {Math.min(100, Math.round((tenant.revenue / 600000) * 100))}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Report Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button 
            onClick={generatePDFReport}
            className="flex items-center justify-center space-x-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FileText className="w-6 h-6 text-red-600" />
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900">PDF Report</p>
              <p className="text-xs text-gray-500">Detailed PDF report</p>
            </div>
          </button>
          
          <button 
            onClick={exportToExcel}
            className="flex items-center justify-center space-x-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="w-6 h-6 text-green-600" />
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900">Excel Export</p>
              <p className="text-xs text-gray-500">Spreadsheet format</p>
            </div>
          </button>
          
          <button className="flex items-center justify-center space-x-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <RefreshCw className="w-6 h-6 text-blue-600" />
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900">Schedule Report</p>
              <p className="text-xs text-gray-500">Automated delivery</p>
            </div>
          </button>
          
          <button className="flex items-center justify-center space-x-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Users className="w-6 h-6 text-purple-600" />
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900">Share Report</p>
              <p className="text-xs text-gray-500">Send to stakeholders</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}