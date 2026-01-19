'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { toast } from 'react-hot-toast'
import { 
  ArrowLeft, 
  CreditCard, 
  DollarSign,
  Calendar,
  FileText,
  CheckCircle
} from 'lucide-react'

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
  payment: {
    totalPaid: number
    remainingAmount: number
  }
  status: string
}

export default function RecordPaymentPage() {
  const params = useParams()
  const router = useRouter()
  const upgradeId = params.id as string

  const [upgradeRequest, setUpgradeRequest] = useState<UpgradeRequest | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  
  // Form data
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState('online')
  const [transactionId, setTransactionId] = useState('')
  const [notes, setNotes] = useState('')
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0])

  useEffect(() => {
    if (upgradeId) {
      fetchUpgradeRequest()
    }
  }, [upgradeId])

  const fetchUpgradeRequest = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/sales/upgrades/${upgradeId}`)
      
      if (response.data?.success) {
        const request = response.data.data
        setUpgradeRequest(request)
        // Set default amount to remaining amount
        setAmount(request.payment.remainingAmount.toString())
      } else {
        toast.error('Upgrade request not found')
        router.push('/upgrades')
      }
    } catch (error: any) {
      console.error('Error fetching upgrade request:', error)
      toast.error('Failed to load upgrade request')
      router.push('/upgrades')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid payment amount')
      return
    }

    if (!upgradeRequest) return

    if (parseFloat(amount) > upgradeRequest.payment.remainingAmount) {
      toast.error('Payment amount cannot exceed remaining balance')
      return
    }

    try {
      setSubmitting(true)
      
      const paymentData = {
        amount: parseFloat(amount),
        method,
        transactionId: transactionId.trim(),
        notes: notes.trim(),
        date: paymentDate
      }

      const response = await api.post(`/sales/upgrades/${upgradeId}/payment`, paymentData)
      
      if (response.data?.success) {
        toast.success('Payment recorded successfully!')
        router.push(`/upgrades/${upgradeId}`)
      }
    } catch (error: any) {
      console.error('Error recording payment:', error)
      toast.error(error.response?.data?.message || 'Failed to record payment')
    } finally {
      setSubmitting(false)
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
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!upgradeRequest) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Upgrade Request Not Found</h2>
        <Button onClick={() => router.push('/upgrades')} className="mt-4">
          Back to Upgrades
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          onClick={() => router.push(`/upgrades/${upgradeId}`)}
          className="flex items-center"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Details
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Record Payment</h1>
          <p className="text-gray-600">for {upgradeRequest.tenancy.name}</p>
        </div>
      </div>

      {/* Payment Summary */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <DollarSign className="w-5 h-5 mr-2 text-green-600" />
          Payment Summary
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-blue-600 font-medium">Total Amount</p>
            <p className="text-xl font-bold text-blue-900">
              {formatCurrency(upgradeRequest.pricing.customPrice)}
            </p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-sm text-green-600 font-medium">Already Paid</p>
            <p className="text-xl font-bold text-green-900">
              {formatCurrency(upgradeRequest.payment.totalPaid)}
            </p>
          </div>
          <div className="bg-orange-50 rounded-lg p-4">
            <p className="text-sm text-orange-600 font-medium">Remaining</p>
            <p className="text-xl font-bold text-orange-900">
              {formatCurrency(upgradeRequest.payment.remainingAmount)}
            </p>
          </div>
        </div>
      </div>

      {/* Payment Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <CreditCard className="w-5 h-5 mr-2 text-purple-600" />
          Payment Details
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Amount */}
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
              Payment Amount *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">₹</span>
              </div>
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="0.01"
                max={upgradeRequest.payment.remainingAmount}
                step="0.01"
                required
                className="block w-full pl-8 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Maximum: {formatCurrency(upgradeRequest.payment.remainingAmount)}
            </p>
          </div>

          {/* Payment Method */}
          <div>
            <label htmlFor="method" className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method *
            </label>
            <select
              id="method"
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              required
              className="block w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="online">Online Payment</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="cash">Cash</option>
              <option value="cheque">Cheque</option>
              <option value="upi">UPI</option>
              <option value="card">Card Payment</option>
            </select>
          </div>

          {/* Transaction ID */}
          <div>
            <label htmlFor="transactionId" className="block text-sm font-medium text-gray-700 mb-2">
              Transaction ID / Reference Number
            </label>
            <input
              type="text"
              id="transactionId"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              className="block w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter transaction ID or reference number"
            />
          </div>

          {/* Payment Date */}
          <div>
            <label htmlFor="paymentDate" className="block text-sm font-medium text-gray-700 mb-2">
              Payment Date *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="w-4 h-4 text-gray-400" />
              </div>
              <input
                type="date"
                id="paymentDate"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                required
                className="block w-full pl-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <div className="relative">
              <div className="absolute top-3 left-3 pointer-events-none">
                <FileText className="w-4 h-4 text-gray-400" />
              </div>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="block w-full pl-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Add any additional notes about this payment..."
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/upgrades/${upgradeId}`)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="flex items-center"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Recording...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Record Payment
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}