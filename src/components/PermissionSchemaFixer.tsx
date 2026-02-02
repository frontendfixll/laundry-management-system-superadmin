'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, XCircle, AlertTriangle, RefreshCw } from 'lucide-react'
import { superAdminApi } from '@/lib/superAdminApi'
import toast from 'react-hot-toast'

interface FixResult {
  userId: string
  email: string
  updated: boolean
  hadValidPermissions?: boolean
  error?: string
}

export const PermissionSchemaFixer: React.FC = () => {
  const [userEmail, setUserEmail] = useState('')
  const [isFixing, setIsFixing] = useState(false)
  const [results, setResults] = useState<FixResult[]>([])
  const [lastOperation, setLastOperation] = useState<string>('')

  const fixSingleUser = async () => {
    if (!userEmail.trim()) {
      toast.error('Please enter a user email')
      return
    }

    setIsFixing(true)
    setResults([])
    
    try {
      const response = await superAdminApi.post('/permissions/fix-schema', {
        userEmail: userEmail.trim(),
        grantBasicPermissions: true
      })

      if (response.data.success) {
        setResults(response.data.data.results)
        setLastOperation(`Fixed permissions for ${userEmail}`)
        toast.success('User permissions fixed successfully!')
      } else {
        toast.error(response.data.message || 'Failed to fix permissions')
      }
    } catch (error: any) {
      console.error('Fix permissions error:', error)
      toast.error(error.response?.data?.message || 'Failed to fix permissions')
    } finally {
      setIsFixing(false)
    }
  }

  const fixAllUsers = async () => {
    setIsFixing(true)
    setResults([])
    
    try {
      const response = await superAdminApi.post('/permissions/fix-schema', {
        grantBasicPermissions: true
      })

      if (response.data.success) {
        setResults(response.data.data.results)
        setLastOperation(`Fixed permissions for ${response.data.data.fixedUsers} out of ${response.data.data.totalUsers} users`)
        toast.success(`Fixed permissions for ${response.data.data.fixedUsers} users!`)
      } else {
        toast.error(response.data.message || 'Failed to fix permissions')
      }
    } catch (error: any) {
      console.error('Fix all permissions error:', error)
      toast.error(error.response?.data?.message || 'Failed to fix permissions')
    } finally {
      setIsFixing(false)
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="w-5 h-5" />
          Permission Schema Fixer
        </CardTitle>
        <CardDescription>
          Fix permission schema mismatches between SuperAdmin and Backend. 
          This tool ensures all users have the correct permission structure.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Single User Fix */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Fix Single User</h3>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="userEmail">User Email</Label>
              <Input
                id="userEmail"
                type="email"
                placeholder="user@example.com"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                disabled={isFixing}
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={fixSingleUser}
                disabled={isFixing || !userEmail.trim()}
                className="min-w-[120px]"
              >
                {isFixing ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Fixing...
                  </>
                ) : (
                  'Fix User'
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Bulk Fix */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Fix All Users</h3>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              This will fix permission schemas for ALL users in the system. 
              Users without valid permissions will be granted basic view permissions.
            </AlertDescription>
          </Alert>
          <Button 
            onClick={fixAllUsers}
            disabled={isFixing}
            variant="destructive"
            className="min-w-[150px]"
          >
            {isFixing ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Fixing All...
              </>
            ) : (
              'Fix All Users'
            )}
          </Button>
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Results</h3>
            {lastOperation && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>{lastOperation}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {results.map((result, index) => (
                <div 
                  key={index}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    result.updated 
                      ? 'bg-green-50 border-green-200' 
                      : result.error 
                        ? 'bg-red-50 border-red-200'
                        : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {result.updated ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : result.error ? (
                      <XCircle className="w-5 h-5 text-red-600" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-yellow-600" />
                    )}
                    <div>
                      <div className="font-medium">{result.email}</div>
                      {result.error && (
                        <div className="text-sm text-red-600">{result.error}</div>
                      )}
                      {result.updated && !result.hadValidPermissions && (
                        <div className="text-sm text-green-600">Granted basic permissions</div>
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {result.updated ? 'Fixed' : result.error ? 'Failed' : 'No changes needed'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">What This Tool Does</h3>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <ul className="space-y-2 text-sm">
              <li>• <strong>Validates permission structure:</strong> Ensures all users have the correct permission modules and actions</li>
              <li>• <strong>Removes invalid modules:</strong> Cleans up old permission modules that no longer exist</li>
              <li>• <strong>Grants basic permissions:</strong> Users without valid permissions get basic view access</li>
              <li>• <strong>Maintains existing permissions:</strong> Valid existing permissions are preserved</li>
              <li>• <strong>Real-time sync:</strong> Fixed permissions are immediately available without logout/login</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}