'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { superAdminApi } from '@/lib/superAdminApi'
import { 
  ArrowLeft,
  AlertTriangle,
  Eye,
  RefreshCw,
  TrendingUp,
  Clock,
  User,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'

interface EscalatedComplaint {
  _id: string
  complaintId: string
  title: string
  description: string
  category: string
  severity: string
  priority: string
  status: string
  customerName: string
  customerEmail: string
  isEscalated: boolean
  escalationLevel: number
  escalationReason?: string
  escalatedAt?: string
  slaBreached: boolean
  createdAt: string
  branchId?: { name: string }
}

export default function EscalationsPage() {
  const [complaints, setComplaints] = useState<EscalatedComplaint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [levelFilter, setLevelFilter] = useState<number | ''>('')

  useEffect(() => {
    fetchEscalatedComplaints()
  }, [])

  const fetchEscalatedComplaints = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await superAdminApi.getComplaints({
        isEscalated: true,
        status: 'escalated',
        sortBy: 'escalationLevel',
        sortOrder: 'desc',
        limit: 100
      })
      setComplaints(response.data.complaints)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const getSeverityBadge = (severity: string) => {
    const config: Record<string, { color: string, icon: any }> = {
      low: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      medium: { color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
      high: { color: 'bg-orange-100 text-orange-800', icon: AlertTriangle },
      critical: { color: 'bg-red-100 text-red-800', icon: XCircle }
    }
    const { color, icon: Icon } = config[severity] || config.medium
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {severity.charAt(0).toUpperCase() + severity.slice(1)}
      </span>
    )
  }

  const getEscalationLevelBadge = (level: number) => {
    const colors = [
      'bg-yellow-100 text-yellow-800',
      'bg-orange-100 text-orange-800',
      'bg-red-100 text-red-800',
      'bg-red-200 text-red-900',
      'bg-red-300 text-red-900'
    ]
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${colors[level - 1] || colors[0]}`}>
        <TrendingUp className="w-4 h-4 mr-1" />
        Level {level}
      </span>
    )
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

  const filteredComplaints = levelFilter 
    ? complaints.filter(c => c.escalationLevel === levelFilter)
    : complaints

  // Group by escalation level
  const groupedByLevel = filteredComplaints.reduce((acc, complaint) => {
    const level = complaint.escalationLevel
    if (!acc[level]) acc[level] = []
    acc[level].push(complaint)
    return acc
  }, {} as Record<number, EscalatedComplaint[]>)

  const levels = Object.keys(groupedByLevel).map(Number).sort((a, b) => b - a)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/superadmin/risk" className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Escalated Cases</h1>
            <p className="text-gray-600">Handle escalated complaints requiring immediate attention</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value ? Number(e.target.value) : '')}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">All Levels</option>
            <option value="1">Level 1</option>
            <option value="2">Level 2</option>
            <option value="3">Level 3</option>
            <option value="4">Level 4</option>
            <option value="5">Level 5</option>
          </select>
          <button
            onClick={fetchEscalatedComplaints}
            className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
          >
            <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map(level => {
          const count = complaints.filter(c => c.escalationLevel === level).length
          return (
            <div
              key={level}
              onClick={() => setLevelFilter(levelFilter === level ? '' : level)}
              className={`bg-white rounded-lg shadow-sm border p-4 cursor-pointer transition-all ${
                levelFilter === level ? 'ring-2 ring-purple-500' : 'hover:shadow-md'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Level {level}</p>
                  <p className="text-2xl font-bold text-gray-900">{count}</p>
                </div>
                <div className={`p-2 rounded-full ${
                  level >= 4 ? 'bg-red-100' : level >= 2 ? 'bg-orange-100' : 'bg-yellow-100'
                }`}>
                  <TrendingUp className={`h-5 w-5 ${
                    level >= 4 ? 'text-red-600' : level >= 2 ? 'text-orange-600' : 'text-yellow-600'
                  }`} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>
      )}

      {/* Escalated Complaints */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      ) : filteredComplaints.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Escalated Cases</h3>
          <p className="text-gray-500">All complaints are being handled at normal priority levels.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {levels.map(level => (
            <div key={level}>
              <div className="flex items-center gap-3 mb-4">
                {getEscalationLevelBadge(level)}
                <span className="text-gray-500">({groupedByLevel[level].length} cases)</span>
              </div>
              
              <div className="grid gap-4">
                {groupedByLevel[level].map(complaint => (
                  <div key={complaint._id} className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-mono text-sm text-gray-500">{complaint.complaintId}</span>
                          {getSeverityBadge(complaint.severity)}
                          {complaint.slaBreached && (
                            <span className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full flex items-center gap-1">
                              <Clock className="w-3 h-3" /> SLA Breached
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{complaint.title}</h3>
                        <p className="text-gray-600 text-sm line-clamp-2 mb-3">{complaint.description}</p>
                        
                        <div className="flex items-center gap-6 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {complaint.customerName}
                          </div>
                          <div>
                            Category: {getCategoryLabel(complaint.category)}
                          </div>
                          {complaint.branchId && (
                            <div>Branch: {complaint.branchId.name}</div>
                          )}
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            Escalated: {complaint.escalatedAt ? new Date(complaint.escalatedAt).toLocaleDateString() : 'N/A'}
                          </div>
                        </div>

                        {complaint.escalationReason && (
                          <div className="mt-3 p-3 bg-red-50 rounded-lg">
                            <p className="text-sm text-red-800">
                              <strong>Escalation Reason:</strong> {complaint.escalationReason}
                            </p>
                          </div>
                        )}
                      </div>
                      
                      <Link
                        href={`/superadmin/risk/complaints/${complaint._id}`}
                        className="ml-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

