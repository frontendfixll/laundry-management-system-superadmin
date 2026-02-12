'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'
import {
  Users,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Headphones,
  Ticket,
  Timer,
  Star
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts'

interface SupportStats {
  tickets: {
    total: number
    today: number
    open: number
    inProgress: number
    resolved: number
    closed: number
  }
  performance: {
    avgResponseTime: number
    avgResolutionTime: number
    satisfactionScore: number
    firstContactResolution: number
  }
  agents: {
    online: number
    busy: number
    away: number
    total: number
  }
}

export default function SupportDashboardPage() {
  const { user, userType } = useAuthStore()
  const [stats, setStats] = useState<SupportStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSupportData()
  }, [])

  const fetchSupportData = async () => {
    try {
      console.log('🔄 Fetching support dashboard data...');
      
      // Fetch real data from backend API
      const response = await api.get('/admin/support/dashboard')
      
      if (response.data.success && response.data.data) {
        const backendData = response.data.data
        const metrics = backendData.metrics || {}
        const ticketStats = backendData.ticketStats || {}
        const byStatus = (s: string) => ticketStats.byStatus?.find((x: { _id: string }) => x._id === s)?.count ?? 0
        const total = metrics.totalTickets ?? ticketStats.total ?? 0
        const open = metrics.openTickets ?? byStatus('open') ?? 0
        const inProgress = metrics.inProgressTickets ?? byStatus('in_progress') ?? 0
        const resolved = metrics.resolvedTickets ?? byStatus('resolved') ?? 0
        const closed = metrics.closedTickets ?? byStatus('closed') ?? 0

        // All data from real API - no mock values
        const transformedStats: SupportStats = {
          tickets: {
            total,
            today: metrics.todayTickets ?? 0,
            open,
            inProgress,
            resolved,
            closed: closed || Math.max(0, total - open - inProgress - resolved)
          },
          performance: {
            avgResponseTime: metrics.avgResponseTime ?? metrics.avgResolutionTime ?? 0,
            avgResolutionTime: metrics.avgResolutionTime ?? 0,
            satisfactionScore: metrics.satisfactionScore ?? 0,
            firstContactResolution: total > 0 ? Math.round((resolved / total) * 100) : 0
          },
          agents: {
            online: backendData.totalSupportUsers ?? 0,
            busy: 0,
            away: 0,
            total: backendData.totalSupportUsers ?? 0
          }
        }
        
        setStats(transformedStats)
        console.log('✅ Support dashboard data loaded from API:', transformedStats);
      } else {
        throw new Error('Invalid API response')
      }
    } catch (error) {
      console.error('Error fetching support data:', error)
      
      // Empty state when API fails - no mock data
      setStats({
        tickets: { total: 0, today: 0, open: 0, inProgress: 0, resolved: 0, closed: 0 },
        performance: { avgResponseTime: 0, avgResolutionTime: 0, satisfactionScore: 0, firstContactResolution: 0 },
        agents: { online: 0, busy: 0, away: 0, total: 0 }
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const ticketStatusData = [
    { name: 'Open', value: stats?.tickets.open || 0, color: '#EF4444' },
    { name: 'In Progress', value: stats?.tickets.inProgress || 0, color: '#F59E0B' },
    { name: 'Resolved', value: stats?.tickets.resolved || 0, color: '#10B981' },
    { name: 'Closed', value: stats?.tickets.closed || 0, color: '#6B7280' }
  ]

  // Agent status - use real total; online/busy/away need presence system (not implemented)
  const agentTotal = stats?.agents.total ?? 0
  const agentStatusData = agentTotal > 0
    ? [{ name: 'Support Agents', value: agentTotal, color: '#10B981' }]
    : [{ name: 'No agents', value: 1, color: '#E5E7EB' }]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-xl shadow-md p-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-light flex items-center">
              <Headphones className="w-6 h-6 mr-2" />
              Support Dashboard
            </h1>
            <p className="text-blue-100 mt-1 text-sm">
              {userType === 'superadmin' ? 'SuperAdmin View - ' : ''}Platform Support Overview
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-blue-100 uppercase tracking-wider">Welcome back</p>
            <p className="text-base font-semibold">{user?.name}</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Total Tickets</p>
              <p className="text-xl font-bold text-gray-900 mt-1">
                {stats?.tickets.total || 0}
              </p>
              <p className="text-xs text-green-600 mt-0.5">
                +{stats?.tickets.today ?? 0} new today
              </p>
            </div>
            <div className="bg-blue-500 p-2 rounded-lg">
              <Ticket className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Avg Response</p>
              <p className="text-xl font-bold text-gray-900 mt-1">
                {stats?.performance.avgResponseTime || 0}h
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                Avg first response
              </p>
            </div>
            <div className="bg-green-500 p-2 rounded-lg">
              <Timer className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Satisfaction</p>
              <p className="text-xl font-bold text-gray-900 mt-1">
                {(stats?.performance.satisfactionScore ?? 0) > 0 ? `${stats?.performance.satisfactionScore}/5` : 'N/A'}
              </p>
              <div className="flex items-center mt-0.5">
                {(stats?.performance.satisfactionScore ?? 0) > 0 ? (
                  [1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-3 h-3 ${star <= (stats?.performance.satisfactionScore || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                    />
                  ))
                ) : (
                  <span className="text-xs text-gray-400">No feedback yet</span>
                )}
              </div>
            </div>
            <div className="bg-yellow-500 p-2 rounded-lg">
              <Star className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Support Agents</p>
              <p className="text-xl font-bold text-gray-900 mt-1">
                {stats?.agents.total ?? 0}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                Active agents
              </p>
            </div>
            <div className="bg-purple-500 p-2 rounded-lg">
              <Users className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ticket Status Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center">
            <MessageSquare className="w-4 h-4 mr-2 text-blue-600" />
            Ticket Status
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={ticketStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {ticketStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {ticketStatusData.map((item, index) => (
              <div key={index} className="flex items-center text-sm">
                <div
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-gray-700">{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Agent Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center">
            <Users className="w-4 h-4 mr-2 text-purple-600" />
            Availability
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={agentStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {agentStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-1 gap-2 mt-4">
            {agentStatusData.map((item, index) => (
              <div key={index} className="flex items-center text-sm">
                <div
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-gray-700">{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center">
          <TrendingUp className="w-4 h-4 mr-2 text-green-600" />
          Metrics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {stats?.performance.avgResolutionTime || 0}h
            </div>
            <div className="text-sm text-gray-600 mt-1">Avg Resolution Time</div>
          </div>

          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {stats?.performance.firstContactResolution || 0}%
            </div>
            <div className="text-sm text-gray-600 mt-1">First Contact Resolution</div>
          </div>

          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {((stats?.tickets.resolved || 0) / (stats?.tickets.total || 1) * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600 mt-1">Resolution Rate</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <a
          href="/support-tickets"
          className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md p-4 hover:shadow-lg transition-all hover:scale-105 group text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">View All Tickets</p>
              <p className="text-2xl font-bold mt-1">{stats?.tickets.total || 0}</p>
            </div>
            <MessageSquare className="w-8 h-8 opacity-80 group-hover:opacity-100" />
          </div>
        </a>

        <a
          href="/support/chat/history"
          className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-md p-4 hover:shadow-lg transition-all hover:scale-105 group text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">Chat History</p>
              <p className="text-2xl font-bold mt-1">View</p>
            </div>
            <MessageSquare className="w-8 h-8 opacity-80 group-hover:opacity-100" />
          </div>
        </a>

        <a
          href="/support/users"
          className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-md p-4 hover:shadow-lg transition-all hover:scale-105 group text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">Manage Users</p>
              <p className="text-2xl font-bold mt-1">Users</p>
            </div>
            <Users className="w-8 h-8 opacity-80 group-hover:opacity-100" />
          </div>
        </a>
      </div>
    </div>
  )
}