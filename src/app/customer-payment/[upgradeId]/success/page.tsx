'use client'

import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { CheckCircle, ArrowRight, Download } from 'lucide-react'
import api from '@/lib/api'

interface UpgradeRequest {
  _id: string
  tenancy: {
    name: string
    contactPerson?: {
      name: string
      email: string
    }
  }
  toPlan: {
    displayName: string
  }
  pricing: {
    customPrice: number
  }
  status: string
}

export default function PaymentSuccessPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const upgradeId = params.upgradeId as string
  const sessionId = searchParams.get('session_id')

  const [upgradeRequest, setUpgradeRequest] = useState<UpgradeRequest | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (sessionId) {
      fetchUpgradeRequest()
    } else {
      setError('Invalid payment session')
      setLoading(false)
    }
  }, [upgradeId, sessionId])

  const fetchUpgradeRequest = async () => {
    try {
      const response = await api.get(`/sales/upgrades/public/${upgradeId}`)
      
      if (response.data?.success) {
        setUpgradeRequest(response.data.data)
      } else {
        setError('Upgrade request not found')
      }
    } catch (error: any) {
      console.error('Error fetching upgrade request:', error)
      setError('Failed to load upgrade details')
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Confirming your payment...</p>
        </div>
      </div>
    )
  }

  if (error || !upgradeRequest) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-red-500 mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Verification Failed</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <p className="text-sm text-gray-500">
            Please contact support if you believe this is an error.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <CheckCircle className="mx-auto h-20 w-20 text-green-500 mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
          <p className="text-gray-600">
            Your plan upgrade has been processed successfully.
          </p>
        </div>

        {/* Payment Details */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
          <h3 className="font-semibold text-green-900 mb-4">Upgrade Details</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-green-700">Business:</span>
              <span className="font-semibold text-green-900">{upgradeRequest.tenancy.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-700">New Plan:</span>
              <span className="font-semibold text-green-900">{upgradeRequest.toPlan.displayName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-700">Amount Paid:</span>
              <span className="font-semibold text-green-900">{formatCurrency(upgradeRequest.pricing.customPrice)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-700">Payment Method:</span>
              <span className="font-semibold text-green-900">Stripe</span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-700">Session ID:</span>
              <span className="font-mono text-xs text-green-900">{sessionId}</span>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h3 className="font-semibold text-blue-900 mb-3">What's Next?</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">✓</span>
              <span>Your upgraded features are now active</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">✓</span>
              <span>A confirmation email has been sent to your registered email</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">✓</span>
              <span>Your invoice will be available in your dashboard</span>
            </li>
          </ul>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={() => window.print()}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            Print Receipt
          </button>
          
          <button
            onClick={() => window.close()}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            Continue to Dashboard
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Support */}
        <div className="mt-6 pt-6 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-600 mb-2">Need help or have questions?</p>
          {upgradeRequest.tenancy.contactPerson?.email && (
            <p className="text-sm text-blue-600">
              Contact: {upgradeRequest.tenancy.contactPerson.email}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}