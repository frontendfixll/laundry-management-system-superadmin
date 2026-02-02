'use client'

import { useState, useEffect } from 'react'
import { Activity, User, Clock, StopCircle, AlertTriangle, RefreshCw } from 'lucide-react'

interface ActiveSession {
  sessionId: string
  userId: string
  userName: string
  userEmail: string
  tenantName: string
  supportUserId: string
  supportUserName: string
  startedAt: string
  expiresAt: string
  reason: string
  duration: number
  status: 'active' | 'expired'
}

export default function ActiveImpersonationSessionsPage() {
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchActiveSessions()
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchActiveSessions, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchActiveSessions = async (showRefreshing = false) => {
    try {
      if (showRefreshing) setRefreshing(true)
      
      const token = localStorage.getItem('auth-storage')
      if (!token) return

      const parsed = JSON.parse(token)
      const authToken = parsed.state?.token
      if (!authToken) return

      const response = await fetch('http://localhost:5000/api/support/impersonation/active', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setActiveSessions(data.data || [])
      } else {
        console.error('Failed to fetch active sessions')
      }
    } catch (error) {
      console.error('Error fetching active sessions:', error)
    } finally {
      setLoading(false)
      if (showRefreshing) setRefreshing(false)
    }
  }

  const endImpersonation = async (sessionId: string) => {
    try {
      const token = localStorage.getItem('auth-storage')
      if (!token) return

      const parsed = JSON.parse(token)
      const authToken = parsed.state?.token
      if (!authToken) return

      const response = await fetch('http://localhost:5000/api/support/impersonation/end', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sessionId })
      })

      if (response.ok) {
        alert('Impersonation session ended successfully')
        fetchActiveSessions()
      } else {
        const error = await response.json()
        alert(error.message || 'Failed to end impersonation')
      }
    } catch (error) {
      console.error('Error ending impersonation:', error)
      alert('Failed to end impersonation')
    }
  }

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date()
    const expires = new Date(expiresAt)
    const diff = expires.getTime() - now.getTime()
    
    if (diff <= 0) return { text: 'Expired', color: 'text-red-600' }
    
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(minutes / 60)
    
    let text = ''
    let color = 'text-green-600'
    
    if (hours > 0) {
      text = `${hours}h ${minutes % 60}m`
    } else {
      text = `${minutes}m`
      if (minutes < 10) color = 'text-red-600'
      else if (minutes < 30) color = 'text-yellow-600'
    }
    
    return { text, color }
  }

  const getStatusBadge = (session: ActiveSession) => {
    const timeRemaining = getTimeRemaining(session.expiresAt)
    
    if (timeRemaining.text === 'Expired') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          Expired
        </span>
      )
    }
    
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Active
      </span>
    )
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 flex items-center">
              <Activity className="w-6 h-6 mr-2" />
              Active Impersonation Sessions
            </h1>
            <p className="text-gray-600 mt-1">Monitor and manage all active impersonation sessions</p>
          </div>
          <button
            onClick={() => fetchActiveSessions(true)}
            disabled={refreshing}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Auto-refresh notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-center">
          <Clock className="w-5 h-5 text-blue-600 mr-3" />
          <div className="text-sm text-blue-800">
            This page automatically refreshes every 30 seconds to show real-time session status.
          </div>
        </div>
      </div>

      {activeSessions.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Sessions</h3>
          <p className="text-gray-600 mb-4">There are currently no active impersonation sessions.</p>
          <a
            href="/support/impersonation"
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Start New Session
          </a>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Active Sessions ({activeSessions.length})
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Session ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Target User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Support User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Started
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time Remaining
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reason
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {activeSessions.map((session) => {
                  const timeRemaining = getTimeRemaining(session.expiresAt)
                  return (
                    <tr key={session.sessionId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-mono text-gray-900">
                          {session.sessionId}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <User className="w-4 h-4 text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {session.userName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {session.userEmail}
                            </div>
                            <div className="text-xs text-gray-400">
                              {session.tenantName}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {session.supportUserName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(session.startedAt).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-medium ${timeRemaining.color}`}>
                          {timeRemaining.text}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(session)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate" title={session.reason}>
                          {session.reason}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => endImpersonation(session.sessionId)}
                          className="inline-flex items-center px-3 py-1 text-sm font-medium text-red-600 hover:text-red-900 border border-red-200 rounded hover:bg-red-50"
                        >
                          <StopCircle className="w-4 h-4 mr-1" />
                          End Session
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Session Management Guidelines */}
      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start">
          <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-yellow-800">Session Management</h3>
            <div className="text-sm text-yellow-700 mt-1 space-y-1">
              <p>• Sessions automatically expire after their designated duration</p>
              <p>• End sessions immediately when support work is complete</p>
              <p>• Sessions with less than 10 minutes remaining are highlighted in red</p>
              <p>• All session activities are logged for security auditing</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}