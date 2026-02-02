'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuthStore } from '@/store/authStore'
import { 
  MessageSquare,
  Send,
  Search,
  Filter,
  Clock,
  User,
  Building2,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Phone,
  Mail,
  MoreVertical,
  Paperclip,
  Smile,
  X
} from 'lucide-react'

interface ChatSession {
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
  lastMessage: {
    message: string
    timestamp: Date
    sender: string
    isFromSupport: boolean
  }
  unreadCount: number
  status: 'open' | 'in_progress' | 'waiting' | 'resolved'
  priority: 'low' | 'medium' | 'high' | 'critical'
}

interface ChatMessage {
  id: string
  sender: {
    name: string
    role: string
  }
  message: string
  timestamp: Date
  isInternal: boolean
  isFromSupport: boolean
}

export default function ActiveChatsPage() {
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([])
  const [selectedChat, setSelectedChat] = useState<ChatSession | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isInternal, setIsInternal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchActiveChats()
    const interval = setInterval(fetchActiveChats, 10000) // Refresh every 10 seconds for real-time updates
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (selectedChat) {
      fetchChatHistory(selectedChat.ticketId)
      
      // Set up interval to refresh messages every 5 seconds when a chat is selected
      const messageInterval = setInterval(() => {
        fetchChatHistory(selectedChat.ticketId)
      }, 5000)
      
      return () => clearInterval(messageInterval)
    }
  }, [selectedChat])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchActiveChats = async () => {
    console.log('🔄 Fetching active chats for platform support...');
    
    try {
      const authStorage = localStorage.getItem('auth-storage')
      let token = authStorage ? JSON.parse(authStorage).state?.token : null

      // Also try direct token
      if (!token) {
        token = localStorage.getItem('token');
      }

      console.log('🔑 Platform support token found:', !!token);

      if (!token) {
        console.log('❌ No token found for platform support');
        setLoading(false);
        return;
      }

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
      console.log('🌐 Fetching from:', `${API_URL}/support/chat/active`);
      
      const response = await fetch(`${API_URL}/support/chat/active`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      console.log('📥 Active chats response status:', response.status);
      console.log('📥 Active chats response ok:', response.ok);

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Active chats data:', data);
        
        if (data.success) {
          setChatSessions(data.data.activeChats || [])
          console.log('✅ Active chats updated:', data.data.activeChats?.length || 0);
          console.log('📋 Active chats list:', data.data.activeChats?.map(chat => ({
            ticketId: chat.ticketId,
            ticketNumber: chat.ticketNumber,
            customerName: chat.customer?.name,
            tenantName: chat.tenant?.name,
            status: chat.status,
            priority: chat.priority
          })) || []);
        }
      } else {
        console.log('❌ Active chats API error:', response.status);
        const errorText = await response.text();
        console.log('❌ Error details:', errorText);
        
        // Test if backend is running
        try {
          const healthCheck = await fetch(`${API_URL.replace('/api', '')}/api/health`);
          console.log('🏥 Backend health check:', healthCheck.ok ? 'ONLINE' : 'OFFLINE');
        } catch (healthError) {
          console.log('🏥 Backend health check: OFFLINE -', healthError.message);
        }
        
        // Fallback to mock data for demonstration
        console.log('🔄 Using mock data for platform support...');
        setChatSessions([
          {
            ticketId: 'ticket_1',
            ticketNumber: 'TKT-2026-001',
            customer: {
              name: 'Rajesh Kumar',
              email: 'rajesh@cleanwash.com',
              phone: '+91 98765 43210'
            },
            tenant: {
              name: 'CleanWash Laundry',
              slug: 'cleanwash'
            },
            lastMessage: {
              message: 'The payment gateway is still showing errors. Can you please check?',
              timestamp: new Date(Date.now() - 5 * 60 * 1000),
              sender: 'Rajesh Kumar',
              isFromSupport: false
            },
            unreadCount: 2,
            status: 'in_progress',
            priority: 'high'
          },
          {
            ticketId: 'ticket_2',
            ticketNumber: 'TKT-2026-002',
            customer: {
              name: 'Priya Sharma',
              email: 'priya@quickclean.in'
            },
            tenant: {
              name: 'QuickClean Services',
              slug: 'quickclean'
            },
            lastMessage: {
              message: 'Thank you for the update. I will check and get back to you.',
              timestamp: new Date(Date.now() - 15 * 60 * 1000),
              sender: 'Support Agent',
              isFromSupport: true
            },
            unreadCount: 0,
            status: 'waiting',
            priority: 'medium'
          }
        ])
      }
    } catch (error) {
      console.error('❌ Error fetching active chats:', error)
      
      // Fallback to mock data on network error
      console.log('🔄 Using mock data due to network error...');
      setChatSessions([
        {
          ticketId: 'error_ticket_1',
          ticketNumber: 'TKT-ERROR-001',
          customer: {
            name: 'Network Error - Mock Customer',
            email: 'error@example.com'
          },
          tenant: {
            name: 'Mock Tenant (Network Error)',
            slug: 'mock-tenant'
          },
          lastMessage: {
            message: 'This is a mock chat due to network error: ' + error.message,
            timestamp: new Date(),
            sender: 'System',
            isFromSupport: true
          },
          unreadCount: 0,
          status: 'open',
          priority: 'high'
        }
      ]);
    } finally {
      setLoading(false)
    }
  }

  const fetchChatHistory = async (sessionId: string) => {
    console.log('🔄 Fetching chat history for session:', sessionId);
    
    try {
      const authStorage = localStorage.getItem('auth-storage')
      let token = authStorage ? JSON.parse(authStorage).state?.token : null

      // Also try direct token
      if (!token) {
        token = localStorage.getItem('token');
      }

      if (!token) {
        console.log('❌ No token found for chat history');
        return;
      }

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
      console.log('🌐 Fetching history from:', `${API_URL}/support/chat/${sessionId}/history`);
      
      const response = await fetch(`${API_URL}/support/chat/${sessionId}/history`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      console.log('📥 Chat history response status:', response.status);

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Chat history data:', data);
        
        if (data.success) {
          const newMessages = data.data.messages || []
          
          // Preserve optimistic messages during refresh
          setMessages(prev => {
            // Get all optimistic messages (temp IDs start with 'temp_support_')
            const optimisticMessages = prev.filter(msg => msg.id.startsWith('temp_support_'))
            
            console.log('✅ Chat messages updated:', newMessages.length, 'server messages +', optimisticMessages.length, 'optimistic messages');
            
            // Merge server messages with optimistic messages and sort by timestamp
            return [...newMessages, ...optimisticMessages]
              .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()) // Sort by timestamp ascending
          })
        }
      } else {
        console.log('❌ Chat history API error:', response.status);
        const errorText = await response.text();
        console.log('❌ Error details:', errorText);
        
        // Only use fallback if we don't have any messages yet
        if (messages.length === 0) {
          console.log('🔄 Using mock chat history...');
          setMessages([
            {
              id: 'msg_1',
              sender: { name: 'Rajesh Kumar', role: 'tenant_admin' },
              message: 'Hi, I am facing issues with the payment gateway. Customers are unable to complete payments.',
              timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
              isInternal: false,
              isFromSupport: false
            },
            {
              id: 'msg_2',
              sender: { name: 'Support Agent', role: 'support' },
              message: 'Hello Rajesh, I understand you are facing payment gateway issues. Let me check the logs and get back to you.',
              timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
              isInternal: false,
              isFromSupport: true
            },
            {
              id: 'msg_3',
              sender: { name: 'Support Agent', role: 'support' },
              message: 'Internal note: Checking Razorpay logs for tenant cleanwash',
              timestamp: new Date(Date.now() - 1.4 * 60 * 60 * 1000),
              isInternal: true,
              isFromSupport: true
            },
            {
              id: 'msg_4',
              sender: { name: 'Support Agent', role: 'support' },
              message: 'I found the issue. There was a temporary connectivity problem with Razorpay. It should be resolved now. Can you please try again?',
              timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
              isInternal: false,
              isFromSupport: true
            },
            {
              id: 'msg_5',
              sender: { name: 'Rajesh Kumar', role: 'tenant_admin' },
              message: 'The payment gateway is still showing errors. Can you please check?',
              timestamp: new Date(Date.now() - 5 * 60 * 1000),
              isInternal: false,
              isFromSupport: false
            }
          ])
        }
      }
    } catch (error) {
      console.error('❌ Error fetching chat history:', error)
      
      // Only use fallback if we don't have any messages yet
      if (messages.length === 0) {
        setMessages([
          {
            id: 'error_msg_1',
            sender: { name: 'System', role: 'system' },
            message: 'Error loading chat history: ' + error.message,
            timestamp: new Date(),
            isInternal: true,
            isFromSupport: true
          }
        ]);
      }
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return

    const messageText = newMessage.trim()
    const isInternalNote = isInternal

    console.log('📤 Sending message from platform support:', {
      sessionId: selectedChat.ticketId,
      message: messageText,
      isInternal: isInternalNote
    });

    // Create optimistic message with unique ID
    const optimisticId = `temp_support_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const optimisticMessage = {
      id: optimisticId,
      sender: { name: user?.name || 'Support Agent', role: 'support' },
      message: messageText,
      timestamp: new Date(),
      isInternal: isInternalNote,
      isFromSupport: true
    }

    // Add optimistic message immediately and clear input
    setMessages(prev => [...prev, optimisticMessage])
    setNewMessage('')
    setIsInternal(false)

    try {
      const authStorage = localStorage.getItem('auth-storage')
      let token = authStorage ? JSON.parse(authStorage).state?.token : null

      // Also try direct token
      if (!token) {
        token = localStorage.getItem('token');
      }

      if (!token) {
        console.log('❌ No token found for sending message');
        // Only restore message if no token (authentication issue)
        setMessages(prev => prev.filter(msg => msg.id !== optimisticId))
        setNewMessage(messageText)
        setIsInternal(isInternalNote)
        return;
      }

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
      console.log('🌐 Sending message to:', `${API_URL}/support/chat/${selectedChat.ticketId}/message`);
      
      const response = await fetch(`${API_URL}/support/chat/${selectedChat.ticketId}/message`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: messageText,
          isInternal: isInternalNote,
          messageType: 'text'
        })
      })

      console.log('📥 Send message response status:', response.status);

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Message sent successfully:', data);
        
        if (data.success && data.data.message) {
          // Replace optimistic message with real message from server
          setMessages(prev => prev.map(msg => 
            msg.id === optimisticId ? {
              id: data.data.message.id || `msg_${Date.now()}`,
              sender: data.data.message.sender || { name: user?.name || 'Support Agent', role: 'support' },
              message: data.data.message.message || messageText,
              timestamp: new Date(data.data.message.timestamp || Date.now()),
              isInternal: data.data.message.isInternal || isInternalNote,
              isFromSupport: true,
              messageType: data.data.message.messageType || 'text',
              status: data.data.message.status || 'sent'
            } : msg
          ))
          
          // Force refresh of chat history to ensure sync (but don't restore input)
          setTimeout(() => {
            fetchChatHistory(selectedChat.ticketId)
          }, 1000)
        } else {
          // API returned success: false - keep optimistic message but don't restore input
          console.log('❌ API returned success: false', data);
          // Keep the optimistic message for now, let the refresh handle it
        }
      } else {
        console.log('❌ Send message API error:', response.status);
        const errorText = await response.text();
        console.log('❌ Error details:', errorText);
        
        // For API errors, keep the optimistic message and let refresh handle it
        // Don't restore the input text to prevent the "reappearing message" issue
        console.log('🔄 Keeping optimistic message, will be handled by refresh');
      }
    } catch (error) {
      console.error('❌ Error sending message:', error)
      
      // For network errors, keep the optimistic message and let refresh handle it
      // Don't restore the input text to prevent the "reappearing message" issue
      console.log('🔄 Network error, keeping optimistic message for now');
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-700'
      case 'in_progress': return 'bg-yellow-100 text-yellow-700'
      case 'waiting': return 'bg-orange-100 text-orange-700'
      case 'resolved': return 'bg-green-100 text-green-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-700 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-700 border-green-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const filteredChats = chatSessions.filter(chat => {
    if (!chat) return false;
    
    const customerName = chat.customer?.name || '';
    const tenantName = chat.tenant?.name || '';
    const ticketNumber = chat.ticketNumber || '';
    
    return (
      customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tenantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticketNumber.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <MessageSquare className="w-7 h-7 mr-3 text-blue-600" />
              Live Chat Support
            </h1>
            <p className="text-gray-600 mt-1">
              Active chat sessions with customers and tenant admins
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
              {filteredChats.length} Active Chats
            </span>
            <button
              onClick={fetchActiveChats}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Chat List Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          {/* Search */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search chats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Chat Sessions */}
          <div className="flex-1 overflow-y-auto">
            {filteredChats.length > 0 ? (
              filteredChats.map((chat) => (
                <div
                  key={chat.ticketId}
                  onClick={() => setSelectedChat(chat)}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedChat?.ticketId === chat.ticketId ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-mono text-blue-600">{chat.ticketNumber}</span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(chat.priority)}`}>
                        {chat.priority}
                      </span>
                    </div>
                    {chat.unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                        {chat.unreadCount}
                      </span>
                    )}
                  </div>
                  
                  <div className="mb-2">
                    <p className="font-medium text-gray-900 text-sm">{chat.customer?.name || 'Unknown Customer'}</p>
                    <p className="text-xs text-gray-500">{chat.tenant?.name || 'Unknown Tenant'}</p>
                  </div>
                  
                  <div className="mb-2">
                    <p className="text-sm text-gray-700 line-clamp-2">{chat.lastMessage?.message || 'No messages yet'}</p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(chat.status)}`}>
                      {chat.status.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-gray-500">
                      {chat.lastMessage?.timestamp ? new Date(chat.lastMessage.timestamp).toLocaleTimeString() : 'No time'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No active chats found</p>
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="flex-shrink-0 bg-white border-b border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{selectedChat.customer?.name || 'Unknown Customer'}</h3>
                      <p className="text-sm text-gray-500">{selectedChat.tenant?.name || 'Unknown Tenant'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Mail className="w-4 h-4" />
                      <span>{selectedChat.customer?.email || 'No email'}</span>
                    </div>
                    {selectedChat.customer?.phone && (
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Phone className="w-4 h-4" />
                        <span>{selectedChat.customer.phone}</span>
                      </div>
                    )}
                    <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.isFromSupport ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.isInternal
                          ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                          : message.isFromSupport
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      {message.isInternal && (
                        <p className="text-xs font-medium mb-1">Internal Note</p>
                      )}
                      <p className="text-sm">{message.message}</p>
                      <p className={`text-xs mt-1 ${
                        message.isInternal
                          ? 'text-yellow-600'
                          : message.isFromSupport
                          ? 'text-blue-200'
                          : 'text-gray-500'
                      }`}>
                        {message.sender.name} • {new Date(message.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="flex-shrink-0 bg-white border-t border-gray-200 p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={isInternal}
                      onChange={(e) => setIsInternal(e.target.checked)}
                      className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                    />
                    <span className="text-sm text-gray-600">Internal note</span>
                  </label>
                </div>
                <div className="flex items-end space-x-3">
                  <div className="flex-1">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder={isInternal ? "Add internal note..." : "Type your message..."}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      rows={2}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          sendMessage()
                        }
                      }}
                    />
                  </div>
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a chat to start</h3>
                <p className="text-gray-500">Choose a chat session from the sidebar to begin messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}