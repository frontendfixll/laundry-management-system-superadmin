'use client';

import { useState, useEffect } from 'react';
import { X, TrendingUp, MousePointer, Eye, Target, Calendar, Users, DollarSign } from 'lucide-react';
import { useSuperAdminStore } from '@/store/superAdminStore';

interface BannerAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  banner: any;
}

export default function BannerAnalyticsModal({ isOpen, onClose, banner }: BannerAnalyticsModalProps) {
  const { token } = useSuperAdminStore();
  const [timeRange, setTimeRange] = useState('7d');
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && banner) {
      fetchAnalytics();
    }
  }, [isOpen, banner, timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/superadmin/banners/${banner._id}/analytics?timeRange=${timeRange}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        setAnalytics(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !banner) return null;

  const stats = banner.analytics || {};
  const impressions = stats.impressions || 0;
  const clicks = stats.clicks || 0;
  const ctr = stats.ctr || 0;
  const conversions = stats.conversions || 0;
  const conversionRate = impressions > 0 ? ((conversions / impressions) * 100).toFixed(2) : 0;
  const uniqueUsers = stats.uniqueUsers || 0;
  const revenue = stats.revenue || 0;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Banner Analytics</h2>
            <p className="text-sm text-gray-600 mt-1">{banner.content?.title}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {/* Time Range Filter */}
          <div className="flex items-center gap-2 mb-6">
            <Calendar className="w-5 h-5 text-gray-600" />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="all">All Time</option>
            </select>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-blue-50 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Eye className="w-8 h-8 text-blue-600" />
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                  </div>
                  <p className="text-sm text-gray-600 mb-1">Impressions</p>
                  <p className="text-3xl font-bold text-blue-600">{impressions.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">Total views</p>
                </div>

                <div className="bg-green-50 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-2">
                    <MousePointer className="w-8 h-8 text-green-600" />
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <p className="text-sm text-gray-600 mb-1">Clicks</p>
                  <p className="text-3xl font-bold text-green-600">{clicks.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">CTR: {ctr.toFixed(2)}%</p>
                </div>

                <div className="bg-purple-50 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Target className="w-8 h-8 text-purple-600" />
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                  </div>
                  <p className="text-sm text-gray-600 mb-1">Conversions</p>
                  <p className="text-3xl font-bold text-purple-600">{conversions.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">Rate: {conversionRate}%</p>
                </div>

                <div className="bg-orange-50 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Users className="w-8 h-8 text-orange-600" />
                    <TrendingUp className="w-5 h-5 text-orange-600" />
                  </div>
                  <p className="text-sm text-gray-600 mb-1">Unique Users</p>
                  <p className="text-3xl font-bold text-orange-600">{uniqueUsers.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">Engaged users</p>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="bg-white border rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Click-Through Rate (CTR)</span>
                      <span className="text-sm font-semibold text-gray-900">{ctr.toFixed(2)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${Math.min(ctr * 10, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Conversion Rate</span>
                      <span className="text-sm font-semibold text-gray-900">{conversionRate}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-500 h-2 rounded-full"
                        style={{ width: `${Math.min(parseFloat(conversionRate as string) * 10, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Engagement Rate</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {impressions > 0 ? ((clicks / impressions) * 100).toFixed(2) : 0}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${impressions > 0 ? Math.min(((clicks / impressions) * 100) * 10, 100) : 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Revenue & ROI */}
              {revenue > 0 && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6 mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <DollarSign className="w-8 h-8 text-green-600" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Revenue Generated</h3>
                      <p className="text-sm text-gray-600">From banner conversions</p>
                    </div>
                  </div>
                  <p className="text-4xl font-bold text-green-600">${revenue.toFixed(2)}</p>
                  <p className="text-sm text-gray-600 mt-2">
                    Average per conversion: ${conversions > 0 ? (revenue / conversions).toFixed(2) : '0.00'}
                  </p>
                </div>
              )}

              {/* Banner Details */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Banner Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Type:</span>
                    <p className="font-medium">{banner.templateType}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Position:</span>
                    <p className="font-medium">{banner.position}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Scope:</span>
                    <p className="font-medium">{banner.bannerScope}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Status:</span>
                    <p className="font-medium">{banner.state}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Priority:</span>
                    <p className="font-medium">{banner.priority}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Schedule:</span>
                    <p className="font-medium">
                      {new Date(banner.schedule?.startDate).toLocaleDateString()} - {new Date(banner.schedule?.endDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Insights */}
              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">📊 Insights</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  {ctr > 2 && (
                    <li className="flex items-start gap-2">
                      <span className="text-green-600">✓</span>
                      <span>Great CTR! Your banner is performing above average.</span>
                    </li>
                  )}
                  {ctr < 1 && impressions > 100 && (
                    <li className="flex items-start gap-2">
                      <span className="text-orange-600">⚠</span>
                      <span>Low CTR. Consider updating the banner design or messaging.</span>
                    </li>
                  )}
                  {conversions > 0 && (
                    <li className="flex items-start gap-2">
                      <span className="text-green-600">✓</span>
                      <span>Banner is driving conversions successfully!</span>
                    </li>
                  )}
                  {impressions > 1000 && clicks < 10 && (
                    <li className="flex items-start gap-2">
                      <span className="text-red-600">✗</span>
                      <span>High impressions but low clicks. Review your call-to-action.</span>
                    </li>
                  )}
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
