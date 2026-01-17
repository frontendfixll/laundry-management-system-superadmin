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
  Calendar
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
                Upgrade Plan
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
  const [paymentMethod, setPaymentMethod] = useState('manual')
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
      const response = await api.post(`/sales/subscriptions/${subscriptionId}/upgrade`, {
        planId: newPlan,
        paymentMethod
      })
      
      // Show success message with payment info
      if (response.data?.data?.payment) {
        alert(`Plan upgraded successfully! Payment of ₹${upgradeAmount} has been processed via ${paymentMethod}.`)
      }
      
      onSuccess()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to upgrade subscription')
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
          <h2 className="text-2xl font-bold text-white">Upgrade Plan</h2>
          <p className="text-blue-100 text-sm mt-1">for {tenancyName}</p>
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

          {/* Payment Amount Display */}
          {upgradeAmount > 0 && (
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700">Upgrade Amount:</span>
                <span className="text-xl font-bold text-green-600">₹{upgradeAmount}</span>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                This amount will be charged for the plan upgrade
              </p>
            </div>
          )}

          {/* Payment Method Selection */}
          {upgradeAmount > 0 && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Payment Method *
              </label>
              <div className="space-y-2">
                {paymentMethods.map((method) => (
                  <label
                    key={method.value}
                    className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                      paymentMethod === method.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.value}
                      checked={paymentMethod === method.value}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="ml-3 text-sm font-medium text-gray-900">
                      {method.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Payment Instructions */}
          {upgradeAmount > 0 && paymentMethod === 'manual' && (
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
              <h4 className="font-semibold text-yellow-800 mb-2">Manual Payment Instructions</h4>
              <div className="text-sm text-yellow-700 space-y-1">
                <p>• Payment will be marked as completed manually</p>
                <p>• Customer can pay via cash, bank transfer, or cheque</p>
                <p>• Payment record will be created for tracking</p>
              </div>
            </div>
          )}

          {upgradeAmount > 0 && paymentMethod !== 'manual' && (
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
              <h4 className="font-semibold text-blue-800 mb-2">Online Payment</h4>
              <div className="text-sm text-blue-700 space-y-1">
                <p>• Payment will be processed via {paymentMethods.find(m => m.value === paymentMethod)?.label}</p>
                <p>• Transaction will be recorded automatically</p>
                <p>• Plan upgrade will be activated immediately</p>
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
              {loading ? 'Processing Payment...' : `Pay ₹${upgradeAmount} & Upgrade`}
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
