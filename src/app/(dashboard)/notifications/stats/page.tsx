'use client'

import React, { useState, useEffect } from 'react'
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Users, 
  Activity,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Zap,
  Target,
  Eye,
  Send,
  Calendar,
  Download
} from 'lucide-react'

interface NotificationStats {
  overview: {
    totalSent: number
    totalDelivered: number
    totalFailed: number
    averageResponseTime: number
    deliveryRate: number
    readRate: number
  }
  priorityBreakdown: {
    P0: { sent: number, delivered: number, failed: number, avgResponseTime: number }
    P1: { sent: number, delivered: number, failed: number, avgResponseTime: number }
    P2: { sent: number, delivered: number, failed: number, avgResponseTime: number }
    P3: { sent: number, delivered: number, failed: number, avgResponseTime: number }
    P4: { sent: number, delivered: number, failed: number, avgResponseTime: number }
  }
  channelPerformance: {
    websocket: { sent: number, delivered: number, failed: number, avgResponseTime: number }
    email: { sent: number, delivered: number, failed: number, avgResponseTime: number }
    sms: { sent: number, delivered: number, failed: number, avgResponseTime: number }
    push: { sent: number, delivered: number, failed: number, avgResponseTime: number }
  }
  timeSeriesData: {
    timestamp: string
    sent: number
    delivered: number
    failed: number
  }[]
  userEngagement: {
    totalUsers: number
    activeUsers: number
    engagementRate: number
    averageReadTime: number
  }
}

const priorityConfig = {
  P0: { name: 'Critical', color: 'red' },
  P1: { name: 'High', color: 'orange' },
  P2: { name: 'Medium', color: 'blue' },
  P3: { name: 'Low', color: 'gray' },
  P4: { name: 'Silent', color: 'gray' }
}

const channelConfig = {
  websocket: { name: 'WebSocket', color: 'blue' },
  email: { name: 'Email', color: 'green' },
  sms: { name: 'SMS', color: 'purple' },
  push: { name: 'Push', color: 'orange' }
}

