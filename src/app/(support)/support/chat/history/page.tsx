'use client'

import { useState, useEffect } from 'react'
import { useSuperAdmin } from '@/store/authStore'
import api from '@/lib/api'
import { 
  MessageSquare, 
  Search,
  Filter,
  Calendar,
  User,
  Building2,
  Clock,
  Eye,
  Download,
  RefreshCw,
  ArrowLeft,
  FileText,
  Mail,
  Phone
} from 'lucide-react'

interface ChatHistoryItem {
  ticketId: string
  ticketNumber: string
  customer: {
    name: string
    email: string
    phone?: string
  }
  tenant: {
    name: string
    slug: string
  }
  messageCount: number
  duration: string
  status: string
  priority: string
  createdAt: string
  resolvedAt?: string
  lastActivity: string
  category: string
}

export default function ChatHistory() {
  const admin = useSuperAdmin()
  const [loading, setLoading] = useState(true)
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('7d')
  const [selectedChat, setSelectedChat] = useState<ChatHistoryItem | null>(null)

  useEffect(() => {
    loadChatHistory()
  }, [dateFilter, statusFilter])

  const loadChatHistory = async () => {
    try {
      setLoading(true)
      const { data } = await api.get('/support/chat/history', {
        params: { period: dateFilter, status: statusFilter }
      })
      if (data.success && Array.isArray(data.data)) {
        const transformedHistory = data.data.map((chat: any) => ({
          ticketId: chat._id || chat.id,
          ticketNumber: chat.ticketNumber || `TKT-${(chat._id || chat.id || '').toString().slice(-6)}`,
          customer: {
            name: chat.customer?.name || 'Unknown Customer',
            email: chat.customer?.email || 'unknown@email.com',
            phone: chat.customer?.phone
          },
          tenant: {
            name: chat.tenant?.name || 'Unknown Tenant',
            slug: chat.tenant?.slug || 'unknown'
          },
          messageCount: chat.messageCount || 0,
          duration: chat.duration || '0m',
          status: chat.status || 'unknown',
          priority: chat.priority || 'medium',
          createdAt: chat.createdAt,
          resolvedAt: chat.resolvedAt,
          lastActivity: chat.lastActivity || chat.updatedAt,
          category: chat.category || 'general'
        }))
        setChatHistory(transformedHistory)
      } else {
        setChatHistory([])
      }
    } catch (error) {
      console.error('Failed to load chat history:', error)
      setChatHistory([])
    } finally {
      setLoading(false)
    }
  }

  const filteredHistory = chatHistory.filter(chat => {
    const matchesSearch = chat.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         chat.tenant?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         chat.ticketNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || chat.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'bg-green-100 text-green-700'
      case 'closed': return 'bg-gray-100 text-gray-700'
      case 'escalated': return 'bg-red-100 text-red-700'
      default: return 'bg-blue-100 text-blue-700'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-700 border-green-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const exportChatHistory = () => {
    // TODO: Implement export functionality
    console.log('Exporting chat history...')
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 bg-gray-200 rounded w-64 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
              <div className="space-y-3">
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Chat History</h1>
          <p className="text-gray-600 mt-1">
            View and analyze past chat conversations
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={exportChatHistory}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          <button
            onClick={loadChatHistory}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Chats</p>
              <p className="text-2xl font-bold text-gray-900">{chatHistory.length}</p>
            </div>
            <MessageSquare className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Resolved</p>
              <p className="text-2xl font-bold text-gray-900">
                {chatHistory.filter(c => c.status === 'resolved').length}
              </p>
            </div>
            <FileText className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Avg Duration</p>
              <p className="text-2xl font-bold text-gray-900">1h 45m</p>
            </div>
            <Clock className="w-8 h-8 text-orange-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Avg Messages</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(chatHistory.reduce((sum, c) => sum + c.messageCount, 0) / chatHistory.length || 0)}
              </p>
            </div>
            <MessageSquare className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search chats..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
              <option value="escalated">Escalated</option>
            </select>
            
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="1d">Last 24 hours</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Chat History List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Chat History ({filteredHistory.length})
          </h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {filteredHistory.length > 0 ? (
            filteredHistory.map((chat) => (
              <div key={chat.ticketId} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-sm font-mono text-blue-600">{chat.ticketNumber}</span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(chat.priority)}`}>
                        {chat.priority}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(chat.status)}`}>
                        {chat.status}
                      </span>
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                        {chat.category}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="font-medium text-gray-900">{chat.customer.name}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Mail className="w-3 h-3" />
                          <span>{chat.customer.email}</span>
                        </div>
                        {chat.customer.phone && (
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Phone className="w-3 h-3" />
                            <span>{chat.customer.phone}</span>
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <Building2 className="w-4 h-4 text-gray-400" />
                          <span className="font-medium text-gray-900">{chat.tenant.name}</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          {chat.messageCount} messages • {chat.duration}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-6 text-xs text-gray-500">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>Created: {formatDate(chat.createdAt)}</span>
                      </span>
                      {chat.resolvedAt && (
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>Resolved: {formatDate(chat.resolvedAt)}</span>
                        </span>
                      )}
                      <span className="flex items-center space-x-1">
                        <MessageSquare className="w-3 h-3" />
                        <span>Last activity: {formatDate(chat.lastActivity)}</span>
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center">
              <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No chat history found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}