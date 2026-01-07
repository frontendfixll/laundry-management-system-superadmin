'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Eye, Edit, Trash2, BarChart3, Power, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import {
  useAllBanners,
  useDeleteAnyBanner,
  useToggleAnyBannerStatus,
  useApproveBanner,
  useDisableBanner
} from '@/hooks/useSuperAdminBanners';
import CreateGlobalBannerModal from '@/components/banners/CreateGlobalBannerModal';
import PlatformAnalyticsDashboard from '@/components/banners/PlatformAnalyticsDashboard';

export default function SuperAdminBannersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [scopeFilter, setScopeFilter] = useState('ALL');
  const [banners, setBanners] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedBanner, setSelectedBanner] = useState<any>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);

  const { getAllBanners, loading } = useAllBanners();
  const { deleteBanner } = useDeleteAnyBanner();
  const { toggleStatus } = useToggleAnyBannerStatus();
  const { approveBanner } = useApproveBanner();
  const { disableBanner } = useDisableBanner();

  useEffect(() => {
    loadBanners();
  }, [currentPage, searchTerm, statusFilter, typeFilter, scopeFilter]);

  const loadBanners = async () => {
    try {
      const params: any = {
        page: currentPage,
        limit: 10
      };
      if (searchTerm) params.search = searchTerm;
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (typeFilter !== 'ALL') params.type = typeFilter;
      if (scopeFilter !== 'ALL') params.scope = scopeFilter;

      const result = await getAllBanners(params);
      setBanners(result.data || []);
      setTotalPages(result.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Failed to load banners:', error);
    }
  };

  const handleDelete = async (bannerId: string) => {
    if (!confirm('Are you sure you want to delete this banner? This action cannot be undone.')) return;
    
    try {
      await deleteBanner(bannerId);
      loadBanners();
    } catch (error) {
      console.error('Failed to delete banner:', error);
    }
  };

  const handleToggleStatus = async (bannerId: string) => {
    try {
      await toggleStatus(bannerId);
      loadBanners();
    } catch (error) {
      console.error('Failed to toggle status:', error);
    }
  };

  const handleApprove = async (bannerId: string, approved: boolean) => {
    try {
      await approveBanner(bannerId, approved);
      setShowApprovalModal(false);
      loadBanners();
    } catch (error) {
      console.error('Failed to approve banner:', error);
    }
  };

  const handleDisable = async (bannerId: string, reason: string) => {
    try {
      await disableBanner(bannerId, reason);
      setShowDisableModal(false);
      loadBanners();
    } catch (error) {
      console.error('Failed to disable banner:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      ACTIVE: 'bg-green-100 text-green-800',
      SCHEDULED: 'bg-blue-100 text-blue-800',
      PAUSED: 'bg-yellow-100 text-yellow-800',
      EXPIRED: 'bg-gray-100 text-gray-800',
      DRAFT: 'bg-gray-100 text-gray-600'
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  const getScopeBadge = (scope: string) => {
    return scope === 'GLOBAL'
      ? 'bg-purple-100 text-purple-800'
      : 'bg-blue-100 text-blue-800';
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Banner Management</h1>
          <p className="text-gray-600 mt-1">Manage global and tenant banners across the platform</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAnalytics(true)}
            className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
          >
            <BarChart3 size={20} />
            Platform Analytics
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <Plus size={20} />
            Create Global Banner
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <p className="text-sm text-gray-600 mb-1">Total Banners</p>
          <p className="text-2xl font-bold text-gray-900">{banners.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <p className="text-sm text-gray-600 mb-1">Global Banners</p>
          <p className="text-2xl font-bold text-purple-600">
            {banners.filter(b => b.bannerScope === 'GLOBAL').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <p className="text-sm text-gray-600 mb-1">Active Banners</p>
          <p className="text-2xl font-bold text-green-600">
            {banners.filter(b => b.status === 'ACTIVE').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <p className="text-sm text-gray-600 mb-1">Pending Approval</p>
          <p className="text-2xl font-bold text-yellow-600">
            {banners.filter(b => b.requiresApproval && !b.isApproved).length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search banners..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={scopeFilter}
            onChange={(e) => setScopeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Scopes</option>
            <option value="GLOBAL">Global</option>
            <option value="TENANT">Tenant</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="PAUSED">Paused</option>
            <option value="EXPIRED">Expired</option>
            <option value="DRAFT">Draft</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Types</option>
            <option value="PROMOTIONAL">Promotional</option>
            <option value="INFORMATIONAL">Informational</option>
            <option value="SEASONAL">Seasonal</option>
            <option value="ANNOUNCEMENT">Announcement</option>
          </select>
        </div>
      </div>

      {/* Banner List */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading banners...</p>
          </div>
        ) : banners.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-500 text-lg">No banners found</p>
          </div>
        ) : (
          banners.map((banner) => (
            <div key={banner._id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">{banner.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(banner.status)}`}>
                      {banner.status}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getScopeBadge(banner.bannerScope)}`}>
                      {banner.bannerScope}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      {banner.type}
                    </span>
                    {banner.requiresApproval && !banner.isApproved && (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Pending Approval
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
                    <span>📅 {new Date(banner.startDate).toLocaleDateString()} - {new Date(banner.endDate).toLocaleDateString()}</span>
                    <span>📍 {banner.targetPages?.join(', ')}</span>
                    {banner.tenancyId && <span>🏢 Tenant: {banner.tenancyId.name || banner.tenancyId}</span>}
                  </div>

                  {/* Analytics Preview */}
                  <div className="grid grid-cols-4 gap-4">
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600 mb-1">Impressions</p>
                      <p className="text-lg font-bold text-blue-600">{banner.analytics?.impressions?.toLocaleString() || 0}</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600 mb-1">Clicks</p>
                      <p className="text-lg font-bold text-green-600">{banner.analytics?.clicks?.toLocaleString() || 0}</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600 mb-1">CTR</p>
                      <p className="text-lg font-bold text-purple-600">{banner.analytics?.ctr?.toFixed(2) || 0}%</p>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600 mb-1">Conversions</p>
                      <p className="text-lg font-bold text-orange-600">{banner.analytics?.conversions || 0}</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 ml-4">
                  {banner.requiresApproval && !banner.isApproved && (
                    <>
                      <button
                        onClick={() => handleApprove(banner._id, true)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                        title="Approve"
                      >
                        <CheckCircle size={20} />
                      </button>
                      <button
                        onClick={() => handleApprove(banner._id, false)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Reject"
                      >
                        <XCircle size={20} />
                      </button>
                    </>
                  )}
                  <button
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                    title="Preview"
                  >
                    <Eye size={20} />
                  </button>
                  <button
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    title="Edit"
                  >
                    <Edit size={20} />
                  </button>
                  <button
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                    title="Analytics"
                  >
                    <BarChart3 size={20} />
                  </button>
                  <button
                    onClick={() => handleToggleStatus(banner._id)}
                    className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition"
                    title="Toggle Status"
                  >
                    <Power size={20} />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedBanner(banner);
                      setShowDisableModal(true);
                    }}
                    className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition"
                    title="Emergency Disable"
                  >
                    <AlertTriangle size={20} />
                  </button>
                  <button
                    onClick={() => handleDelete(banner._id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="Delete"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {banners.length > 0 && (
        <div className="mt-6 flex justify-center">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
            >
              Previous
            </button>
            {[...Array(Math.min(totalPages, 5))].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-4 py-2 rounded-lg transition ${
                  currentPage === i + 1
                    ? 'bg-blue-600 text-white'
                    : 'border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <CreateGlobalBannerModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={loadBanners}
      />

      <PlatformAnalyticsDashboard
        isOpen={showAnalytics}
        onClose={() => setShowAnalytics(false)}
      />
    </div>
  );
}
