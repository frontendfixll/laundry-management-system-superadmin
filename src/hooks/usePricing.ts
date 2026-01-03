import { useState, useEffect } from 'react'
import { superAdminApi } from '@/lib/superAdminApi'

interface PricingConfiguration {
  _id: string
  name: string
  version: string
  isActive: boolean
  isDefault: boolean
  approvalStatus: 'draft' | 'pending_approval' | 'approved' | 'rejected'
  serviceItems: any[]
  expressCharges: any[]
  holidayPricing: any[]
  discountPolicies: any[]
  settings: {
    currency: string
    taxRate: number
    deliveryCharges: {
      freeDeliveryThreshold: number
      standardCharge: number
      expressCharge: number
    }
    minimumOrderValue: number
  }
  createdBy: {
    name: string
    email: string
  }
  approvedBy?: {
    name: string
    email: string
  }
  createdAt: string
  updatedAt: string
}

interface PricingFilters {
  search?: string
  status?: string
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: string
}

export function usePricing(filters: PricingFilters = {}) {
  const [pricingConfigs, setPricingConfigs] = useState<PricingConfiguration[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
    limit: 10
  })

  const fetchPricingConfigurations = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await superAdminApi.getPricingConfigurations(filters)
      setPricingConfigs(response.data.pricingConfigs)
      setPagination(response.data.pagination)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch pricing configurations')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPricingConfigurations()
  }, [JSON.stringify(filters)])

  const createPricingConfiguration = async (pricingData: any) => {
    try {
      const response = await superAdminApi.createPricingConfiguration(pricingData)
      await fetchPricingConfigurations()
      return response
    } catch (err: any) {
      throw new Error(err.message || 'Failed to create pricing configuration')
    }
  }

  const updatePricingConfiguration = async (pricingId: string, pricingData: any) => {
    try {
      const response = await superAdminApi.updatePricingConfiguration(pricingId, pricingData)
      await fetchPricingConfigurations()
      return response
    } catch (err: any) {
      throw new Error(err.message || 'Failed to update pricing configuration')
    }
  }

  const approvePricingConfiguration = async (pricingId: string, makeActive: boolean = false) => {
    try {
      const response = await superAdminApi.approvePricingConfiguration(pricingId, makeActive)
      await fetchPricingConfigurations()
      return response
    } catch (err: any) {
      throw new Error(err.message || 'Failed to approve pricing configuration')
    }
  }

  const activatePricingConfiguration = async (pricingId: string) => {
    try {
      const response = await superAdminApi.activatePricingConfiguration(pricingId)
      await fetchPricingConfigurations()
      return response
    } catch (err: any) {
      throw new Error(err.message || 'Failed to activate pricing configuration')
    }
  }

  const clonePricingConfiguration = async (pricingId: string, newVersion: string, newName?: string) => {
    try {
      const response = await superAdminApi.clonePricingConfiguration(pricingId, newVersion, newName)
      await fetchPricingConfigurations()
      return response
    } catch (err: any) {
      throw new Error(err.message || 'Failed to clone pricing configuration')
    }
  }

  return {
    pricingConfigs,
    loading,
    error,
    pagination,
    fetchPricingConfigurations,
    createPricingConfiguration,
    updatePricingConfiguration,
    approvePricingConfiguration,
    activatePricingConfiguration,
    clonePricingConfiguration
  }
}

export function useActivePricing() {
  const [activePricing, setActivePricing] = useState<PricingConfiguration | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchActivePricing = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await superAdminApi.getActivePricing()
      setActivePricing(response.data.pricing)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch active pricing')
      setActivePricing(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchActivePricing()
  }, [])

  return {
    activePricing,
    loading,
    error,
    fetchActivePricing
  }
}

export function usePriceCalculation() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const calculatePrice = async (items: any[], options: any = {}) => {
    try {
      setLoading(true)
      setError(null)
      const response = await superAdminApi.calculatePrice(items, options)
      return response.data
    } catch (err: any) {
      setError(err.message || 'Failed to calculate price')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const validateDiscountCode = async (code: string, orderValue: number = 0, customerInfo: any = {}) => {
    try {
      setLoading(true)
      setError(null)
      const response = await superAdminApi.validateDiscountCode(code, orderValue, customerInfo)
      return response.data
    } catch (err: any) {
      setError(err.message || 'Failed to validate discount code')
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    calculatePrice,
    validateDiscountCode
  }
}

export function useServiceItems(category?: string) {
  const [serviceItems, setServiceItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchServiceItems = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await superAdminApi.getServiceItems(category)
      setServiceItems(response.data.serviceItems)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch service items')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchServiceItems()
  }, [category])

  return {
    serviceItems,
    loading,
    error,
    fetchServiceItems
  }
}

export function useDiscountPolicies(active: boolean = true) {
  const [discountPolicies, setDiscountPolicies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDiscountPolicies = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await superAdminApi.getDiscountPolicies(active)
      setDiscountPolicies(response.data.discountPolicies)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch discount policies')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDiscountPolicies()
  }, [active])

  return {
    discountPolicies,
    loading,
    error,
    fetchDiscountPolicies
  }
}
