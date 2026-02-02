'use client'

import { useState, useEffect } from 'react'
import { Shield, User, Clock, AlertTriangle, Eye, StopCircle, Search, Play } from 'lucide-react'

interface ImpersonationSession {
  sessionId: string
  userId: string
  userName: string
  userEmail: string
  tenantName: string
  supportUserId: string
  supportUserName: string
  startedAt: string
  expiresAt: string
  status: 'active' | 'expired' | 'terminated'
  duration: number
}

interface User {
  id: string
  name: string
  email: string
  tenantName: string
  role: string
}

export default function SafeImpersonationPage() {
  const [activeSessions, setActiveSessions] = useState<ImpersonationSession[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedDuration, setSelectedDuration] = useState(30) // Default 30 minutes
  const [impersonationReason, setImpersonationReason] = useState('')

  useEffect(() => {
    fetchActiveSessions()
  }, [])

  const fetchActiveSessions = async () => {
    try {
      const token = localStorage.getItem('auth-storage')
      if (!token) return

      const parsed = JSON.parse(token)
      const authToken = parsed.state?.token
      if (!authToken) return

      // Fetch active impersonation sessions
      const response = await fetch('http://localhost:5000/api/support/impersonation/active', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setActiveSessions(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching active sessions:', error)
    }
  }

  const searchUsers = async () => {
    if (searchTerm.length < 3) {
      setSearchResults([])
      return
    }

    try {
      setLoading(true)
      const token = localStorage.getItem('auth-storage')
      if (!token) return

      const parsed = JSON.parse(token)
      const authToken = parsed.state?.token
      if (!authToken) return

      const response = await fetch(`http://localhost:5000/api/support/users/search?query=${encodeURIComponent(searchTerm)}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setSearchResults(data.data || [])
      }
    } catch (error) {
      console.error('Error searching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const startImpersonation = async (userId: string) => {
    if (!impersonationReason.trim()) {
      alert('Please provide a reason for impersonation')
      return
    }

    try {
      const token = localStorage.getItem('auth-storage')
      if (!token) return

      const parsed = JSON.parse(token)
      const authToken = parsed.state?.token
      if (!authToken) return

      const response = await fetch('http://localhost:5000/api/support/impersonation', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: userId,
          duration: selectedDuration,
          reason: impersonationReason.trim()
        })
      })

      if (response.ok) {
        const data = await response.json()
        alert(`Impersonation session started successfully. Session ID: ${data.data.sessionId}`)
        setImpersonationReason('') // Clear the reason field
        fetchActiveSessions()
      } else {
        const error = await response.json()
        alert(error.message || 'Failed to start impersonation')
      }
    } catch (error) {
      console.error('Error starting impersonation:', error)
      alert('Failed to start impersonation')
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
        body: JSON.stringify({
          sessionId: sessionId
        })
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

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      searchUsers()
    }, 500)

    return () => clearTimeout(debounceTimer)
  }, [searchTerm])

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date()
    const expires = new Date(expiresAt)
    const diff = expires.getTime() - now.getTime()
    
    if (diff <= 0) return 'Expired'
    
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(minutes / 60)
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`
    }
    return `${minutes}m`
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Safe Impersonation</h1>
            <p className="text-gray-600 mt-1">Securely view user accounts to assist with issues</p>
          </div>
        </div>
      </div>

      {/* Security Warning */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-red-800">Security Notice</h3>
            <div className="text-sm text-red-700 mt-1">
              <p>• All impersonation sessions are logged and audited</p>
              <p>• Sessions are time-limited and automatically expire</p>
              <p>• No destructive actions are allowed during impersonation</p>
              <p>• Use only for legitimate support purposes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Active Sessions */}
      {activeSessions.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Eye className="w-5 h-5 mr-2" />
              Active Impersonation Sessions
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
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tenant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Started
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time Remaining
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {activeSessions.map((session) => (
                  <tr key={session.sessionId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-mono text-gray-900">{session.sessionId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{session.userName}</div>
                        <div className="text-sm text-gray-500">{session.userEmail}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{session.tenantName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(session.startedAt).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {getTimeRemaining(session.expiresAt)}
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
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* User Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Start New Impersonation Session</h3>
        
        <div className="flex items-end space-x-4 mb-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search User</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by name, email, or tenant (minimum 3 characters)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="w-32">
            <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
            <select
              value={selectedDuration}
              onChange={(e) => setSelectedDuration(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={15}>15 min</option>
              <option value={30}>30 min</option>
              <option value={60}>1 hour</option>
              <option value={120}>2 hours</option>
            </select>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Reason for Impersonation <span className="text-red-500">*</span>
          </label>
          <textarea
            placeholder="Describe the support issue requiring impersonation (required for audit trail)..."
            value={impersonationReason}
            onChange={(e) => setImpersonationReason(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>

        {searchTerm.length > 0 && searchTerm.length < 3 && (
          <p className="text-sm text-gray-500">Please enter at least 3 characters to search</p>
        )}
      </div>

      {/* Search Results */}
      {loading && (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Searching users...</p>
        </div>
      )}

      {!loading && searchTerm.length >= 3 && searchResults.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Users Found</h3>
          <p className="text-gray-600">No users match your search criteria.</p>
        </div>
      )}

      {!loading && searchResults.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Search Results ({searchResults.length} users found)
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tenant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {searchResults.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.tenantName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.role}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => startImpersonation(user.id)}
                        disabled={!impersonationReason.trim()}
                        className="inline-flex items-center px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-900 border border-blue-200 rounded hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Play className="w-4 h-4 mr-1" />
                        Start Session
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Guidelines */}
      {searchTerm.length === 0 && (
        <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
          <h3 className="text-lg font-medium text-blue-900 mb-2">Impersonation Guidelines</h3>
          <div className="text-sm text-blue-800 space-y-2">
            <p><strong>When to Use:</strong> Only when direct user assistance is required and other methods have failed</p>
            <p><strong>Duration:</strong> Use the minimum time necessary to resolve the issue</p>
            <p><strong>Restrictions:</strong> View-only access - no data modification, payment processing, or account changes</p>
            <p><strong>Documentation:</strong> Always document the reason and actions taken during impersonation</p>
            <p><strong>Privacy:</strong> Respect user privacy and only access information relevant to the support issue</p>
          </div>
        </div>
      )}
    </div>
  )
}