'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import api from '@/lib/api'
import { 
  ArrowLeft, 
  CreditCard, 
  Clock, 
  CheckCircle,
  Pause,
  Play,
  TrendingUp,
  TrendingDown,
  Calendar,
  Smartphone
} from 'lucide-react'
import Link from 'next/link'

interface Subscription {
  _id: string
  tenancyName: string
  plan: {
    name: string
    price: number
    billingCycle: string
    features: string[]
  }
  status: string
  trial: {
    isActive: boolean
    startDate: string
    endDate: string
    daysRemaining: number
  }
  nextBillingDate: string
  startDate: string
  createdAt: string
}

export default function SubscriptionDetailPage() {
  const router = useRouter()
  const params = useParams()
  const subscriptionId = params.id as string

  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [showPauseModal, setShowPauseModal] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [showDowngradeModal, setShowDowngradeModal] = useState(false)
  const [showPaymentLinkModal, setShowPaymentLinkModal] = useState(false)
  const [generatedPaymentLink, setGeneratedPaymentLink] = useState('')
  const [upgradeRequestData, setUpgradeRequestData] = useState<any>(null)

  useEffect(() => {
    fetchSubscription()
  }, [subscriptionId])

  const fetchSubscription = async () => {
    try {
      const response = await api.get(`/sales/subscriptions/${subscriptionId}`)
      console.log('Subscription Detail API Response:', response.data)
      
      // Backend returns data in response.data.data
      const tenancy = response.data?.data?.tenancy
      
      if (tenancy) {
        // Map tenancy data to subscription format
        const mappedSubscription = {
          _id: tenancy._id,
          tenancyName: tenancy.name || tenancy.businessName || 'Unknown Business',
          plan: {
            name: tenancy.subscription?.planId?.displayName || tenancy.subscription?.planId?.name || 'No Plan',
            price: tenancy.subscription?.planId?.price || 0,
            billingCycle: tenancy.subscription?.billingCycle || 'monthly',
            features: tenancy.subscription?.planId?.features || []
          },
          status: tenancy.subscription?.status || 'inactive',
          trial: {
            isActive: tenancy.subscription?.trial?.isActive || false,
            startDate: tenancy.subscription?.trial?.startDate || new Date().toISOString(),
            endDate: tenancy.subscription?.trial?.endDate || new Date().toISOString(),
            daysRemaining: tenancy.subscription?.trial?.daysRemaining || 0
          },
          nextBillingDate: tenancy.subscription?.nextBillingDate || new Date().toISOString(),
          startDate: tenancy.subscription?.startDate || tenancy.createdAt,
          createdAt: tenancy.createdAt
        }
        
        console.log('Mapped Subscription:', mappedSubscription)
        setSubscription(mappedSubscription)
      } else {
        console.log('No tenancy found in response')
      }
    } catch (error: any) {
      console.error('Error fetching subscription:', error)
      console.error('Error details:', error.response?.data)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    const colors: any = {
      active: 'bg-green-100 text-green-800 border-green-200',
      trial: 'bg-orange-100 text-orange-800 border-orange-200',
      paused: 'bg-gray-100 text-gray-800 border-gray-200',
      expired: 'bg-red-100 text-red-800 border-red-200',
    }
    return colors[status] || 'bg-blue-100 text-blue-800 border-blue-200'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!subscription) {
    return (
      <div className="text-center py-12">
        <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Subscription not found</h3>
        <Link href="/subscriptions" className="mt-4 inline-block text-blue-600 hover:text-blue-800">
          ← Back to Subscriptions
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/subscriptions"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{subscription.tenancyName}</h1>
            <p className="text-gray-600 capitalize">{subscription.plan.name} Plan</p>
          </div>
        </div>

        <span className={`px-4 py-2 text-sm font-semibold rounded-full border ${getStatusColor(subscription.status)}`}>
          {subscription.status}
        </span>
      </div>

      {/* Status Card */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-100 text-sm">Current Plan</p>
            <p className="text-3xl font-bold mt-1">{subscription.plan.name}</p>
            <p className="text-blue-100 text-sm mt-2">
              {formatCurrency(subscription.plan.price)}/{subscription.plan.billingCycle}
            </p>
          </div>
          <div className="text-right">
            <p className="text-blue-100 text-sm">Next Billing</p>
            <p className="text-xl font-bold mt-1">
              {new Date(subscription.nextBillingDate).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Trial Status */}
          {subscription.trial?.isActive && (
            <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-orange-600" />
                  Trial Period Active
                </h2>
                <span className="px-3 py-1 bg-orange-100 text-orange-800 text-sm font-semibold rounded-full">
                  {subscription.trial.daysRemaining} days left
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Start Date</p>
                  <p className="font-medium text-gray-900">
                    {new Date(subscription.trial.startDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">End Date</p>
                  <p className="font-medium text-gray-900">
                    {new Date(subscription.trial.endDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Plan Features */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Plan Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Array.isArray(subscription.plan.features) ? (
                subscription.plan.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-gray-500 text-sm">
                  No features available
                </div>
              )}
            </div>
          </div>

          {/* Subscription Info */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Subscription Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Start Date</p>
                <p className="font-medium text-gray-900">
                  {new Date(subscription.startDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Billing Cycle</p>
                <p className="font-medium text-gray-900 capitalize">
                  {subscription.plan.billingCycle}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Created</p>
                <p className="font-medium text-gray-900">
                  {new Date(subscription.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <p className="font-medium text-gray-900 capitalize">
                  {subscription.status}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Actions */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>
            <div className="space-y-3">
              {subscription.status === 'active' && (
                <button
                  onClick={() => setShowPauseModal(true)}
                  className="w-full px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Pause className="w-5 h-5" />
                  Pause Subscription
                </button>
              )}

              {subscription.status === 'paused' && (
                <button
                  onClick={() => setShowPauseModal(true)}
                  className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Play className="w-5 h-5" />
                  Resume Subscription
                </button>
              )}

              <button
                onClick={() => setShowUpgradeModal(true)}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <TrendingUp className="w-5 h-5" />
                Send Upgrade Request
              </button>

              <button
                onClick={() => setShowDowngradeModal(true)}
                className="w-full px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
              >
                <TrendingDown className="w-5 h-5" />
                Downgrade Plan
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showPauseModal && (
        <PauseResumeModal
          subscriptionId={subscriptionId}
          tenancyName={subscription.tenancyName}
          currentStatus={subscription.status}
          onClose={() => setShowPauseModal(false)}
          onSuccess={() => {
            setShowPauseModal(false)
            fetchSubscription()
          }}
        />
      )}

      {showUpgradeModal && (
        <UpgradeModal
          subscriptionId={subscriptionId}
          tenancyName={subscription.tenancyName}
          currentPlan={subscription.plan.name}
          onClose={() => setShowUpgradeModal(false)}
          onSuccess={() => {
            setShowUpgradeModal(false)
            fetchSubscription()
          }}
        />
      )}

      {showDowngradeModal && (
        <DowngradeModal
          subscriptionId={subscriptionId}
          tenancyName={subscription.tenancyName}
          currentPlan={subscription.plan.name}
          onClose={() => setShowDowngradeModal(false)}
          onSuccess={() => {
            setShowDowngradeModal(false)
            fetchSubscription()
          }}
        />
      )}

      {showPaymentLinkModal && (
        <PaymentLinkModal
          paymentLink={generatedPaymentLink}
          upgradeData={upgradeRequestData}
          tenancyName={subscription.tenancyName}
          onClose={() => {
            setShowPaymentLinkModal(false)
            setGeneratedPaymentLink('')
            setUpgradeRequestData(null)
          }}
        />
      )}
    </div>
  )
}

// Pause/Resume Modal
function PauseResumeModal({ subscriptionId, tenancyName, currentStatus, onClose, onSuccess }: any) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const isPaused = currentStatus === 'paused'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const endpoint = isPaused ? 'resume' : 'pause'
      await api.post(`/sales/subscriptions/${subscriptionId}/${endpoint}`)
      onSuccess()
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to ${isPaused ? 'resume' : 'pause'} subscription`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className={`bg-gradient-to-r ${isPaused ? 'from-green-600 to-emerald-600' : 'from-gray-600 to-gray-700'} p-6 rounded-t-2xl`}>
          <h2 className="text-2xl font-bold text-white">
            {isPaused ? 'Resume' : 'Pause'} Subscription
          </h2>
          <p className="text-white/80 text-sm mt-1">for {tenancyName}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className={`${isPaused ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'} border-2 rounded-xl p-4`}>
            <p className="text-sm text-gray-700">
              {isPaused 
                ? '✓ This will resume the subscription and billing will continue as normal.'
                : '⚠️ This will pause the subscription. No charges will be made until resumed.'}
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
              className={`flex-1 px-4 py-3 bg-gradient-to-r ${isPaused ? 'from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700' : 'from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800'} text-white rounded-xl font-semibold transition-all disabled:opacity-50`}
              disabled={loading}
            >
              {loading ? (isPaused ? 'Resuming...' : 'Pausing...') : (isPaused ? 'Resume' : 'Pause')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Upgrade Modal
function UpgradeModal({ subscriptionId, tenancyName, currentPlan, onClose, onSuccess }: any) {
  const [newPlan, setNewPlan] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [availablePlans, setAvailablePlans] = useState<any[]>([])
  const [upgradeAmount, setUpgradeAmount] = useState(0)

  // Fetch available plans on mount
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await api.get('/sales/subscriptions/plans')
        if (response.data?.success) {
          setAvailablePlans(response.data.data.plans || [])
        }
      } catch (error) {
        console.error('Failed to fetch plans:', error)
      }
    }
    fetchPlans()
  }, [])

  // Calculate upgrade amount when plan changes
  useEffect(() => {
    if (newPlan && availablePlans.length > 0) {
      const selectedPlan = availablePlans.find(p => p._id === newPlan)
      const currentPlanData = availablePlans.find(p => p.name === currentPlan.toLowerCase())
      
      if (selectedPlan && currentPlanData) {
        const newPrice = selectedPlan.price?.monthly || 0
        const currentPrice = currentPlanData.price?.monthly || 0
        setUpgradeAmount(Math.max(0, newPrice - currentPrice))
      }
    }
  }, [newPlan, availablePlans, currentPlan])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Create upgrade request instead of processing payment directly
      const response = await api.post(`/sales/upgrades/request`, {
        tenancyId: subscriptionId, // Using subscription ID as tenancy ID
        toPlanId: newPlan,
        customPrice: upgradeAmount,
        paymentTerms: {
          method: 'online',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
          gracePeriod: 7
        },
        featureAccess: {
          immediate: [],
          paymentRequired: [] // All features locked until payment
        },
        customMessage: `Plan upgrade from ${currentPlan} - Payment link sent to customer`,
        communication: {
          sendEmail: true,
          sendSMS: false
        }
      })
      
      // Show success message with actual payment link
      if (response.data?.success) {
        const upgradeRequestId = response.data.data._id
        const paymentLink = `${window.location.origin}/customer-payment/${upgradeRequestId}`
        
        // Show modal with payment link instead of alert
        setShowPaymentLinkModal(true)
        setGeneratedPaymentLink(paymentLink)
        setUpgradeRequestData(response.data.data)
      }
      
      onSuccess()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create upgrade request')
    } finally {
      setLoading(false)
    }
  }

  const paymentMethods = [
    { value: 'manual', label: 'Manual Payment (Cash/Bank Transfer)' },
    { value: 'card', label: 'Credit/Debit Card' },
    { value: 'upi', label: 'UPI Payment' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'wallet', label: 'Digital Wallet' }
  ]

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-t-2xl">
          <h2 className="text-2xl font-bold text-white">Create Upgrade Request</h2>
          <p className="text-blue-100 text-sm mt-1">for {tenancyName} - Customer will pay</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">Current Plan:</span> {currentPlan}
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Select New Plan *
            </label>
            <div className="space-y-2">
              {availablePlans.map((plan) => (
                <label
                  key={plan._id}
                  className={`flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    newPlan === plan._id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center">
                    <input
                      type="radio"
                      name="plan"
                      value={plan._id}
                      checked={newPlan === plan._id}
                      onChange={(e) => setNewPlan(e.target.value)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="ml-3 font-semibold text-gray-900">{plan.displayName}</span>
                  </div>
                  <span className="text-gray-700">
                    ₹{plan.price?.monthly || 0}/month
                  </span>
                </label>
              ))}
              {availablePlans.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  Loading plans...
                </div>
              )}
            </div>
          </div>

          {/* Upgrade Amount Display */}
          {upgradeAmount > 0 && (
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700">Upgrade Amount:</span>
                <span className="text-xl font-bold text-green-600">₹{upgradeAmount}</span>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Customer will pay this amount for the plan upgrade
              </p>
            </div>
          )}

          {/* Customer Payment Instructions */}
          {upgradeAmount > 0 && (
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
              <h4 className="font-semibold text-blue-800 mb-2">📧 Customer Payment Process</h4>
              <div className="text-sm text-blue-700 space-y-1">
                <p>• Payment link will be sent to customer via email/SMS</p>
                <p>• Customer can pay online using multiple payment methods</p>
                <p>• Plan will be upgraded automatically after payment confirmation</p>
                <p>• You will receive notification when payment is completed</p>
              </div>
            </div>
          )}

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
              disabled={loading || !newPlan}
            >
              {loading ? 'Sending Payment Link...' : `Send Payment Link (₹${upgradeAmount})`}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Downgrade Modal
function DowngradeModal({ subscriptionId, tenancyName, currentPlan, onClose, onSuccess }: any) {
  const [newPlan, setNewPlan] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [availablePlans, setAvailablePlans] = useState<any[]>([])

  // Fetch available plans on mount
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await api.get('/sales/subscriptions/plans')
        if (response.data?.success) {
          setAvailablePlans(response.data.data.plans || [])
        }
      } catch (error) {
        console.error('Failed to fetch plans:', error)
      }
    }
    fetchPlans()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await api.post(`/sales/subscriptions/${subscriptionId}/downgrade`, {
        planId: newPlan  // Send planId instead of newPlan
      })
      onSuccess()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to downgrade subscription')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="bg-gradient-to-r from-orange-600 to-red-600 p-6 rounded-t-2xl">
          <h2 className="text-2xl font-bold text-white">Downgrade Plan</h2>
          <p className="text-orange-100 text-sm mt-1">for {tenancyName}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">Current Plan:</span> {currentPlan}
            </p>
            <p className="text-sm text-orange-700 mt-2">
              ⚠️ Downgrading will take effect at the end of the current billing cycle.
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Select New Plan *
            </label>
            <div className="space-y-2">
              {availablePlans.map((plan) => (
                <label
                  key={plan._id}
                  className={`flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    newPlan === plan._id
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center">
                    <input
                      type="radio"
                      name="plan"
                      value={plan._id}
                      checked={newPlan === plan._id}
                      onChange={(e) => setNewPlan(e.target.value)}
                      className="w-4 h-4 text-orange-600"
                    />
                    <span className="ml-3 font-semibold text-gray-900">{plan.displayName}</span>
                  </div>
                  <span className="text-gray-700">
                    ₹{plan.price?.monthly || 0}/month
                  </span>
                </label>
              ))}
              {availablePlans.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  Loading plans...
                </div>
              )}
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
              className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl font-semibold hover:from-orange-700 hover:to-red-700 transition-all disabled:opacity-50"
              disabled={loading || !newPlan}
            >
              {loading ? 'Downgrading...' : 'Downgrade Plan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Payment Link Modal
function PaymentLinkModal({ paymentLink, upgradeData, tenancyName, onClose }: any) {
  const [copied, setCopied] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [smsSent, setSmsSent] = useState(false)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(paymentLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const sendEmail = async () => {
    try {
      setEmailSent(true)
      const response = await api.post(`/sales/upgrades/${upgradeData._id}/send-email`)
      
      if (response.data?.success) {
        console.log('Email sent successfully:', response.data.data.messageId)
        // Keep the success state for 3 seconds
        setTimeout(() => setEmailSent(false), 3000)
      } else {
        throw new Error('Email sending failed')
      }
    } catch (err) {
      console.error('Failed to send email:', err)
      setEmailSent(false)
      alert('Failed to send email. Please try again.')
    }
  }

  const sendSMS = async () => {
    try {
      setSmsSent(true)
      // TODO: Implement SMS sending API
      // await api.post(`/sales/upgrades/${upgradeData._id}/send-sms`)
      setTimeout(() => setSmsSent(false), 3000)
    } catch (err) {
      console.error('Failed to send SMS:', err)
      setSmsSent(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 rounded-t-2xl">
          <h2 className="text-2xl font-bold text-white">✅ Payment Link Generated!</h2>
          <p className="text-green-100 text-sm mt-1">for {tenancyName}</p>
        </div>

        <div className="p-6 space-y-6">
          {/* Upgrade Summary */}
          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
            <h3 className="font-semibold text-green-900 mb-2">Upgrade Request Created</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Amount:</p>
                <p className="font-bold text-green-700">₹{upgradeData?.pricing?.customPrice || 0}</p>
              </div>
              <div>
                <p className="text-gray-600">Due Date:</p>
                <p className="font-bold text-green-700">
                  {upgradeData?.paymentTerms?.dueDate ? 
                    new Date(upgradeData.paymentTerms.dueDate).toLocaleDateString() : 
                    '7 days from now'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Payment Link */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              🔗 Customer Payment Link
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={paymentLink}
                readOnly
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg bg-gray-50 text-sm font-mono"
              />
              <button
                onClick={copyToClipboard}
                className={`px-4 py-3 rounded-lg font-semibold transition-all ${
                  copied 
                    ? 'bg-green-600 text-white' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {copied ? '✓ Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Send Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={sendEmail}
              disabled={emailSent}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all ${
                emailSent
                  ? 'bg-green-600 text-white'
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
            >
              {emailSent ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Email Sent!
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  Send via Email
                </>
              )}
            </button>

            <button
              onClick={sendSMS}
              disabled={smsSent}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all ${
                smsSent
                  ? 'bg-green-600 text-white'
                  : 'bg-orange-600 text-white hover:bg-orange-700'
              }`}
            >
              {smsSent ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  SMS Sent!
                </>
              ) : (
                <>
                  <Smartphone className="w-5 h-5" />
                  Send via SMS
                </>
              )}
            </button>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
            <h4 className="font-semibold text-blue-900 mb-2">📋 Next Steps</h4>
            <div className="text-sm text-blue-700 space-y-1">
              <p>1. Copy the payment link and share it with the customer</p>
              <p>2. Or use the Email/SMS buttons to send automatically</p>
              <p>3. Customer will pay securely using the link</p>
              <p>4. You'll be notified when payment is completed</p>
              <p>5. Plan will be upgraded automatically after payment</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-600 text-white rounded-xl font-semibold hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => window.open(paymentLink, '_blank')}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              Preview Payment Page
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}