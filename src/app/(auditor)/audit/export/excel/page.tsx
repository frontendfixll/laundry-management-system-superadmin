'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { superAdminApi } from '@/lib/superAdminApi'
import {
  BarChart3,
  Download,
  Calendar,
  Filter,
  Shield,
  DollarSign,
  Users,
  Activity,
  Clock,
  CheckCircle,
  AlertTriangle,
  Eye,
  Hash,
  FileText,
  Table
} from 'lucide-react'

interface ExportRequest {
  _id: string
  type: 'financial' | 'security' | 'audit' | 'compliance' | 'rbac' | 'tenant'
  format: 'excel'
  status: 'pending' | 'processing' | 'completed' | 'failed'
  watermark: string
  filename: string
  recordCount: number
  sheetCount: number
  requestedBy: string
  requestedAt: Date
  completedAt?: Date
  downloadUrl?: string
  expiresAt?: Date
  fileSize?: string
}

export default function ExcelExportPage() {
  const [exportRequests, setExportRequests] = useState<ExportRequest[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedType, setSelectedType] = useState<string>('financial')
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [filters, setFilters] = useState({
    tenantId: '',
    severity: 'all',
    includeCharts: true,
    multiSheet: true
  })

  useEffect(() => {
    fetchExportHistory()
  }, [])

  const fetchExportHistory = async () => {
    try {
      const data = await superAdminApi.get(`/audit/export/history`)

      if (data.success) {
        setExportRequests(data.data.exports || [])
      } else {
        throw new Error(data.message || 'Failed to fetch export history')
      }

    } catch (error) {
      console.error('Error fetching export history:', error)
      // Fallback to mock data
      const mockExports: ExportRequest[] = [
        {
          _id: '1',
          type: 'financial',
          format: 'excel',
          status: 'completed',
          watermark: 'XLS-2024-001234',
          filename: 'financial-audit-XLS-2024-001234.xlsx',
          recordCount: 3200,
          sheetCount: 5,
          requestedBy: 'auditor@laundrylobby.com',
          requestedAt: new Date(Date.now() - 3600000),
          completedAt: new Date(Date.now() - 3000000),
          downloadUrl: '/api/audit/download/XLS-2024-001234',
          expiresAt: new Date(Date.now() + 86400000),
          fileSize: '2.4 MB'
        },
        {
          _id: '2',
          type: 'security',
          format: 'excel',
          status: 'processing',
          watermark: 'XLS-2024-001235',
          filename: 'security-audit-XLS-2024-001235.xlsx',
          recordCount: 1850,
          sheetCount: 3,
          requestedBy: 'auditor@laundrylobby.com',
          requestedAt: new Date(Date.now() - 1800000),
          expiresAt: new Date(Date.now() + 86400000),
          fileSize: '1.1 MB'
        },
        {
          _id: '3',
          type: 'rbac',
          format: 'excel',
          status: 'completed',
          watermark: 'XLS-2024-001236',
          filename: 'rbac-audit-XLS-2024-001236.xlsx',
          recordCount: 720,
          sheetCount: 4,
          requestedBy: 'auditor@laundrylobby.com',
          requestedAt: new Date(Date.now() - 7200000),
          completedAt: new Date(Date.now() - 6600000),
          downloadUrl: '/api/audit/download/XLS-2024-001236',
          expiresAt: new Date(Date.now() + 86400000),
          fileSize: '890 KB'
        },
        {
          _id: '4',
          type: 'tenant',
          format: 'excel',
          status: 'failed',
          watermark: 'XLS-2024-001237',
          filename: 'tenant-audit-XLS-2024-001237.xlsx',
          recordCount: 0,
          sheetCount: 0,
          requestedBy: 'auditor@laundrylobby.com',
          requestedAt: new Date(Date.now() - 10800000),
          expiresAt: new Date(Date.now() + 86400000)
        },
        {
          _id: '5',
          type: 'compliance',
          format: 'excel',
          status: 'completed',
          watermark: 'XLS-2024-001238',
          filename: 'compliance-audit-XLS-2024-001238.xlsx',
          recordCount: 4500,
          sheetCount: 8,
          requestedBy: 'auditor@laundrylobby.com',
          requestedAt: new Date(Date.now() - 14400000),
          completedAt: new Date(Date.now() - 13800000),
          downloadUrl: '/api/audit/download/XLS-2024-001238',
          expiresAt: new Date(Date.now() + 86400000),
          fileSize: '5.7 MB'
        }
      ]
      setExportRequests(mockExports)
    }
  }

  const handleExportRequest = async () => {
    try {
      setLoading(true)

      const exportData = {
        type: selectedType,
        format: 'excel',
        startDate: dateRange.start,
        endDate: dateRange.end,
        filters
      }

      const data = await superAdminApi.post(`/audit/export/excel`, exportData)

      if (data.success) {
        // Add new export request to the list
        const newExport: ExportRequest = {
          _id: data.data.exportId,
          type: selectedType as any,
          format: 'excel',
          status: 'pending',
          watermark: data.data.watermark,
          filename: data.data.filename,
          recordCount: data.data.recordCount,
          sheetCount: data.data.sheetCount || 1,
          requestedBy: 'auditor@laundrylobby.com',
          requestedAt: new Date(),
          downloadUrl: data.data.downloadUrl,
          expiresAt: new Date(data.data.expiresAt),
          fileSize: data.data.fileSize
        }

        setExportRequests(prev => [newExport, ...prev])

        // Show success message
        alert(`Excel export request submitted successfully. Watermark: ${data.data.watermark}`)
      } else {
        throw new Error(data.message || 'Failed to request export')
      }

    } catch (error) {
      console.error('Error requesting export:', error)
      alert('Failed to request export. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-700 bg-green-100'
      case 'processing': return 'text-blue-700 bg-blue-100'
      case 'pending': return 'text-yellow-700 bg-yellow-100'
      case 'failed': return 'text-red-700 bg-red-100'
      default: return 'text-gray-700 bg-gray-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />
      case 'processing': return <Activity className="w-4 h-4 animate-spin" />
      case 'pending': return <Clock className="w-4 h-4" />
      case 'failed': return <AlertTriangle className="w-4 h-4" />
      default: return <Eye className="w-4 h-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'financial': return 'text-green-700 bg-green-100'
      case 'security': return 'text-red-700 bg-red-100'
      case 'audit': return 'text-blue-700 bg-blue-100'
      case 'compliance': return 'text-purple-700 bg-purple-100'
      case 'rbac': return 'text-orange-700 bg-orange-100'
      case 'tenant': return 'text-teal-700 bg-teal-100'
      default: return 'text-gray-700 bg-gray-100'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'financial': return <DollarSign className="w-4 h-4" />
      case 'security': return <Shield className="w-4 h-4" />
      case 'audit': return <Activity className="w-4 h-4" />
      case 'compliance': return <FileText className="w-4 h-4" />
      case 'rbac': return <Users className="w-4 h-4" />
      case 'tenant': return <Table className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 via-teal-600 to-blue-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center">
              <BarChart3 className="w-8 h-8 mr-3" />
              Excel Reports Export
            </h1>
            <p className="text-green-100 mt-2">
              Generate multi-sheet Excel workbooks with pivot-ready data and charts
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-green-100">Structured Export</p>
            <p className="text-xs text-green-200">Multi-Sheet & Chart-Ready</p>
          </div>
        </div>
      </div>

      {/* Excel Features Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Table className="w-5 h-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">Multi-Sheet Reports</p>
              <p className="text-xs text-gray-500">Organized data across multiple worksheets</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-teal-100 rounded-lg">
              <BarChart3 className="w-5 h-5 text-teal-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">Chart-Ready Data</p>
              <p className="text-xs text-gray-500">Pre-formatted for pivot tables and charts</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Filter className="w-5 h-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">Pivot Table Data</p>
              <p className="text-xs text-gray-500">Structured for advanced data analysis</p>
            </div>
          </div>
        </div>
      </div>

      {/* Export Request Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
          <Download className="w-5 h-5 mr-2 text-green-600" />
          Request New Excel Export
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Export Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Export Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="financial">Financial Audit Report</option>
              <option value="security">Security Audit Report</option>
              <option value="audit">Complete Audit Trail</option>
              <option value="compliance">Compliance Report</option>
              <option value="rbac">RBAC & Permissions Report</option>
              <option value="tenant">Tenant Activity Report</option>
            </select>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Filters */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tenant Filter</label>
            <input
              type="text"
              placeholder="Tenant ID (optional)"
              value={filters.tenantId}
              onChange={(e) => setFilters(prev => ({ ...prev, tenantId: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Severity Filter</label>
            <select
              value={filters.severity}
              onChange={(e) => setFilters(prev => ({ ...prev, severity: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Severity Levels</option>
              <option value="critical">Critical Only</option>
              <option value="high">High & Critical</option>
              <option value="medium">Medium & Above</option>
            </select>
          </div>

          <div className="flex flex-col justify-center space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.includeCharts}
                onChange={(e) => setFilters(prev => ({ ...prev, includeCharts: e.target.checked }))}
                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <span className="ml-2 text-sm text-gray-700">Include chart-ready data</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.multiSheet}
                onChange={(e) => setFilters(prev => ({ ...prev, multiSheet: e.target.checked }))}
                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <span className="ml-2 text-sm text-gray-700">Multi-sheet workbook</span>
            </label>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleExportRequest}
            disabled={loading}
            className="bg-green-600 text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {loading ? (
              <>
                <Activity className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Request Excel Export
              </>
            )}
          </button>
        </div>
      </div>

      {/* Export History */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-gray-600" />
            Export History
          </h3>
          <p className="text-sm text-gray-600 mt-1">Track all Excel export requests and downloads</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Watermark
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Records
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sheets
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  File Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Requested
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Completed
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expires
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {exportRequests.map((request) => (
                <tr key={request._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Hash className="w-4 h-4 mr-2 text-green-600" />
                      <div>
                        <div className="text-sm font-mono font-medium text-gray-900">{request.watermark}</div>
                        <div className="text-xs text-gray-500">{request.filename}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center w-fit ${getTypeColor(request.type)}`}>
                      {getTypeIcon(request.type)}
                      <span className="ml-1">{request.type.toUpperCase()}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center w-fit ${getStatusColor(request.status)}`}>
                      {getStatusIcon(request.status)}
                      <span className="ml-1">{request.status.toUpperCase()}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {request.recordCount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <Table className="w-3 h-3 mr-1 text-gray-400" />
                      {request.sheetCount}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {request.fileSize ? (
                      <span>{request.fileSize}</span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>{new Date(request.requestedAt).toLocaleDateString()}</div>
                    <div className="text-gray-500 text-xs">{new Date(request.requestedAt).toLocaleTimeString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {request.completedAt ? (
                      <div>
                        <div>{new Date(request.completedAt).toLocaleDateString()}</div>
                        <div className="text-gray-500 text-xs">{new Date(request.completedAt).toLocaleTimeString()}</div>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {request.expiresAt ? (
                      <div>
                        <div>{new Date(request.expiresAt).toLocaleDateString()}</div>
                        <div className="text-gray-500 text-xs">{new Date(request.expiresAt).toLocaleTimeString()}</div>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {request.status === 'completed' && request.downloadUrl ? (
                      <a
                        href={request.downloadUrl}
                        className="text-green-600 hover:text-green-900 flex items-center"
                        download
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </a>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Security Notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start">
          <Shield className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" />
          <div>
            <h4 className="text-sm font-medium text-yellow-800">Security & Compliance Notice</h4>
            <div className="text-sm text-yellow-700 mt-1">
              <ul className="list-disc list-inside space-y-1">
                <li>All exported Excel workbooks are watermarked with unique identifiers for traceability</li>
                <li>Export events are logged in the audit trail with user attribution</li>
                <li>Downloaded files expire after 24 hours for security compliance</li>
                <li>Only authorized auditors can access sensitive data exports</li>
                <li>Multi-sheet workbooks include a metadata sheet with export provenance details</li>
                <li>Chart-ready data sheets are formatted for immediate pivot table creation</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
