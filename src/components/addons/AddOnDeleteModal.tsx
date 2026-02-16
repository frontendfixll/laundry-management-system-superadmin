'use client'

import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SlidePanel } from '@/components/ui/slide-panel'
import { Badge } from '@/components/ui/badge'

interface AddOnDeleteModalProps {
  open: boolean
  addOn: {
    _id: string
    displayName: string
    category: string
    status: string
    stats?: {
      activeSubscriptions: number
    }
  } | null
  onClose: () => void
  onConfirm: () => Promise<void>
}

export function AddOnDeleteModal({ open, addOn, onClose, onConfirm }: AddOnDeleteModalProps) {
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    try {
      setLoading(true)
      await onConfirm()
      onClose()
    } catch (error) {
      console.error('Failed to delete add-on:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!addOn) return null

  const hasActiveSubscriptions = (addOn.stats?.activeSubscriptions || 0) > 0
  const canDelete = !hasActiveSubscriptions && addOn.status !== 'active'

  return (
    <SlidePanel open={open} onClose={onClose} title="Delete Add-on" width="md" accentBar="bg-red-500">
        <p className="text-sm text-muted-foreground mb-4">
          Are you sure you want to delete this add-on? This action cannot be undone.
        </p>
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="space-y-2">
              <div className="font-medium">{addOn.displayName}</div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{addOn.category}</Badge>
                <Badge variant={addOn.status === 'active' ? 'default' : 'secondary'}>
                  {addOn.status}
                </Badge>
              </div>
              {addOn.stats?.activeSubscriptions && (
                <div className="text-sm text-muted-foreground">
                  {addOn.stats.activeSubscriptions} active subscription(s)
                </div>
              )}
            </div>
          </div>

          {!canDelete && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="text-sm text-red-800">
                <div className="font-medium mb-1">Cannot delete this add-on:</div>
                <ul className="list-disc list-inside space-y-1">
                  {hasActiveSubscriptions && (
                    <li>Has {addOn.stats?.activeSubscriptions} active subscription(s)</li>
                  )}
                  {addOn.status === 'active' && (
                    <li>Add-on is currently active</li>
                  )}
                </ul>
                <div className="mt-2 text-xs">
                  To delete this add-on, first set its status to 'deprecated' and wait for all subscriptions to expire.
                </div>
              </div>
            </div>
          )}

          {canDelete && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="text-sm text-yellow-800">
                <div className="font-medium mb-1">Warning:</div>
                <p>
                  Deleting this add-on will permanently remove it from the system. 
                  Any historical data and analytics will be lost.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleConfirm}
            disabled={!canDelete || loading}
          >
            {loading ? 'Deleting...' : 'Delete Add-on'}
          </Button>
        </div>
    </SlidePanel>
  )
}