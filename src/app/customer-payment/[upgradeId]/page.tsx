'use client'

import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import api from '@/lib/api'
import { 
  CreditCard, 
  CheckCircle, 
  AlertTriangle,
  Shield,
  Calendar,
  ArrowRight,
  Zap,
  ExternalLink
} from 'lucide-react'

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_51Sp1LD39sP2yt4IkYMaBjKENoYco6quTah5DwIEtnfBh4LEsOKkFFvM6dX13poyMm7gyz3YCcSJcF0R4n4J9nvsM00gS52EooV')

interface UpgradeRequest {
  _id: string
  tenancy: {
    name: string
    contactPerson?: {
      name: string
      email: string
    }
  }
  fromPlan: {
    name: string
    displayName: string
    price: { monthly: number }
  }
  toPlan: {
    name: string
    displayName: string
    price: { monthly: number }
    features: any
  }
  pricing: {
    originalPrice: number
    customPrice: number
    discount: number
    discountReason?: string
  }
  paymentTerms: {
    method: string
    dueDate: string
    gracePeriod: number
  }
  payment: {
    totalPaid: number
    remainingAmount: number
  }
  status: string
  requestedAt: string
}

// Stripe Card Form Component
function StripeCardForm({ 
  upgradeRequest, 
  onPaymentSuccess, 
  onPaymentError 
}: { 
  upgradeRequest: UpgradeRequest
  onPaymentSuccess: () => void
  onPaymentError: (error: string) => void
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [paymentLoading, setPaymentLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!stripe || !elements) {
      onPaymentError('Stripe not loaded')
      return
    }

    setPaymentLoading(true)

    try {
      // Create payment intent
      const response = await api.post(`/sales/upgrades/public/${upgradeRequest._id}/create-payment-intent`)
      
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to create payment intent')
      }

      const { clientSecret } = response.data.data

      // Confirm payment
      const cardElement = elements.getElement(CardElement)
      if (!cardElement) {
        throw new Error('Card element not found')
      }

      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: upgradeRequest.tenancy.contactPerson?.name || upgradeRequest.tenancy.name,
            email: upgradeRequest.tenancy.contactPerson?.email,
          },
        },
      })

      if (error) {
        throw new Error(error.message)
      }

      if (paymentIntent?.status === 'succeeded') {
        onPaymentSuccess()
      } else {
        throw new Error('Payment was not successful')
      }
    } catch (error: any) {
      console.error('Payment error:', error)
      onPaymentError(error.message || 'Payment failed')
    } finally {
      setPaymentLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Card Details
        </label>
        <div className="border border-gray-300 rounded-lg p-4 bg-white">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#9e2146',
                },
              },
            }}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={!stripe || paymentLoading}
        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {paymentLoading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            Processing Payment...
          </>
        ) : (
          <>
            Pay {formatCurrency(upgradeRequest.payment.remainingAmount)}
            <ArrowRight className="w-5 h-5" />
          </>
        )}
      </button>
    </form>
  )
}

