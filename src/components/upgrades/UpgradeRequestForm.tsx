'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { CalendarIcon, DollarSign, Users, Settings, Mail, MessageSquare, CreditCard, Clock, Target } from 'lucide-react'
import { format } from 'date-fns'

interface UpgradeRequestFormProps {
  tenancy: any
  availablePlans: any[]
  onSubmit: (data: any) => void
  onCancel: () => void
  loading?: boolean
}

export default function UpgradeRequestForm({ 
  tenancy, 
  availablePlans, 
  onSubmit, 
  onCancel, 
  loading = false 
}: UpgradeRequestFormProps) {
  const [formData, setFormData] = useState({
    toPlanId: '',
    customPrice: '',
    discount: '',
    discountReason: '',
    paymentMethod: 'online',
    dueDate: '',
    gracePeriod: 7,
    installments: 1,
    immediateFeatures: [] as string[],
    paymentRequiredFeatures: [] as string[],
    customMessage: '',
    sendEmail: true,
    sendSMS: false
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Set default due date (7 days from now)
  useEffect(() => {
    const defaultDate = new Date()
    defaultDate.setDate(defaultDate.getDate() + 7)
    setFormData(prev => ({
      ...prev,
      dueDate: format(defaultDate, 'yyyy-MM-dd')
    }))
  }, [])

  const selectedPlan = availablePlans.find(plan => plan._id === formData.toPlanId)
  const currentPlan = tenancy.subscription?.planId || tenancy.currentPlan
  const originalPrice = selectedPlan?.price?.monthly || 0
  const customPrice = parseFloat(formData.customPrice) || originalPrice
  const discount = parseFloat(formData.discount) || Math.max(0, originalPrice - customPrice)
  const finalPrice = originalPrice - discount

  // Validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.toPlanId) {
      newErrors.toPlanId = 'Please select a target plan'
    }

    if (customPrice <= 0) {
      newErrors.customPrice = 'Price must be greater than 0'
    }

    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required'
    } else {
      const dueDate = new Date(formData.dueDate)
      if (dueDate <= new Date()) {
        newErrors.dueDate = 'Due date must be in the future'
      }
    }

    if (formData.gracePeriod < 0 || formData.gracePeriod > 90) {
      newErrors.gracePeriod = 'Grace period must be between 0 and 90 days'
    }

    if (formData.paymentMethod === 'installments' && (formData.installments < 2 || formData.installments > 12)) {
      newErrors.installments = 'Installments must be between 2 and 12'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    const upgradeData = {
      tenancyId: tenancy._id,
      toPlanId: formData.toPlanId,
      customPrice: finalPrice,
      discount: discount,
      discountReason: formData.discountReason,
      paymentTerms: {
        method: formData.paymentMethod,
        dueDate: formData.dueDate,
        gracePeriod: formData.gracePeriod,
        installments: formData.paymentMethod === 'installments' ? {
          total: formData.installments,
          amount: finalPrice / formData.installments
        } : {
          total: 1,
          amount: finalPrice
        }
      },
      featureAccess: {
        immediate: formData.immediateFeatures,
        paymentRequired: formData.paymentRequiredFeatures.length > 0 
          ? formData.paymentRequiredFeatures 
          : (selectedPlan?.features ? Object.keys(selectedPlan.features) : [])
      },
      customMessage: formData.customMessage,
      communication: {
        sendEmail: formData.sendEmail,
        sendSMS: formData.sendSMS
      }
    }

    onSubmit(upgradeData)
  }

  const handleFeatureToggle = (feature: string, type: 'immediate' | 'paymentRequired') => {
    if (type === 'immediate') {
      const newImmediate = formData.immediateFeatures.includes(feature)
        ? formData.immediateFeatures.filter(f => f !== feature)
        : [...formData.immediateFeatures, feature]
      
      setFormData({
        ...formData,
        immediateFeatures: newImmediate,
        paymentRequiredFeatures: formData.paymentRequiredFeatures.filter(f => f !== feature)
      })
    } else {
      const newPaymentRequired = formData.paymentRequiredFeatures.includes(feature)
        ? formData.paymentRequiredFeatures.filter(f => f !== feature)
        : [...formData.paymentRequiredFeatures, feature]
      
      setFormData({
        ...formData,
        paymentRequiredFeatures: newPaymentRequired,
        immediateFeatures: formData.immediateFeatures.filter(f => f !== feature)
      })
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create Upgrade Request</h1>
          <p className="text-gray-600 mt-1">Configure custom upgrade terms for the customer</p>
        </div>
        <Badge variant="outline" className="text-sm">
          Custom Upgrade System
        </Badge>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Business Name</p>
              <p className="font-semibold text-gray-900">{tenancy.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Current Plan</p>
              <p className="font-semibold text-gray-900">
                {currentPlan?.displayName || currentPlan?.name || 'No Plan'} 
                {currentPlan?.price?.monthly && (
                  <span className="text-gray-500 ml-2">₹{currentPlan.price.monthly}/month</span>
                )}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Contact Person</p>
              <p className="font-semibold text-gray-900">{tenancy.contactPerson?.name || tenancy.contact?.name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-semibold text-gray-900">{tenancy.contactPerson?.email || tenancy.contact?.email || 'N/A'}</p>
            </div>
          </CardContent>
        </Card>

        {/* Plan Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-green-600" />
              Target Plan Selection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Select Target Plan *</label>
                <Select 
                  value={formData.toPlanId} 
                  onValueChange={(value) => {
                    setFormData({...formData, toPlanId: value, customPrice: '', discount: ''})
                    setErrors({...errors, toPlanId: ''})
                  }}
                >
                  <SelectTrigger className={errors.toPlanId ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Choose the plan to upgrade to" />
                  </SelectTrigger>
                  <SelectContent>
                    {availablePlans.map(plan => (
                      <SelectItem key={plan._id} value={plan._id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{plan.displayName}</span>
                          <span className="text-gray-500 ml-4">₹{plan.price.monthly}/month</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.toPlanId && <p className="text-red-500 text-sm mt-1">{errors.toPlanId}</p>}
              </div>

              {selectedPlan && (
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-900 mb-2">Selected Plan: {selectedPlan.displayName}</h4>
                  <p className="text-green-700 text-sm">{selectedPlan.description}</p>
                  <div className="mt-2 flex items-center gap-4">
                    <span className="text-green-900 font-semibold">₹{selectedPlan.price.monthly}/month</span>
                    {selectedPlan.features && (
                      <span className="text-green-700 text-sm">
                        {Object.keys(selectedPlan.features).length} features included
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pricing Control */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-purple-600" />
              Pricing Control
            </CardTitle>
            <CardDescription>
              Set custom pricing and discounts for this upgrade
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Original Price</label>
                <div className="relative">
                  <Input 
                    value={`₹${originalPrice}`} 
                    disabled 
                    className="bg-gray-50"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Custom Price *</label>
                <div className="relative">
                  <Input 
                    type="number" 
                    value={formData.customPrice} 
                    onChange={(e) => {
                      setFormData({...formData, customPrice: e.target.value})
                      setErrors({...errors, customPrice: ''})
                    }}
                    placeholder={originalPrice.toString()}
                    className={errors.customPrice ? 'border-red-500' : ''}
                  />
                </div>
                {errors.customPrice && <p className="text-red-500 text-sm mt-1">{errors.customPrice}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Discount</label>
                <div className="relative">
                  <Input 
                    type="number"
                    value={formData.discount} 
                    onChange={(e) => setFormData({...formData, discount: e.target.value})}
                    placeholder={discount.toString()}
                  />
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium mb-2">Discount Reason</label>
              <Input 
                value={formData.discountReason} 
                onChange={(e) => setFormData({...formData, discountReason: e.target.value})}
                placeholder="e.g., First time customer, Loyalty discount, Bulk purchase"
                maxLength={200}
              />
            </div>

            {/* Pricing Summary */}
            <div className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">Pricing Summary</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Original Price:</span>
                    <span>₹{originalPrice}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Discount:</span>
                    <span className="text-red-600">-₹{discount}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Final Price:</span>
                    <span className="text-blue-900">₹{finalPrice}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Savings:</span>
                    <span className="text-green-600">₹{discount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Discount %:</span>
                    <span className="text-green-600">
                      {originalPrice > 0 ? Math.round((discount / originalPrice) * 100) : 0}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Terms */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-orange-600" />
              Payment Terms
            </CardTitle>
            <CardDescription>
              Configure payment method and timeline
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Payment Method</label>
                <Select 
                  value={formData.paymentMethod} 
                  onValueChange={(value) => setFormData({...formData, paymentMethod: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="online">Online Payment (Stripe)</SelectItem>
                    <SelectItem value="offline">Offline Payment (Manual)</SelectItem>
                    <SelectItem value="installments">Installment Plan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Due Date *</label>
                <Input 
                  type="date" 
                  value={formData.dueDate} 
                  onChange={(e) => {
                    setFormData({...formData, dueDate: e.target.value})
                    setErrors({...errors, dueDate: ''})
                  }}
                  className={errors.dueDate ? 'border-red-500' : ''}
                />
                {errors.dueDate && <p className="text-red-500 text-sm mt-1">{errors.dueDate}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Grace Period (days)</label>
                <Input 
                  type="number" 
                  value={formData.gracePeriod} 
                  onChange={(e) => {
                    setFormData({...formData, gracePeriod: parseInt(e.target.value) || 0})
                    setErrors({...errors, gracePeriod: ''})
                  }}
                  min="0"
                  max="90"
                  className={errors.gracePeriod ? 'border-red-500' : ''}
                />
                {errors.gracePeriod && <p className="text-red-500 text-sm mt-1">{errors.gracePeriod}</p>}
              </div>
              {formData.paymentMethod === 'installments' && (
                <div>
                  <label className="block text-sm font-medium mb-2">Number of Installments</label>
                  <Select 
                    value={formData.installments.toString()} 
                    onValueChange={(value) => {
                      setFormData({...formData, installments: parseInt(value)})
                      setErrors({...errors, installments: ''})
                    }}
                  >
                    <SelectTrigger className={errors.installments ? 'border-red-500' : ''}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2 Installments (₹{(finalPrice / 2).toFixed(0)} each)</SelectItem>
                      <SelectItem value="3">3 Installments (₹{(finalPrice / 3).toFixed(0)} each)</SelectItem>
                      <SelectItem value="4">4 Installments (₹{(finalPrice / 4).toFixed(0)} each)</SelectItem>
                      <SelectItem value="6">6 Installments (₹{(finalPrice / 6).toFixed(0)} each)</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.installments && <p className="text-red-500 text-sm mt-1">{errors.installments}</p>}
                </div>
              )}
            </div>

            {/* Payment Summary */}
            <div className="mt-4 bg-orange-50 p-4 rounded-lg border border-orange-200">
              <h4 className="font-semibold text-orange-900 mb-2">Payment Summary</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p><strong>Method:</strong> {formData.paymentMethod}</p>
                  <p><strong>Due Date:</strong> {formData.dueDate ? format(new Date(formData.dueDate), 'MMM dd, yyyy') : 'Not set'}</p>
                </div>
                <div>
                  <p><strong>Grace Period:</strong> {formData.gracePeriod} days</p>
                  {formData.paymentMethod === 'installments' && (
                    <p><strong>Per Installment:</strong> ₹{(finalPrice / formData.installments).toFixed(0)}</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feature Access Control */}
        {selectedPlan && selectedPlan.features && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-indigo-600" />
                Feature Access Control
              </CardTitle>
              <CardDescription>
                Configure which features are available immediately vs after payment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3 text-green-700">✅ Immediate Access (Before Payment)</h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto border rounded-lg p-3 bg-green-50">
                    {Object.keys(selectedPlan.features).map(feature => (
                      <div key={feature} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`immediate-${feature}`}
                          checked={formData.immediateFeatures.includes(feature)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              handleFeatureToggle(feature, 'immediate')
                            } else {
                              setFormData({
                                ...formData,
                                immediateFeatures: formData.immediateFeatures.filter(f => f !== feature)
                              })
                            }
                          }}
                        />
                        <label htmlFor={`immediate-${feature}`} className="text-sm capitalize cursor-pointer">
                          {feature.replace(/_/g, ' ')}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-3 text-red-700">🔒 Payment Required</h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto border rounded-lg p-3 bg-red-50">
                    {Object.keys(selectedPlan.features).map(feature => (
                      <div key={feature} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`payment-${feature}`}
                          checked={
                            formData.paymentRequiredFeatures.includes(feature) || 
                            (!formData.immediateFeatures.includes(feature) && formData.paymentRequiredFeatures.length === 0)
                          }
                          onCheckedChange={(checked) => {
                            if (checked) {
                              handleFeatureToggle(feature, 'paymentRequired')
                            } else {
                              setFormData({
                                ...formData,
                                paymentRequiredFeatures: formData.paymentRequiredFeatures.filter(f => f !== feature)
                              })
                            }
                          }}
                        />
                        <label htmlFor={`payment-${feature}`} className="text-sm capitalize cursor-pointer">
                          {feature.replace(/_/g, ' ')}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-700">
                  <strong>Note:</strong> Features not selected for immediate access will be locked until payment is completed.
                  This gives customers a preview of the upgrade while ensuring payment compliance.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Communication */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-teal-600" />
              Customer Communication
            </CardTitle>
            <CardDescription>
              Configure how the customer will be notified about this upgrade
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="sendEmail"
                    checked={formData.sendEmail}
                    onCheckedChange={(checked) => setFormData({...formData, sendEmail: checked as boolean})}
                  />
                  <label htmlFor="sendEmail" className="text-sm font-medium">Send Email Notification</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="sendSMS"
                    checked={formData.sendSMS}
                    onCheckedChange={(checked) => setFormData({...formData, sendSMS: checked as boolean})}
                  />
                  <label htmlFor="sendSMS" className="text-sm font-medium">Send SMS Alert</label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Custom Message for Customer</label>
                <Textarea 
                  value={formData.customMessage}
                  onChange={(e) => setFormData({...formData, customMessage: e.target.value})}
                  placeholder="Add a personal message to explain the upgrade benefits, special pricing, or next steps..."
                  rows={4}
                  maxLength={500}
                  className="resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.customMessage.length}/500 characters
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Final Summary */}
        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-900">📋 Upgrade Request Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h4 className="font-semibold text-blue-900">Plan Change</h4>
                <p className="text-sm">
                  <strong>From:</strong> {currentPlan?.displayName || 'Current Plan'}
                </p>
                <p className="text-sm">
                  <strong>To:</strong> {selectedPlan?.displayName || 'Select a plan'}
                </p>
                <p className="text-sm">
                  <strong>Price:</strong> ₹{originalPrice} → ₹{finalPrice} 
                  {discount > 0 && <span className="text-green-600 ml-1">(Save ₹{discount})</span>}
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-blue-900">Payment Terms</h4>
                <p className="text-sm">
                  <strong>Method:</strong> {formData.paymentMethod}
                </p>
                <p className="text-sm">
                  <strong>Due:</strong> {formData.dueDate ? format(new Date(formData.dueDate), 'MMM dd, yyyy') : 'Not set'}
                </p>
                <p className="text-sm">
                  <strong>Grace Period:</strong> {formData.gracePeriod} days
                </p>
                {formData.paymentMethod === 'installments' && (
                  <p className="text-sm">
                    <strong>Installments:</strong> {formData.installments} × ₹{(finalPrice / formData.installments).toFixed(0)}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            className="bg-blue-600 hover:bg-blue-700 min-w-[200px]"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating Request...
              </div>
            ) : (
              'Create Upgrade Request'
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}