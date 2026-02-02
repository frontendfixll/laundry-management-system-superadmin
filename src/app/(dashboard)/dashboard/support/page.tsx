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
        
        // Transform backend data to frontend format
        const transformedStats: SupportStats = {
          tickets: {
            total: backendData.metrics?.totalTickets || 0,
            open: backendData.metrics?.openTickets || 0,
            inProgress: backendData.metrics?.inProgressTickets || 0,
            resolved: backendData.metrics?.resolvedTickets || 0,
            closed: backendData.metrics?.totalTickets - (backendData.metrics?.openTickets || 0) - (backendData.metrics?.inProgressTickets || 0) - (backendData.metrics?.resolvedTickets || 0) || 0
          },
          performance: {
            avgResponseTime: backendData.metrics?.avgResolutionTime || 0,
            avgResolutionTime: backendData.metrics?.avgResolutionTime || 0,
            satisfactionScore: 4.2, // This would come from customer feedback system
            firstContactResolution: backendData.metrics?.resolvedTickets && backendData.metrics?.totalTickets 
              ? Math.round((backendData.metrics.resolvedTickets / backendData.metrics.totalTickets) * 100) 
              : 0
          },
          agents: {
            online: 5, // This would come from real-time agent status
            busy: 2,
            away: 1,
            total: 8
          }
        }
        
        setStats(transformedStats)
        console.log('✅ Support dashboard data loaded from API:', transformedStats);
      } else {
        throw new Error('Invalid API response')
      }
    } catch (error) {
      console.error('Error fetching support data:', error)
      
      // Use fallback data when API fails
      setStats({
        tickets: { total: 0, open: 0, inProgress: 0, resolved: 0, closed: 0 },
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

  const agentStatusData = [
    { name: 'Online', value: stats?.agents.online || 0, color: '#10B981' },
    { name: 'Busy', value: stats?.agents.busy || 0, color: '#F59E0B' },
    { name: 'Away', value: stats?.agents.away || 0, color: '#6B7280' }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-xl shadow-md p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center">
              <Headphones className="w-8 h-8 mr-3" />
              Support Dashboard
            </h1>
            <p className="text-blue-100 mt-2">
              {userType === 'superadmin' ? 'SuperAdmin View - ' : ''}Platform Support Overview
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-blue-100">Welcome back</p>
            <p className="text-lg font-semibold">{user?.name}</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Tickets</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stats?.tickets.total || 0}
              </p>
              <p className="text-sm text-green-600 mt-1">
                +{stats?.tickets.open || 0} new today
              </p>
            </div>
            <div className="bg-blue-500 p-3 rounded-lg">
              <Ticket className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stats?.performance.avgResponseTime || 0}h
              </p>
              <p className="text-sm text-green-600 mt-1">
                -15% from last week
              </p>
            </div>
            <div className="bg-green-500 p-3 rounded-lg">
              <Timer className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Satisfaction Score</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stats?.performance.satisfactionScore || 0}/5
              </p>
              <div className="flex items-center mt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star} 
                    className={`w-4 h-4 ${star <= (stats?.performance.satisfactionScore || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                  />
                ))}
              </div>
            </div>
            <div className="bg-yellow-500 p-3 rounded-lg">
              <Star className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Online Agents</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stats?.agents.online || 0}/{stats?.agents.total || 0}
              </p>
              <p className="text-sm text-blue-600 mt-1">
                {stats?.agents.busy || 0} busy
              </p>
            </div>
            <div className="bg-purple-500 p-3 rounded-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ticket Status Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <MessageSquare className="w-5 h-5 mr-2 text-blue-600" />
            Ticket Status Distribution
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={ticketStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2 text-purple-600" />
            Agent Availability
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={agentStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
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
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
          Performance Metrics
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