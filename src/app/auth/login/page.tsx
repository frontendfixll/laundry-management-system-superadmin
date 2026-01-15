'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useSuperAdminStore } from '@/store/superAdminStore'
import { 
  Shield, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle,
  CheckCircle,
  Loader2,
  KeyRound
} from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://LaundryLobby-backend-605c.onrender.com/api'

export default function SuperAdminLogin() {
  const router = useRouter()
  const { setAdmin, setToken, setSession } = useSuperAdminStore()
  const [step, setStep] = useState<'credentials' | 'mfa'>('credentials')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    otp: '',
    backupCode: '',
    rememberMe: false
  })
  const [mfaToken, setMfaToken] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [useBackupCode, setUseBackupCode] = useState(false)

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

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

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Login failed')
      }

      if (data.requiresMFA) {
        setMfaToken(data.mfaToken)
        setStep('mfa')
        setSuccess('Verification code sent to your email')
      } else {
        // No MFA required - login successful
        // Update Zustand store (this will persist to localStorage automatically)
        setToken(data.token)
        setAdmin(data.admin)
        if (data.session) {
          setSession(data.session)
        }
        
        setSuccess('Login successful! Redirecting...')
        setTimeout(() => {
          router.push('/dashboard')
        }, 1000)
      }
    } catch (error: any) {
      setError(error.message)
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

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Verification failed')
      }

      // MFA verification successful
      // Update Zustand store (this will persist to localStorage automatically)
      setToken(data.token)
      setAdmin(data.admin)
      if (data.session) {
        setSession(data.session)
      }
      
      setSuccess('Verification successful! Redirecting...')
      setTimeout(() => {
        router.push('/dashboard')
      }, 1000)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const resendOTP = async () => {
    // Trigger resend by resubmitting credentials
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
          <h2 className="text-3xl font-bold text-white">Super Admin</h2>
          <p className="mt-2 text-gray-300">
            {step === 'credentials' ? 'Sign in to your admin account' : 'Enter verification code'}
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
                    placeholder="admin@LaundryLobby.com"
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
            LaundryLobby Super Admin Portal
          </p>
          <Link href="/" className="text-purple-400 hover:text-purple-300 text-sm transition-colors">
            ← Back to main site
          </Link>
        </div>
      </div>
    </div>
  )
}
