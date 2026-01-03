'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { superAdminApi } from '@/lib/superAdminApi'
import { 
  ArrowLeft,
  Plus,
  Clock,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Settings,
  CheckCircle,
  X,
  AlertTriangle
} from 'lucide-react'

interface SLATarget {
  category: string
  severity: string
  priority: string
  firstResponseTime: number
  resolutionTime: number
}

interface SLAConfig {
  _id: string
  configId: string
  name: string
  description?: string
  scope: string
  isActive: boolean
  targets: SLATarget[]
  createdAt: string
  createdBy?: { name: string }
}

interface Pagination {
  current: number
  pages: number
  total: number
  limit: number
}

export default function SLAConfigPage() {
  const [configs, setConfigs] = useState<SLAConfig[]>([])
  const [pagination, setPagination] = useState<Pagination>({ current: 1, pages: 1, total: 0, limit: 20 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // Create modal
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [newConfig, setNewConfig] = useState({
    name: '',
    description: '',
    scope: 'global',
    targets: [
      { category: 'service_quality', severity: 'medium', priority: 'normal', firstResponseTime: 60, resolutionTime: 480 }
    ]
  })

  useEffect(() => {
    fetchConfigs()
  }, [pagination.current])

  const fetchConfigs = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await superAdminApi.getSLAConfigurations({ page: pagination.current, limit: 20 })
      setConfigs(response.data.configs)
      setPagination(response.data.pagination)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!newConfig.name.trim()) return
    try {
      setCreateLoading(true)
      await superAdminApi.createSLAConfiguration(newConfig)
      setShowCreateModal(false)
      setNewConfig({
        name: '',
        description: '',
        scope: 'global',
        targets: [{ category: 'service_quality', severity: 'medium', priority: 'normal', firstResponseTime: 60, resolutionTime: 480 }]
      })
      fetchConfigs()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setCreateLoading(false)
    }
  }

  const addTarget = () => {
    setNewConfig({
      ...newConfig,
      targets: [...newConfig.targets, { category: 'service_quality', severity: 'medium', priority: 'normal', firstResponseTime: 60, resolutionTime: 480 }]
    })
  }

  const removeTarget = (index: number) => {
    setNewConfig({
      ...newConfig,
      targets: newConfig.targets.filter((_, i) => i !== index)
    })
  }

  const updateTarget = (index: number, field: string, value: any) => {
    const updatedTargets = [...newConfig.targets]
    updatedTargets[index] = { ...updatedTargets[index], [field]: value }
    setNewConfig({ ...newConfig, targets: updatedTargets })
  }

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
  }

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      service_quality: 'Service Quality',
      delivery_delay: 'Delivery Delay',
      damaged_items: 'Damaged Items',
      missing_items: 'Missing Items',
      billing_issue: 'Billing Issue',
      staff_behavior: 'Staff Behavior',
      refund_request: 'Refund Request',
      technical_issue: 'Technical Issue',
      fraud_report: 'Fraud Report',
      other: 'Other'
    }
    return labels[category] || category
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/superadmin/risk" className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">SLA Configuration</h1>
            <p className="text-gray-600">Configure Service Level Agreement targets</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => fetchConfigs()}
            className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
          >
            <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            New Configuration
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>
      )}

      {/* Configs List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        ) : configs.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No SLA configurations found</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg"
            >
              Create First Configuration
            </button>
          </div>
        ) : (
          configs.map((config) => (
            <div key={config._id} className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-gray-900">{config.name}</h3>
                    {config.isActive ? (
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Active
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">Inactive</span>
                    )}
                    <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full capitalize">
                      {config.scope}
                    </span>
                  </div>
                  {config.description && (
                    <p className="text-gray-600 text-sm mt-1">{config.description}</p>
                  )}
                  <p className="text-gray-400 text-xs mt-2">
                    ID: {config.configId} • Created: {new Date(config.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Targets Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Severity</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">First Response</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Resolution</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {config.targets.map((target, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2 text-sm text-gray-900">{getCategoryLabel(target.category)}</td>
                        <td className="px-4 py-2 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            target.severity === 'critical' ? 'bg-red-100 text-red-800' :
                            target.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                            target.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {target.severity}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            target.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                            target.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                            target.priority === 'normal' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {target.priority}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-600">
                          <Clock className="w-4 h-4 inline mr-1" />
                          {formatTime(target.firstResponseTime)}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-600">
                          <Clock className="w-4 h-4 inline mr-1" />
                          {formatTime(target.resolutionTime)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Page {pagination.current} of {pagination.pages}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPagination(prev => ({ ...prev, current: prev.current - 1 }))}
              disabled={pagination.current === 1}
              className="p-2 border rounded-lg disabled:opacity-50"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => setPagination(prev => ({ ...prev, current: prev.current + 1 }))}
              disabled={pagination.current === pagination.pages}
              className="p-2 border rounded-lg disabled:opacity-50"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Create SLA Configuration</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={newConfig.name}
                    onChange={(e) => setNewConfig({ ...newConfig, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="e.g., Standard SLA"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Scope</label>
                  <select
                    value={newConfig.scope}
                    onChange={(e) => setNewConfig({ ...newConfig, scope: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="global">Global</option>
                    <option value="regional">Regional</option>
                    <option value="city">City</option>
                    <option value="branch">Branch</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newConfig.description}
                  onChange={(e) => setNewConfig({ ...newConfig, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Optional description..."
                />
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium text-gray-900">SLA Targets</h4>
                  <button
                    onClick={addTarget}
                    className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" /> Add Target
                  </button>
                </div>

                <div className="space-y-4">
                  {newConfig.targets.map((target, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-sm font-medium text-gray-700">Target {index + 1}</span>
                        {newConfig.targets.length > 1 && (
                          <button
                            onClick={() => removeTarget(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-5 gap-3">
                        <select
                          value={target.category}
                          onChange={(e) => updateTarget(index, 'category', e.target.value)}
                          className="px-2 py-1 border rounded text-sm"
                        >
                          <option value="service_quality">Service Quality</option>
                          <option value="delivery_delay">Delivery Delay</option>
                          <option value="damaged_items">Damaged Items</option>
                          <option value="billing_issue">Billing Issue</option>
                          <option value="fraud_report">Fraud Report</option>
                          <option value="other">Other</option>
                        </select>
                        <select
                          value={target.severity}
                          onChange={(e) => updateTarget(index, 'severity', e.target.value)}
                          className="px-2 py-1 border rounded text-sm"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                          <option value="critical">Critical</option>
                        </select>
                        <select
                          value={target.priority}
                          onChange={(e) => updateTarget(index, 'priority', e.target.value)}
                          className="px-2 py-1 border rounded text-sm"
                        >
                          <option value="low">Low</option>
                          <option value="normal">Normal</option>
                          <option value="high">High</option>
                          <option value="urgent">Urgent</option>
                        </select>
                        <div>
                          <input
                            type="number"
                            value={target.firstResponseTime}
                            onChange={(e) => updateTarget(index, 'firstResponseTime', Number(e.target.value))}
                            className="w-full px-2 py-1 border rounded text-sm"
                            min="1"
                            placeholder="Response (min)"
                          />
                        </div>
                        <div>
                          <input
                            type="number"
                            value={target.resolutionTime}
                            onChange={(e) => updateTarget(index, 'resolutionTime', Number(e.target.value))}
                            className="w-full px-2 py-1 border rounded text-sm"
                            min="1"
                            placeholder="Resolution (min)"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 border rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={createLoading || !newConfig.name.trim()}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg disabled:opacity-50"
              >
                {createLoading ? 'Creating...' : 'Create Configuration'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

