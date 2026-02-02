'use client'

import { useState, useEffect } from 'react'
import { Building2, AlertTriangle, CheckCircle, Clock, TrendingUp, Users, Package, DollarSign } from 'lucide-react'

interface TenantIssue {
  id: string
  tenantId: string
  tenantName: string
  issueType: 'setup' | 'billing' | 'technical' | 'performance' | 'compliance'
  priority: 'P0' | 'P1' | 'P2' | 'P3'
  status: 'new' | 'investigating' | 'escalated' | 'resolved'
  description: string
  createdAt: string
  assignedTo?: string
}

interface TenantStats {
  totalTenants: number
  activeTenants: number
  issuesThisWeek: number
  avgResolutionTime: string
}

export default function TenantSupportPage() {
  const [tenantIssues, setTenantIssues] = useState<TenantIssue[]>([])
  const [stats, setStats] = useState<TenantStats>({
    totalTenants: 0,
    activeTenants: 0,
    issuesThisWeek: 0,
    avgResolutionTime: '0h'
  })
  const [loading, setLoading] = useState(true)
  const [selectedPriority, setSelectedPriority] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')

  useEffect(() => {
    fetchTenantIssues()
    fetchStats()
  }, [])

  const fetchTenantIssues = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('auth-storage')
      if (!token) return

      const parsed = JSON.parse(token)
      const authToken = parsed.state?.token
      if (!authToken) return

      const response = await fetch('http://localhost:5000/api/support/tenant-heatmap', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setTenantIssues(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching tenant issues:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('auth-storage')
      if (!token) return

      const parsed = JSON.parse(token)
      const authToken = parsed.state?.token
      if (!authToken) return

      const response = await fetch('http://localhost:5000/api/support/stats', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.data) {
          setStats({
            totalTenants: data.data.totalUsers || 0,
            activeTenants: data.data.activeUsers || 0,
            issuesThisWeek: data.data.openTickets || 0,
            avgResolutionTime: data.data.avgResponseTime || '0h'
          })
        }
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'P0':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'P1':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'P2':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'P3':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'investigating':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'escalated':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'resolved':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getIssueTypeIcon = (type: string) => {
    switch (type) {
      case 'setup':
        return <Building2 className="w-4 h-4" />
      case 'billing':
        return <DollarSign className="w-4 h-4" />
      case 'technical':
        return <AlertTriangle className="w-4 h-4" />
      case 'performance':
        return <TrendingUp className="w-4 h-4" />
      case 'compliance':
        return <CheckCircle className="w-4 h-4" />
      default:
        return <Package className="w-4 h-4" />
    }
  }

  const filteredIssues = tenantIssues.filter(issue => {
    const matchesPriority = selectedPriority === 'all' || (issue.priority || '') === selectedPriority
    const matchesStatus = selectedStatus === 'all' || (issue.status || '') === selectedStatus
    return matchesPriority && matchesStatus
  })

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Tenant Support</h1>
            <p className="text-gray-600 mt-1">Monitor and resolve tenant issues</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Building2 className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Tenants</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalTenants}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Tenants</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.activeTenants}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Issues This Week</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.issuesThisWeek}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Clock className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Avg Resolution</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.avgResolutionTime}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="sm:w-48">
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Priorities</option>
              <option value="P0">P0 - Critical</option>
              <option value="P1">P1 - High</option>
              <option value="P2">P2 - Medium</option>
              <option value="P3">P3 - Low</option>
            </select>
          </div>
          <div className="sm:w-48">
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Statuses</option>
              <option value="new">New</option>
              <option value="investigating">Investigating</option>
              <option value="escalated">Escalated</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tenant Issues */}
      <div className="bg-white rounded-lg border border-gray-200">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading tenant issues...</p>
          </div>
        ) : filteredIssues.length === 0 ? (
          <div className="p-8 text-center">
            <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Tenant Issues</h3>
            <p className="text-gray-600">
              {selectedPriority !== 'all' || selectedStatus !== 'all' 
                ? 'No tenant issues match your current filters.' 
                : 'All tenant issues have been resolved.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tenant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Issue Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
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
                {filteredIssues.map((issue) => (
                  <tr key={issue.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{issue.tenantName}</div>
                      <div className="text-sm text-gray-500">ID: {issue.tenantId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getIssueTypeIcon(issue.issueType)}
                        <span className="ml-2 text-sm text-gray-900 capitalize">{issue.issueType}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(issue.priority)}`}>
                        {issue.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(issue.status)}`}>
                        {(issue.status || 'unknown').replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate" title={issue.description}>
                        {issue.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(issue.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900 mr-3">
                        View Details
                      </button>
                      <button className="text-green-600 hover:text-green-900">
                        Escalate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Enablement Resources */}
      <div className="mt-6 bg-blue-50 rounded-lg p-6 border border-blue-200">
        <h3 className="text-lg font-medium text-blue-900 mb-4">Tenant Enablement Resources</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-blue-800 mb-2">Setup Assistance</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Initial configuration walkthrough</li>
              <li>• Service setup and pricing guidance</li>
              <li>• Staff training and onboarding</li>
              <li>• Integration testing support</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-blue-800 mb-2">Ongoing Support</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Performance optimization tips</li>
              <li>• Best practices documentation</li>
              <li>• Feature updates and training</li>
              <li>• Compliance and security guidance</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}