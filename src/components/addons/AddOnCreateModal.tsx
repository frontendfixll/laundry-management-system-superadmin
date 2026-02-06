'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { X, Plus, Trash2, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

const addOnSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').max(100),
  slug: z.string().optional(), // Will be generated from name
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
  }).optional(),
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
  useCases: z.array(z.string()).default([])
})

type AddOnFormData = z.infer<typeof addOnSchema>

interface AddOnCreateModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: AddOnFormData) => Promise<void>
}

export function AddOnCreateModal({ open, onClose, onSubmit }: AddOnCreateModalProps) {
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('basic')

  const form = useForm<AddOnFormData>({
    resolver: zodResolver(addOnSchema),
    defaultValues: {
      name: '',
      displayName: '',
      description: '',
      shortDescription: '',
      category: 'feature',
      subcategory: '',
      billingCycle: 'monthly',
      pricing: {
        monthly: undefined,
        yearly: undefined,
        oneTime: undefined
      },
      config: {
        features: []
      },
      icon: 'package',
      color: '#3B82F6',
      status: 'draft',
      isPopular: false,
      isRecommended: false,
      isFeatured: false,
      showOnMarketplace: true,
      showOnPricingPage: false,
      sortOrder: 0,
      trialDays: 0,
      maxQuantity: 1,
      tags: [],
      benefits: [],
      features: [],
      useCases: []
    }
  })

  const { register, handleSubmit, watch, setValue, formState: { errors } } = form

  const watchedCategory = watch('category')
  const watchedBillingCycle = watch('billingCycle')
  const watchedTags = watch('tags')
  const watchedBenefits = watch('benefits')
  const watchedFeatures = watch('features')
  const watchedUseCases = watch('useCases')
  const watchedConfigFeatures = watch('config.features') || []

  const handleFormSubmit = async (data: AddOnFormData) => {
    try {
      setLoading(true)
      // console.log('🔍 Form data being submitted:', data)

      // Check if we're missing required pricing based on billing cycle
      const billingCycle = data.billingCycle;
      let missingFields = [];

      if (billingCycle === 'monthly' && (!data.pricing?.monthly || data.pricing.monthly <= 0)) {
        missingFields.push('Monthly pricing is required for monthly billing cycle');
      }

      if (billingCycle === 'yearly' && (!data.pricing?.yearly || data.pricing.yearly <= 0)) {
        missingFields.push('Yearly pricing is required for yearly billing cycle');
      }

      if (billingCycle === 'one-time' && (!data.pricing?.oneTime || data.pricing.oneTime <= 0)) {
        missingFields.push('One-time pricing is required for one-time billing cycle');
      }

      if (missingFields.length > 0) {
        toast.error('Please complete all required fields', {
          duration: 4000,
          position: 'top-right',
        });

        // Show individual field errors
        missingFields.forEach((field, index) => {
          setTimeout(() => {
            toast.error(field, {
              duration: 3000,
              position: 'top-right',
            });
          }, index * 500); // Stagger the messages
        });

        // Switch to pricing tab if pricing is missing
        if (missingFields.some(field => field.includes('pricing'))) {
          setActiveTab('pricing');
        }
        return;
      }

      // Generate slug from name if not provided
      const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

      const processedData = {
        ...data,
        slug, // Explicitly set the slug
        // Ensure pricing object has the right structure
        pricing: {
          monthly: data.pricing?.monthly || 0,
          yearly: data.pricing?.yearly || 0,
          oneTime: data.pricing?.oneTime || 0
        },
        // Ensure config object exists
        config: data.config || {},
        // Ensure arrays exist
        tags: data.tags || [],
        benefits: data.benefits || [],
        features: data.features || [],
        useCases: data.useCases || []
      }

      // console.log('🔍 Processed data being submitted:', processedData)

      await onSubmit(processedData)
      toast.success('Add-on created successfully!', {
        duration: 3000,
        position: 'top-right',
      });
      form.reset()
      onClose()
    } catch (error) {
      // console.error('❌ Failed to create add-on:', error)
      toast.error(`Failed to create add-on: ${error instanceof Error ? error.message : 'Unknown error'}`, {
        duration: 5000,
        position: 'top-right',
      });
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

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[90vh] flex flex-col">
        <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col h-full">
          {/* Fixed Header */}
          <div className="flex items-center justify-between p-4 border-b bg-white flex-shrink-0">
            <h2 className="text-lg font-semibold">Create New Add-on</h2>
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="flex-1 p-4">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="basic" className={errors.name || errors.displayName || errors.description || errors.category ? 'text-red-600' : ''}>
                    Basic Info
                    {(errors.name || errors.displayName || errors.description || errors.category) && <span className="ml-1 text-red-500">*</span>}
                  </TabsTrigger>
                  <TabsTrigger value="pricing" className={errors.billingCycle || errors.pricing ? 'text-red-600' : ''}>
                    Pricing
                    {(errors.billingCycle || errors.pricing) && <span className="ml-1 text-red-500">*</span>}
                  </TabsTrigger>
                  <TabsTrigger value="config">Configuration</TabsTrigger>
                  <TabsTrigger value="marketing">Marketing</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Internal Name *</Label>
                      <Input
                        id="name"
                        {...register('name')}
                        placeholder="e.g., extra-branch"
                      />
                      {errors.name && (
                        <p className="text-sm text-red-600">{errors.name.message}</p>
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
                      {errors.category && (
                        <p className="text-sm text-red-600">{errors.category.message}</p>
                      )}
                      {errors.category && (
                        <p className="text-sm text-red-600">{errors.category.message}</p>
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
                    {errors.billingCycle && (
                      <p className="text-sm text-red-600">{errors.billingCycle.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    {(watchedBillingCycle === 'monthly' || watchedBillingCycle === 'yearly') && (
                      <div className="space-y-2">
                        <Label htmlFor="pricing.monthly">Monthly Price (₹) *</Label>
                        <Input
                          id="pricing.monthly"
                          type="number"
                          min="0"
                          step="0.01"
                          {...register('pricing.monthly', {
                            valueAsNumber: true,
                            required: watchedBillingCycle === 'monthly' ? 'Monthly price is required' : false,
                            min: { value: 0.01, message: 'Price must be greater than 0' }
                          })}
                          placeholder="99"
                        />
                        {errors.pricing?.monthly && (
                          <p className="text-sm text-red-600">{errors.pricing.monthly.message}</p>
                        )}
                      </div>
                    )}

                    {watchedBillingCycle === 'yearly' && (
                      <div className="space-y-2">
                        <Label htmlFor="pricing.yearly">Yearly Price (₹) *</Label>
                        <Input
                          id="pricing.yearly"
                          type="number"
                          min="0"
                          step="0.01"
                          {...register('pricing.yearly', {
                            valueAsNumber: true,
                            required: watchedBillingCycle === 'yearly' ? 'Yearly price is required' : false,
                            min: { value: 0.01, message: 'Price must be greater than 0' }
                          })}
                          placeholder="999"
                        />
                        {errors.pricing?.yearly && (
                          <p className="text-sm text-red-600">{errors.pricing.yearly.message}</p>
                        )}
                      </div>
                    )}

                    {watchedBillingCycle === 'one-time' && (
                      <div className="space-y-2">
                        <Label htmlFor="pricing.oneTime">One-time Price (₹) *</Label>
                        <Input
                          id="pricing.oneTime"
                          type="number"
                          min="0"
                          step="0.01"
                          {...register('pricing.oneTime', {
                            valueAsNumber: true,
                            required: watchedBillingCycle === 'one-time' ? 'One-time price is required' : false,
                            min: { value: 0.01, message: 'Price must be greater than 0' }
                          })}
                          placeholder="499"
                        />
                        {errors.pricing?.oneTime && (
                          <p className="text-sm text-red-600">{errors.pricing.oneTime.message}</p>
                        )}
                      </div>
                    )}
                  </div>

                  {watchedBillingCycle === 'usage-based' && (
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        Usage-based add-ons are charged based on consumption. Configure usage settings in the Configuration tab.
                      </AlertDescription>
                    </Alert>
                  )}
                </TabsContent>

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
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="config.capacity.increment">Increment</Label>
                            <Input
                              id="config.capacity.increment"
                              type="number"
                              {...register('config.capacity.increment', { valueAsNumber: true })}
                              placeholder="1"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="config.capacity.unit">Unit</Label>
                            <Input
                              id="config.capacity.unit"
                              {...register('config.capacity.unit')}
                              placeholder="e.g., branches"
                            />
                          </div>
                        </div>
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
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
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
                                  onClick={() => removeConfigFeature(index)}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </Badge>
                            ))}
                          </div>
                        </div>
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
                            <Select onValueChange={(value) => setValue('config.usage.type', value as any)}>
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
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="config.usage.lowBalanceThreshold">Low Balance Threshold</Label>
                            <Input
                              id="config.usage.lowBalanceThreshold"
                              type="number"
                              {...register('config.usage.lowBalanceThreshold', { valueAsNumber: true })}
                              placeholder="10"
                            />
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="config.usage.autoRenew"
                            onCheckedChange={(checked) => setValue('config.usage.autoRenew', checked)}
                          />
                          <Label htmlFor="config.usage.autoRenew">Auto-renew when low</Label>
                        </div>
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
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select onValueChange={(value) => setValue('status', value as any)}>
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

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="trialDays">Trial Days</Label>
                      <Input
                        id="trialDays"
                        type="number"
                        {...register('trialDays', { valueAsNumber: true })}
                        placeholder="0"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="maxQuantity">Max Quantity</Label>
                      <Input
                        id="maxQuantity"
                        type="number"
                        {...register('maxQuantity', { valueAsNumber: true })}
                        placeholder="1"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="isPopular"
                        onCheckedChange={(checked) => setValue('isPopular', checked)}
                      />
                      <Label htmlFor="isPopular">Mark as Popular</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="isRecommended"
                        onCheckedChange={(checked) => setValue('isRecommended', checked)}
                      />
                      <Label htmlFor="isRecommended">Mark as Recommended</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="isFeatured"
                        onCheckedChange={(checked) => setValue('isFeatured', checked)}
                      />
                      <Label htmlFor="isFeatured">Mark as Featured</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="showOnMarketplace"
                        onCheckedChange={(checked) => setValue('showOnMarketplace', checked)}
                        defaultChecked
                      />
                      <Label htmlFor="showOnMarketplace">Show on Marketplace</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="showOnPricingPage"
                        onCheckedChange={(checked) => setValue('showOnPricingPage', checked)}
                      />
                      <Label htmlFor="showOnPricingPage">Show on Pricing Page</Label>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Fixed Footer */}
          <div className="flex items-center justify-end gap-2 p-4 border-t bg-white flex-shrink-0">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Add-on'}
            </Button>
          </div>
        </form>
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