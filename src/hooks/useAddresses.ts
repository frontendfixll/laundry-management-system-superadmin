import { useState, useEffect } from 'react'
import { customerAPI } from '@/lib/api'
import toast from 'react-hot-toast'

interface Address {
  _id: string
  name: string
  phone: string
  addressLine1: string
  addressLine2?: string
  landmark?: string
  city: string
  pincode: string
  isDefault: boolean
  addressType?: 'home' | 'office'
}

export function useAddresses() {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAddresses = async () => {
    try {
      setLoading(true)
      const response = await customerAPI.getAddresses()
      setAddresses(response.data.data.addresses || [])
      setError(null)
    } catch (err: any) {
      console.error('Error fetching addresses:', err)
      setError(err.response?.data?.message || 'Failed to fetch addresses')
    } finally {
      setLoading(false)
    }
  }

  const addAddress = async (addressData: Omit<Address, '_id'>) => {
    try {
      const response = await customerAPI.addAddress(addressData)
      const newAddress = response.data.data.address
      setAddresses(prev => [...prev, newAddress])
      toast.success('Address added successfully')
      return newAddress
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to add address'
      toast.error(message)
      throw err
    }
  }

  const updateAddress = async (addressId: string, addressData: Partial<Address>) => {
    try {
      const response = await customerAPI.updateAddress(addressId, addressData)
      const updatedAddress = response.data.data.address
      setAddresses(prev => 
        prev.map(addr => addr._id === addressId ? updatedAddress : addr)
      )
      toast.success('Address updated successfully')
      return updatedAddress
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to update address'
      toast.error(message)
      throw err
    }
  }

  const deleteAddress = async (addressId: string) => {
    try {
      await customerAPI.deleteAddress(addressId)
      setAddresses(prev => prev.filter(addr => addr._id !== addressId))
      toast.success('Address deleted successfully')
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to delete address'
      toast.error(message)
      throw err
    }
  }

  const setDefaultAddress = async (addressId: string) => {
    try {
      const response = await customerAPI.setDefaultAddress(addressId)
      const updatedAddress = response.data.data.address
      setAddresses(prev => 
        prev.map(addr => ({
          ...addr,
          isDefault: addr._id === addressId
        }))
      )
      toast.success('Default address updated')
      return updatedAddress
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to set default address'
      toast.error(message)
      throw err
    }
  }

  useEffect(() => {
    fetchAddresses()
  }, [])

  return {
    addresses,
    loading,
    error,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    refetch: fetchAddresses
  }
}
