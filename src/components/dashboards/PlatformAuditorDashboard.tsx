'use client'

import { useState, useEffect } from 'react'
import { superAdminApi } from '@/lib/superAdminApi'
import {
  Shield,
  Activity,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  Download,
  Search,
  Filter,
  Calendar,
  Users,
  Building2,
  ArrowRight,
  RefreshCw,
  Database,
  Lock
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface AuditMetrics {
  totalAuditLogs: number
  todayActivities: number
  securityAlerts: number
  complianceScore: number
  failedLogins: number
  dataAccesses: number
  systemChanges: number
  userActivities: number
}

interface AuditLog {
  id: string
  timestamp: string
  user: string
  action: string
  resource: string
  result: 'success' | 'failure' | 'warning'
  ipAddress: string
  userAgent: string
}

interface ComplianceItem {
  id: string
  category: string
  requirement: string
  status: 'compliant' | 'non_compliant' | 'pending_review'
  lastChecked: string
  nextReview: string
}

export function PlatformAuditorDashboard() {
  const [metrics, setMetrics] = useState<AuditMetrics | null>(null)
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [complianceItems, setComplianceItems] = useState<ComplianceItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAuditData = async () => {
      try {
        setLoading(true)
        
        // Fetch real audit data from backend using superAdminApi
        const data = await superAdminApi.getAuditDashboard()
        
        if (data.success) {
          // Use real data from backend
          setMetrics({
            totalAuditLogs: data.data.stats.totalAuditLogs,
            todayActivities: data.data.stats.todayLogs,
            securityAlerts: data.data.stats.securityAlerts,
            complianceScore: 94.7, // Mock compliance score for now
            failedLogins: 12, // Mock failed logins for now
            dataAccesses: data.data.stats.crossTenantAccess,
            systemChanges: data.data.stats.systemEvents,
            userActivities: data.data.stats.userActions
          })

          // Transform audit logs to match expected format
          setAuditLogs(data.data.recentAuditLogs.map((log: any) => ({
            id: log._id,
            timestamp: new Date(log.timestamp).toLocaleString(),
            user: log.who,
            action: log.action,
            resource: log.entity,
            result: log.outcome,
            ipAddress: log.ipAddress,
            userAgent: log.userAgent || 'Unknown'
          })))

          // Mock compliance items (TODO: implement real compliance tracking)
          setComplianceItems([
            {
              id: 'C-001',
              category: 'Data Protection',
              requirement: 'GDPR Article 32 - Security of processing',
              status: 'compliant',
              lastChecked: '2024-01-20',
              nextReview: '2024-02-20'
            },
            {
              id: 'C-002',
              category: 'Access Control',
              requirement: 'SOC 2 Type II - Logical Access Controls',
              status: 'compliant',
              lastChecked: '2024-01-18',
              nextReview: '2024-02-18'
            },
            {
              id: 'C-003',
              category: 'Audit Logging',
              requirement: 'PCI DSS 10.2 - Audit trail requirements',
              status: 'pending_review',
              lastChecked: '2024-01-15',
              nextReview: '2024-01-25'
            },
            {
              id: 'C-004',
              category: 'Data Retention',
              requirement: 'CCPA Section 1798.105 - Right to delete',
              status: 'non_compliant',
              lastChecked: '2024-01-10',
              nextReview: '2024-01-24'
            }
          ])
          
          console.log('✅ Successfully loaded real audit data')
        } else {
          throw new Error(data.message || 'Failed to fetch audit data')
        }
      } catch (error) {
        console.error('❌ Error fetching audit data:', error)
        
        // Show empty state instead of mock data
        setMetrics({
          totalAuditLogs: 0,
          todayActivities: 0,
          securityAlerts: 0,
          complianceScore: 0,
          failedLogins: 0,
          dataAccesses: 0,
          systemChanges: 0,
          userActivities: 0
        })
        setAuditLogs([])
        setComplianceItems([])
      } finally {
        setLoading(false)
      }
    }

    fetchAuditData()
  }, [])

  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Audit Overview</h1>
          <p className="text-gray-600 mt-2">Platform Auditor Dashboard</p>
        </div>
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-6 h-32"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const getResultColor = (result: AuditLog['result']) => {
    switch (result) {
      case 'success':
        return 'bg-green-100 text-green-800'
      case 'failure':
        return 'bg-red-100 text-red-800'
      case 'warning':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getResultIcon = (result: AuditLog['result']) => {
    switch (result) {
      case 'success':
        return <CheckCircle className="w-4 h-4" />
      case 'failure':
        return <AlertTriangle className="w-4 h-4" />
      case 'warning':
        return <Clock className="w-4 h-4" />
      default:
        return <Activity className="w-4 h-4" />
    }
  }

  const getComplianceStatusColor = (status: ComplianceItem['status']) => {
    switch (status) {
      case 'compliant':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'non_compliant':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'pending_review':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Audit Overview</h1>
        <p className="text-gray-600 mt-2">Platform Auditor Dashboard - Read-Only Access</p>
      </div>

      <div className="space-y-8">
        {/* Key Audit Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Audit Logs</p>
                <p className="text-3xl font-bold text-gray-900">{metrics?.totalAuditLogs.toLocaleString()}</p>
                <p className="text-sm text-blue-600 mt-1">
                  +{metrics?.todayActivities} today
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Security Alerts</p>
                <p className="text-3xl font-bold text-gray-900">{metrics?.securityAlerts}</p>
                <p className="text-sm text-red-600 mt-1">
                  {metrics?.failedLogins} failed logins
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Compliance Score</p>
                <p className="text-3xl font-bold text-gray-900">{metrics?.complianceScore}%</p>
                <p className="text-sm text-green-600 mt-1">
                  {metrics?.dataAccesses} data accesses
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">System Changes</p>
                <p className="text-3xl font-bold text-gray-900">{metrics?.systemChanges}</p>
                <p className="text-sm text-purple-600 mt-1">
                  {metrics?.userActivities.toLocaleString()} user activities
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Audit Tools */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Audit Tools</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/audit/search">
              <Button className="w-full justify-start" variant="outline">
                <Search className="w-4 h-4 mr-2" />
                Search Logs
              </Button>
            </Link>

            <Button className="w-full justify-start" variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export Reports
            </Button>

            <Link href="/audit/compliance">
              <Button className="w-full justify-start" variant="outline">
                <Shield className="w-4 h-4 mr-2" />
                Compliance Check
              </Button>
            </Link>

            <Link href="/audit/security">
              <Button className="w-full justify-start" variant="outline">
                <Lock className="w-4 h-4 mr-2" />
                Security Analysis
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Audit Logs */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
              <div className="flex space-x-2">
                <Button variant="ghost" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
                <Link href="/audit/logs">
                  <Button variant="ghost" size="sm">
                    <Eye className="w-4 h-4 mr-2" />
                    View All
                  </Button>
                </Link>
              </div>
            </div>
            <div className="space-y-4">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm font-medium text-gray-900">{log.action}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getResultColor(log.result)}`}>
                          {log.result}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{log.user}</p>
                      <p className="text-xs text-gray-500">
                        {log.resource} • {log.timestamp}
                      </p>
                      <p className="text-xs text-gray-500">
                        IP: {log.ipAddress}
                      </p>
                    </div>
                    <div className="flex items-center">
                      {getResultIcon(log.result)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Compliance Status */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Compliance Status</h3>
              <Button variant="ghost" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
            <div className="space-y-4">
              {complianceItems.map((item) => (
                <div key={item.id} className="p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm font-medium text-gray-900">{item.category}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${getComplianceStatusColor(item.status)}`}>
                          {item.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{item.requirement}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>Last checked: {item.lastChecked}</span>
                        <span>Next review: {item.nextReview}</span>
                      </div>
                    </div>
                  </div>
                  {item.status === 'non_compliant' && (
                    <div className="mt-3 p-2 bg-red-50 rounded border border-red-200">
                      <p className="text-xs text-red-700">Action required: Review and update compliance measures</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <Link href="/audit/compliance" className="text-sm text-blue-600 hover:text-blue-700 flex items-center">
                View full compliance report
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>
        </div>

        {/* Security Overview */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Security Overview</h3>
            <Link href="/audit/security">
              <Button variant="ghost" size="sm">
                View Security Report
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-green-50 border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-900">Successful Logins</p>
                  <p className="text-2xl font-bold text-green-600">2,847</p>
                </div>
                <Users className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <div className="p-4 rounded-lg bg-red-50 border border-red-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-900">Failed Attempts</p>
                  <p className="text-2xl font-bold text-red-600">12</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </div>

            <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-900">Data Exports</p>
                  <p className="text-2xl font-bold text-blue-600">45</p>
                </div>
                <Database className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-900">System Changes</p>
                  <p className="text-2xl font-bold text-purple-600">23</p>
                </div>
                <Activity className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}