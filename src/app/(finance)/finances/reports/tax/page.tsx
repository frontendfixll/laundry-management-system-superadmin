'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { superAdminApi } from '@/lib/superAdminApi'
import { 
  FileText,
  Download,
  Calendar,
  Filter,
  Calculator,
  Building2,
  DollarSign,
  PieChart,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  Search
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

interface TaxReport {
  period: string
  totalRevenue: number
  taxableRevenue: number
  gstCollected: number
  tdsDeducted: number
  netTaxLiability: number
  gstRate: number
  tdsRate: number
  tenantTaxBreakdown: {
    tenantId: string
    tenantName: string
    revenue: number
    gstCollected: number
    tdsDeducted: number
    taxableIncome: number
    gstNumber?: string
    panNumber?: string
  }[]
  complianceStatus: 'compliant' | 'pending' | 'overdue'
  filingDeadline: Date
  lastFiled: Date
}

interface TaxSummary {
  quarterlyGST: number
  annualTDS: number
  totalTaxLiability: number
  complianceScore: number
  pendingReturns: number
  overdueReturns: number
}

export default function TaxReportsPage() {
  const [taxReports, setTaxReports] = useState<TaxReport[]>([])
  const [loading, setLoading] = useState(true)
  const [taxSummary, setTaxSummary] = useState<TaxSummary | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState('current_quarter')
  const [selectedReport, setSelectedReport] = useState<TaxReport | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchTaxReports()
  }, [selectedPeriod])

  const fetchTaxReports = async () => {
    try {
      setLoading(true)
      
      const data = await superAdminApi.getTaxReports(selectedPeriod)
      
      if (data.success) {
        setTaxReports(data.data.reports.map((report: any) => ({
          ...report,
          filingDeadline: new Date(report.filingDeadline),
          lastFiled: new Date(report.lastFiled)
        })))
        setTaxSummary(data.data.summary)
        if (data.data.reports.length > 0) {
          setSelectedReport(data.data.reports[0])
        }
      } else {
        throw new Error(data.message || 'Failed to fetch tax reports')
      }
      
    } catch (error) {
      console.error('Error fetching tax reports:', error)
      
      // Show empty state instead of mock data
      setTaxReports([])
      setTaxSummary({
        quarterlyGST: 0,
        annualTDS: 0,
        totalTaxLiability: 0,
        complianceScore: 0,
        pendingReturns: 0,
        overdueReturns: 0
      })
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

  const getComplianceColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'text-green-700 bg-green-100'
      case 'pending': return 'text-yellow-700 bg-yellow-100'
      case 'overdue': return 'text-red-700 bg-red-100'
      default: return 'text-gray-700 bg-gray-100'
    }
  }

  const getComplianceIcon = (status: string) => {
    switch (status) {
      case 'compliant': return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'pending': return <Clock className="w-4 h-4 text-yellow-600" />
      case 'overdue': return <AlertTriangle className="w-4 h-4 text-red-600" />
      default: return <AlertTriangle className="w-4 h-4 text-gray-600" />
    }
  }

  const generateGSTReturn = () => {
    console.log('Generating GST return...')
  }

  const generateTDSReturn = () => {
    console.log('Generating TDS return...')
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
              <Calculator className="w-8 h-8 mr-3" />
              Tax Reports & Compliance
            </h1>
            <p className="text-blue-100 mt-2">
              Comprehensive tax reporting, GST returns, and compliance management
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-blue-100">Compliance Score</p>
            <p className="text-2xl font-bold">{taxSummary?.complianceScore || 0}%</p>
          </div>
        </div>
      </div>

      {/* Tax Summary Cards */}
      {taxSummary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-sm p-5 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Quarterly GST</p>
                <p className="text-2xl font-bold text-blue-900 mt-1">
                  {formatCurrency(taxSummary.quarterlyGST)}
                </p>
                <p className="text-xs text-blue-600">Current quarter</p>
              </div>
              <div className="bg-blue-500 p-3 rounded-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-sm p-5 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-green-700 uppercase tracking-wide">Annual TDS</p>
                <p className="text-2xl font-bold text-green-900 mt-1">
                  {formatCurrency(taxSummary.annualTDS)}
                </p>
                <p className="text-xs text-green-600">Financial year</p>
              </div>
              <div className="bg-green-500 p-3 rounded-lg">
                <Calculator className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-sm p-5 border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide">Tax Liability</p>
                <p className="text-2xl font-bold text-purple-900 mt-1">
                  {formatCurrency(taxSummary.totalTaxLiability)}
                </p>
                <p className="text-xs text-purple-600">Total outstanding</p>
              </div>
              <div className="bg-purple-500 p-3 rounded-lg">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl shadow-sm p-5 border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-orange-700 uppercase tracking-wide">Pending Returns</p>
                <p className="text-2xl font-bold text-orange-900 mt-1">
                  {taxSummary.pendingReturns}
                </p>
                <p className="text-xs text-orange-600">{taxSummary.overdueReturns} overdue</p>
              </div>
              <div className="bg-orange-500 p-3 rounded-lg">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Period Selection */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-gray-500" />
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="current_quarter">Current Quarter</option>
                <option value="last_quarter">Last Quarter</option>
                <option value="current_year">Current Financial Year</option>
                <option value="last_year">Last Financial Year</option>
                <option value="custom">Custom Period</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Search className="w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Search tenants..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button 
              onClick={generateGSTReturn}
              className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors flex items-center"
            >
              <FileText className="w-4 h-4 mr-2" />
              GST Return
            </button>
            <button 
              onClick={generateTDSReturn}
              className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors flex items-center"
            >
              <Calculator className="w-4 h-4 mr-2" />
              TDS Return
            </button>
          </div>
        </div>
      </div>

      {/* Tax Analysis Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tax Breakdown */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <PieChart className="w-5 h-5 mr-2 text-blue-600" />
            Tax Breakdown
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={selectedReport ? [
                    { name: 'GST Collected', value: selectedReport.gstCollected, color: '#3B82F6' },
                    { name: 'TDS Deducted', value: selectedReport.tdsDeducted, color: '#10B981' },
                    { name: 'Net Revenue', value: selectedReport.totalRevenue - selectedReport.gstCollected - selectedReport.tdsDeducted, color: '#F59E0B' }
                  ] : []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {COLORS.map((color, index) => (
                    <Cell key={`cell-${index}`} fill={color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tax Trends */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
            Tax Collection Trends
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={taxReports}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Area type="monotone" dataKey="gstCollected" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
                <Area type="monotone" dataKey="tdsDeducted" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tenant Tax Details */}
      {selectedReport && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 flex items-center">
                <Building2 className="w-5 h-5 mr-2 text-purple-600" />
                Tenant Tax Breakdown - {selectedReport.period}
              </h3>
              <div className="flex items-center space-x-2">
                {getComplianceIcon(selectedReport.complianceStatus)}
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getComplianceColor(selectedReport.complianceStatus)}`}>
                  {selectedReport.complianceStatus}
                </span>
              </div>
            </div>
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
                    GST Collected
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    TDS Deducted
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Taxable Income
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    GST Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    PAN Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {selectedReport.tenantTaxBreakdown.map((tenant, index) => (
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
                      <div className="text-sm text-blue-600 font-medium">{formatCurrency(tenant.gstCollected)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-green-600 font-medium">{formatCurrency(tenant.tdsDeducted)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{formatCurrency(tenant.taxableIncome)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-mono">{tenant.gstNumber || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-mono">{tenant.panNumber || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Compliance Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tax Compliance Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button 
            onClick={generateGSTReturn}
            className="flex items-center justify-center space-x-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FileText className="w-6 h-6 text-blue-600" />
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900">Generate GST Return</p>
              <p className="text-xs text-gray-500">GSTR-1, GSTR-3B</p>
            </div>
          </button>
          
          <button 
            onClick={generateTDSReturn}
            className="flex items-center justify-center space-x-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Calculator className="w-6 h-6 text-green-600" />
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900">Generate TDS Return</p>
              <p className="text-xs text-gray-500">Form 24Q, 26Q</p>
            </div>
          </button>
          
          <button className="flex items-center justify-center space-x-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="w-6 h-6 text-purple-600" />
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900">Export Tax Data</p>
              <p className="text-xs text-gray-500">Excel, CSV formats</p>
            </div>
          </button>
          
          <button className="flex items-center justify-center space-x-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <RefreshCw className="w-6 h-6 text-orange-600" />
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900">Sync Tax Data</p>
              <p className="text-xs text-gray-500">Update calculations</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}