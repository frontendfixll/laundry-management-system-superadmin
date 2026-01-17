'use client'

import { useState } from 'react'
import { X, User, Mail, Lock, Phone, CheckCircle } from 'lucide-react'
import axios from 'axios'
import { useSuperAdminStore } from '@/store/superAdminStore'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

interface CreateSalesUserModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function CreateSalesUserModal({
  isOpen,
  onClose,
  onSuccess
}: CreateSalesUserModalProps) {
  const { token } = useSuperAdminStore()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    employeeId: '',
    designation: 'Sales Executive'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [step, setStep] = useState(1)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Validate phone if provided
      if (formData.phone && !/^[6-9]\d{9}$/.test(formData.phone)) {
        setError('Phone number must be a valid 10-digit Indian mobile number')
        setLoading(false)
        return
      }

      await axios.post(
        `${API_URL}/superadmin/sales-users`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      onSuccess()
      onClose()
      setFormData({
        name: '',
        email: '',
        password: '',
        phone: '',
        employeeId: '',
        designation: 'Sales Executive'
      })
      setStep(1)
    } catch (err: any) {
      console.error('Create sales user error:', err.response?.data)
      setError(err.response?.data?.message || 'Failed to create sales user')
    } finally {
      setLoading(false)
    }
  }

  const isStep1Valid = formData.name && formData.email && formData.password.length >= 8
  const isStep2Valid = true // Optional fields

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg transform transition-all">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-t-2xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Add Sales User</h2>
              <p className="text-blue-100 text-sm">Create a new sales team member</p>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center gap-2 mt-6">
            <div className={`flex-1 h-1 rounded-full transition-all ${step >= 1 ? 'bg-white' : 'bg-white/30'}`} />
            <div className={`flex-1 h-1 rounded-full transition-all ${step >= 2 ? 'bg-white' : 'bg-white/30'}`} />
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-xs text-white/80">Basic Info</span>
            <span className="text-xs text-white/80">Additional Details</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* Step 1: Basic Information */}
          {step === 1 && (
            <div className="space-y-5 animate-fadeIn">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <User className="w-4 h-4 text-blue-600" />
                  Full Name *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="e.g., John Doe"
                    className="w-full pl-10 h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Mail className="w-4 h-4 text-blue-600" />
                  Email Address *
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    placeholder="john@company.com"
                    className="w-full pl-10 h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Lock className="w-4 h-4 text-blue-600" />
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    minLength={8}
                    placeholder="Minimum 8 characters"
                    className="w-full pl-10 pr-12 h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm font-medium"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                {formData.password && (
                  <div className="flex items-center gap-2 text-xs">
                    <div className={`h-1 flex-1 rounded-full ${
                      formData.password.length < 8 ? 'bg-red-300' :
                      formData.password.length < 12 ? 'bg-yellow-300' : 'bg-green-400'
                    }`} />
                    <span className={`font-medium ${
                      formData.password.length < 8 ? 'text-red-600' :
                      formData.password.length < 12 ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {formData.password.length < 8 ? 'Weak' :
                       formData.password.length < 12 ? 'Good' : 'Strong'}
                    </span>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={!isStep1Valid}
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue to Additional Details →
              </button>
            </div>
          )}

          {/* Step 2: Additional Details */}
          {step === 2 && (
            <div className="space-y-5 animate-fadeIn">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Phone className="w-4 h-4 text-blue-600" />
                  Phone Number
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="9876543210"
                    pattern="[6-9][0-9]{9}"
                    maxLength={10}
                    className="w-full pl-10 h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
                <p className="text-xs text-gray-500">Optional: 10-digit Indian mobile number</p>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <User className="w-4 h-4 text-blue-600" />
                  Employee ID
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.employeeId}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                    placeholder="SALES001"
                    className="w-full pl-10 h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <User className="w-4 h-4 text-blue-600" />
                  Designation
                </label>
                <div className="relative">
                  <select
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    className="w-full pl-10 pr-4 h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none bg-white"
                  >
                    <option value="Sales Executive">Sales Executive</option>
                    <option value="Senior Sales Executive">Senior Sales Executive</option>
                    <option value="Sales Manager">Sales Manager</option>
                    <option value="Regional Sales Manager">Regional Sales Manager</option>
                    <option value="Sales Director">Sales Director</option>
                  </select>
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 h-12 border-2 border-gray-300 hover:bg-gray-50 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  className="flex-1 h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      Create User
                    </span>
                  )}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}