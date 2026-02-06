'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/authStore'
import {
  Shield,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Loader2,
  KeyRound,
  Users,
  DollarSign
} from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://laundrylobby-backend-1.vercel.app/api'

export default function UnifiedLogin() {
  const router = useRouter()
  const { setUser, setToken, setSession } = useAuthStore()
  const [step, setStep] = useState<'credentials' | 'mfa'>('credentials')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    otp: '',
    backupCode: '',
    rememberMe: false
  })
  const [mfaToken, setMfaToken] = useState('')
  const [userType, setUserType] = useState<'superadmin' | 'sales' | 'support' | 'auditor' | 'finance' | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [useBackupCode, setUseBackupCode] = useState(false)
  const [selectedQuickLogin, setSelectedQuickLogin] = useState<'superadmin' | 'sales' | 'support' | 'finance' | 'auditor' | null>(null)

  // Quick login credentials
  const quickLoginOptions = {
    superadmin: {
      email: 'superadmin@laundrypro.com',
      password: 'SuperAdmin@123',
      label: 'SuperAdmin Login',
      icon: Shield,
      color: 'purple'
    },
    sales: {
      email: 'virat@sales.com',
      password: 'sales123',
      label: 'Sales Login',
      icon: Users,
      color: 'blue'
    },
    support: {
      email: 'support@gmail.com',
      password: 'deep2025',
      label: 'Support Login',
      icon: KeyRound,
      color: 'green'
    },
    finance: {
      email: 'finance@gmail.com',
      password: 'finance2025',
      label: 'Finance Admin',
      icon: DollarSign,
      color: 'emerald'
    },
    auditor: {
      email: 'auditor@gmail.com',
      password: 'auditor2025',
      label: 'Platform Auditor',
      icon: Eye,
      color: 'orange'
    }
  }

  const handleQuickLogin = (type: 'superadmin' | 'sales' | 'support' | 'finance' | 'auditor') => {
    const credentials = quickLoginOptions[type]
    setFormData({
      ...formData,
      email: credentials.email,
      password: credentials.password
    })
    setSelectedQuickLogin(type)
  }

  const clearQuickLogin = () => {
    setFormData({
      ...formData,
      email: '',
      password: ''
    })
    setSelectedQuickLogin(null)
  }

  const handleCheckboxChange = (type: 'superadmin' | 'sales' | 'support' | 'finance' | 'auditor', checked: boolean) => {
    if (checked) {
      // If checking this box, uncheck the other and fill credentials
      handleQuickLogin(type)
    } else {
      // If unchecking, clear credentials
      clearQuickLogin()
    }
  }

  const detectUserTypeAndLogin = async () => {
    let lastError = null

    // Try SuperAdmin login first
    try {
      const response = await fetch(`${API_URL}/superadmin/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          rememberMe: formData.rememberMe
        })
      })

      // Check if response is JSON
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text()
        // console.error('Non-JSON response from SuperAdmin login:', text)
        throw new Error('Server returned invalid response format')
      }

      const data = await response.json()

      if (response.ok && data.success) {
        // Check user type by examining the roles array first, then legacy role field
        const admin = data.admin || data.data?.admin || data.data?.user

        if (admin) {
          // Check roles array first (new RBAC system)
          if (admin.roles && admin.roles.length > 0) {
            const primaryRole = admin.roles[0]
            if (primaryRole.slug === 'platform-support' || primaryRole.name === 'Platform Support') {
              setUserType('support')
              return { success: true, data, type: 'support' }
            } else if (primaryRole.slug === 'super-admin' || primaryRole.slug === 'super_admin' || primaryRole.name === 'Super Admin') {
              setUserType('superadmin')
              return { success: true, data, type: 'superadmin' }
            } else if (primaryRole.slug === 'platform-read-only-auditor' || primaryRole.name === 'Platform Read-Only Auditor' || primaryRole.name === 'Platform Auditor') {
              setUserType('auditor')
              return { success: true, data, type: 'auditor' }
            } else if (primaryRole.slug === 'platform-finance-admin' || primaryRole.name === 'Platform Finance Admin') {
              setUserType('finance')
              return { success: true, data, type: 'finance' }
            }
          }

          // Fallback to legacy role field
          const legacyRole = admin.role
          if (legacyRole === 'support') {
            setUserType('support')
            return { success: true, data, type: 'support' }
          } else if (legacyRole === 'auditor') {
            setUserType('auditor')
            return { success: true, data, type: 'auditor' }
          } else if (legacyRole === 'finance') {
            setUserType('finance')
            return { success: true, data, type: 'finance' }
          } else {
            // Default to superadmin for SuperAdmin endpoint
            setUserType('superadmin')
            return { success: true, data, type: 'superadmin' }
          }
        }
      }

      // Store error for later
      lastError = data.message || 'SuperAdmin login failed'
    } catch (error: any) {
      // SuperAdmin login failed, try regular auth for support users
      // console.log('SuperAdmin login failed, trying regular auth...', error.message)
      lastError = error.message
    }

    // Try Sales login (skip regular auth since SuperAdmin should handle support users)
    try {
      const response = await fetch(`${API_URL}/sales/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      })

      // Check if response is JSON
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text()
        // console.error('Non-JSON response from Sales login:', text)
        throw new Error('Server returned invalid response format')
      }

      const data = await response.json()

      if (response.ok && data.success) {
        setUserType('sales')
        return { success: true, data, type: 'sales' }
      } else {
        throw new Error(data.message || lastError || 'Invalid credentials')
      }
    } catch (error: any) {
      throw new Error(error.message || lastError || 'Invalid email or password')
    }
  }

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const result = await detectUserTypeAndLogin()

      if (!result || !result.data) {
        throw new Error('Login failed')
      }

      if (result.data.requiresMFA) {
        // SuperAdmin with MFA
        setMfaToken(result.data.mfaToken)
        setStep('mfa')
        setSuccess('Verification code sent to your email')
      } else {
        // Login successful (either SuperAdmin without MFA or Sales)
        // Handle different response structures
        let userData, token, session

        if (result.type === 'superadmin' || result.type === 'support' || result.type === 'auditor' || result.type === 'finance') {
          // SuperAdmin/Support/Auditor/Finance response: { admin, token, session } (direct structure)
          userData = result.data.admin || result.data.data?.admin
          token = result.data.token
          session = result.data.session
        } else {
          // Sales response: { data: { salesUser, token, session } }
          // Also handle nested token structure
          userData = result.data.data?.salesUser || result.data.salesUser || result.data.data
          token = result.data.data?.token || result.data.token
          session = result.data.data?.session || result.data.session
        }

        if (!userData) {
          // console.error('Response data:', result.data)
          throw new Error('User data not found in response')
        }

        // Update unified auth store
        setToken(token)
        setUser(userData)
        if (session) {
          setSession(session)
        }

        // console.log('✅ Stored token in auth store:', token?.substring(0, 50) + '...')
        // console.log('✅ Stored user:', userData.email, userData.role || userData.designation)

        setSuccess('Login successful! Redirecting...')

        // Redirect based on user type and role
        setTimeout(() => {
          if (result.type === 'superadmin' || result.type === 'support' || result.type === 'auditor' || result.type === 'finance') {
            // Use role-based dashboard routing for SuperAdmin, Support, Auditor, and Finance users
            // console.log('🔄 Login - Importing dashboard router for user type:', result.type)
            import('@/utils/dashboardRouter').then(({ getDashboardRoute }) => {
              const dashboardRoute = getDashboardRoute(userData)
              // console.log('🎯 Login - Routing user to dashboard:', dashboardRoute, 'based on role:', userData.role || userData.roles?.[0]?.name)
              router.push(dashboardRoute)
            })
          } else {
            // console.log('🔄 Login - Routing sales user to /sales-dashboard')
            router.push('/sales-dashboard')
          }
        }, 2000) // Increased delay to ensure token is properly stored
      }
    } catch (error: any) {
      // console.error('Login error:', error)
      setError(error.message || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  const handleMFASubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${API_URL}/superadmin/auth/verify-mfa`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          mfaToken,
          otp: useBackupCode ? undefined : formData.otp,
          backupCode: useBackupCode ? formData.backupCode : undefined
        })
      })

      // Check if response is JSON
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text()
        // console.error('Non-JSON response from MFA verification:', text)
        throw new Error('Server returned invalid response format')
      }

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Verification failed')
      }

      // MFA verification successful
      setToken(data.token)
      setUser(data.admin)
      if (data.session) {
        setSession(data.session)
      }

      setSuccess('Verification successful! Redirecting...')
      setTimeout(() => {
        // Use role-based dashboard routing for MFA verified users
        import('@/utils/dashboardRouter').then(({ getDashboardRoute }) => {
          const dashboardRoute = getDashboardRoute(data.admin)
          // console.log('🎯 Routing MFA user to dashboard:', dashboardRoute, 'based on role:', data.admin.roles?.[0]?.name)
          router.push(dashboardRoute)
        })
      }, 1000)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const resendOTP = async () => {
    await handleCredentialsSubmit(new Event('submit') as any)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white">LaundryLobby</h2>
          <p className="mt-2 text-gray-300">
            {step === 'credentials' ? 'Sign in to your account' : 'Enter verification code'}
          </p>
        </div>

        {/* Alert Messages */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-center space-x-3">
            <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
            <span className="text-red-300 text-sm">{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 flex items-center space-x-3">
            <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
            <span className="text-green-300 text-sm">{success}</span>
          </div>
        )}

        {/* Login Form */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-white/20">
          {step === 'credentials' ? (
            <form onSubmit={handleCredentialsSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-200 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-10 pr-3 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-200 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-10 pr-12 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.rememberMe}
                    onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                    className="w-4 h-4 rounded border-white/20 bg-white/5 text-purple-500 focus:ring-purple-500 focus:ring-offset-0"
                  />
                  <span className="text-sm text-gray-300">Remember me</span>
                </label>

                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 rounded-lg font-medium transition-all duration-200 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>

              {/* Quick Login Checkboxes - Smart 5-item Layout */}
              <div className="mt-4 pt-4 border-t border-white/20">
                <p className="text-xs text-gray-400 text-center mb-3">Quick Login</p>
                <div className="space-y-2">
                  {/* First row: 3 items */}
                  <div className="grid grid-cols-3 gap-2">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedQuickLogin === 'superadmin'}
                        onChange={(e) => handleCheckboxChange('superadmin', e.target.checked)}
                        className="w-4 h-4 rounded border-white/20 bg-white/5 text-purple-500 focus:ring-purple-500 focus:ring-offset-0"
                      />
                      <span className="text-xs text-gray-300">SuperAdmin</span>
                    </label>

                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedQuickLogin === 'sales'}
                        onChange={(e) => handleCheckboxChange('sales', e.target.checked)}
                        className="w-4 h-4 rounded border-white/20 bg-white/5 text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
                      />
                      <span className="text-xs text-gray-300">Sales</span>
                    </label>

                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedQuickLogin === 'support'}
                        onChange={(e) => handleCheckboxChange('support', e.target.checked)}
                        className="w-4 h-4 rounded border-white/20 bg-white/5 text-green-500 focus:ring-green-500 focus:ring-offset-0"
                      />
                      <span className="text-xs text-gray-300">Support</span>
                    </label>
                  </div>

                  {/* Second row: 2 items centered */}
                  <div className="grid grid-cols-2 gap-2 max-w-xs mx-auto">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedQuickLogin === 'finance'}
                        onChange={(e) => handleCheckboxChange('finance', e.target.checked)}
                        className="w-4 h-4 rounded border-white/20 bg-white/5 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0"
                      />
                      <span className="text-xs text-gray-300">Finance</span>
                    </label>

                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedQuickLogin === 'auditor'}
                        onChange={(e) => handleCheckboxChange('auditor', e.target.checked)}
                        className="w-4 h-4 rounded border-white/20 bg-white/5 text-orange-500 focus:ring-orange-500 focus:ring-offset-0"
                      />
                      <span className="text-xs text-gray-300">Auditor</span>
                    </label>
                  </div>
                </div>
              </div>
            </form>
          ) : (
            <form onSubmit={handleMFASubmit} className="space-y-6">
              <div className="text-center mb-6">
                <div className="mx-auto h-12 w-12 bg-purple-500/20 rounded-full flex items-center justify-center mb-3">
                  <KeyRound className="h-6 w-6 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Two-Factor Authentication</h3>
                <p className="text-gray-300 text-sm">
                  {useBackupCode
                    ? 'Enter your backup code'
                    : 'Enter the 6-digit code sent to your email'
                  }
                </p>
              </div>

              {!useBackupCode ? (
                <div>
                  <label htmlFor="otp" className="block text-sm font-medium text-gray-200 mb-2">
                    Verification Code
                  </label>
                  <input
                    id="otp"
                    name="otp"
                    type="text"
                    maxLength={6}
                    required
                    value={formData.otp}
                    onChange={(e) => setFormData({ ...formData, otp: e.target.value.replace(/\D/g, '') })}
                    className="w-full px-3 py-3 bg-white/5 border border-white/20 rounded-lg text-white text-center text-2xl tracking-widest placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="000000"
                  />
                </div>
              ) : (
                <div>
                  <label htmlFor="backupCode" className="block text-sm font-medium text-gray-200 mb-2">
                    Backup Code
                  </label>
                  <input
                    id="backupCode"
                    name="backupCode"
                    type="text"
                    maxLength={8}
                    required
                    value={formData.backupCode}
                    onChange={(e) => setFormData({ ...formData, backupCode: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-3 bg-white/5 border border-white/20 rounded-lg text-white text-center text-xl tracking-widest placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="XXXXXXXX"
                  />
                </div>
              )}

              <div className="flex space-x-3">
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 rounded-lg font-medium transition-all duration-200 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Verify'
                  )}
                </Button>
              </div>

              <div className="flex flex-col space-y-3 text-center">
                <button
                  type="button"
                  onClick={() => setUseBackupCode(!useBackupCode)}
                  className="text-purple-400 hover:text-purple-300 text-sm transition-colors"
                >
                  {useBackupCode ? 'Use verification code instead' : 'Use backup code instead'}
                </button>

                {!useBackupCode && (
                  <button
                    type="button"
                    onClick={resendOTP}
                    disabled={loading}
                    className="text-gray-400 hover:text-gray-300 text-sm transition-colors disabled:opacity-50"
                  >
                    Resend code
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setStep('credentials')
                    setFormData({ ...formData, otp: '', backupCode: '' })
                    setUseBackupCode(false)
                    setError('')
                  }}
                  className="text-gray-400 hover:text-gray-300 text-sm transition-colors"
                >
                  Back to login
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-gray-400 text-sm">
            LaundryLobby Admin Portal
          </p>
        </div>
      </div>
    </div>
  )
}
