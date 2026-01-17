'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'
import { Search, CreditCard, Clock, CheckCircle, XCircle } from 'lucide-react'
import Link from 'next/link'

interface Subscription {
  _id: string
  tenancyName: string
  plan: {
    name: string
    price: number
    billingCycle: string
  }
  status: string
  trial: {
    isActive: boolean
    daysRemaining: number
  }
  nextBillingDate: string
  createdAt: string
}

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchSubscriptions()
  }, [])

  const fetchSubscriptions = async () => {
    try {
      const response = await api.get('/sales/subscriptions', {
        params: { search }
      })
      
      console.log('Subscriptions API Response:', response.data)
      
      // Backend returns data in response.data.data
      const subscriptionsData = response.data?.data?.subscriptions
      
      if (subscriptionsData && subscriptionsData.length > 0) {
        // Map tenancy data to subscription format
        const mappedSubscriptions = subscriptionsData.map((tenancy: any) => ({
          _id: tenancy._id,
          tenancyName: tenancy.name || tenancy.businessName || 'Unknown Business',
          plan: {
            name: tenancy.subscription?.planId?.displayName || tenancy.subscription?.planId?.name || 'No Plan',
            price: tenancy.subscription?.planId?.price || 0,
            billingCycle: tenancy.subscription?.billingCycle || 'monthly'
          },
          status: tenancy.subscription?.status || 'inactive',
          trial: {
            isActive: tenancy.subscription?.trial?.isActive || false,
            daysRemaining: tenancy.subscription?.trial?.daysRemaining || 0
          },
          nextBillingDate: tenancy.subscription?.nextBillingDate || new Date().toISOString(),
          createdAt: tenancy.createdAt
        }))
        
        console.log('Mapped Subscriptions:', mappedSubscriptions)
        setSubscriptions(mappedSubscriptions)
      } else {
        console.log('No subscriptions found in response')
        setSubscriptions([])
      }
    } catch (error: any) {
      console.error('Error fetching subscriptions:', error)
      console.error('Error details:', error.response?.data)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'trial':
        return <Clock className="w-5 h-5 text-orange-500" />
      case 'paused':
        return <XCircle className="w-5 h-5 text-gray-500" />
      default:
        return <CreditCard className="w-5 h-5 text-blue-500" />
    }
  }

  const getStatusColor = (status: string) => {
    const colors: any = {
      active: 'bg-green-100 text-green-800',
      trial: 'bg-orange-100 text-orange-800',
      paused: 'bg-gray-100 text-gray-800',
      expired: 'bg-red-100 text-red-800',
    }
    return colors[status] || 'bg-blue-100 text-blue-800'
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Subscriptions</h1>
        <p className="text-gray-600 mt-1">Manage customer subscriptions</p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by tenancy name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && fetchSubscriptions()}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={fetchSubscriptions}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Search
          </button>
        </div>
      </div>

      {/* Subscriptions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subscriptions.map((sub) => (
          <div key={sub._id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                {getStatusIcon(sub.status)}
                <h3 className="ml-2 text-lg font-semibold text-gray-900">
                  {sub.tenancyName}
                </h3>
              </div>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(sub.status)}`}>
                {sub.status}
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Plan</p>
                <p className="text-base font-medium text-gray-900">
                  {sub.plan.name} - {formatCurrency(sub.plan.price)}/{sub.plan.billingCycle}
                </p>
              </div>

              {sub.trial?.isActive && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                  <div className="flex items-center text-orange-800">
                    <Clock className="w-4 h-4 mr-2" />
                    <span className="text-sm font-medium">
                      Trial: {sub.trial.daysRemaining} days left
                    </span>
                  </div>
                </div>
              )}

              <div>
                <p className="text-sm text-gray-600">Next Billing</p>
                <p className="text-sm text-gray-900">
                  {new Date(sub.nextBillingDate).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t">
              <Link 
                href={`/subscriptions/${sub._id}`}
                className="block w-full px-4 py-2 text-sm text-center text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                Manage Subscription
              </Link>
            </div>
          </div>
        ))}
      </div>

      {subscriptions.length === 0 && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No subscriptions found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Subscriptions will appear here once leads are converted.
          </p>
        </div>
      )}
    </div>
  )
}


