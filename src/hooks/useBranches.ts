import { useState, useCallback } from 'react'
import { superAdminApi } from '@/lib/superAdminApi'

interface Branch {
  _id: string
  name: string
  code: string
  address: {
    addressLine1: string
    addressLine2?: string
    city: string
    state: string
    pincode: string
    landmark?: string
  }
  contact: {
    phone: string
    email?: string
    whatsapp?: string
  }
  manager?: {
    _id: string
    name: string
    email: string
  }
  staff: Array<{
    userId: {
      _id: string
      name: string
      email: string
    }
    role: string
    permissions: any
    isActive: boolean
  }>
  capacity: {
    maxOrdersPerDay: number
    maxWeightPerDay: number
    maxCustomersPerDay: number
    staffCount: number
  }
  status: string
  isActive: boolean
  metrics: {
    totalOrders: number
    completedOrders: number
    totalRevenue: number
    averageRating: number
    efficiency: number
  }
  createdAt: string
  updatedAt: string
}

interface BranchFilters {
  page?: number
  limit?: number
  search?: string
  status?: string
  city?: string
  sortBy?: string
  sortOrder?: string
}

export const useBranches = () => {
  const [branches, setBranches] = useState<Branch[]>([])
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
    limit: 10
  })

  // Fetch branches with filters
  const fetchBranches = useCallback(async (filters: BranchFilters = {}) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await superAdminApi.getBranches(filters)
      setBranches(response.data.branches)
      setPagination(response.data.pagination)
    } catch (err: any) {
      setError(err.message)
      console.error('Fetch branches error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch single branch
  const fetchBranch = useCallback(async (branchId: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await superAdminApi.getBranch(branchId)
      setSelectedBranch(response.data.branch)
      return response.data
    } catch (err: any) {
      setError(err.message)
      console.error('Fetch branch error:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Create branch
  const createBranch = useCallback(async (branchData: any) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await superAdminApi.createBranch(branchData)
      
      // Refresh branches list
      await fetchBranches()
      
      return response.data.branch
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create branch'
      setError(errorMessage)
      console.error('Create branch error:', err)
      // Re-throw with the actual error message
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [fetchBranches])

  // Update branch
  const updateBranch = useCallback(async (branchId: string, branchData: any) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await superAdminApi.updateBranch(branchId, branchData)
      
      // Update local state
      setBranches(prev => 
        prev.map(branch => 
          branch._id === branchId ? response.data.branch : branch
        )
      )
      
      if (selectedBranch?._id === branchId) {
        setSelectedBranch(response.data.branch)
      }
      
      return response.data.branch
    } catch (err: any) {
      setError(err.message)
      console.error('Update branch error:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [selectedBranch])

  // Delete branch
  const deleteBranch = useCallback(async (branchId: string, permanent: boolean = false) => {
    setLoading(true)
    setError(null)
    
    try {
      await superAdminApi.deleteBranch(branchId, permanent)
      
      // Remove from local state
      setBranches(prev => prev.filter(branch => branch._id !== branchId))
      
      if (selectedBranch?._id === branchId) {
        setSelectedBranch(null)
      }
      
      return true
    } catch (err: any) {
      setError(err.message)
      console.error('Delete branch error:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [selectedBranch])

  // Assign manager
  const assignManager = useCallback(async (branchId: string, managerId: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await superAdminApi.assignManager(branchId, managerId)
      
      // Update local state
      setBranches(prev => 
        prev.map(branch => 
          branch._id === branchId ? response.data.branch : branch
        )
      )
      
      if (selectedBranch?._id === branchId) {
        setSelectedBranch(response.data.branch)
      }
      
      return response.data
    } catch (err: any) {
      setError(err.message)
      console.error('Assign manager error:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [selectedBranch])

  // Add staff
  const addStaff = useCallback(async (branchId: string, staffData: any) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await superAdminApi.addStaff(branchId, staffData)
      
      // Update local state
      setBranches(prev => 
        prev.map(branch => 
          branch._id === branchId ? response.data.branch : branch
        )
      )
      
      if (selectedBranch?._id === branchId) {
        setSelectedBranch(response.data.branch)
      }
      
      return response.data.branch
    } catch (err: any) {
      setError(err.message)
      console.error('Add staff error:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [selectedBranch])

  // Remove staff
  const removeStaff = useCallback(async (branchId: string, userId: string) => {
    setLoading(true)
    setError(null)
    
    try {
      await superAdminApi.removeStaff(branchId, userId)
      
      // Refresh branch data
      if (selectedBranch?._id === branchId) {
        await fetchBranch(branchId)
      }
      
      return true
    } catch (err: any) {
      setError(err.message)
      console.error('Remove staff error:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [selectedBranch, fetchBranch])

  // Get branch analytics
  const getBranchAnalytics = useCallback(async (branchId: string, params: {
    startDate: string
    endDate: string
    groupBy?: string
  }) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await superAdminApi.getBranchAnalytics(branchId, params)
      return response.data
    } catch (err: any) {
      setError(err.message)
      console.error('Branch analytics error:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    // Data
    branches,
    selectedBranch,
    loading,
    error,
    pagination,
    
    // Actions
    fetchBranches,
    fetchBranch,
    createBranch,
    updateBranch,
    deleteBranch,
    assignManager,
    addStaff,
    removeStaff,
    getBranchAnalytics,
    
    // Setters
    setSelectedBranch,
    clearError: () => setError(null)
  }
}
