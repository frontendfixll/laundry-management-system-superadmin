'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { X, Plus, Trash2, Info, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'

const addOnSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').max(100),
  displayName: z.string().min(3, 'Display name must be at least 3 characters').max(150),
  description: z.string().min(10, 'Description must be at least 10 characters').max(500),
  shortDescription: z.string().max(100).optional(),
  category: z.enum(['capacity', 'feature', 'usage', 'branding', 'integration', 'support']),
  subcategory: z.string().max(50).optional(),
  billingCycle: z.enum(['monthly', 'yearly', 'one-time', 'usage-based']),
  pricing: z.object({
    monthly: z.number().min(0).optional(),
    yearly: z.number().min(0).optional(),
    oneTime: z.number().min(0).optional()
  }),
  config: z.object({
    capacity: z.object({
      feature: z.string().optional(),
      increment: z.number().optional(),
      unit: z.string().optional()
    }).optional(),
    features: z.array(z.object({
      key: z.string(),
      value: z.union([z.boolean(), z.number(), z.string()])
    })).optional(),
    usage: z.object({
      type: z.enum(['credits', 'quota', 'allowance']).optional(),
      amount: z.number().optional(),
      unit: z.string().optional(),
      autoRenew: z.boolean().optional(),
      lowBalanceThreshold: z.number().optional()
    }).optional()
  }),
  icon: z.string().default('package'),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Must be a valid hex color').default('#3B82F6'),
  status: z.enum(['draft', 'active', 'hidden', 'deprecated']).default('draft'),
  isPopular: z.boolean().default(false),
  isRecommended: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  showOnMarketplace: z.boolean().default(true),
  showOnPricingPage: z.boolean().default(false),
  sortOrder: z.number().default(0),
  trialDays: z.number().min(0).max(365).default(0),
  maxQuantity: z.number().min(1).default(1),
  tags: z.array(z.string()).default([]),
  benefits: z.array(z.string()).default([]),
  features: z.array(z.string()).default([]),
  useCases: z.array(z.string()).default([]),
  changelogEntry: z.string().optional()
})

type AddOnFormData = z.infer<typeof addOnSchema>

interface AddOnEditModalProps {
  open: boolean
  addOn: any
  onClose: () => void
  onSubmit: (data: AddOnFormData) => Promise<void>
}

