'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { 
  FileText,
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
  Hash
} from 'lucide-react'

interface ExportRequest {
  _id: string
  type: 'financial' | 'security' | 'audit' | 'compliance'
  format: 'pdf'
  status: 'pending' | 'processing' | 'completed' | 'failed'
  watermark: string
  filename: string
  recordCount: number
  requestedBy: string
  requestedAt: Date
  completedAt?: Date
  downloadUrl?: string
  expiresAt?: Date
}

export default function PDFExportPage() {
  const [exportRequests, setExportRequests] = useState<ExportRequest[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedType, setSelectedType] = useState<string>('financial')
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [filters, setFilters] = useState({
    tenantId: '',
    severity: 'all',
    includeDetails: true
  })

  useEffect(() => {
    fetchExportHistory()
  }, [])

  const fetchExportHistory = async () => {
    try {
      const response = await fetch('/api/superadmin/audit/export/history', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth-storage') ? JSON.parse(localStorage.getItem('auth-storage')).state?.token : ''}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch export history')
      }
      
      const data = await response.json()
      
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
          format: 'pdf',
          status: 'completed',
          watermark: 'AUD-2024-001234',
          filename: 'financial-audit-AUD-2024-001234.pdf',
          recordCount: 1500,
          requestedBy: 'auditor@laundrylobby.com',
          requestedAt: new Date(Date.now() - 3600000),
          completedAt: new Date(Date.now() - 3000000),
          downloadUrl: '/api/audit/download/AUD-2024-001234',
          expiresAt: new Date(Date.now() + 86400000)
        },
        {
          _id: '2',
          type: 'security',
          format: 'pdf',
          status: 'processing',
          watermark: 'AUD-2024-001235',
          filename: 'security-audit-AUD-2024-001235.pdf',
          recordCount: 850,
          requestedBy: 'auditor@laundrylobby.com',
          requestedAt: new Date(Date.now() - 1800000),
          expiresAt: new Date(Date.now() + 86400000)
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
        format: 'pdf',
        startDate: dateRange.start,
        endDate: dateRange.end,
        filters
      }

      const response = await fetch('/api/superadmin/audit/export/pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth-storage') ? JSON.parse(localStorage.getItem('auth-storage')).state?.token : ''}`
        },
        body: JSON.stringify(exportData)
      })
      
      if (!response.ok) {
        throw new Error('Failed to request export')
      }
      
      const data = await response.json()
      
      if (data.success) {
        // Add new export request to the list
        const newExport: ExportRequest = {
          _id: data.data.exportId,
          type: selectedType as any,
          format: 'pdf',
          status: 'pending',
          watermark: data.data.watermark,
          filename: data.data.filename,
          recordCount: data.data.recordCount,
          requestedBy: 'auditor@laundrylobby.com',
          requestedAt: new Date(),
          downloadUrl: data.data.downloadUrl,
          expiresAt: new Date(data.data.expiresAt)
        }
        
        setExportRequests(prev => [newExport, ...prev])
        
        // Show success message
        alert(`Export request submitted successfully. Watermark: ${data.data.watermark}`)
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
      default: return 'text-gray-700 bg-gray-100'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'financial': return <DollarSign className="w-4 h-4" />
      case 'security': return <Shield className="w-4 h-4" />
      case 'audit': return <Activity className="w-4 h-4" />
      case 'compliance': return <FileText className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center">
              <FileText className="w-8 h-8 mr-3" />
              Watermarked PDF Export
            </h1>
            <p className="text-blue-100 mt-2">
              Generate secure, watermarked PDF reports for audit compliance
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-blue-100">Secure Export</p>
            <p className="text-xs text-blue-200">Watermarked & Traceable</p>
          </div>
        </div>
      </div>

      {/* Export Request Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
          <Download className="w-5 h-5 mr-2 text-blue-600" />
          Request New PDF Export
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Export Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Export Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="financial">Financial Audit Report</option>
              <option value="security">Security Audit Report</option>
              <option value="audit">Complete Audit Trail</option>
              <option value="compliance">Compliance Report</option>
            </select>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Severity Filter</label>
            <select
              value={filters.severity}
              onChange={(e) => setFilters(prev => ({ ...prev, severity: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Severity Levels</option>
              <option value="critical">Critical Only</option>
              <option value="high">High & Critical</option>
              <option value="medium">Medium & Above</option>
            </select>
          </div>

          <div className="flex items-center">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.includeDetails}
                onChange={(e) => setFilters(prev => ({ ...prev, includeDetails: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Include detailed logs</span>
            </label>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleExportRequest}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {loading ? (
              <>
                <Activity className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Request PDF Export
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
          <p className="text-sm text-gray-600 mt-1">Track all PDF export requests and downloads</p>
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
                      <Hash className="w-4 h-4 mr-2 text-blue-600" />
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
                    <div>{request.requestedAt.toLocaleDateString()}</div>
                    <div className="text-gray-500 text-xs">{request.requestedAt.toLocaleTimeString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {request.completedAt ? (
                      <div>
                        <div>{request.completedAt.toLocaleDateString()}</div>
                        <div className="text-gray-500 text-xs">{request.completedAt.toLocaleTimeString()}</div>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {request.expiresAt ? (
                      <div>
                        <div>{request.expiresAt.toLocaleDateString()}</div>
                        <div className="text-gray-500 text-xs">{request.expiresAt.toLocaleTimeString()}</div>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {request.status === 'completed' && request.downloadUrl ? (
                      <a
                        href={request.downloadUrl}
                        className="text-blue-600 hover:text-blue-900 flex items-center"
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
                <li>All exported PDFs are watermarked with unique identifiers for traceability</li>
                <li>Export events are logged in the audit trail with user attribution</li>
                <li>Downloaded files expire after 24 hours for security compliance</li>
                <li>Only authorized auditors can access sensitive data exports</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}