export default function CustomerPaymentPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const upgradeId = params.upgradeId as string
  const sessionId = searchParams.get('session_id')

  const [upgradeRequest, setUpgradeRequest] = useState<UpgradeRequest | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card')
  const [error, setError] = useState('')
  const [paymentSuccess, setPaymentSuccess] = useState(false)

  useEffect(() => {
    fetchUpgradeRequest()
    
    // Check if returning from successful Stripe Checkout
    if (sessionId) {
      setPaymentSuccess(true)
    }
  }, [upgradeId, sessionId])

  const fetchUpgradeRequest = async () => {
    try {
      // Use the public API endpoint that doesn't require authentication
      const response = await api.get(`/sales/upgrades/public/${upgradeId}`)
      
      if (response.data?.success) {
        setUpgradeRequest(response.data.data)
      } else {
        setError('Upgrade request not found or no longer available')
      }
    } catch (error: any) {
      console.error('Error fetching upgrade request:', error)
      setError(error.response?.data?.message || 'Failed to load upgrade request')
    } finally {
      setLoading(false)
    }
  }

  const handleStripeCheckout = async () => {
    if (!upgradeRequest) return

    try {
      setError('')
      const response = await api.post(`/sales/upgrades/public/${upgradeRequest._id}/create-checkout-session`)
      
      if (response.data?.success) {
        // Redirect to Stripe Checkout
        window.location.href = response.data.data.url
      } else {
        setError(response.data?.message || 'Failed to create checkout session')
      }
    } catch (error: any) {
      console.error('Checkout error:', error)
      setError(error.response?.data?.message || 'Failed to create checkout session')
    }
  }

  const handlePaymentSuccess = () => {
    setPaymentSuccess(true)
  }

  const handlePaymentError = (errorMessage: string) => {
    setError(errorMessage)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  const paymentMethods = [
    { 
      id: 'card', 
      name: 'Credit/Debit Card', 
      icon: CreditCard,
      description: 'Secure payment with Stripe'
    },
    { 
      id: 'checkout', 
      name: 'Stripe Checkout', 
      icon: ExternalLink,
      description: 'UPI, Cards, Net Banking & more'
    }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading upgrade details...</p>
        </div>
      </div>
    )
  }

  if (error || !upgradeRequest) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <AlertTriangle className="mx-auto h-16 w-16 text-red-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Unable to Load</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <p className="text-sm text-gray-500">
            Please contact your sales representative if you believe this is an error.
          </p>
        </div>
      </div>
    )
  }

  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
          <p className="text-gray-600 mb-6">
            Your plan has been upgraded successfully. You'll receive a confirmation email shortly.
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-green-700">
              <strong>New Plan:</strong> {upgradeRequest.toPlan.displayName}
            </p>
            <p className="text-sm text-green-700">
              <strong>Amount Paid:</strong> {formatCurrency(upgradeRequest.pricing.customPrice)}
            </p>
          </div>
          <p className="text-sm text-gray-500">
            Your upgraded features are now active and ready to use.
          </p>
        </div>
      </div>
    )
  }

  const daysUntilDue = Math.ceil(
    (new Date(upgradeRequest.paymentTerms.dueDate).getTime() - new Date().getTime()) / 
    (1000 * 60 * 60 * 24)
  )

  return (
    <Elements stripe={stripePromise}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Plan Upgrade</h1>
                <p className="text-gray-600">for {upgradeRequest.tenancy.name}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Payment Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Complete Your Upgrade</h2>

                {/* Plan Comparison */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200">
                    <p className="text-sm text-gray-600 mb-1">Current Plan</p>
                    <p className="font-bold text-gray-900">{upgradeRequest.fromPlan.displayName}</p>
                    <p className="text-sm text-gray-600">{formatCurrency(upgradeRequest.fromPlan.price.monthly)}/month</p>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200 relative">
                    <div className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                      Upgrade
                    </div>
                    <p className="text-sm text-blue-600 mb-1">New Plan</p>
                    <p className="font-bold text-blue-900">{upgradeRequest.toPlan.displayName}</p>
                    <p className="text-sm text-blue-600">{formatCurrency(upgradeRequest.toPlan.price.monthly)}/month</p>
                  </div>
                </div>

                {/* Payment Methods */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose Payment Method</h3>
                  <div className="space-y-3">
                    {paymentMethods.map((method) => {
                      const Icon = method.icon
                      return (
                        <label
                          key={method.id}
                          className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                            selectedPaymentMethod === method.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name="paymentMethod"
                            value={method.id}
                            checked={selectedPaymentMethod === method.id}
                            onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                            className="w-4 h-4 text-blue-600 mr-4"
                          />
                          <Icon className="w-6 h-6 text-gray-600 mr-3" />
                          <div>
                            <p className="font-semibold text-gray-900">{method.name}</p>
                            <p className="text-sm text-gray-600">{method.description}</p>
                          </div>
                        </label>
                      )
                    })}
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg mb-6">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                {/* Payment Form */}
                {selectedPaymentMethod === 'card' ? (
                  <StripeCardForm
                    upgradeRequest={upgradeRequest}
                    onPaymentSuccess={handlePaymentSuccess}
                    onPaymentError={handlePaymentError}
                  />
                ) : (
                  <button
                    onClick={handleStripeCheckout}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center justify-center gap-2"
                  >
                    Continue to Stripe Checkout
                    <ExternalLink className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Payment Summary */}
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Payment Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Original Price:</span>
                    <span className="font-semibold">{formatCurrency(upgradeRequest.pricing.originalPrice)}</span>
                  </div>
                  {upgradeRequest.pricing.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount:</span>
                      <span className="font-semibold">-{formatCurrency(upgradeRequest.pricing.discount)}</span>
                    </div>
                  )}
                  <div className="border-t pt-3">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total Amount:</span>
                      <span className="text-blue-600">{formatCurrency(upgradeRequest.pricing.customPrice)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Due Date */}
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Payment Due</h3>
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-semibold text-gray-900">
                      {new Date(upgradeRequest.paymentTerms.dueDate).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-600">
                      {daysUntilDue > 0 ? `${daysUntilDue} days remaining` : 'Payment overdue'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Security */}
              <div className="bg-green-50 rounded-2xl border-2 border-green-200 p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Shield className="w-6 h-6 text-green-600" />
                  <h3 className="font-bold text-green-900">Secure Payment</h3>
                </div>
                <p className="text-sm text-green-700">
                  Your payment is protected by Stripe's bank-level security and encryption.
                </p>
              </div>

              {/* Support */}
              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="font-bold text-gray-900 mb-2">Need Help?</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Contact your sales representative for assistance.
                </p>
                {upgradeRequest.tenancy.contactPerson?.email && (
                  <p className="text-sm text-blue-600">
                    📧 {upgradeRequest.tenancy.contactPerson.email}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Elements>
  )
}