export function AddOnEditModal({ open, addOn, onClose, onSubmit }: AddOnEditModalProps) {
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('basic')
  const [hasActiveSubscriptions, setHasActiveSubscriptions] = useState(false)

  const form = useForm<AddOnFormData>({
    resolver: zodResolver(addOnSchema)
  })

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = form

  // Initialize form with add-on data
  useEffect(() => {
    if (addOn && open) {
      reset({
        name: addOn.name || '',
        displayName: addOn.displayName || '',
        description: addOn.description || '',
        shortDescription: addOn.shortDescription || '',
        category: addOn.category || 'feature',
        subcategory: addOn.subcategory || '',
        billingCycle: addOn.billingCycle || 'monthly',
        pricing: {
          monthly: addOn.pricing?.monthly || 0,
          yearly: addOn.pricing?.yearly || 0,
          oneTime: addOn.pricing?.oneTime || 0
        },
        config: {
          capacity: addOn.config?.capacity || {},
          features: addOn.config?.features || [],
          usage: addOn.config?.usage || {}
        },
        icon: addOn.icon || 'package',
        color: addOn.color || '#3B82F6',
        status: addOn.status || 'draft',
        isPopular: addOn.isPopular || false,
        isRecommended: addOn.isRecommended || false,
        isFeatured: addOn.isFeatured || false,
        showOnMarketplace: addOn.showOnMarketplace !== false,
        showOnPricingPage: addOn.showOnPricingPage || false,
        sortOrder: addOn.sortOrder || 0,
        trialDays: addOn.trialDays || 0,
        maxQuantity: addOn.maxQuantity || 1,
        tags: addOn.tags || [],
        benefits: addOn.benefits || [],
        features: addOn.features || [],
        useCases: addOn.useCases || []
      })

      // Check if add-on has active subscriptions
      setHasActiveSubscriptions((addOn.stats?.activeSubscriptions || 0) > 0)
    }
  }, [addOn, open, reset])

  const watchedCategory = watch('category')
  const watchedBillingCycle = watch('billingCycle')
  const watchedTags = watch('tags') || []
  const watchedBenefits = watch('benefits') || []
  const watchedFeatures = watch('features') || []
  const watchedUseCases = watch('useCases') || []
  const watchedConfigFeatures = watch('config.features') || []

  const handleFormSubmit = async (data: AddOnFormData) => {
    try {
      setLoading(true)
      await onSubmit(data)
      onClose()
    } catch (error) {
      console.error('Failed to update add-on:', error)
    } finally {
      setLoading(false)
    }
  }

  const addArrayItem = (field: keyof AddOnFormData, value: string) => {
    const currentArray = watch(field) as string[]
    if (value.trim() && !currentArray.includes(value.trim())) {
      setValue(field, [...currentArray, value.trim()])
    }
  }

  const removeArrayItem = (field: keyof AddOnFormData, index: number) => {
    const currentArray = watch(field) as string[]
    setValue(field, currentArray.filter((_, i) => i !== index))
  }

  const addConfigFeature = (key: string, value: any) => {
    if (key.trim()) {
      const currentFeatures = watchedConfigFeatures
      const existingIndex = currentFeatures.findIndex(f => f.key === key)
      
      if (existingIndex >= 0) {
        currentFeatures[existingIndex].value = value
      } else {
        currentFeatures.push({ key: key.trim(), value })
      }
      
      setValue('config.features', [...currentFeatures])
    }
  }

  const removeConfigFeature = (index: number) => {
    const currentFeatures = watchedConfigFeatures
    setValue('config.features', currentFeatures.filter((_, i) => i !== index))
  }

  if (!open || !addOn) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[90vh] flex flex-col">
        {/* Fixed Header */}
        <div className="flex items-center justify-between p-4 border-b bg-white flex-shrink-0">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold truncate">Edit Add-on</h2>
            <p className="text-sm text-muted-foreground truncate">
              {addOn.displayName} • Version {addOn.version}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {hasActiveSubscriptions && (
            <Alert className="m-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                This add-on has {addOn.stats?.activeSubscriptions} active subscriptions. 
                Critical changes (billing cycle, category, configuration) will create a new version.
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col h-full">
            <div className="flex-1 p-4">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-6">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="pricing">Pricing</TabsTrigger>
                  <TabsTrigger value="config">Configuration</TabsTrigger>
                  <TabsTrigger value="marketing">Marketing</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                  <TabsTrigger value="changelog">Changelog</TabsTrigger>
                </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Internal Name *</Label>
                    <Input
                      id="name"
                      {...register('name')}
                      placeholder="e.g., extra-branch"
                      disabled={hasActiveSubscriptions}
                    />
                    {errors.name && (
                      <p className="text-sm text-red-600">{errors.name.message}</p>
                    )}
                    {hasActiveSubscriptions && (
                      <p className="text-xs text-muted-foreground">
                        Cannot change name with active subscriptions
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="displayName">Display Name *</Label>
                    <Input
                      id="displayName"
                      {...register('displayName')}
                      placeholder="e.g., Extra Branch"
                    />
                    {errors.displayName && (
                      <p className="text-sm text-red-600">{errors.displayName.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    {...register('description')}
                    placeholder="Detailed description of what this add-on provides..."
                    rows={3}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-600">{errors.description.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shortDescription">Short Description</Label>
                  <Input
                    id="shortDescription"
                    {...register('shortDescription')}
                    placeholder="Brief one-line description"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select 
                      value={watchedCategory}
                      onValueChange={(value) => setValue('category', value as any)}
                      disabled={hasActiveSubscriptions}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="capacity">Capacity</SelectItem>
                        <SelectItem value="feature">Feature</SelectItem>
                        <SelectItem value="usage">Usage</SelectItem>
                        <SelectItem value="branding">Branding</SelectItem>
                        <SelectItem value="integration">Integration</SelectItem>
                        <SelectItem value="support">Support</SelectItem>
                      </SelectContent>
                    </Select>
                    {hasActiveSubscriptions && (
                      <p className="text-xs text-muted-foreground">
                        Cannot change category with active subscriptions
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subcategory">Subcategory</Label>
                    <Input
                      id="subcategory"
                      {...register('subcategory')}
                      placeholder="e.g., locations, users"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="icon">Icon</Label>
                    <Input
                      id="icon"
                      {...register('icon')}
                      placeholder="Lucide icon name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="color">Color</Label>
                    <Input
                      id="color"
                      {...register('color')}
                      type="color"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="pricing" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="billingCycle">Billing Cycle *</Label>
                  <Select 
                    value={watchedBillingCycle}
                    onValueChange={(value) => setValue('billingCycle', value as any)}
                    disabled={hasActiveSubscriptions}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select billing cycle" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                      <SelectItem value="one-time">One-time</SelectItem>
                      <SelectItem value="usage-based">Usage-based</SelectItem>
                    </SelectContent>
                  </Select>
                  {hasActiveSubscriptions && (
                    <p className="text-xs text-muted-foreground">
                      Cannot change billing cycle with active subscriptions
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {(watchedBillingCycle === 'monthly' || watchedBillingCycle === 'yearly') && (
                    <div className="space-y-2">
                      <Label htmlFor="pricing.monthly">Monthly Price (₹)</Label>
                      <Input
                        id="pricing.monthly"
                        type="number"
                        {...register('pricing.monthly', { valueAsNumber: true })}
                        placeholder="0"
                      />
                    </div>
                  )}

                  {watchedBillingCycle === 'yearly' && (
                    <div className="space-y-2">
                      <Label htmlFor="pricing.yearly">Yearly Price (₹)</Label>
                      <Input
                        id="pricing.yearly"
                        type="number"
                        {...register('pricing.yearly', { valueAsNumber: true })}
                        placeholder="0"
                      />
                    </div>
                  )}

                  {watchedBillingCycle === 'one-time' && (
                    <div className="space-y-2">
                      <Label htmlFor="pricing.oneTime">One-time Price (₹)</Label>
                      <Input
                        id="pricing.oneTime"
                        type="number"
                        {...register('pricing.oneTime', { valueAsNumber: true })}
                        placeholder="0"
                      />
                    </div>
                  )}
                </div>

                {hasActiveSubscriptions && (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      Pricing changes will affect new subscriptions only. Existing subscribers will continue with their current pricing.
                    </AlertDescription>
                  </Alert>
                )}
              </TabsContent>

              {/* Configuration, Marketing, Settings tabs - similar to create modal but with conditional disabling */}
              <TabsContent value="config" className="space-y-4">
                {watchedCategory === 'capacity' && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Capacity Configuration</CardTitle>
                      <CardDescription>
                        Configure how this add-on increases capacity limits
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="config.capacity.feature">Feature Key</Label>
                          <Input
                            id="config.capacity.feature"
                            {...register('config.capacity.feature')}
                            placeholder="e.g., max_branches"
                            disabled={hasActiveSubscriptions}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="config.capacity.increment">Increment</Label>
                          <Input
                            id="config.capacity.increment"
                            type="number"
                            {...register('config.capacity.increment', { valueAsNumber: true })}
                            placeholder="1"
                            disabled={hasActiveSubscriptions}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="config.capacity.unit">Unit</Label>
                          <Input
                            id="config.capacity.unit"
                            {...register('config.capacity.unit')}
                            placeholder="e.g., branches"
                            disabled={hasActiveSubscriptions}
                          />
                        </div>
                      </div>
                      {hasActiveSubscriptions && (
                        <p className="text-xs text-muted-foreground">
                          Cannot change configuration with active subscriptions
                        </p>
                      )}
                    </CardContent>
                  </Card>
                )}

                {watchedCategory === 'feature' && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Feature Configuration</CardTitle>
                      <CardDescription>
                        Configure which features this add-on unlocks
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Features</Label>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Feature key (e.g., campaigns)"
                            disabled={hasActiveSubscriptions}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter' && !hasActiveSubscriptions) {
                                e.preventDefault()
                                const input = e.target as HTMLInputElement
                                addConfigFeature(input.value, true)
                                input.value = ''
                              }
                            }}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            disabled={hasActiveSubscriptions}
                            onClick={(e) => {
                              const input = (e.target as HTMLElement).previousElementSibling as HTMLInputElement
                              addConfigFeature(input.value, true)
                              input.value = ''
                            }}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {watchedConfigFeatures.map((feature, index) => (
                            <Badge key={index} variant="secondary" className="flex items-center gap-1">
                              {feature.key}
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-4 w-4 p-0"
                                disabled={hasActiveSubscriptions}
                                onClick={() => removeConfigFeature(index)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </Badge>
                          ))}
                        </div>
                      </div>
                      {hasActiveSubscriptions && (
                        <p className="text-xs text-muted-foreground">
                          Cannot change configuration with active subscriptions
                        </p>
                      )}
                    </CardContent>
                  </Card>
                )}

                {watchedCategory === 'usage' && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Usage Configuration</CardTitle>
                      <CardDescription>
                        Configure usage-based settings
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="config.usage.type">Usage Type</Label>
                          <Select 
                            value={watch('config.usage.type')}
                            onValueChange={(value) => setValue('config.usage.type', value as any)}
                            disabled={hasActiveSubscriptions}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="credits">Credits</SelectItem>
                              <SelectItem value="quota">Quota</SelectItem>
                              <SelectItem value="allowance">Allowance</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="config.usage.amount">Amount</Label>
                          <Input
                            id="config.usage.amount"
                            type="number"
                            {...register('config.usage.amount', { valueAsNumber: true })}
                            placeholder="1000"
                            disabled={hasActiveSubscriptions}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="config.usage.unit">Unit</Label>
                          <Input
                            id="config.usage.unit"
                            {...register('config.usage.unit')}
                            placeholder="e.g., sms, emails"
                            disabled={hasActiveSubscriptions}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="config.usage.lowBalanceThreshold">Low Balance Threshold</Label>
                          <Input
                            id="config.usage.lowBalanceThreshold"
                            type="number"
                            {...register('config.usage.lowBalanceThreshold', { valueAsNumber: true })}
                            placeholder="10"
                            disabled={hasActiveSubscriptions}
                          />
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="config.usage.autoRenew"
                          checked={watch('config.usage.autoRenew')}
                          onCheckedChange={(checked) => setValue('config.usage.autoRenew', checked)}
                          disabled={hasActiveSubscriptions}
                        />
                        <Label htmlFor="config.usage.autoRenew">Auto-renew when low</Label>
                      </div>
                      {hasActiveSubscriptions && (
                        <p className="text-xs text-muted-foreground">
                          Cannot change configuration with active subscriptions
                        </p>
                      )}
                    </CardContent>
                  </Card>
                )}

                {watchedCategory === 'branding' && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Branding Configuration</CardTitle>
                      <CardDescription>
                        Configure branding customization options
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Branding Features</Label>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Branding option (e.g., custom_logo)"
                            disabled={hasActiveSubscriptions}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter' && !hasActiveSubscriptions) {
                                e.preventDefault()
                                const input = e.target as HTMLInputElement
                                addConfigFeature(input.value, true)
                                input.value = ''
                              }
                            }}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            disabled={hasActiveSubscriptions}
                            onClick={(e) => {
                              const input = (e.target as HTMLElement).previousElementSibling as HTMLInputElement
                              addConfigFeature(input.value, true)
                              input.value = ''
                            }}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {watchedConfigFeatures.map((feature, index) => (
                            <Badge key={index} variant="secondary" className="flex items-center gap-1">
                              {feature.key}
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-4 w-4 p-0"
                                disabled={hasActiveSubscriptions}
                                onClick={() => removeConfigFeature(index)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </Badge>
                          ))}
                        </div>
                      </div>
                      {hasActiveSubscriptions && (
                        <p className="text-xs text-muted-foreground">
                          Cannot change configuration with active subscriptions
                        </p>
                      )}
                    </CardContent>
                  </Card>
                )}

                {watchedCategory === 'integration' && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Integration Configuration</CardTitle>
                      <CardDescription>
                        Configure third-party integration settings
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Integration Options</Label>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Integration type (e.g., payment_gateway)"
                            disabled={hasActiveSubscriptions}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter' && !hasActiveSubscriptions) {
                                e.preventDefault()
                                const input = e.target as HTMLInputElement
                                addConfigFeature(input.value, true)
                                input.value = ''
                              }
                            }}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            disabled={hasActiveSubscriptions}
                            onClick={(e) => {
                              const input = (e.target as HTMLElement).previousElementSibling as HTMLInputElement
                              addConfigFeature(input.value, true)
                              input.value = ''
                            }}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {watchedConfigFeatures.map((feature, index) => (
                            <Badge key={index} variant="secondary" className="flex items-center gap-1">
                              {feature.key}
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-4 w-4 p-0"
                                disabled={hasActiveSubscriptions}
                                onClick={() => removeConfigFeature(index)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </Badge>
                          ))}
                        </div>
                      </div>
                      {hasActiveSubscriptions && (
                        <p className="text-xs text-muted-foreground">
                          Cannot change configuration with active subscriptions
                        </p>
                      )}
                    </CardContent>
                  </Card>
                )}

                {watchedCategory === 'support' && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Support Configuration</CardTitle>
                      <CardDescription>
                        Configure support and service options
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Support Options</Label>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Support type (e.g., priority_support)"
                            disabled={hasActiveSubscriptions}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter' && !hasActiveSubscriptions) {
                                e.preventDefault()
                                const input = e.target as HTMLInputElement
                                addConfigFeature(input.value, true)
                                input.value = ''
                              }
                            }}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            disabled={hasActiveSubscriptions}
                            onClick={(e) => {
                              const input = (e.target as HTMLElement).previousElementSibling as HTMLInputElement
                              addConfigFeature(input.value, true)
                              input.value = ''
                            }}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {watchedConfigFeatures.map((feature, index) => (
                            <Badge key={index} variant="secondary" className="flex items-center gap-1">
                              {feature.key}
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-4 w-4 p-0"
                                disabled={hasActiveSubscriptions}
                                onClick={() => removeConfigFeature(index)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </Badge>
                          ))}
                        </div>
                      </div>
                      {hasActiveSubscriptions && (
                        <p className="text-xs text-muted-foreground">
                          Cannot change configuration with active subscriptions
                        </p>
                      )}
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="marketing" className="space-y-4">
                <ArrayField
                  label="Tags"
                  items={watchedTags}
                  onAdd={(value) => addArrayItem('tags', value)}
                  onRemove={(index) => removeArrayItem('tags', index)}
                  placeholder="Add tag..."
                />

                <ArrayField
                  label="Benefits"
                  items={watchedBenefits}
                  onAdd={(value) => addArrayItem('benefits', value)}
                  onRemove={(index) => removeArrayItem('benefits', index)}
                  placeholder="Add benefit..."
                />

                <ArrayField
                  label="Features"
                  items={watchedFeatures}
                  onAdd={(value) => addArrayItem('features', value)}
                  onRemove={(index) => removeArrayItem('features', index)}
                  placeholder="Add feature..."
                />

                <ArrayField
                  label="Use Cases"
                  items={watchedUseCases}
                  onAdd={(value) => addArrayItem('useCases', value)}
                  onRemove={(index) => removeArrayItem('useCases', index)}
                  placeholder="Add use case..."
                />
              </TabsContent>

              <TabsContent value="settings" className="space-y-4">
                {/* Similar to create modal */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select 
                      value={watch('status')}
                      onValueChange={(value) => setValue('status', value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="hidden">Hidden</SelectItem>
                        <SelectItem value="deprecated">Deprecated</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sortOrder">Sort Order</Label>
                    <Input
                      id="sortOrder"
                      type="number"
                      {...register('sortOrder', { valueAsNumber: true })}
                      placeholder="0"
                    />
                  </div>
                </div>

                {/* Add other settings similar to create modal */}
              </TabsContent>

              <TabsContent value="changelog" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="changelogEntry">Changelog Entry</Label>
                  <Textarea
                    id="changelogEntry"
                    {...register('changelogEntry')}
                    placeholder="Describe what changed in this update..."
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">
                    Optional. Will be added to the add-on's changelog if provided.
                  </p>
                </div>

                {addOn.changelog && addOn.changelog.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Version History</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {addOn.changelog.slice(0, 5).map((entry: any, index: number) => (
                          <div key={index} className="border-l-2 border-muted pl-4">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">v{entry.version}</Badge>
                              <span className="text-sm text-muted-foreground">
                                {new Date(entry.date).toLocaleDateString()}
                              </span>
                            </div>
                            <ul className="mt-1 text-sm space-y-1">
                              {entry.changes.map((change: string, changeIndex: number) => (
                                <li key={changeIndex} className="text-muted-foreground">
                                  • {change}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
            </div>

            {/* Fixed Footer */}
            <div className="flex items-center justify-end gap-2 p-4 border-t bg-white flex-shrink-0">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Updating...' : 'Update Add-on'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

interface ArrayFieldProps {
  label: string
  items: string[]
  onAdd: (value: string) => void
  onRemove: (index: number) => void
  placeholder: string
}

function ArrayField({ label, items, onAdd, onRemove, placeholder }: ArrayFieldProps) {
  const [inputValue, setInputValue] = useState('')

  const handleAdd = () => {
    if (inputValue.trim()) {
      onAdd(inputValue.trim())
      setInputValue('')
    }
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={placeholder}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              handleAdd()
            }
          }}
        />
        <Button type="button" variant="outline" onClick={handleAdd}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((item, index) => (
          <Badge key={index} variant="secondary" className="flex items-center gap-1">
            {item}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0"
              onClick={() => onRemove(index)}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        ))}
      </div>
    </div>
  )
}