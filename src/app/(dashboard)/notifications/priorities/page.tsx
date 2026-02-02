'use client'

import React, { useState, useEffect } from 'react'
import { 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  Bell, 
  Settings, 
  Save, 
  RefreshCw,
  Plus,
  Trash2,
  Edit,
  Eye,
  BarChart3,
  Clock,
  Users,
  Shield,
  DollarSign
} from 'lucide-react'

interface PriorityRule {
  id: string
  priority: 'P0' | 'P1' | 'P2' | 'P3' | 'P4'
  name: string
  description: string
  events: string[]
  keywords: string[]
  conditions: {
    amountThreshold?: number
    securityLevel?: string
    businessImpact?: string
    systemOnly?: boolean
  }
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface PriorityStats {
  totalNotifications: number
  byPriority: {
    P0: number
    P1: number
    P2: number
    P3: number
    P4: number
  }
  averageResponseTime: {
    P0: number
    P1: number
    P2: number
    P3: number
    P4: number
  }
  classificationAccuracy: number
}

const priorityConfig = {
  P0: {
    name: 'Critical',
    color: 'red',
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
    borderColor: 'border-red-200',
    icon: AlertTriangle,
    description: 'Immediate action required - System critical'
  },
  P1: {
    name: 'High',
    color: 'orange',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-700',
    borderColor: 'border-orange-200',
    icon: AlertCircle,
    description: 'Action needed within hours'
  },
  P2: {
    name: 'Medium',
    color: 'blue',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200',
    icon: Info,
    description: 'Action needed within days'
  },
  P3: {
    name: 'Low',
    color: 'gray',
    bgColor: 'bg-gray-50',
    textColor: 'text-gray-700',
    borderColor: 'border-gray-200',
    icon: Bell,
    description: 'Informational - No urgency'
  },
  P4: {
    name: 'Silent',
    color: 'gray',
    bgColor: 'bg-gray-25',
    textColor: 'text-gray-500',
    borderColor: 'border-gray-100',
    icon: Bell,
    description: 'System logs only - No user notification'
  }
}

export default function NotificationPrioritiesPage() {
  const [rules, setRules] = useState<PriorityRule[]>([])
  const [stats, setStats] = useState<PriorityStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'rules' | 'stats' | 'test'>('overview')
  const [editingRule, setEditingRule] = useState<PriorityRule | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockRules: PriorityRule[] = [
      {
        id: '1',
        priority: 'P0',
        name: 'Payment Fraud Detection',
        description: 'Critical security alerts for payment fraud',
        events: ['payment_fraud_detected', 'security_breach', 'cross_tenant_access_detected'],
        keywords: ['fraud', 'breach', 'security', 'critical'],
        conditions: {
          amountThreshold: 10000,
          securityLevel: 'critical'
        },
        isActive: true,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-20T15:30:00Z'
      },
      {
        id: '2',
        priority: 'P1',
        name: 'Payment Failures',
        description: 'High priority payment processing issues',
        events: ['payment_failed', 'order_stuck', 'subscription_expired'],
        keywords: ['failed', 'stuck', 'expired'],
        conditions: {
          amountThreshold: 1000,
          businessImpact: 'high'
        },
        isActive: true,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-18T12:00:00Z'
      },
      {
        id: '3',
        priority: 'P2',
        name: 'Order Updates',
        description: 'Standard order processing notifications',
        events: ['order_updated', 'pickup_scheduled', 'refund_initiated'],
        keywords: ['updated', 'scheduled', 'initiated'],
        conditions: {
          amountThreshold: 100,
          businessImpact: 'medium'
        },
        isActive: true,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-16T09:15:00Z'
      }
    ]

    const mockStats: PriorityStats = {
      totalNotifications: 15420,
      byPriority: {
        P0: 23,
        P1: 156,
        P2: 2341,
        P3: 8920,
        P4: 3980
      },
      averageResponseTime: {
        P0: 2.5,
        P1: 45,
        P2: 180,
        P3: 720,
        P4: 0
      },
      classificationAccuracy: 96.8
    }

    setTimeout(() => {
      setRules(mockRules)
      setStats(mockStats)
      setLoading(false)
    }, 1000)
  }, [])

  const handleSaveRule = (rule: PriorityRule) => {
    if (editingRule) {
      setRules(rules.map(r => r.id === rule.id ? rule : r))
    } else {
      setRules([...rules, { ...rule, id: Date.now().toString() }])
    }
    setEditingRule(null)
    setShowCreateModal(false)
  }

  const handleDeleteRule = (ruleId: string) => {
    setRules(rules.filter(r => r.id !== ruleId))
  }

  const handleToggleRule = (ruleId: string) => {
    setRules(rules.map(r => 
      r.id === ruleId ? { ...r, isActive: !r.isActive } : r
    ))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Notification Priority Management</h1>
          <p className="text-gray-600 mt-1">Manage P0-P4 priority classification rules and monitor system performance</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Rule
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', name: 'Overview', icon: BarChart3 },
            { id: 'rules', name: 'Priority Rules', icon: Settings },
            { id: 'stats', name: 'Statistics', icon: BarChart3 },
            { id: 'test', name: 'Test Classification', icon: Eye }
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.name}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Priority Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {Object.entries(priorityConfig).map(([priority, config]) => {
              const Icon = config.icon
              const count = stats?.byPriority[priority as keyof typeof stats.byPriority] || 0
              const responseTime = stats?.averageResponseTime[priority as keyof typeof stats.averageResponseTime] || 0
              
              return (
                <div key={priority} className={`p-4 rounded-lg border ${config.bgColor} ${config.borderColor}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <Icon className={`w-5 h-5 mr-2 ${config.textColor}`} />
                      <span className={`font-medium ${config.textColor}`}>{priority}</span>
                    </div>
                    <span className={`text-2xl font-bold ${config.textColor}`}>{count}</span>
                  </div>
                  <p className={`text-sm ${config.textColor} mb-1`}>{config.name}</p>
                  <p className="text-xs text-gray-500">
                    Avg Response: {responseTime === 0 ? 'N/A' : `${responseTime}min`}
                  </p>
                </div>
              )
            })}
          </div>

          {/* System Health */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Classification Accuracy</h3>
                <BarChart3 className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-green-600 mb-2">{stats?.classificationAccuracy}%</div>
              <p className="text-sm text-gray-600">Automatic classification accuracy</p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Total Notifications</h3>
                <Bell className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-blue-600 mb-2">{stats?.totalNotifications.toLocaleString()}</div>
              <p className="text-sm text-gray-600">Last 30 days</p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Active Rules</h3>
                <Settings className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-blue-600 mb-2">{rules.filter(r => r.isActive).length}</div>
              <p className="text-sm text-gray-600">Out of {rules.length} total rules</p>
            </div>
          </div>

          {/* Who Manages What */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Priority Management Hierarchy</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center mb-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 mr-2" />
                  <span className="font-medium text-red-700">P0 - Critical</span>
                </div>
                <ul className="text-sm text-red-600 space-y-1">
                  <li>• SuperAdmins</li>
                  <li>• Security Team</li>
                  <li>• On-call Engineers</li>
                </ul>
              </div>

              <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                <div className="flex items-center mb-2">
                  <AlertCircle className="w-4 h-4 text-orange-600 mr-2" />
                  <span className="font-medium text-orange-700">P1 - High</span>
                </div>
                <ul className="text-sm text-orange-600 space-y-1">
                  <li>• SuperAdmins</li>
                  <li>• Platform Support</li>
                  <li>• Tenant Admins</li>
                </ul>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center mb-2">
                  <Info className="w-4 h-4 text-blue-600 mr-2" />
                  <span className="font-medium text-blue-700">P2 - Medium</span>
                </div>
                <ul className="text-sm text-blue-600 space-y-1">
                  <li>• All Admins</li>
                  <li>• Customer Service</li>
                  <li>• Operations Team</li>
                </ul>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center mb-2">
                  <Bell className="w-4 h-4 text-gray-600 mr-2" />
                  <span className="font-medium text-gray-700">P3/P4 - Low/Silent</span>
                </div>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• All Users (P3)</li>
                  <li>• System Only (P4)</li>
                  <li>• Marketing Team</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'rules' && (
        <div className="space-y-4">
          {rules.map((rule) => {
            const config = priorityConfig[rule.priority]
            const Icon = config.icon
            
            return (
              <div key={rule.id} className={`p-6 rounded-lg border ${config.bgColor} ${config.borderColor}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Icon className={`w-5 h-5 mr-3 ${config.textColor}`} />
                    <div>
                      <h3 className={`font-medium ${config.textColor}`}>{rule.name}</h3>
                      <p className="text-sm text-gray-600">{rule.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      rule.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {rule.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <button
                      onClick={() => setEditingRule(rule)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleToggleRule(rule.id)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteRule(rule.id)}
                      className="p-1 text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Events:</span>
                    <div className="mt-1 space-y-1">
                      {rule.events.map((event, index) => (
                        <span key={index} className="inline-block px-2 py-1 bg-white rounded text-xs mr-1 mb-1">
                          {event}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="font-medium text-gray-700">Keywords:</span>
                    <div className="mt-1 space-y-1">
                      {rule.keywords.map((keyword, index) => (
                        <span key={index} className="inline-block px-2 py-1 bg-white rounded text-xs mr-1 mb-1">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="font-medium text-gray-700">Conditions:</span>
                    <div className="mt-1 text-xs text-gray-600">
                      {rule.conditions.amountThreshold && (
                        <div>Amount ≥ ${rule.conditions.amountThreshold.toLocaleString()}</div>
                      )}
                      {rule.conditions.securityLevel && (
                        <div>Security: {rule.conditions.securityLevel}</div>
                      )}
                      {rule.conditions.businessImpact && (
                        <div>Impact: {rule.conditions.businessImpact}</div>
                      )}
                      {rule.conditions.systemOnly && (
                        <div>System only</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {activeTab === 'stats' && (
        <div className="space-y-6">
          {/* Response Time Chart */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Average Response Times</h3>
            <div className="space-y-4">
              {Object.entries(priorityConfig).map(([priority, config]) => {
                const responseTime = stats?.averageResponseTime[priority as keyof typeof stats.averageResponseTime] || 0
                const maxTime = Math.max(...Object.values(stats?.averageResponseTime || {}))
                const percentage = maxTime > 0 ? (responseTime / maxTime) * 100 : 0
                
                return (
                  <div key={priority} className="flex items-center">
                    <div className="w-16 text-sm font-medium">{priority}</div>
                    <div className="flex-1 mx-4">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full bg-${config.color}-500`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                    <div className="w-20 text-sm text-gray-600 text-right">
                      {responseTime === 0 ? 'N/A' : `${responseTime} min`}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Classification Breakdown */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Priority Distribution</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.entries(priorityConfig).map(([priority, config]) => {
                const count = stats?.byPriority[priority as keyof typeof stats.byPriority] || 0
                const total = stats?.totalNotifications || 1
                const percentage = ((count / total) * 100).toFixed(1)
                
                return (
                  <div key={priority} className="text-center">
                    <div className={`w-16 h-16 mx-auto rounded-full ${config.bgColor} ${config.borderColor} border-2 flex items-center justify-center mb-2`}>
                      <span className={`text-lg font-bold ${config.textColor}`}>{priority}</span>
                    </div>
                    <div className="text-sm font-medium text-gray-900">{count.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">{percentage}%</div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'test' && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Test Priority Classification</h3>
          <p className="text-gray-600 mb-6">Test how the system would classify different notification scenarios</p>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Event Type</label>
                <input
                  type="text"
                  placeholder="e.g., payment_failed"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount ($)</label>
                <input
                  type="number"
                  placeholder="e.g., 1500"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Message Content</label>
              <textarea
                placeholder="e.g., Payment processing failed for order #12345"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              Test Classification
            </button>
          </div>
        </div>
      )}
    </div>
  )
}