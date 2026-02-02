'use client'

import { useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { 
  Search,
  User,
  Building2,
  Phone,
  Mail,
  MessageSquare,
  Eye,
  Clock,
  AlertTriangle,
  CheckCircle,
  RefreshCw
} from 'lucide-react'

interface CustomerInfo {
  id: string
  name: string
  email: string
  phone?: string
  role: string
  tenancy?: {
    name: string
    slug: string
  }
  isActive: boolean
  lastLogin?: Date
  recentTickets: {
    id: string
    ticketNumber: string
    subject: string
    status: string
    createdAt: Date
  }[]
  orderHistory: {
    totalOrders: number
    completedOrders: number
    pendingOrders: number
    lastOrderDate?: Date
  }
}

export default function CustomerLookupPage() {
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<CustomerInfo[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerInfo | null>(null)

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setLoading(true)
    try {
      const authStorage = localStorage.getItem('auth-storage')
      const token = authStorage ? JSON.parse(authStorage).state?.token : null

      if (!token) return

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
      const response = await fetch(`${API_URL}/support/users?search=${encodeURIComponent(searchQuery)}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setSearchResults(data.data.users || [])
        }
      } else {
        // Fallback to mock data
        setSearchResults([
          {
            id: 'user_1',
            name: 'Rajesh Kumar',
            email: 'raj***@cleanwash.com',
            phone: '+91 987***210',
            role: 'tenant_admin',
            tenancy: {
              name: 'CleanWash Laundry',
              slug: 'cleanwash'
            },
            isActive: true,
            lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000),
            recentTickets: [
              {
                id: 'ticket_1',
                ticketNumber: 'TKT-2026-001',
                subject: 'Payment Gateway Error',
                status: 'in_progress',
                createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
              }
            ],
            orderHistory: {
              totalOrders: 0,
              completedOrders: 142,
              pendingOrders: 3,
              lastOrderDate: new Date(Date.now() - 6 * 60 * 60 * 1000)
            }
          }
        ])
      }
    } catch (error) {
      console.error('Error searching customers:', error)
    } finally {
      setLoading(false)
    }
  }

  const startChat = (customer: CustomerInfo) => {
    // Implementation to start a new chat session
    console.log('Starting chat with:', customer.name)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <Search className="w-7 h-7 mr-3 text-blue-600" />
          Customer Lookup
        </h1>
        <p className="text-gray-600 mt-1">
          Search and find customers to start chat support sessions
        </p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, email, phone, or tenant name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={loading || !searchQuery.trim()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Search className="w-4 h-4" />
            )}
            <span>Search</span>
          </button>
        </div>
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Search Results ({searchResults.length})
            </h2>
          </div>
          <div className="divide-y divide-gray-200">
            {searchResults.map((customer) => (
              <div key={customer.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{customer.name}</h3>
                        <p className="text-sm text-gray-500 capitalize">{customer.role.replace('_', ' ')}</p>
                      </div>
                      {customer.isActive ? (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                          Inactive
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Mail className="w-4 h-4" />
                        <span>{customer.email}</span>
                      </div>
                      {customer.phone && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Phone className="w-4 h-4" />
                          <span>{customer.phone}</span>
                        </div>
                      )}
                      {customer.tenancy && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Building2 className="w-4 h-4" />
                          <span>{customer.tenancy.name}</span>
                        </div>
                      )}
                    </div>

                    {customer.lastLogin && (
                      <div className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
                        <Clock className="w-4 h-4" />
                        <span>Last login: {new Date(customer.lastLogin).toLocaleString()}</span>
                      </div>
                    )}

                    {/* Recent Activity */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Recent Tickets */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Recent Tickets</h4>
                        {customer.recentTickets.length > 0 ? (
                          <div className="space-y-2">
                            {customer.recentTickets.slice(0, 2).map((ticket) => (
                              <div key={ticket.id} className="p-2 bg-gray-50 rounded text-sm">
                                <div className="flex items-center justify-between">
                                  <span className="font-mono text-blue-600">{ticket.ticketNumber}</span>
                                  <span className={`px-2 py-1 text-xs rounded-full ${
                                    ticket.status === 'resolved' ? 'bg-green-100 text-green-700' :
                                    ticket.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-blue-100 text-blue-700'
                                  }`}>
                                    {ticket.status.replace('_', ' ')}
                                  </span>
                                </div>
                                <p className="text-gray-600 truncate">{ticket.subject}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">No recent tickets</p>
                        )}
                      </div>

                      {/* Order History */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Order History</h4>
                        <div className="space-y-1 text-sm text-gray-600">
                          <div>Total Orders: {customer.orderHistory.totalOrders}</div>
                          <div>Completed: {customer.orderHistory.completedOrders}</div>
                          <div>Pending: {customer.orderHistory.pendingOrders}</div>
                          {customer.orderHistory.lastOrderDate && (
                            <div>Last Order: {new Date(customer.orderHistory.lastOrderDate).toLocaleDateString()}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2">
                    <button
                      onClick={() => startChat(customer)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Start Chat</span>
                    </button>
                    <button
                      onClick={() => setSelectedCustomer(customer)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View Details</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {searchQuery && searchResults.length === 0 && !loading && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No customers found</h3>
          <p className="text-gray-500">Try adjusting your search terms or check the spelling</p>
        </div>
      )}

      {/* Empty State */}
      {!searchQuery && searchResults.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Search for customers</h3>
          <p className="text-gray-500">Enter a name, email, phone number, or tenant name to find customers</p>
        </div>
      )}
    </div>
  )
}