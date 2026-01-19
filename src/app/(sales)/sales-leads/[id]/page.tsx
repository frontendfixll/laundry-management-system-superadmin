'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import api from '@/lib/api'
import { 
  ArrowLeft, User, Mail, Phone, MapPin, Building2, Calendar, Clock,
  TrendingUp, MessageSquare, CheckCircle, XCircle, PlayCircle,
  RefreshCw, Edit, Trash2
} from 'lucide-react'
import Link from 'next/link'

interface Lead {
  _id: string
  businessName: string
  businessType: string
  contactPerson: {
    name: string
    email: string
    phone: string
    designation?: string
  }
  address: {
    street?: string
    city?: string
    state?: string
    pincode?: string
  }
  status: string
  source: string
  trial?: {
    isActive: boolean
    startDate: string
    endDate: string
    daysRemaining: number
    extensionCount: number
  }
  interestedPlan: string
  estimatedRevenue?: number
  requirements?: {
    numberOfBranches?: number
    expectedOrders?: number
    staffCount?: number
    features?: string[]
    notes?: string
  }
  priority: string
  score: number
  followUpNotes?: Array<{
    note: string
    nextFollowUp?: string
    createdAt: string
  }>
  isConverted: boolean
  createdAt: string
  updatedAt: string
}

export default function LeadDetailPage() {
  const router = useRouter()
  const params = useParams()
  const leadId = params.id as string

  const [lead, setLead] = useState<Lead | null>(null)
  const [loading, setLoading] = useState(true)
  const [showFollowUpModal, setShowFollowUpModal] = useState(false)
  const [showTrialModal, setShowTrialModal] = useState(false)
  const [showExtendModal, setShowExtendModal] = useState(false)
  const [showConvertModal, setShowConvertModal] = useState(false)
  const [showLostModal, setShowLostModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  useEffect(() => {
    fetchLead()
  }, [leadId])

  const fetchLead = async () => {
    try {
      const response = await api.get(`/sales/leads/${leadId}`)
      if (response.data?.data?.lead) {
        setLead(response.data.data.lead)
      }
    } catch (error) {
      console.error('Error fetching lead:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    const colors: any = {
      new: 'bg-blue-100 text-blue-800 border-blue-200',
      contacted: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      qualified: 'bg-green-100 text-green-800 border-green-200',
      demo_scheduled: 'bg-purple-100 text-purple-800 border-purple-200',
      negotiation: 'bg-orange-100 text-orange-800 border-orange-200',
      converted: 'bg-green-100 text-green-800 border-green-200',
      lost: 'bg-red-100 text-red-800 border-red-200',
    }
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const getPriorityColor = (priority: string) => {
    const colors: any = {
      urgent: 'bg-red-500',
      high: 'bg-orange-500',
      medium: 'bg-yellow-500',
      low: 'bg-gray-400',
    }
    return colors[priority] || 'bg-gray-400'
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!lead) {
    return (
      <div className="text-center py-12">
        <XCircle className="mx-auto h-12 w-12 text-red-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Lead not found</h3>
        <Link href="/sales-leads" className="mt-4 inline-block text-blue-600 hover:text-blue-800">
          ← Back to Leads
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/sales-leads" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{lead.businessName}</h1>
            <p className="text-gray-600 capitalize">{lead.businessType}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowEditModal(true)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Edit Lead">
            <Edit className="w-5 h-5 text-gray-600" />
          </button>
          <button onClick={() => setShowDeleteModal(true)} className="p-2 hover:bg-red-50 rounded-lg transition-colors" title="Delete Lead">
            <Trash2 className="w-5 h-5 text-red-600" />
          </button>
          <div className={`w-3 h-3 rounded-full ${getPriorityColor(lead.priority)}`} />
          <span className={`px-3 py-1 text-sm font-semibold rounded-full border ${getStatusColor(lead.status)}`}>
            {lead.status.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Score Card */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-100 text-sm">Lead Score</p>
            <p className="text-4xl font-bold mt-1">{lead.score}/100</p>
            <p className="text-blue-100 text-sm mt-2">
              {lead.score >= 80 ? 'Hot Lead 🔥' : lead.score >= 60 ? 'Warm Lead 🌡️' : 'Cold Lead ❄️'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-blue-100 text-sm">Estimated Revenue</p>
            <p className="text-2xl font-bold mt-1">
              {lead.estimatedRevenue ? formatCurrency(lead.estimatedRevenue) : 'Not set'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Information */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Contact Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Contact Person</p>
                  <p className="font-medium text-gray-900">{lead.contactPerson.name}</p>
                  {lead.contactPerson.designation && (
                    <p className="text-sm text-gray-500">{lead.contactPerson.designation}</p>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <a href={`mailto:${lead.contactPerson.email}`} className="font-medium text-blue-600 hover:text-blue-800">
                    {lead.contactPerson.email}
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <a href={`tel:${lead.contactPerson.phone}`} className="font-medium text-blue-600 hover:text-blue-800">
                    {lead.contactPerson.phone}
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Location</p>
                  <p className="font-medium text-gray-900">
                    {lead.address.city || 'Not provided'}, {lead.address.state || ''}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Trial Status */}
          {lead.trial?.isActive && (
            <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-orange-600" />
                  Active Trial
                </h2>
                <span className="px-3 py-1 bg-orange-100 text-orange-800 text-sm font-semibold rounded-full">
                  {lead.trial.daysRemaining} days left
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Start Date</p>
                  <p className="font-medium text-gray-900">
                    {new Date(lead.trial.startDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">End Date</p>
                  <p className="font-medium text-gray-900">
                    {new Date(lead.trial.endDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowExtendModal(true)}
                className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Extend Trial
              </button>
            </div>
          )}

          {/* Requirements */}
          {lead.requirements && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                Requirements
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {lead.requirements.numberOfBranches && (
                  <div>
                    <p className="text-sm text-gray-600">Branches</p>
                    <p className="text-lg font-semibold text-gray-900">{lead.requirements.numberOfBranches}</p>
                  </div>
                )}
                {lead.requirements.expectedOrders && (
                  <div>
                    <p className="text-sm text-gray-600">Expected Orders</p>
                    <p className="text-lg font-semibold text-gray-900">{lead.requirements.expectedOrders}/month</p>
                  </div>
                )}
                {lead.requirements.staffCount && (
                  <div>
                    <p className="text-sm text-gray-600">Staff Count</p>
                    <p className="text-lg font-semibold text-gray-900">{lead.requirements.staffCount}</p>
                  </div>
                )}
              </div>
              {lead.requirements.notes && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Additional Notes</p>
                  <p className="text-gray-900">{lead.requirements.notes}</p>
                </div>
              )}
            </div>
          )}

          {/* Follow-up Notes */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                Follow-up Notes
              </h2>
              <button
                onClick={() => setShowFollowUpModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                Add Note
              </button>
            </div>
            {lead.followUpNotes && lead.followUpNotes.length > 0 ? (
              <div className="space-y-4">
                {lead.followUpNotes.map((note, index) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                    <p className="text-gray-900">{note.note}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(note.createdAt).toLocaleString()}
                    </p>
                    {note.nextFollowUp && (
                      <p className="text-sm text-blue-600 mt-1">
                        Next follow-up: {new Date(note.nextFollowUp).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No follow-up notes yet</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              {!lead.trial?.isActive && !lead.isConverted && (
                <button
                  onClick={() => setShowTrialModal(true)}
                  className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <PlayCircle className="w-5 h-5" />
                  Start Trial
                </button>
              )}
              {lead.trial?.isActive && !lead.isConverted && (
                <button
                  onClick={() => setShowConvertModal(true)}
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  Convert to Customer
                </button>
              )}
              <button
                onClick={() => setShowFollowUpModal(true)}
                className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-5 h-5" />
                Add Follow-up
              </button>
              {!lead.isConverted && (
                <button
                  onClick={() => setShowLostModal(true)}
                  className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                >
                  <XCircle className="w-5 h-5" />
                  Mark as Lost
                </button>
              )}
            </div>
          </div>

          {/* Lead Info */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Lead Information</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Source</p>
                <p className="font-medium text-gray-900 capitalize">{lead.source.replace('_', ' ')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Interested Plan</p>
                <p className="font-medium text-gray-900 capitalize">{lead.interestedPlan}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Priority</p>
                <p className="font-medium text-gray-900 capitalize">{lead.priority}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Created</p>
                <p className="font-medium text-gray-900">
                  {new Date(lead.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Last Updated</p>
                <p className="font-medium text-gray-900">
                  {new Date(lead.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showFollowUpModal && (
        <FollowUpModal
          leadId={leadId}
          onClose={() => setShowFollowUpModal(false)}
          onSuccess={() => {
            setShowFollowUpModal(false)
            fetchLead()
          }}
        />
      )}

      {showTrialModal && (
        <StartTrialModal
          leadId={leadId}
          businessName={lead.businessName}
          onClose={() => setShowTrialModal(false)}
          onSuccess={() => {
            setShowTrialModal(false)
            fetchLead()
          }}
        />
      )}

      {showExtendModal && (
        <ExtendTrialModal
          leadId={leadId}
          businessName={lead.businessName}
          currentEndDate={lead.trial?.endDate || ''}
          onClose={() => setShowExtendModal(false)}
          onSuccess={() => {
            setShowExtendModal(false)
            fetchLead()
          }}
        />
      )}

      {showConvertModal && (
        <ConvertLeadModal
          leadId={leadId}
          businessName={lead.businessName}
          onClose={() => setShowConvertModal(false)}
          onSuccess={() => {
            setShowConvertModal(false)
            router.push('/leads')
          }}
        />
      )}

      {showLostModal && (
        <MarkLostModal
          leadId={leadId}
          businessName={lead.businessName}
          onClose={() => setShowLostModal(false)}
          onSuccess={() => {
            setShowLostModal(false)
            router.push('/leads')
          }}
        />
      )}

      {showEditModal && (
        <EditLeadModal
          lead={lead}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => {
            setShowEditModal(false)
            fetchLead()
          }}
        />
      )}

      {showDeleteModal && (
        <DeleteLeadModal
          leadId={leadId}
          businessName={lead.businessName}
          onClose={() => setShowDeleteModal(false)}
          onSuccess={() => {
            setShowDeleteModal(false)
            router.push('/leads')
          }}
        />
      )}
    </div>
  )
}

// Modal Components

// 1. Follow-up Modal
function FollowUpModal({ leadId, onClose, onSuccess }: any) {
  const [note, setNote] = useState('')
  const [nextFollowUp, setNextFollowUp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await api.post(`/sales/leads/${leadId}/follow-up`, {
        note,
        nextFollowUp: nextFollowUp || undefined
      })
      onSuccess()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add follow-up')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 rounded-t-2xl">
          <h2 className="text-2xl font-bold text-white">Add Follow-up Note</h2>
          <p className="text-purple-100 text-sm mt-1">Record your conversation and next steps</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Follow-up Note *
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              required
              rows={4}
              placeholder="What did you discuss? What are the next steps?"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Next Follow-up Date (Optional)
            </label>
            <input
              type="datetime-local"
              value={nextFollowUp}
              onChange={(e) => setNextFollowUp(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Adding...' : 'Add Note'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// 2. Start Trial Modal
function StartTrialModal({ leadId, businessName, onClose, onSuccess }: any) {
  const [trialDays, setTrialDays] = useState(30)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await api.post(`/sales/leads/${leadId}/start-trial`, { trialDays })
      onSuccess()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to start trial')
    } finally {
      setLoading(false)
    }
  }

  const endDate = new Date()
  endDate.setDate(endDate.getDate() + trialDays)

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 rounded-t-2xl">
          <h2 className="text-2xl font-bold text-white">Start Trial Period</h2>
          <p className="text-green-100 text-sm mt-1">for {businessName}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Trial Duration (Days) *
            </label>
            <div className="flex gap-2">
              {[15, 30, 60, 90].map((days) => (
                <button
                  key={days}
                  type="button"
                  onClick={() => setTrialDays(days)}
                  className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all ${
                    trialDays === days
                      ? 'bg-green-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {days} days
                </button>
              ))}
            </div>
            <input
              type="number"
              value={trialDays}
              onChange={(e) => setTrialDays(parseInt(e.target.value))}
              min="1"
              max="365"
              className="w-full mt-3 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all"
            />
          </div>

          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">Trial will end on:</span>
              <br />
              <span className="text-lg font-bold text-green-700">
                {endDate.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Starting...' : 'Start Trial'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// 3. Extend Trial Modal
function ExtendTrialModal({ leadId, businessName, currentEndDate, onClose, onSuccess }: any) {
  const [extensionDays, setExtensionDays] = useState(7)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await api.post(`/sales/leads/${leadId}/extend-trial`, { extensionDays })
      onSuccess()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to extend trial')
    } finally {
      setLoading(false)
    }
  }

  const newEndDate = new Date(currentEndDate)
  newEndDate.setDate(newEndDate.getDate() + extensionDays)

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="bg-gradient-to-r from-orange-600 to-red-600 p-6 rounded-t-2xl">
          <h2 className="text-2xl font-bold text-white">Extend Trial Period</h2>
          <p className="text-orange-100 text-sm mt-1">for {businessName}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">Current end date:</span>
              <br />
              <span className="text-lg font-bold text-orange-700">
                {new Date(currentEndDate).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Extension Days *
            </label>
            <div className="flex gap-2">
              {[7, 14, 30].map((days) => (
                <button
                  key={days}
                  type="button"
                  onClick={() => setExtensionDays(days)}
                  className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all ${
                    extensionDays === days
                      ? 'bg-orange-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {days} days
                </button>
              ))}
            </div>
            <input
              type="number"
              value={extensionDays}
              onChange={(e) => setExtensionDays(parseInt(e.target.value))}
              min="1"
              max="90"
              className="w-full mt-3 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
            />
          </div>

          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">New end date:</span>
              <br />
              <span className="text-lg font-bold text-green-700">
                {newEndDate.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl font-semibold hover:from-orange-700 hover:to-red-700 transition-all disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Extending...' : 'Extend Trial'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// 4. Convert Lead Modal
function ConvertLeadModal({ leadId, businessName, onClose, onSuccess }: any) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await api.post(`/sales/leads/${leadId}/convert`)
      onSuccess()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to convert lead')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-t-2xl">
          <h2 className="text-2xl font-bold text-white">Convert to Customer</h2>
          <p className="text-blue-100 text-sm mt-1">Congratulations! 🎉</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 text-center">
            <CheckCircle className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <p className="text-lg font-semibold text-gray-900 mb-2">
              Convert {businessName} to a paying customer?
            </p>
            <p className="text-sm text-gray-600">
              This will mark the lead as converted and create a customer account.
              This action cannot be undone.
            </p>
          </div>

          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
            <p className="text-sm font-semibold text-green-800 mb-2">✓ What happens next:</p>
            <ul className="text-sm text-gray-700 space-y-1 ml-4">
              <li>• Lead status will be marked as "Converted"</li>
              <li>• Customer account will be created</li>
              <li>• You'll earn commission for this conversion</li>
              <li>• Lead will move to customer management</li>
            </ul>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Converting...' : 'Convert to Customer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// 5. Mark as Lost Modal
function MarkLostModal({ leadId, businessName, onClose, onSuccess }: any) {
  const [reason, setReason] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const lostReasons = [
    'Budget constraints',
    'Chose competitor',
    'Not interested anymore',
    'Timing not right',
    'No response',
    'Other'
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await api.post(`/sales/leads/${leadId}/mark-lost`, { reason, notes })
      onSuccess()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to mark lead as lost')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="bg-gradient-to-r from-red-600 to-pink-600 p-6 rounded-t-2xl">
          <h2 className="text-2xl font-bold text-white">Mark Lead as Lost</h2>
          <p className="text-red-100 text-sm mt-1">for {businessName}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Reason for Loss *
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all"
            >
              <option value="">Select a reason</option>
              {lostReasons.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Additional Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Any additional details..."
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all"
            />
          </div>

          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
            <p className="text-sm font-semibold text-red-800 mb-2">⚠️ Warning:</p>
            <p className="text-sm text-gray-700">
              This will mark the lead as lost. You can still view it in the leads list with "Lost" status.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl font-semibold hover:from-red-700 hover:to-pink-700 transition-all disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Marking...' : 'Mark as Lost'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// 6. Edit Lead Modal
function EditLeadModal({ lead, onClose, onSuccess }: any) {
  const [formData, setFormData] = useState({
    businessName: lead.businessName,
    contactPerson: {
      name: lead.contactPerson.name,
      email: lead.contactPerson.email,
      phone: lead.contactPerson.phone,
      designation: lead.contactPerson.designation || ''
    },
    interestedPlan: lead.interestedPlan,
    priority: lead.priority,
    estimatedRevenue: lead.estimatedRevenue || 0
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await api.put(`/sales/leads/${lead._id}`, formData)
      onSuccess()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update lead')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-t-2xl">
          <h2 className="text-2xl font-bold text-white">Edit Lead</h2>
          <p className="text-blue-100 text-sm mt-1">Update lead information</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Business Name *</label>
              <input
                type="text"
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Contact Name *</label>
              <input
                type="text"
                value={formData.contactPerson.name}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  contactPerson: { ...formData.contactPerson, name: e.target.value }
                })}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
              <input
                type="email"
                value={formData.contactPerson.email}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  contactPerson: { ...formData.contactPerson, email: e.target.value }
                })}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Phone *</label>
              <input
                type="tel"
                value={formData.contactPerson.phone}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  contactPerson: { ...formData.contactPerson, phone: e.target.value }
                })}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Interested Plan</label>
              <select
                value={formData.interestedPlan}
                onChange={(e) => setFormData({ ...formData, interestedPlan: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              >
                <option value="basic">Basic</option>
                <option value="pro">Pro</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Estimated Revenue (₹)</label>
              <input
                type="number"
                value={formData.estimatedRevenue}
                onChange={(e) => setFormData({ ...formData, estimatedRevenue: parseInt(e.target.value) })}
                min="0"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Designation</label>
              <input
                type="text"
                value={formData.contactPerson.designation}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  contactPerson: { ...formData.contactPerson, designation: e.target.value }
                })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// 7. Delete Lead Modal
function DeleteLeadModal({ leadId, businessName, onClose, onSuccess }: any) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleDelete = async () => {
    setLoading(true)
    setError('')

    try {
      await api.delete(`/sales/leads/${leadId}`)
      onSuccess()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete lead')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="bg-gradient-to-r from-red-600 to-pink-600 p-6 rounded-t-2xl">
          <h2 className="text-2xl font-bold text-white">Delete Lead</h2>
          <p className="text-red-100 text-sm mt-1">This action cannot be undone</p>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 text-center">
            <Trash2 className="w-16 h-16 text-red-600 mx-auto mb-4" />
            <p className="text-lg font-semibold text-gray-900 mb-2">
              Delete {businessName}?
            </p>
            <p className="text-sm text-gray-600">
              This will permanently delete this lead and all associated data including follow-up notes and trial information.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl font-semibold hover:from-red-700 hover:to-pink-700 transition-all disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Deleting...' : 'Delete Lead'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