export default function NotificationStatsPage() {
  const [stats, setStats] = useState<NotificationStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<string>('7d')
  const [activeTab, setActiveTab] = useState<'overview' | 'priority' | 'channels' | 'engagement'>('overview')

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockStats: NotificationStats = {
      overview: {
        totalSent: 12450,
        totalDelivered: 11890,
        totalFailed: 560,
        averageResponseTime: 245,
        deliveryRate: 95.5,
        readRate: 78.2
      },
      priorityBreakdown: {
        P0: { sent: 45, delivered: 44, failed: 1, avgResponseTime: 120 },
        P1: { sent: 890, delivered: 875, failed: 15, avgResponseTime: 180 },
        P2: { sent: 5670, delivered: 5450, failed: 220, avgResponseTime: 250 },
        P3: { sent: 4890, delivered: 4680, failed: 210, avgResponseTime: 300 },
        P4: { sent: 955, delivered: 841, failed: 114, avgResponseTime: 400 }
      },
      channelPerformance: {
        websocket: { sent: 8900, delivered: 8750, failed: 150, avgResponseTime: 180 },
        email: { sent: 2100, delivered: 1980, failed: 120, avgResponseTime: 2500 },
        sms: { sent: 890, delivered: 720, failed: 170, avgResponseTime: 1200 },
        push: { sent: 560, delivered: 440, failed: 120, avgResponseTime: 800 }
      },
      timeSeriesData: [
        { timestamp: '2024-01-23', sent: 1200, delivered: 1150, failed: 50 },
        { timestamp: '2024-01-24', sent: 1350, delivered: 1290, failed: 60 },
        { timestamp: '2024-01-25', sent: 1100, delivered: 1050, failed: 50 },
        { timestamp: '2024-01-26', sent: 1450, delivered: 1380, failed: 70 },
        { timestamp: '2024-01-27', sent: 1600, delivered: 1520, failed: 80 },
        { timestamp: '2024-01-28', sent: 1750, delivered: 1670, failed: 80 },
        { timestamp: '2024-01-29', sent: 2000, delivered: 1830, failed: 170 }
      ],
      userEngagement: {
        totalUsers: 2450,
        activeUsers: 1890,
        engagementRate: 77.1,
        averageReadTime: 45
      }
    }

    setTimeout(() => {
      setStats(mockStats)
      setLoading(false)
    }, 1000)
  }, [timeRange])

  const refreshStats = () => {
    setLoading(true)
    // Simulate API call
    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }

  const exportStats = () => {
    // Implementation for exporting stats
    console.log('Exporting stats...')
  }

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  const calculatePercentage = (value: number, total: number) => {
    return total > 0 ? ((value / total) * 100).toFixed(1) : '0.0'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Performance Statistics</h1>
          <p className="text-gray-600 mt-1">Monitor notification system performance and user engagement</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
          <button
            onClick={refreshStats}
            className="flex items-center px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
          <button
            onClick={exportStats}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Sent</p>
              <p className="text-2xl font-bold text-blue-600">{stats.overview.totalSent.toLocaleString()}</p>
            </div>
            <Send className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Delivered</p>
              <p className="text-2xl font-bold text-green-600">{stats.overview.totalDelivered.toLocaleString()}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Failed</p>
              <p className="text-2xl font-bold text-red-600">{stats.overview.totalFailed.toLocaleString()}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Delivery Rate</p>
              <p className="text-2xl font-bold text-green-600">{stats.overview.deliveryRate}%</p>
            </div>
            <Target className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Read Rate</p>
              <p className="text-2xl font-bold text-purple-600">{stats.overview.readRate}%</p>
            </div>
            <Eye className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Response</p>
              <p className="text-2xl font-bold text-orange-600">{stats.overview.averageResponseTime}ms</p>
            </div>
            <Zap className="w-8 h-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', name: 'Overview', icon: BarChart3 },
            { id: 'priority', name: 'Priority Breakdown', icon: AlertTriangle },
            { id: 'channels', name: 'Channel Performance', icon: Activity },
            { id: 'engagement', name: 'User Engagement', icon: Users }
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
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Time Series Chart Placeholder */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Volume Trend</h3>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">Chart visualization would go here</p>
                  <p className="text-sm text-gray-400">Integration with charting library needed</p>
                </div>
              </div>
            </div>

            {/* Success Rate Chart Placeholder */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Success Rate Over Time</h3>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">Success rate chart would go here</p>
                  <p className="text-sm text-gray-400">Shows delivery and read rates</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'priority' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Priority Breakdown Table */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Priority Level Performance</h3>
              <div className="space-y-4">
                {Object.entries(stats.priorityBreakdown).map(([priority, data]) => {
                  const config = priorityConfig[priority as keyof typeof priorityConfig]
                  const successRate = calculatePercentage(data.delivered, data.sent)
                  
                  return (
                    <div key={priority} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <span className={`px-3 py-1 text-sm font-medium rounded-full bg-${config.color}-100 text-${config.color}-800`}>
                          {priority}
                        </span>
                        <span className="ml-3 font-medium">{config.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{data.sent} sent</div>
                        <div className="text-xs text-gray-500">{successRate}% success</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Priority Response Times */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Average Response Times</h3>
              <div className="space-y-4">
                {Object.entries(stats.priorityBreakdown).map(([priority, data]) => {
                  const config = priorityConfig[priority as keyof typeof priorityConfig]
                  
                  return (
                    <div key={priority} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full bg-${config.color}-100 text-${config.color}-800`}>
                          {priority}
                        </span>
                        <span className="ml-2 text-sm">{config.name}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 text-gray-400 mr-1" />
                        <span className="text-sm font-medium">{data.avgResponseTime}ms</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'channels' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Channel Performance Table */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Channel Performance</h3>
              <div className="space-y-4">
                {Object.entries(stats.channelPerformance).map(([channel, data]) => {
                  const config = channelConfig[channel as keyof typeof channelConfig]
                  const successRate = calculatePercentage(data.delivered, data.sent)
                  const failureRate = calculatePercentage(data.failed, data.sent)
                  
                  return (
                    <div key={channel} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`px-3 py-1 text-sm font-medium rounded-full bg-${config.color}-100 text-${config.color}-800`}>
                          {config.name}
                        </span>
                        <span className="text-sm font-medium">{data.sent} sent</span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Success:</span>
                          <span className="ml-1 font-medium text-green-600">{successRate}%</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Failed:</span>
                          <span className="ml-1 font-medium text-red-600">{failureRate}%</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Avg Time:</span>
                          <span className="ml-1 font-medium">{data.avgResponseTime}ms</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Channel Comparison Chart Placeholder */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Channel Comparison</h3>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <Activity className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">Channel comparison chart would go here</p>
                  <p className="text-sm text-gray-400">Shows success rates by channel</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'engagement' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User Engagement Stats */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">User Engagement Metrics</h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.userEngagement.totalUsers.toLocaleString()}</p>
                  </div>
                  <Users className="w-8 h-8 text-gray-600" />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Users</p>
                    <p className="text-2xl font-bold text-green-600">{stats.userEngagement.activeUsers.toLocaleString()}</p>
                  </div>
                  <Activity className="w-8 h-8 text-green-600" />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Engagement Rate</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.userEngagement.engagementRate}%</p>
                  </div>
                  <Target className="w-8 h-8 text-blue-600" />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg Read Time</p>
                    <p className="text-2xl font-bold text-purple-600">{stats.userEngagement.averageReadTime}s</p>
                  </div>
                  <Clock className="w-8 h-8 text-purple-600" />
                </div>
              </div>
            </div>

            {/* Engagement Trends Placeholder */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Engagement Trends</h3>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">Engagement trends chart would go here</p>
                  <p className="text-sm text-gray-400">Shows user interaction over time</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Performance Insights */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center mb-2">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
              <span className="font-medium text-green-800">High Performance</span>
            </div>
            <p className="text-sm text-green-700">
              WebSocket notifications have the highest delivery rate at 98.3% with fastest response times.
            </p>
          </div>

          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-center mb-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
              <span className="font-medium text-yellow-800">Needs Attention</span>
            </div>
            <p className="text-sm text-yellow-700">
              SMS delivery rate is below target at 80.9%. Consider reviewing SMS provider configuration.
            </p>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center mb-2">
              <TrendingUp className="w-5 h-5 text-blue-600 mr-2" />
              <span className="font-medium text-blue-800">Trending Up</span>
            </div>
            <p className="text-sm text-blue-700">
              P0/P1 notifications show 95%+ delivery rate, indicating critical alerts are reaching users effectively.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}