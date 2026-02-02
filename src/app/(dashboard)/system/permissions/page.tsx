'use client'

import React from 'react'
import { PermissionSchemaFixer } from '@/components/PermissionSchemaFixer'

export default function SystemPermissionsPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">System Permissions</h1>
        <p className="text-gray-600 mt-2">
          Manage and fix permission schemas across the platform
        </p>
      </div>
      
      <PermissionSchemaFixer />
    </div>
  )
}