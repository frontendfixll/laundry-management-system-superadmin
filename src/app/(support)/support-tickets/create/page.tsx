'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft,
  Send,
  Paperclip,
  AlertTriangle,
  Clock,
  User,
  Building2,
  Mail,
  Phone,
  FileText,
  CreditCard,
  Settings,
  HelpCircle,
  RefreshCw,
  Zap,
  Save,
  X
} from 'lucide-react'

interface TicketFormData {
  title: string
  description: string
  priority: 'P0' | 'P1' | 'P2' | 'P3'
  category: 'payment' | 'order' | 'account' | 'system' | 'general' | 'refund' | 'technical'
  tenantId?: string
  userEmail?: string
  businessImpact: 'low' | 'medium' | 'high' | 'critical'
  expectedResolution: string
  attachments: File[]
}

export default function CreateTicketPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<TicketFormData>({
    title: '',
    description: '',
    priority: 'P3',
    category: 'general',
    businessImpact: 'low',
    expectedResolution: '',
    attachments: []
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const token = localStorage.getItem('auth-storage')
      if (!token) {
        alert('Authentication required')
        return
      }

      const parsed = JSON.parse(token)
      const authToken = parsed.state?.token
      if (!authToken) {
        alert('Authentication token not found')
        return
      }

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://laundrylobby-backend-1.vercel.app/api'

      const ticketData = {
        subject: formData.title,
        description: formData.description,
        priority: formData.priority,
        category: formData.category,
        businessImpact: formData.businessImpact,
        expectedResolution: formData.expectedResolution,
        tenantId: formData.tenantId,
        userEmail: formData.userEmail,
        source: 'staff-panel',
        status: 'new'
      }

      const response = await fetch(`${API_URL}/support/tickets`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(ticketData)
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          alert('Ticket created successfully!')
          router.push('/support-tickets')
        } else {
          alert('Failed to create ticket: ' + (result.message || 'Unknown error'))
        }
      } else {
        alert('Failed to create ticket: ' + response.statusText)
      }
    } catch (error) {
      console.error('Error creating ticket:', error)
      alert('Error creating ticket. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'payment': return <CreditCard className="w-4 h-4" />
      case 'order': return <FileText className="w-4 h-4" />
      case 'account': return <User className="w-4 h-4" />
      case 'system': return <Settings className="w-4 h-4" />
      case 'refund': return <RefreshCw className="w-4 h-4" />
      case 'technical': return <Zap className="w-4 h-4" />
      default: return <HelpCircle className="w-4 h-4" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'P0': return 'border-red-500 bg-red-50'
      case 'P1': return 'border-orange-500 bg-orange-50'
      case 'P2': return 'border-yellow-500 bg-yellow-50'
      case 'P3': return 'border-green-500 bg-green-50'
      default: return 'border-gray-300 bg-white'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create Support Ticket</h1>
            <p className="text-gray-600 mt-1">Create a new support ticket for customer assistance</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Main Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Ticket Details</h2>
          
          <div className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ticket Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Brief description of the issue"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Priority and Category Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority Level *
                </label>
                <select
                  required
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${getPriorityColor(formData.priority)}`}
                >
                  <option value="P0">P0 - Critical (System Down)</option>
                  <option value="P1">P1 - High (Major Impact)</option>
                  <option value="P2">P2 - Medium (Moderate Impact)</option>
                  <option value="P3">P3 - Low (Minor Issue)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <div className="relative">
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                  >
                    <option value="general">General Support</option>
                    <option value="payment">Payment Issues</option>
                    <option value="order">Order Problems</option>
                    <option value="refund">Refund Requests</option>
                    <option value="technical">Technical Issues</option>
                    <option value="account">Account Management</option>
                    <option value="system">System Issues</option>
                  </select>
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                    {getCategoryIcon(formData.category)}
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Email
                </label>
                <div className="relative">
                  <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="email"
                    value={formData.userEmail || ''}
                    onChange={(e) => setFormData({ ...formData, userEmail: e.target.value })}
                    placeholder="customer@example.com"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tenant ID
                </label>
                <div className="relative">
                  <Building2 className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    value={formData.tenantId || ''}
                    onChange={(e) => setFormData({ ...formData, tenantId: e.target.value })}
                    placeholder="tenant-id-123"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Business Impact */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Impact
              </label>
              <select
                value={formData.businessImpact}
                onChange={(e) => setFormData({ ...formData, businessImpact: e.target.value as any })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="low">Low - Minor inconvenience</option>
                <option value="medium">Medium - Affects some operations</option>
                <option value="high">High - Significant impact</option>
                <option value="critical">Critical - Business stopping</option>
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Detailed Description *
              </label>
              <textarea
                required
                rows={6}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Provide detailed information about the issue, including steps to reproduce, error messages, and any relevant context..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Expected Resolution */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expected Resolution
              </label>
              <textarea
                rows={3}
                value={formData.expectedResolution}
                onChange={(e) => setFormData({ ...formData, expectedResolution: e.target.value })}
                placeholder="What outcome are you expecting? How should this issue be resolved?"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>
          </div>
        </div>

        {/* Priority Guidelines */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Priority Guidelines</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 border-l-4 border-red-500 bg-red-50">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span className="font-medium text-red-900">P0 - Critical</span>
              </div>
              <p className="text-sm text-red-700">System completely down, major security breach, data loss</p>
            </div>

            <div className="p-4 border-l-4 border-orange-500 bg-orange-50">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="w-4 h-4 text-orange-600" />
                <span className="font-medium text-orange-900">P1 - High</span>
              </div>
              <p className="text-sm text-orange-700">Major functionality broken, significant user impact</p>
            </div>

            <div className="p-4 border-l-4 border-yellow-500 bg-yellow-50">
              <div className="flex items-center space-x-2 mb-2">
                <FileText className="w-4 h-4 text-yellow-600" />
                <span className="font-medium text-yellow-900">P2 - Medium</span>
              </div>
              <p className="text-sm text-yellow-700">Feature not working as expected, moderate impact</p>
            </div>

            <div className="p-4 border-l-4 border-green-500 bg-green-50">
              <div className="flex items-center space-x-2 mb-2">
                <HelpCircle className="w-4 h-4 text-green-600" />
                <span className="font-medium text-green-900">P3 - Low</span>
              </div>
              <p className="text-sm text-green-700">Minor issues, feature requests, general questions</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
          >
            <X className="w-4 h-4" />
            <span>Cancel</span>
          </button>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Draft</span>
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>{loading ? 'Creating...' : 'Create Ticket'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}