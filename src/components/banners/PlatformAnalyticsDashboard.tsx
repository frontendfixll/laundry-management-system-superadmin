'use client';

import { useState, useEffect } from 'react';
import { X, TrendingUp, Eye, MousePointer, DollarSign, Users } from 'lucide-react';
import { usePlatformAnalytics } from '@/hooks/useSuperAdminBanners';
import PrivacyToggle from '../ui/PrivacyToggle';

interface PlatformAnalyticsDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PlatformAnalyticsDashboard({ isOpen, onClose }: PlatformAnalyticsDashboardProps) {
  const { getPlatformAnalytics, loading } = usePlatformAnalytics();
  const [analytics, setAnalytics] = useState<any>(null);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    if (isOpen) {
      loadAnalytics();
    }
  }, [isOpen]);

  const loadAnalytics = async () => {
    try {
      const result = await getPlatformAnalytics(dateRange);
      setAnalytics(result.data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Platform Banner Analytics</h2>
            <p className="text-gray-600 mt-1">Performance metrics across all banners</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition">
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {/* Date Range Filter */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
            <button
              onClick={loadAnalytics}
              className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Apply Filter
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
          ) : analytics ? (
            <div className="space-y-6">
              {/* Overview Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Eye className="text-blue-600" size={24} />
                    <span className="text-xs font-medium text-blue-600">TOTAL IMPRESSIONS</span>
                  </div>
                  <p className="text-3xl font-bold text-blue-900">
                    {analytics.totalImpressions?.toLocaleString() || 0}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-2">
                    <MousePointer className="text-green-600" size={24} />
                    <span className="text-xs font-medium text-green-600">TOTAL CLICKS</span>
                  </div>
                  <p className="text-3xl font-bold text-green-900">
                    {analytics.totalClicks?.toLocaleString() || 0}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-2">
                    <TrendingUp className="text-purple-600" size={24} />
                    <span className="text-xs font-medium text-purple-600">AVG CTR</span>
                  </div>
                  <p className="text-3xl font-bold text-purple-900">
                    {analytics.averageCTR?.toFixed(2) || 0}%
                  </p>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-2">
                    <DollarSign className="text-orange-600" size={24} />
                    <span className="text-xs font-medium text-orange-600">TOTAL REVENUE</span>
                  </div>
                  <div className="text-3xl font-bold text-orange-900">
                    <PrivacyToggle storageKey="analytics-revenue" className="w-full">
                      ₹{analytics.totalRevenue?.toLocaleString() || 0}
                    </PrivacyToggle>
                  </div>
                </div>
              </div>

              {/* Banner Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Total Banners</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.totalBanners || 0}</p>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Active Banners</p>
                  <p className="text-2xl font-bold text-green-600">{analytics.activeBanners || 0}</p>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Global Banners</p>
                  <p className="text-2xl font-bold text-purple-600">{analytics.globalBanners || 0}</p>
                </div>
              </div>

              {/* Performance by Type */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance by Banner Type</h3>
                <div className="space-y-3">
                  {analytics.byType?.map((item: any) => (
                    <div key={item.type} className="flex items-center justify-between p-3 bg-white rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{item.type}</p>
                        <p className="text-sm text-gray-600">{item.count} banners</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">{item.impressions?.toLocaleString()}</p>
                        <p className="text-sm text-gray-600">impressions</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Performing Banners */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Banners</h3>
                <div className="space-y-3">
                  {analytics.topBanners?.map((banner: any, index: number) => (
                    <div key={banner._id} className="flex items-center gap-4 p-3 bg-white rounded-lg">
                      <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-purple-600 font-bold">#{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{banner.title}</p>
                        <p className="text-sm text-gray-600">{banner.type}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">{banner.analytics?.ctr?.toFixed(2)}%</p>
                        <p className="text-sm text-gray-600">CTR</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No analytics data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
