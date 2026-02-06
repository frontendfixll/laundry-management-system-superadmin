'use client'

import PrivacyToggle from '@/components/ui/PrivacyToggle'
import RevenueCard from '@/components/ui/RevenueCard'
import { DollarSign, Shield } from 'lucide-react'

export default function TestPrivacyTogglePage() {
  return (
    <div className="p-8 space-y-8">
      <h1 className="text-2xl font-bold">Privacy Toggle Test Page</h1>
      
      {/* New RevenueCard Component */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">New RevenueCard Component:</h2>
        
        <RevenueCard
          title="Platform Revenue"
          amount="₹56,777"
          storageKey="test-revenue-1"
          icon={<Shield className="w-5 h-5 text-gray-600" />}
        />

        <RevenueCard
          title="Monthly Revenue"
          amount="₹1,23,456"
          subtitle="From subscriptions"
          storageKey="test-revenue-2"
          icon={<DollarSign className="w-5 h-5 text-green-600" />}
        />
      </div>
      
      {/* Dashboard Style Card */}
      <div className="bg-gradient-to-br from-slate-50 to-gray-50 border border-slate-100 rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow max-w-sm">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-700">Platform Revenue</p>
            <div className="mt-2">
              <PrivacyToggle 
                hiddenText="*****"
                showLabel="Show revenue amount"
                hideLabel="Hide revenue amount"
                className="items-center gap-1"
                storageKey="test-platform-revenue"
              >
                <p className="text-2xl font-semibold text-gray-900">
                  ₹56,777
                </p>
              </PrivacyToggle>
            </div>
          </div>
          <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
            <Shield className="w-5 h-5 text-gray-600" />
          </div>
        </div>
      </div>

      {/* Analytics Style Card */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 max-w-sm">
        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
          <h3 className="text-sm font-medium">Platform Revenue</h3>
          <DollarSign className="h-4 w-4 text-gray-500" />
        </div>
        <div className="space-y-2">
          <PrivacyToggle 
            hiddenText="*****"
            showLabel="Show revenue amount"
            hideLabel="Hide revenue amount"
            className="items-center gap-1"
            storageKey="test-platform-revenue-analytics"
          >
            <div className="text-2xl font-bold">
              ₹1,23,456
            </div>
          </PrivacyToggle>
          <p className="text-xs text-gray-500">From subscriptions</p>
        </div>
      </div>

      {/* Different Examples */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Different Examples:</h2>
        
        <div className="bg-white p-4 border rounded-lg">
          <h3 className="font-medium mb-2">Large Amount:</h3>
          <PrivacyToggle hiddenText="*****" className="gap-1">
            <span className="text-lg font-bold">₹12,34,56,789</span>
          </PrivacyToggle>
        </div>

        <div className="bg-white p-4 border rounded-lg">
          <h3 className="font-medium mb-2">Small Amount:</h3>
          <PrivacyToggle hiddenText="***" className="gap-1">
            <span className="text-lg font-bold">₹1,234</span>
          </PrivacyToggle>
        </div>

        <div className="bg-white p-4 border rounded-lg">
          <h3 className="font-medium mb-2">Custom Hidden Text:</h3>
          <PrivacyToggle hiddenText="HIDDEN" className="gap-1">
            <span className="text-lg font-bold">₹99,999</span>
          </PrivacyToggle>
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-medium text-blue-900 mb-2">Visual Comparison:</h3>
        <div className="space-y-2 text-sm text-blue-800">
          <div>✅ <strong>Hidden:</strong> ***** (no rupee sign)</div>
          <div>✅ <strong>Visible:</strong> ₹56,777 (with rupee sign)</div>
          <div>✅ <strong>Icon Position:</strong> Right after "Revenue" text</div>
          <div>✅ <strong>Hover Effect:</strong> Icon changes color on hover</div>
        </div>
      </div>
    </div>
  )
}