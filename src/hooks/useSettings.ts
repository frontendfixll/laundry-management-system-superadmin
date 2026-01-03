'use client'

import { useState, useEffect } from 'react'
import { superAdminApi } from '@/lib/superAdminApi'

export interface SystemSettings {
  general: {
    systemName: string
    timezone: string
    currency: string
    language: string
    dateFormat: string
    timeFormat: string
  }
  security: {
    sessionTimeout: number
    maxLoginAttempts: number
    lockoutDuration: number
    passwordMinLength: number
    requireMFA: boolean
    allowMultipleSessions: boolean
  }
  notifications: {
    emailNotifications: boolean
    smsNotifications: boolean
    pushNotifications: boolean
    orderUpdates: boolean
    paymentAlerts: boolean
    systemAlerts: boolean
  }
  business: {
    operatingHours: {
      start: string
      end: string
    }
    workingDays: string[]
    defaultPickupTime: number
    defaultDeliveryTime: number
    maxOrdersPerDay: number
    autoAssignOrders: boolean
  }
  integrations: {
    paymentGateway: {
      enabled: boolean
      provider: string
      testMode: boolean
    }
    smsGateway: {
      enabled: boolean
      provider: string
    }
    emailService: {
      enabled: boolean
      provider: string
    }
  }
}

export interface AdminProfile {
  id: string
  name: string
  email: string
  phone?: string
  avatar?: string
  role: string
  permissions: Record<string, boolean>
  mfaEnabled: boolean
  lastLogin?: string
  createdAt: string
}

export interface SystemInfo {
  version: string
  environment: string
  uptime: number
  memory: any
  platform: string
  nodeVersion: string
  database: {
    status: string
    name: string
  }
  features: Record<string, boolean>
}

export function useSettings() {
  const [settings, setSettings] = useState<SystemSettings | null>(null)
  const [profile, setProfile] = useState<AdminProfile | null>(null)
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchSettings = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await superAdminApi.getSystemSettings()
      setSettings(response.data.settings)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch settings')
    } finally {
      setLoading(false)
    }
  }

  const fetchProfile = async () => {
    try {
      const response = await superAdminApi.getProfileSettings()
      setProfile(response.data.profile)
    } catch (err) {
      console.error('Failed to fetch profile:', err)
    }
  }

  const fetchSystemInfo = async () => {
    try {
      const response = await superAdminApi.getSystemInfo()
      setSystemInfo(response.data.systemInfo)
    } catch (err) {
      console.error('Failed to fetch system info:', err)
    }
  }

  const updateSettings = async (category: string, updatedSettings: any) => {
    try {
      setUpdating(true)
      setError(null)
      const response = await superAdminApi.updateSystemSettings(category, updatedSettings)
      
      // Update local state
      if (settings) {
        setSettings({
          ...settings,
          [category]: updatedSettings
        })
      }
      
      return response.data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update settings'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setUpdating(false)
    }
  }

  const updateProfile = async (profileData: Partial<AdminProfile>) => {
    try {
      setUpdating(true)
      setError(null)
      const response = await superAdminApi.updateProfile(profileData)
      
      // Update local state
      if (profile) {
        setProfile({
          ...profile,
          ...profileData
        })
      }
      
      return response.data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setUpdating(false)
    }
  }

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      setUpdating(true)
      setError(null)
      const response = await superAdminApi.changePassword({
        currentPassword,
        newPassword
      })
      return response.data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to change password'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setUpdating(false)
    }
  }

  useEffect(() => {
    fetchSettings()
    fetchProfile()
    fetchSystemInfo()
  }, [])

  return {
    settings,
    profile,
    systemInfo,
    loading,
    updating,
    error,
    updateSettings,
    updateProfile,
    changePassword,
    refetch: () => {
      fetchSettings()
      fetchProfile()
      fetchSystemInfo()
    }
  }
}
